<script setup lang="ts">
const props = defineProps<{
  fetchedAt: number
}>()

const { now } = useNow()

const label = computed(() => {
  if (!props.fetchedAt) return ''
  const secs = Math.max(0, Math.floor((now.value - props.fetchedAt) / 1000))
  if (secs < 5) return 'just now'
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  return `${hours}h ago`
})
</script>

<template>
  <span class="text-xs text-muted-foreground tabular-nums">updated {{ label }}</span>
</template>
