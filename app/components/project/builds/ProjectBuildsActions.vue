<script setup lang="ts">
import type { CleanRequest } from '@oreforge/sdk'
import { ChevronDownIcon, Trash2Icon } from 'lucide-vue-next'

const props = defineProps<{ projectName: string }>()

type CleanTarget = Extract<CleanRequest['target'], 'images' | 'cache' | 'builds'>

const ops = useProjectOperations(() => props.projectName)

const confirmTarget = ref<CleanTarget | null>(null)

const LABELS: Record<CleanTarget, string> = {
  images: 'Clean images',
  cache: 'Clean cache',
  builds: 'Clean builds',
}

const DESCRIPTIONS: Record<CleanTarget, string> = {
  images:
    'Removes container images built for this project. Servers will rebuild them on next start.',
  cache: 'Removes cached build artifacts. Next build will be slower but produces the same result.',
  builds: 'Removes build metadata. Tracked builds disappear from this page.',
}

function runConfirmed() {
  const target = confirmTarget.value
  confirmTarget.value = null
  if (target) ops.handleClean(target)
}
</script>

<template>
  <div>
    <ButtonGroup>
      <Button
        size="sm"
        variant="outline"
        :disabled="ops.anyRunning"
        @click="confirmTarget = 'cache'"
      >
        <Spinner v-if="ops.clean.running" class="mr-1.5" />
        <Trash2Icon v-else class="mr-1.5 size-3.5" />
        Clean cache
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button size="sm" variant="outline" class="px-1.5" :disabled="ops.anyRunning">
            <ChevronDownIcon class="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="confirmTarget = 'images'">Clean images</DropdownMenuItem>
          <DropdownMenuItem @click="confirmTarget = 'cache'">Clean cache</DropdownMenuItem>
          <DropdownMenuItem @click="confirmTarget = 'builds'">Clean builds</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>

    <Dialog :open="!!confirmTarget" @update:open="(v) => { if (!v) confirmTarget = null }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ confirmTarget ? LABELS[confirmTarget] : '' }}?</DialogTitle>
          <DialogDescription>
            {{ confirmTarget ? DESCRIPTIONS[confirmTarget] : '' }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="confirmTarget = null">Cancel</Button>
          <Button variant="destructive" @click="runConfirmed">
            {{ confirmTarget ? LABELS[confirmTarget] : 'Clean' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
