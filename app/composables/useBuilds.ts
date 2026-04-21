import type { BinaryEntry, BuildEntry } from '@oreforge/sdk'
import { toast } from 'vue-sonner'
import { usePollingSource } from '~/composables/internal/usePollingSource'
import { BUILDS_INTERVAL } from '~/config/polling'
import { useBuildsStore } from '~/stores/builds'
import { parseOreError } from '~/utils/parseOreError'

const lastErrorByProject = new Map<string, string | null>()

export function useBuilds(name: MaybeRefOrGetter<string>) {
  const store = useBuildsStore()
  const client = useOreClient()
  const projectName = computed(() => toValue(name))

  async function refresh() {
    const key = projectName.value
    if (!key) return
    try {
      const res = await client.projects.get(key).builds()
      const builds: BuildEntry[] = Object.values(res.builds ?? {})
      const binaries: BinaryEntry[] = Object.values(res.binaries ?? {})
      store.setForProject(key, { builds, binaries })
      store.setError(key, null)
      store.setFetchedAt(key, Date.now())
      lastErrorByProject.set(key, null)
    } catch (e) {
      const msg = parseOreError(e, 'Failed to load builds')
      if (lastErrorByProject.get(key) !== msg) {
        toast.error(msg)
        lastErrorByProject.set(key, msg)
      }
      store.setError(key, msg)
    } finally {
      store.setLoading(key, false)
    }
  }

  usePollingSource(() => `builds:${projectName.value}`, {
    fetcher: refresh,
    interval: BUILDS_INTERVAL,
  })

  return {
    builds: computed<BuildEntry[]>(() => store.buildsFor(projectName.value)),
    binaries: computed<BinaryEntry[]>(() => store.binariesFor(projectName.value)),
    loading: computed(() => store.loading[projectName.value] ?? true),
    error: computed(() => store.error[projectName.value] ?? null),
    fetchedAt: computed(() => store.fetchedAt[projectName.value] ?? 0),
    refresh,
  }
}
