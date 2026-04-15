import type { BackupResponse } from '@oreforge/sdk'
import { defineStore } from 'pinia'

export const useBackupsStore = defineStore('backups', () => {
  const entries = ref<Record<string, Record<string, BackupResponse>>>({})
  const loading = ref<Record<string, boolean>>({})
  const error = ref<Record<string, string | null>>({})
  const fetchedAt = ref<Record<string, number>>({})

  function forProject(project: string): BackupResponse[] {
    const bucket = entries.value[project]
    return bucket ? Object.values(bucket) : []
  }

  function get(project: string, id: string): BackupResponse | undefined {
    return entries.value[project]?.[id]
  }

  function setForProject(project: string, backups: BackupResponse[]) {
    const next: Record<string, BackupResponse> = {}
    for (const b of backups) next[b.id] = b
    entries.value[project] = next
  }

  function upsert(project: string, backup: BackupResponse) {
    const bucket = entries.value[project] ?? {}
    bucket[backup.id] = backup
    entries.value[project] = bucket
  }

  function removeOne(project: string, id: string) {
    const bucket = entries.value[project]
    if (!bucket) return
    delete bucket[id]
  }

  function setLoading(project: string, value: boolean) {
    loading.value[project] = value
  }

  function setError(project: string, message: string | null) {
    error.value[project] = message
  }

  function setFetchedAt(project: string, ts: number) {
    fetchedAt.value[project] = ts
  }

  return {
    entries,
    loading,
    error,
    fetchedAt,
    forProject,
    get,
    setForProject,
    upsert,
    removeOne,
    setLoading,
    setError,
    setFetchedAt,
  }
})
