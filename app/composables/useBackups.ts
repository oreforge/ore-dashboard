import type {
  BackupListOptions,
  BackupResponse,
  BackupStatus,
  CreateBackupRequest,
} from '@oreforge/sdk'
import { toast } from 'vue-sonner'
import { usePollingSource } from '~/composables/internal/usePollingSource'
import { BACKUPS_INTERVAL } from '~/config/polling'
import { useBackupsStore } from '~/stores/backups'
import { useOperationsStore } from '~/stores/operations'
import { parseOreError } from '~/utils/parseOreError'

const lastErrorByProject = new Map<string, string | null>()

export interface BackupsFilter {
  volume?: string
  status?: BackupStatus
}

export function useBackups(name: MaybeRef<string>, filter?: MaybeRef<BackupsFilter>) {
  const store = useBackupsStore()
  const operationsStore = useOperationsStore()
  const client = useOreClient()
  const projectName = computed(() => toValue(name))
  const filterRef = computed<BackupsFilter>(() => toValue(filter) ?? {})

  async function refresh() {
    const key = projectName.value
    if (!key) return
    try {
      const opts: BackupListOptions = {}
      const f = filterRef.value
      if (f.volume) opts.volume = f.volume
      if (f.status) opts.status = f.status
      const { backups } = await client.projects.get(key).backups.list(opts)
      store.setForProject(key, backups ?? [])
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

  usePollingSource(
    () =>
      `backups:${projectName.value}:${filterRef.value.volume ?? ''}:${filterRef.value.status ?? ''}`,
    {
      fetcher: refresh,
      interval: BACKUPS_INTERVAL,
    },
  )

  async function create(request: CreateBackupRequest): Promise<boolean> {
    const key = projectName.value
    try {
      const op = await client.projects.get(key).backups.create(request)
      operationsStore.upsert(op)
      toast.success(`Backup started for ${request.volume}`)
      await refresh()
      return true
    } catch (e) {
      toast.error(parseOreError(e, 'Failed to create backup'))
      return false
    }
  }

  async function remove(id: string): Promise<boolean> {
    const key = projectName.value
    try {
      await client.projects.get(key).backups.get(id).delete()
      store.removeOne(key, id)
      toast.success('Backup deleted')
      return true
    } catch (e) {
      toast.error(parseOreError(e, 'Failed to delete backup'))
      return false
    }
  }

  async function restore(id: string, keepPreRestore = true): Promise<boolean> {
    const key = projectName.value
    try {
      const op = await client.projects
        .get(key)
        .backups.get(id)
        .restore({ keep_pre_restore: keepPreRestore })
      operationsStore.upsert(op)
      toast.success('Restoring backup')
      await refresh()
      return true
    } catch (e) {
      toast.error(parseOreError(e, 'Failed to restore backup'))
      return false
    }
  }

  async function verify(id: string): Promise<boolean> {
    const key = projectName.value
    try {
      const op = await client.projects.get(key).backups.get(id).verify()
      operationsStore.upsert(op)
      toast.success('Verifying backup')
      return true
    } catch (e) {
      toast.error(parseOreError(e, 'Failed to verify backup'))
      return false
    }
  }

  const backups = computed<BackupResponse[]>(() => store.forProject(projectName.value))

  return {
    backups,
    loading: computed(() => store.loading[projectName.value] ?? true),
    error: computed(() => store.error[projectName.value] ?? null),
    fetchedAt: computed(() => store.fetchedAt[projectName.value] ?? 0),
    refresh,
    create,
    remove,
    restore,
    verify,
  }
}
