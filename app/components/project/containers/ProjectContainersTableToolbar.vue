<script setup lang="ts" generic="TRow extends { name: string }">
import type { Table } from '@tanstack/vue-table'
import { PlayIcon, RefreshCwIcon, SquareIcon } from 'lucide-vue-next'

const props = defineProps<{
  table: Table<TRow>
  projectName: string
  type: 'server' | 'service'
}>()

const selectedRows = computed(() => props.table.getFilteredSelectedRowModel().rows)
const hasSelection = computed(() => selectedRows.value.length > 0)
const selectedNames = computed(() => selectedRows.value.map((r) => r.original.name))

const batch = useBatchContainerOperations(() => props.projectName, props.type)

async function handleStart() {
  const names = selectedNames.value
  props.table.toggleAllPageRowsSelected(false)
  await batch.handleStart(names)
}

async function handleStop() {
  const names = selectedNames.value
  props.table.toggleAllPageRowsSelected(false)
  await batch.handleStop(names)
}

async function handleRestart() {
  const names = selectedNames.value
  props.table.toggleAllPageRowsSelected(false)
  await batch.handleRestart(names)
}
</script>

<template>
  <div class="flex items-center gap-2 pb-4">
    <Input
      class="max-w-sm"
      :placeholder="`Filter ${type}s...`"
      :model-value="(table.getColumn('name')?.getFilterValue() as string) ?? ''"
      @update:model-value="table.getColumn('name')?.setFilterValue($event)"
    />
    <div v-if="hasSelection" class="ml-auto flex items-center gap-2">
      <span class="whitespace-nowrap text-sm text-muted-foreground">
        {{ selectedRows.length }} of {{ table.getFilteredRowModel().rows.length }} selected
      </span>
      <Separator orientation="vertical" class="h-6" />
      <Button variant="outline" :disabled="batch.start.running" @click="handleStart">
        <Spinner v-if="batch.start.running" class="mr-1.5" />
        <PlayIcon v-else class="mr-1.5 size-4" />
        Start
      </Button>
      <Button variant="outline" :disabled="batch.stop.running" @click="handleStop">
        <Spinner v-if="batch.stop.running" class="mr-1.5" />
        <SquareIcon v-else class="mr-1.5 size-4" />
        Stop
      </Button>
      <Button variant="outline" :disabled="batch.restart.running" @click="handleRestart">
        <Spinner v-if="batch.restart.running" class="mr-1.5" />
        <RefreshCwIcon v-else class="mr-1.5 size-4" />
        Restart
      </Button>
    </div>
  </div>
</template>
