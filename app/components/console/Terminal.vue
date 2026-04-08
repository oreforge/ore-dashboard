<script setup lang="ts">
import { useSidebar } from '~/components/ui/sidebar'

const props = defineProps<{
  projectName: string
  serverName: string
}>()

const { terminalRef, connecting, connected, error, connect, disconnect, fit } = useConsole(
  () => props.projectName,
  () => props.serverName,
)

defineExpose({ connecting, connected })

const { state } = useSidebar()
watch(state, () => {
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
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-3">
    <Alert v-if="error" variant="destructive" class="shrink-0 py-2">
      <AlertDescription class="text-xs">{{ error }}</AlertDescription>
    </Alert>
    <Card class="min-h-0 flex-1 overflow-hidden py-0">
      <div class="h-full overflow-hidden p-3">
        <div ref="terminalRef" class="h-full overflow-hidden bg-card" />
      </div>
    </Card>
  </div>
</template>
