import type { NdjsonStream, StreamLine } from '@oreforge/sdk'
import { OreApiError, OreConnectionError, OreStreamError } from '@oreforge/sdk'

export function useStreamOperation() {
  const running = ref(false)
  const lines = ref<StreamLine[]>([])
  const error = ref<string | null>(null)
  const aborted = ref(false)
  let controller: AbortController | null = null

  async function execute(streamFn: (signal: AbortSignal) => NdjsonStream) {
    if (running.value) return
    running.value = true
    lines.value = []
    error.value = null
    aborted.value = false
    controller = new AbortController()

    try {
      const stream = streamFn(controller.signal)
      for await (const line of stream) {
        lines.value = [...lines.value, line]
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        aborted.value = true
      } else if (e instanceof OreStreamError) {
        error.value = e.line.error ?? e.message
      } else if (e instanceof OreApiError) {
        error.value = `HTTP ${e.status}: ${e.detail}`
      } else if (e instanceof OreConnectionError) {
        error.value = 'Unable to reach the server. Check your connection.'
      } else if (e instanceof Error) {
        error.value = e.message
      }
    } finally {
      running.value = false
      controller = null
    }
  }

  function abort() {
    controller?.abort()
  }

  return { running, lines, error, aborted, execute, abort }
}
