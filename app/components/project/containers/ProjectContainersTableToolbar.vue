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

function bulkAction(action: 'handleStart' | 'handleStop' | 'handleRestart') {
  for (const row of selectedRows.value) {
    const ops =
      props.type === 'server'
        ? useServerOperations(props.projectName, row.original.name)
        : useServiceOperations(props.projectName, row.original.name)
    ops[action]()
  }
  props.table.toggleAllPageRowsSelected(false)
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
      <Button variant="outline" @click="bulkAction('handleStart')">
        <PlayIcon class="mr-1.5 size-4" />
        Start
      </Button>
      <Button variant="outline" @click="bulkAction('handleStop')">
        <SquareIcon class="mr-1.5 size-4" />
        Stop
      </Button>
      <Button variant="outline" @click="bulkAction('handleRestart')">
        <RefreshCwIcon class="mr-1.5 size-4" />
        Restart
      </Button>
    </div>
  </div>
</template>
