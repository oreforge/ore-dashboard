import type { OperationResponse } from '@oreforge/sdk'
import { useOperationsStore } from '~/stores/operations'
import { parseOreError } from '~/utils/parseOreError'

const TERMINAL_STATUSES = new Set(['completed', 'failed', 'cancelled'])

export function useOperationStream() {
  const store = useOperationsStore()
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
        store.remove(id)
        if (op.status === 'failed' && op.error) error.value = op.error
        return
      }
      store.upsert(op)
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
      store.upsert(op)
      const logs = client.operations.get(op.id).logs(0, { signal: ctrl.signal })
      await logs.drain()
      try {
        const final = await client.operations.get(op.id).get({ signal: ctrl.signal })
        if (TERMINAL_STATUSES.has(final.status)) {
          if (final.status === 'failed' && final.error) error.value = final.error
          store.remove(op.id)
        } else {
          store.upsert(final)
        }
      } catch {
        store.remove(op.id)
      }
    } catch (e) {
      setError(e)
      if (operationId.value) store.remove(operationId.value)
    } finally {
      if (controller === ctrl) controller = null
      running.value = false
    }
  }

  function setError(e: unknown) {
    if (e instanceof Error && e.name === 'AbortError') return
    error.value = parseOreError(e)
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
      error.value = parseOreError(e)
    }
  }

  onScopeDispose(() => controller?.abort())

  return { running, error, operationId, execute, attach, cancel }
}
