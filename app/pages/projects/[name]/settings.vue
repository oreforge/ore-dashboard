<script setup lang="ts">
import type { WebhookInfoResponse } from '@oreforge/sdk'
import { CopyIcon, Loader2Icon, WebhookIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const name = computed(() => route.params.name as string)
const client = useOreClient()
const { oreApiUrl } = useRuntimeConfig().public

const webhook = ref<WebhookInfoResponse | null>(null)
const webhookLoading = ref(true)
const webhookError = ref<string | null>(null)
const triggering = ref(false)

const webhookUrl = computed(() => {
  if (!webhook.value?.url) return ''
  return `${oreApiUrl}${webhook.value.url}`
})

async function fetchWebhook() {
  webhookLoading.value = true
  webhookError.value = null
  try {
    webhook.value = await client.projects.get(name.value).webhookInfo()
  } catch (e) {
    webhookError.value = e instanceof Error ? e.message : 'Failed to load webhook info'
  } finally {
    webhookLoading.value = false
  }
}

async function triggerWebhook() {
  if (!webhookUrl.value) return
  triggering.value = true
  try {
    const res = await fetch(webhookUrl.value, { method: 'POST' })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { detail?: string }
      throw new Error(body.detail ?? res.statusText)
    }
    toast.success('Webhook triggered successfully')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to trigger webhook')
  } finally {
    triggering.value = false
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.success('Copied to clipboard')
}

onMounted(fetchWebhook)

const { remove } = useProjects()
const removing = ref(false)
const showConfirm = ref(false)

async function handleRemove() {
  removing.value = true
  try {
    await remove(name.value)
    toast.success(`Project "${name.value}" removed`)
    router.push('/')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to remove project')
  } finally {
    removing.value = false
    showConfirm.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight">Settings</h1>
      <p class="mt-0.5 text-sm text-muted-foreground">{{ name }}</p>
    </div>

    <div class="space-y-6">
      <Card>
        <CardHeader>
          <div class="flex items-center gap-2">
            <WebhookIcon class="size-4 text-muted-foreground" />
            <CardTitle>Webhook</CardTitle>
          </div>
          <CardDescription>
            Trigger deployments automatically via an HTTP endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="webhookLoading" class="space-y-3">
            <Skeleton class="h-4 w-48" />
            <Skeleton class="h-9 w-full" />
          </div>

          <Alert v-else-if="webhookError" variant="destructive">
            <AlertDescription class="text-xs">{{ webhookError }}</AlertDescription>
          </Alert>

          <div v-else-if="webhook && !webhook.enabled" class="text-sm text-muted-foreground">
            Webhooks are not enabled for this project.
          </div>

          <div v-else-if="webhook" class="space-y-4">
            <div class="flex gap-2">
              <Input
                :model-value="webhookUrl"
                readonly
                class="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                class="shrink-0"
                @click="copyToClipboard(webhookUrl)"
              >
                <CopyIcon class="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                class="shrink-0"
                :disabled="triggering || !webhook.secret"
                @click="triggerWebhook"
              >
                <Loader2Icon v-if="triggering" class="size-3.5 animate-spin" />
                <WebhookIcon v-else class="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0">
          <div class="space-y-1">
            <CardTitle>Delete project</CardTitle>
            <CardDescription>
              Permanently delete this project and stop all running servers. This cannot be undone.
            </CardDescription>
          </div>
          <Button variant="destructive" size="sm" class="shrink-0" @click="showConfirm = true">
            Delete project
          </Button>
        </CardHeader>
      </Card>
    </div>

    <Dialog v-model:open="showConfirm">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently delete
            <span class="font-semibold text-foreground">{{ name }}</span>
            and stop all running servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showConfirm = false">Cancel</Button>
          <Button variant="destructive" :disabled="removing" @click="handleRemove">
            <Loader2Icon v-if="removing" class="mr-1.5 size-4 animate-spin" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
