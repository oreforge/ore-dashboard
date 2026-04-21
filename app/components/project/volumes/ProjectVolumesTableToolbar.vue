<script setup lang="ts">
import type { VolumeResponse } from '@oreforge/sdk'
import type { Table } from '@tanstack/vue-table'
import { Trash2Icon } from 'lucide-vue-next'

const props = defineProps<{
  table: Table<VolumeResponse>
}>()

const emit = defineEmits<(e: 'bulkDelete', rows: VolumeResponse[]) => void>()

const selectedRows = computed(() => props.table.getFilteredSelectedRowModel().rows)
const hasSelection = computed(() => selectedRows.value.length > 0)

function handleBulkDelete() {
  emit(
    'bulkDelete',
    selectedRows.value.map((r) => r.original),
  )
}
</script>

<template>
  <div class="flex items-center pb-4">
    <Input
      class="max-w-sm"
      placeholder="Filter volumes..."
      :model-value="(table.getColumn('name')?.getFilterValue() as string) ?? ''"
      @update:model-value="table.getColumn('name')?.setFilterValue($event)"
    />
    <div v-if="hasSelection" class="ml-auto flex items-center gap-2">
      <span class="text-sm text-muted-foreground">
        {{ selectedRows.length }} of {{ table.getFilteredRowModel().rows.length }} selected
      </span>
      <Separator orientation="vertical" class="h-6" />
      <Button variant="outline" class="text-destructive" @click="handleBulkDelete">
        <Trash2Icon class="mr-1.5 size-4" />
        Delete
      </Button>
    </div>
  </div>
</template>
