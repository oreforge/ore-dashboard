import type { NetworkStatus } from '@oreforge/sdk'
import { defineStore } from 'pinia'

export interface ProjectStatusEntry {
  status: NetworkStatus | null
  loading: boolean
  error: string | null
  fetchedAt: number
}

function emptyEntry(): ProjectStatusEntry {
  return { status: null, loading: true, error: null, fetchedAt: 0 }
}

export const useProjectStatusStore = defineStore('projectStatus', () => {
  const entries = ref<Record<string, ProjectStatusEntry>>({})

  function get(name: string): ProjectStatusEntry {
    return entries.value[name] ?? emptyEntry()
  }

  function upsert(name: string, patch: Partial<ProjectStatusEntry>) {
    const current = entries.value[name] ?? emptyEntry()
    entries.value[name] = { ...current, ...patch }
  }

  function remove(name: string) {
    delete entries.value[name]
  }

  return { entries, get, upsert, remove }
})
