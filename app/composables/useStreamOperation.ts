import {
  type OperationResponse,
  OreApiError,
  OreConnectionError,
  OreStreamError,
} from '@oreforge/sdk'

const TERMINAL_STATUSES = new Set(['completed', 'failed', 'cancelled'])

export function useStreamOperation() {
  const running = ref(false)
  const error = ref<string | null>(null)
  const operationId = ref<string | null>(null)

  let controller: AbortController | null = null

  async function execute(trigger: (signal: AbortSignal) => Promise<OperationResponse>) {
    if (running.value) return
    await run(trigger)
  }

  async function attach(id: string) {
    if (running.value) return
    const client = useOreClient()
    const ctrl = new AbortController()
    try {
      const op = await client.operations.get(id).get({ signal: ctrl.signal })
      if (TERMINAL_STATUSES.has(op.status)) {
        if (op.status === 'failed' && op.error) error.value = op.error
        return
      }
      await run(async () => op, ctrl)
    } catch (e) {
      setError(e)
    }
  }

  async function run(
    kickoff: (signal: AbortSignal) => Promise<OperationResponse>,
    ctrl: AbortController = new AbortController(),
  ) {
    controller = ctrl
    running.value = true
    error.value = null
    operationId.value = null
    const client = useOreClient()
    try {
      const op = await kickoff(ctrl.signal)
      operationId.value = op.id
      const logs = client.operations.get(op.id).logs(0, { signal: ctrl.signal })
      await logs.drain()
    } catch (e) {
      setError(e)
    } finally {
      if (controller === ctrl) controller = null
      running.value = false
    }
  }

  function setError(e: unknown) {
    if (e instanceof OreStreamError) {
      error.value = e.line.error ?? e.message
    } else if (e instanceof OreApiError) {
      error.value = `HTTP ${e.status}: ${String(e.detail)}`
    } else if (e instanceof OreConnectionError) {
      error.value = 'Unable to reach the server. Check your connection.'
    } else if (e instanceof Error && e.name !== 'AbortError') {
      error.value = e.message
    }
  }

  async function cancel() {
    const id = operationId.value
    if (!id) {
      controller?.abort()
      return
    }
    const client = useOreClient()
    try {
      await client.operations.get(id).cancel()
    } catch (e) {
      if (e instanceof Error) error.value = e.message
    }
  }

  onScopeDispose(() => controller?.abort())

  return { running, error, operationId, execute, attach, cancel }
}
