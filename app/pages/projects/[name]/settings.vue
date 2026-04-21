<script setup lang="ts">
import { CopyIcon, SettingsIcon, WebhookIcon, WebhookOffIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const name = computed(() => route.params.name as string)

useHead({ title: computed(() => `Settings — ${name.value}`) })

const {
  info: webhook,
  loading: webhookLoading,
  refresh: fetchWebhook,
  trigger: triggerWebhookCall,
} = useWebhooks(name)
const triggering = ref(false)

const webhookUrl = computed(() => webhook.value?.url ?? '')

async function triggerWebhook() {
  if (!webhook.value?.secret) return
  triggering.value = true
  try {
    await triggerWebhookCall()
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
      <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <SettingsIcon class="size-6 text-muted-foreground" />
        Settings
      </h1>
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
          <div v-if="webhookLoading" class="flex gap-2">
            <Skeleton class="h-9 flex-1" />
            <Skeleton class="size-9 shrink-0" />
            <Skeleton class="size-9 shrink-0" />
          </div>

          <Empty v-else-if="!webhook || !webhook.enabled" class="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WebhookOffIcon />
              </EmptyMedia>
              <EmptyTitle>Webhook disabled</EmptyTitle>
              <EmptyDescription>
                Webhooks are not enabled for this project.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>

          <InputGroup v-else>
            <InputGroupInput
              :model-value="webhookUrl"
              readonly
              class="font-mono text-xs"
            />
            <InputGroupAddon align="inline-end">
              <Tooltip>
                <TooltipTrigger as-child>
                  <InputGroupButton size="icon-sm" @click="copyToClipboard(webhookUrl)">
                    <CopyIcon />
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>Copy URL</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger as-child>
                  <InputGroupButton
                    size="icon-sm"
                    :disabled="triggering || !webhook.secret"
                    @click="triggerWebhook"
                  >
                    <Spinner v-if="triggering" />
                    <WebhookIcon v-else />
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>Trigger webhook</TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete project</CardTitle>
          <CardDescription>
            Permanently delete this project and stop all running servers. This cannot be undone.
          </CardDescription>
          <CardAction>
            <Button variant="destructive" size="sm" @click="showConfirm = true">
              Delete project
            </Button>
          </CardAction>
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
            <Spinner v-if="removing" class="mr-1.5" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
