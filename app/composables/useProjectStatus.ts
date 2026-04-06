import type { NetworkStatus } from '@oreforge/sdk'
import { OreApiError, OreConnectionError } from '@oreforge/sdk'

export function useProjectStatus(name: MaybeRef<string>) {
  const client = useOreClient()
  const status = ref<NetworkStatus | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const fetchedAt = ref<number>(0)
  let polling: ReturnType<typeof setInterval> | null = null

  async function refresh() {
    try {
      status.value = await client.projects.get(toValue(name)).status()
      fetchedAt.value = Date.now()
      error.value = null
    } catch (e) {
      if (e instanceof OreConnectionError) {
        error.value = 'Unable to reach the server. Check your connection.'
      } else if (e instanceof OreApiError) {
        error.value = e.detail
      } else {
        error.value = e instanceof Error ? e.message : String(e)
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    refresh()
    polling = setInterval(refresh, 3000)
  })

  onUnmounted(() => {
    if (polling) clearInterval(polling)
  })

  return { status, loading, error, fetchedAt, refresh }
}
