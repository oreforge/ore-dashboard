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

interface ProjectStatusState {
  entries: Record<string, ProjectStatusEntry>
}

export const useProjectStatusStore = defineStore('projectStatus', {
  state: (): ProjectStatusState => ({ entries: {} }),
  getters: {
    get:
      (state) =>
      (name: string): ProjectStatusEntry =>
        state.entries[name] ?? emptyEntry(),
  },
  actions: {
    upsert(name: string, patch: Partial<ProjectStatusEntry>) {
      const current = this.entries[name] ?? emptyEntry()
      this.entries[name] = { ...current, ...patch }
    },
    remove(name: string) {
      delete this.entries[name]
    },
  },
})
