import { defineStore } from 'pinia'

export const useProjectsStore = defineStore('projects', () => {
  const names = ref<string[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const fetchedAt = ref(0)

  function setNames(next: string[]) {
    names.value = next
  }

  function removeName(name: string) {
    const i = names.value.indexOf(name)
    if (i !== -1) names.value.splice(i, 1)
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  function setError(message: string | null) {
    error.value = message
  }

  function setFetchedAt(ts: number) {
    fetchedAt.value = ts
  }

  return {
    names,
    loading,
    error,
    fetchedAt,
    setNames,
    removeName,
    setLoading,
    setError,
    setFetchedAt,
  }
})
