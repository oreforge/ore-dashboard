import { toast } from 'vue-sonner'
import { usePollingSource } from '~/composables/internal/usePollingSource'
import { PROJECT_STATUS_INTERVAL } from '~/config/polling'
import { useProjectStatusStore } from '~/stores/projectStatus'
import { parseOreError } from '~/utils/parseOreError'

const lastErrorByProject = new Map<string, string | null>()

export function useProjectStatus(name: MaybeRefOrGetter<string>) {
  const store = useProjectStatusStore()
  const client = useOreClient()
  const projectName = computed(() => toValue(name))

  async function refresh() {
    const key = projectName.value
    if (!key) return
    try {
      const status = await client.projects.get(key).status()
      store.upsert(key, {
        status,
        loading: false,
        error: null,
        fetchedAt: Date.now(),
      })
      lastErrorByProject.set(key, null)
    } catch (e) {
      const msg = parseOreError(e)
      if (lastErrorByProject.get(key) !== msg) {
        toast.error(msg)
        lastErrorByProject.set(key, msg)
      }
      const current = store.get(key)
      store.upsert(key, {
        error: msg,
        loading: current.status ? false : current.loading,
      })
    }
  }

  usePollingSource(() => `projectStatus:${projectName.value}`, {
    fetcher: refresh,
    interval: PROJECT_STATUS_INTERVAL,
  })

  const entry = computed(() => store.get(projectName.value))

  return {
    status: computed(() => entry.value.status),
    loading: computed(() => entry.value.loading),
    error: computed(() => entry.value.error),
    fetchedAt: computed(() => entry.value.fetchedAt),
    refresh,
  }
}
