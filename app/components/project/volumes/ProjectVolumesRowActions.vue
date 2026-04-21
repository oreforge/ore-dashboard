<script setup lang="ts">
import { MoreHorizontalIcon, Trash2Icon } from 'lucide-vue-next'

defineProps<{
  inUse: boolean
}>()

const emit = defineEmits<(e: 'delete') => void>()
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
        class="text-destructive focus:text-destructive"
        @click="emit('delete')"
      >
        <Trash2Icon class="mr-2 size-4" />
        Delete…
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
