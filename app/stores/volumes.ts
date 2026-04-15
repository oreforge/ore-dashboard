import type { VolumeResponse } from '@oreforge/sdk'
import { defineStore } from 'pinia'

export const useVolumesStore = defineStore('volumes', () => {
  const entries = ref<Record<string, Record<string, VolumeResponse>>>({})
  const loading = ref<Record<string, boolean>>({})
  const error = ref<Record<string, string | null>>({})
  const fetchedAt = ref<Record<string, number>>({})

  function forProject(project: string): VolumeResponse[] {
    const bucket = entries.value[project]
    return bucket ? Object.values(bucket) : []
  }

  function get(project: string, name: string): VolumeResponse | undefined {
    return entries.value[project]?.[name]
  }

  function setForProject(project: string, volumes: VolumeResponse[]) {
    const next: Record<string, VolumeResponse> = {}
    for (const v of volumes) next[v.name] = v
    entries.value[project] = next
  }

  function upsert(project: string, volume: VolumeResponse) {
    const bucket = entries.value[project] ?? {}
    bucket[volume.name] = volume
    entries.value[project] = bucket
  }

  function removeOne(project: string, name: string) {
    const bucket = entries.value[project]
    if (!bucket) return
    delete bucket[name]
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
