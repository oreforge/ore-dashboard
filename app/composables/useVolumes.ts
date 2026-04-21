import type { VolumeResponse } from '@oreforge/sdk'
import { toast } from 'vue-sonner'
import { usePollingSource } from '~/composables/internal/usePollingSource'
import { VOLUMES_INTERVAL } from '~/config/polling'
import { useOperationsStore } from '~/stores/operations'
import { useVolumesStore } from '~/stores/volumes'
import { parseOreError } from '~/utils/parseOreError'

const lastErrorByProject = new Map<string, string | null>()

export function useVolumes(name: MaybeRefOrGetter<string>) {
  const store = useVolumesStore()
  const operationsStore = useOperationsStore()
  const client = useOreClient()
  const projectName = computed(() => toValue(name))

  async function refresh() {
    const key = projectName.value
    if (!key) return
    try {
      const { volumes } = await client.projects.get(key).volumes.list()
      store.setForProject(key, volumes ?? [])
      store.setError(key, null)
      store.setFetchedAt(key, Date.now())
      lastErrorByProject.set(key, null)
    } catch (e) {
      const msg = parseOreError(e)
      if (lastErrorByProject.get(key) !== msg) {
        toast.error(msg)
        lastErrorByProject.set(key, msg)
      }
      store.setError(key, msg)
    } finally {
      store.setLoading(key, false)
    }
  }

  usePollingSource(() => `volumes:${projectName.value}`, {
    fetcher: refresh,
    interval: VOLUMES_INTERVAL,
  })

  async function remove(volumeName: string, force = false): Promise<boolean> {
    const key = projectName.value
    try {
      const op = await client.projects.get(key).volumes.get(volumeName).delete({ force })
      operationsStore.upsert(op)
      toast.success(`Deleting ${volumeName}${force ? ' (force)' : ''}`)
      await refresh()
      return true
    } catch (e) {
      toast.error(parseOreError(e, 'Failed to delete volume'))
      return false
    }
  }

  const volumes = computed<VolumeResponse[]>(() => store.forProject(projectName.value))

  return {
    volumes,
    loading: computed(() => store.loading[projectName.value] ?? true),
    error: computed(() => store.error[projectName.value] ?? null),
    fetchedAt: computed(() => store.fetchedAt[projectName.value] ?? 0),
    refresh,
    remove,
  }
}
