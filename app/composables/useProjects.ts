import { OreApiError, OreConnectionError } from '@oreforge/sdk'
import type { ProjectEntry } from '~/types/project'

const projects = ref<ProjectEntry[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
let polling: ReturnType<typeof setInterval> | null = null
let subscribers = 0

async function fetchProjects() {
  const client = useOreClient()
  try {
    const { projects: names } = await client.projects.list()
    const entries = await Promise.allSettled(
      names.map(async (name) => {
        const status = await client.projects.get(name).status()
        return { name, status, loading: false, error: null } as ProjectEntry
      }),
    )
    projects.value = names.map((name, i) => {
      const result = entries[i] as PromiseSettledResult<ProjectEntry>
      if (result.status === 'fulfilled') return result.value
      const reason = (result as PromiseRejectedResult).reason
      let errorMsg = 'Failed to fetch status'
      if (reason instanceof OreConnectionError) errorMsg = 'Unable to connect'
      else if (reason instanceof OreApiError) errorMsg = reason.detail
      else if (reason instanceof Error) errorMsg = reason.message
      return {
        name,
        status: null,
        loading: false,
        error: errorMsg,
      }
    })
    error.value = null
  } catch (e) {
    if (e instanceof OreConnectionError) {
      error.value = 'Unable to connect to the server'
    } else if (e instanceof OreApiError) {
      error.value = e.detail
    } else {
      error.value = e instanceof Error ? e.message : String(e)
    }
  } finally {
    loading.value = false
  }
}

export function useProjects() {
  const client = useOreClient()

  async function add(url: string, name?: string) {
    const result = await client.projects.add({ url, name: name || undefined })
    await fetchProjects()
    return result
  }

  async function remove(name: string) {
    await client.projects.remove(name)
    await fetchProjects()
  }

  onMounted(() => {
    subscribers++
    if (subscribers === 1) {
      fetchProjects()
      polling = setInterval(fetchProjects, 5000)
    }
  })

  onUnmounted(() => {
    subscribers--
    if (subscribers === 0 && polling) {
      clearInterval(polling)
      polling = null
    }
  })

  return { projects, loading, error, refresh: fetchProjects, add, remove }
}
