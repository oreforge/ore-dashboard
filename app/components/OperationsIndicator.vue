<script setup lang="ts">
import { ActivityIcon } from 'lucide-vue-next'

const { operations, count } = useActiveOperations()

function formatAction(action: string) {
  return action.charAt(0).toUpperCase() + action.slice(1)
}

function formatTarget(op: { project: string; target?: string | null }) {
  return op.target ? `${op.project} / ${op.target}` : op.project
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        size="sm"
        variant="ghost"
        class="relative h-8 gap-1.5"
        :class="count === 0 ? 'text-muted-foreground' : ''"
      >
        <ActivityIcon class="size-4" :class="count > 0 ? 'text-primary' : ''" />
        <span class="tabular-nums">{{ count }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" class="w-80 p-0">
      <div class="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
        Active operations
      </div>
      <Empty v-if="count === 0" class="py-6">
        <EmptyTitle class="text-sm font-normal text-muted-foreground">
          No operations running
        </EmptyTitle>
      </Empty>
      <ItemGroup v-else class="max-h-72 overflow-y-auto">
        <Item v-for="op in operations" :key="op.id" size="sm">
          <ItemContent>
            <ItemTitle>{{ formatAction(op.action) }}</ItemTitle>
            <ItemDescription>{{ formatTarget(op) }}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <span class="text-xs text-muted-foreground capitalize">{{ op.status }}</span>
          </ItemActions>
        </Item>
      </ItemGroup>
    </PopoverContent>
  </Popover>
</template>
