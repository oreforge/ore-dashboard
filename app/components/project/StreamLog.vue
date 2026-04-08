<script setup lang="ts">
import type { StreamLine } from '@oreforge/sdk'
import { Loader2Icon } from 'lucide-vue-next'

const props = defineProps<{
  lines: StreamLine[]
  running: boolean
}>()

const viewport = ref<HTMLElement | null>(null)

function formatTime(time?: string) {
  if (!time) return ''
  try {
    return new Date(time).toLocaleTimeString()
  } catch {
    return ''
  }
}

function levelColor(level?: string) {
  switch (level?.toUpperCase()) {
    case 'ERROR':
      return 'text-red-400'
    case 'WARN':
      return 'text-yellow-400'
    case 'INFO':
      return 'text-blue-400'
    case 'DEBUG':
      return 'text-muted-foreground'
    default:
      return 'text-foreground'
  }
}

watch(
  () => props.lines.length,
  async () => {
    await nextTick()
    if (viewport.value) {
      viewport.value.scrollTop = viewport.value.scrollHeight
    }
  },
)
</script>

<template>
  <Card class="flex min-h-0 flex-1 flex-col">
    <CardContent class="min-h-0 flex-1">
      <ScrollArea class="h-full">
        <div ref="viewport" class="font-mono text-xs leading-relaxed">
          <div
            v-if="lines.length === 0 && running"
            class="flex h-full items-center justify-center gap-2 text-muted-foreground"
          >
            <Loader2Icon class="size-4 animate-spin" />
            <span class="text-sm">Running...</span>
          </div>
          <div
            v-else-if="lines.length === 0 && !running"
            class="flex h-full items-center justify-center text-sm text-muted-foreground"
          >
            No output yet. Run an operation to see logs here.
          </div>
          <div v-for="(line, i) in lines" :key="i" class="flex gap-3 py-px">
            <span v-if="line.time" class="shrink-0 select-none tabular-nums text-muted-foreground/60">
              {{ formatTime(line.time) }}
            </span>
            <span
              v-if="line.level"
              :class="levelColor(line.level)"
              class="w-12 shrink-0 select-none text-right uppercase"
            >
              {{ line.level }}
            </span>
            <span :class="line.error ? 'text-red-400' : 'text-foreground/80'">
              {{ line.msg || line.error }}
            </span>
          </div>
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
</template>
