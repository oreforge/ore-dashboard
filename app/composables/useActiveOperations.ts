import { toast } from 'vue-sonner'
import { usePollingSource } from '~/composables/internal/usePollingSource'
import { OPERATIONS_INTERVAL } from '~/config/polling'
import { useOperationsStore } from '~/stores/operations'
import { parseOreError } from '~/utils/parseOreError'

let primePromise: Promise<void> | null = null
let lastErrorKey: string | null = null

async function fetchAll() {
  const client = useOreClient()
  const [pending, running] = await Promise.all([
    client.operations.list({ status: 'pending' }),
    client.operations.list({ status: 'running' }),
  ])
  return [...pending.operations, ...running.operations]
}

async function refresh() {
  const store = useOperationsStore()
  try {
    const ops = await fetchAll()
    store.setMany(ops)
    store.setPrimed(true)
    lastErrorKey = null
  } catch (e) {
    const msg = parseOreError(e)
    if (lastErrorKey !== msg) {
      toast.error(msg)
      lastErrorKey = msg
    }
  }
}

export function useActiveOperations(options: { poll?: boolean } = {}) {
  const store = useOperationsStore()

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

  return {
    operations: computed(() => store.list),
    count: computed(() => store.count),
    primed: computed(() => store.primed),
    ensurePrimed,
    refresh,
    forProject: (project: string) => store.forProject(project),
    forTarget: (project: string, target: string | undefined) => store.forTarget(project, target),
  }
}
