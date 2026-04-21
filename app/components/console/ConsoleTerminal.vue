<script setup lang="ts">
import { RefreshCwIcon } from 'lucide-vue-next'
import { useSidebar } from '~/components/ui/sidebar'

const props = defineProps<{
  projectName: string
  serverName: string
}>()

const { terminalRef, state, error, connecting, connected, connect, disconnect, reconnect, fit } =
  useConsole(
    () => props.projectName,
    () => props.serverName,
  )

defineExpose({ connecting, connected, state })

const { state: sidebarState } = useSidebar()
watch(sidebarState, () => {
  setTimeout(fit, 200)
})

watch(
  () => props.serverName,
  () => {
    disconnect()
    nextTick(connect)
  },
)

onMounted(connect)

const statusLabel = computed(() => {
  switch (state.value) {
    case 'connecting':
      return 'Connecting'
    case 'connected':
      return 'Connected'
    case 'disconnected':
      return 'Disconnected'
    case 'error':
      return 'Error'
    default:
      return 'Idle'
  }
})

const statusDot = computed(() => {
  switch (state.value) {
    case 'connected':
      return 'bg-emerald-500'
    case 'connecting':
      return 'bg-amber-500 animate-pulse'
    case 'error':
      return 'bg-destructive'
    case 'disconnected':
      return 'bg-muted-foreground'
    default:
      return 'bg-muted-foreground/60'
  }
})

const showReconnectBanner = computed(
  () => state.value === 'disconnected' || state.value === 'error',
)
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-3">
    <div class="flex items-center gap-2 text-xs text-muted-foreground">
      <span class="inline-block size-2 shrink-0 rounded-full transition-colors" :class="statusDot" aria-hidden="true" />
      <span>{{ statusLabel }}</span>
    </div>
    <Alert v-if="showReconnectBanner" variant="destructive" class="shrink-0 py-2">
      <AlertDescription class="flex items-center justify-between gap-3 text-xs">
        <span>
          <template v-if="error">{{ error }}</template>
          <template v-else>Console disconnected.</template>
        </span>
        <Button size="sm" variant="outline" class="h-7" @click="reconnect">
          <RefreshCwIcon class="mr-1.5 size-3.5" />
          Reconnect
        </Button>
      </AlertDescription>
    </Alert>
    <Card class="min-h-0 flex-1 overflow-hidden py-0">
      <div class="h-full overflow-hidden p-3">
        <div ref="terminalRef" class="h-full overflow-hidden bg-card" />
      </div>
    </Card>
  </div>
</template>
