import type { NdjsonStream } from '@oreforge/sdk'
import { OreApiError, OreConnectionError, OreStreamError } from '@oreforge/sdk'

export function useStreamOperation() {
  const running = ref(false)
  const error = ref<string | null>(null)

  async function execute(streamFn: (signal: AbortSignal) => NdjsonStream) {
    if (running.value) return
    running.value = true
    error.value = null
    const controller = new AbortController()

    try {
      const stream = streamFn(controller.signal)
      for await (const _ of stream) {
      }
    } catch (e) {
      if (e instanceof OreStreamError) {
        error.value = e.line.error ?? e.message
      } else if (e instanceof OreApiError) {
        error.value = `HTTP ${e.status}: ${String(e.detail)}`
      } else if (e instanceof OreConnectionError) {
        error.value = 'Unable to reach the server. Check your connection.'
      } else if (e instanceof Error) {
        error.value = e.message
      }
    } finally {
      running.value = false
    }
  }

  return { running, error, execute }
}
