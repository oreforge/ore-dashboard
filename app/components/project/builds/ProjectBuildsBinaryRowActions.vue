<script setup lang="ts">
import type { BinaryEntry } from '@oreforge/sdk'
import { CopyIcon, ExternalLinkIcon, MoreHorizontalIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{ binary: BinaryEntry }>()

function copy(text: string, label: string) {
  navigator.clipboard.writeText(text)
  toast.success(`${label} copied`)
}
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
      <DropdownMenuItem @click="copy(props.binary.url, 'URL')">
        <CopyIcon class="mr-1.5 size-3.5" />
        Copy URL
      </DropdownMenuItem>
      <DropdownMenuItem @click="copy(props.binary.sha256, 'SHA-256')">
        <CopyIcon class="mr-1.5 size-3.5" />
        Copy SHA-256
      </DropdownMenuItem>
      <DropdownMenuItem as-child>
        <a :href="props.binary.url" target="_blank" rel="noopener noreferrer">
          <ExternalLinkIcon class="mr-1.5 size-3.5" />
          Open URL
        </a>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
