import { toast } from 'vue-sonner'
import { useWebhooksStore } from '~/stores/webhooks'
import { parseOreError } from '~/utils/parseOreError'

export function useWebhooks(projectName: MaybeRefOrGetter<string>) {
  const store = useWebhooksStore()
  const client = useOreClient()
  const name = computed(() => toValue(projectName))

  async function refresh() {
    const key = name.value
    if (!key) return
    store.upsert(key, { loading: true, error: null })
    try {
      const info = await client.projects.get(key).webhookInfo()
      store.upsert(key, { info, loading: false, error: null })
    } catch (e) {
      const msg = parseOreError(e, 'Failed to load webhook info')
      store.upsert(key, { loading: false, error: msg })
      toast.error(msg)
    }
  }

  async function trigger() {
    const key = name.value
    const info = store.get(key).info
    if (!info?.secret) return false
    try {
      await client.webhook.trigger(key, { secret: info.secret })
      toast.success('Webhook triggered successfully')
      return true
    } catch (e) {
      toast.error(parseOreError(e, 'Failed to trigger webhook'))
      return false
    }
  }

  const entry = computed(() => store.get(name.value))

  return {
    info: computed(() => entry.value.info),
    loading: computed(() => entry.value.loading),
    error: computed(() => entry.value.error),
    refresh,
    trigger,
  }
}
