import { toast } from 'vue-sonner'
import { usePollingSource } from '~/composables/internal/usePollingSource'
import { PROJECT_LIST_INTERVAL } from '~/config/polling'
import { useProjectStatusStore } from '~/stores/projectStatus'
import { useProjectsStore } from '~/stores/projects'
import type { ProjectEntry } from '~/types/project'
import { parseOreError } from '~/utils/parseOreError'

let lastErrorKey: string | null = null

async function fetchProjects() {
  const store = useProjectsStore()
  const statusStore = useProjectStatusStore()
  const client = useOreClient()

  try {
    const { projects: rawNames } = await client.projects.list()
    const names = rawNames ?? []
    const settled = await Promise.allSettled(
      names.map(async (name) => ({
        name,
        status: await client.projects.get(name).status(),
      })),
    )

    names.forEach((name, i) => {
      const result = settled[i] as PromiseSettledResult<{
        name: string
        status: ProjectEntry['status']
      }>
      if (result.status === 'fulfilled') {
        statusStore.upsert(name, {
          status: result.value.status,
          loading: false,
          error: null,
          fetchedAt: Date.now(),
        })
      } else {
        statusStore.upsert(name, {
          error: parseOreError(result.reason, 'Failed to fetch status'),
          loading: false,
        })
      }
    })

    store.setNames(names)
    store.setError(null)
    store.setFetchedAt(Date.now())
    lastErrorKey = null
  } catch (e) {
    const msg = parseOreError(e)
    if (lastErrorKey !== msg) {
      toast.error(msg)
      lastErrorKey = msg
    }
    store.setError(msg)
  } finally {
    useProjectsStore().setLoading(false)
  }
}

export function useProjects() {
  const store = useProjectsStore()
  const statusStore = useProjectStatusStore()
  const client = useOreClient()

  const { refresh } = usePollingSource('projects:list', {
    fetcher: fetchProjects,
    interval: PROJECT_LIST_INTERVAL,
  })

  const projects = computed<ProjectEntry[]>(() =>
    store.names.map((name) => {
      const entry = statusStore.get(name)
      return {
        name,
        status: entry.status,
        loading: entry.loading,
        error: entry.error,
      }
    }),
  )

  async function add(url: string, name?: string) {
    const result = await client.projects.add({ url, name: name || undefined })
    await fetchProjects()
    return result
  }

  async function remove(name: string) {
    await client.projects.remove(name)
    statusStore.remove(name)
    store.removeName(name)
    await fetchProjects()
  }

  return {
    projects,
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    fetchedAt: computed(() => store.fetchedAt),
    refresh,
    add,
    remove,
  }
}
