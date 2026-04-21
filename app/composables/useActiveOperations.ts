import type { OperationResponse } from '@oreforge/sdk'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import { usePollingSource } from '~/composables/internal/usePollingSource'
import { OPERATIONS_INTERVAL } from '~/config/polling'
import { useOperationsStore } from '~/stores/operations'
import { parseOreError } from '~/utils/parseOreError'

type ResolutionCallback = (op: OperationResponse) => void

const pendingResolutions = new Map<string, ResolutionCallback>()
let primePromise: Promise<void> | null = null
let lastErrorKey: string | null = null

async function fetchAll(): Promise<OperationResponse[]> {
  const client = useOreClient()
  const [pendingRes, runningRes] = await Promise.all([
    client.operations.list({ status: 'pending' }),
    client.operations.list({ status: 'running' }),
  ])
  return [...pendingRes.operations, ...runningRes.operations]
}

async function resolveOp(id: string): Promise<OperationResponse | null> {
  try {
    const client = useOreClient()
    return await client.operations.get(id).get()
  } catch {
    return null
  }
}

async function refresh() {
  const store = useOperationsStore()
  try {
    const ops = await fetchAll()
    const previousIds = new Set(store.list.map((op) => op.id))
    store.setMany(ops)
    store.setPrimed(true)
    lastErrorKey = null

    const currentIds = new Set(ops.map((op) => op.id))
    for (const id of previousIds) {
      if (currentIds.has(id)) continue
      const callback = pendingResolutions.get(id)
      if (!callback) continue
      pendingResolutions.delete(id)
      const final = await resolveOp(id)
      if (final) callback(final)
    }
  } catch (e) {
    const msg = parseOreError(e)
    if (lastErrorKey !== msg) {
      toast.error(msg)
      lastErrorKey = msg
    }
  }
}

export function watchOperation(id: string, onResult: ResolutionCallback) {
  pendingResolutions.set(id, onResult)
}

export function useActiveOperations(options: { poll?: boolean } = {}) {
  const store = useOperationsStore()
  const { list: operations, count, primed } = storeToRefs(store)

  function ensurePrimed(): Promise<void> {
    if (store.primed) return Promise.resolve()
    if (!primePromise) {
      primePromise = refresh().finally(() => {
        primePromise = null
      })
    }
    return primePromise
  }

  if (options.poll) {
    usePollingSource('operations:active', {
      fetcher: refresh,
      interval: OPERATIONS_INTERVAL,
    })
  }

  return { operations, count, primed, ensurePrimed, refresh }
}
