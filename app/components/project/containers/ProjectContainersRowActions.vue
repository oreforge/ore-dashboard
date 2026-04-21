<script setup lang="ts">
import type { ContainerState } from '@oreforge/sdk'
import { MoreHorizontalIcon, PlayIcon, RefreshCwIcon, SquareIcon } from 'lucide-vue-next'

const props = defineProps<{
  projectName: string
  containerName: string
  containerState: ContainerState
  type: 'server' | 'service'
}>()

const ops =
  props.type === 'server'
    ? useServerOperations(props.projectName, props.containerName)
    : useServiceOperations(props.projectName, props.containerName)

const isRunning = computed(() => props.containerState === 'running')
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="size-8">
        <MoreHorizontalIcon class="size-4" />
        <span class="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel class="text-xs">Actions</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        :disabled="isRunning || ops.anyRunning.value"
        @click="ops.handleStart()"
      >
        <Spinner v-if="ops.start.running.value" class="mr-2" />
        <PlayIcon v-else class="mr-2 size-4" />
        Start
      </DropdownMenuItem>
      <DropdownMenuItem
        :disabled="!isRunning || ops.anyRunning.value"
        @click="ops.handleStop()"
      >
        <Spinner v-if="ops.stop.running.value" class="mr-2" />
        <SquareIcon v-else class="mr-2 size-4" />
        Stop
      </DropdownMenuItem>
      <DropdownMenuItem
        :disabled="!isRunning || ops.anyRunning.value"
        @click="ops.handleRestart()"
      >
        <Spinner v-if="ops.restart.running.value" class="mr-2" />
        <RefreshCwIcon v-else class="mr-2 size-4" />
        Restart
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
