<script setup lang="ts">
const props = defineProps<{
  uptimeNs?: number
  fetchedAt?: number
}>()

const { now } = useNow()

const display = computed(() => {
  if (!props.uptimeNs || !props.fetchedAt) return '—'
  const elapsedMs = now.value - props.fetchedAt
  const totalSecs = Math.floor(props.uptimeNs / 1_000_000_000) + Math.floor(elapsedMs / 1000)
  return formatUptime(totalSecs)
})
</script>

<template>
  <span>{{ display }}</span>
</template>
