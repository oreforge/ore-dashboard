import { defineStore } from 'pinia'

interface ProjectsState {
  names: string[]
  loading: boolean
  error: string | null
  fetchedAt: number
}

export const useProjectsStore = defineStore('projects', {
  state: (): ProjectsState => ({
    names: [],
    loading: true,
    error: null,
    fetchedAt: 0,
  }),
  actions: {
    setNames(names: string[]) {
      this.names = names
    },
    removeName(name: string) {
      const i = this.names.indexOf(name)
      if (i !== -1) this.names.splice(i, 1)
    },
    setLoading(value: boolean) {
      this.loading = value
    },
    setError(message: string | null) {
      this.error = message
    },
    setFetchedAt(ts: number) {
      this.fetchedAt = ts
    },
  },
})
