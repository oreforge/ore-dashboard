import type { BinaryEntry, BuildEntry } from '@oreforge/sdk'
import { defineStore } from 'pinia'

interface BuildsBucket {
  builds: BuildEntry[]
  binaries: BinaryEntry[]
}

export const useBuildsStore = defineStore('builds', () => {
  const entries = ref<Record<string, BuildsBucket>>({})
  const loading = ref<Record<string, boolean>>({})
  const error = ref<Record<string, string | null>>({})
  const fetchedAt = ref<Record<string, number>>({})

  function buildsFor(project: string): BuildEntry[] {
    return entries.value[project]?.builds ?? []
  }

  function binariesFor(project: string): BinaryEntry[] {
    return entries.value[project]?.binaries ?? []
  }

  function setForProject(project: string, data: BuildsBucket) {
    entries.value[project] = data
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
    buildsFor,
    binariesFor,
    setForProject,
    setLoading,
    setError,
    setFetchedAt,
  }
})
