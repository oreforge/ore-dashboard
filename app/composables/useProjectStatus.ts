import type { NetworkStatus } from '@oreforge/sdk'
import { OreApiError, OreConnectionError } from '@oreforge/sdk'
import { toast } from 'vue-sonner'

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
      loading.value = false
    } catch (e) {
      let msg: string
      if (e instanceof OreConnectionError) {
        msg = 'Unable to reach the server. Check your connection.'
      } else if (e instanceof OreApiError) {
        msg = e.detail
      } else {
        msg = e instanceof Error ? e.message : String(e)
      }
      if (error.value !== msg) toast.error(msg)
      error.value = msg
      if (status.value) loading.value = false
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
