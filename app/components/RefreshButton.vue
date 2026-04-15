<script setup lang="ts">
import { RefreshCwIcon } from 'lucide-vue-next'

const props = defineProps<{
  refresh: () => Promise<void> | void
}>()

const spinning = ref(false)

async function onClick() {
  if (spinning.value) return
  spinning.value = true
  try {
    await props.refresh()
  } finally {
    setTimeout(() => {
      spinning.value = false
    }, 400)
  }
}
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button size="icon" variant="ghost" class="size-8" :disabled="spinning" @click="onClick">
        <RefreshCwIcon class="size-4 transition-transform" :class="spinning ? 'animate-spin' : ''" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Refresh</TooltipContent>
  </Tooltip>
</template>
