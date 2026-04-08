<script setup lang="ts">
import {
  ChevronDownIcon,
  EraserIcon,
  HammerIcon,
  Loader2Icon,
  PlayIcon,
  RefreshCwIcon,
  SquareIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-vue-next'

const props = defineProps<{ projectName: string }>()

const ops = useProjectOperations(() => props.projectName)

const showLog = computed(() => ops.activeOp.value !== null || ops.lastOp.value !== undefined)
const currentOp = computed(() => ops.activeOp.value ?? ops.lastOp.value)

const upOpen = ref(false)
const upNoCache = ref(false)
const upForce = ref(false)

function runUp() {
  upOpen.value = false
  ops.handleUp({ no_cache: upNoCache.value, force: upForce.value })
  upNoCache.value = false
  upForce.value = false
}

const buildOpen = ref(false)
const buildNoCache = ref(false)

function runBuild() {
  buildOpen.value = false
  ops.handleBuild({ no_cache: buildNoCache.value })
  buildNoCache.value = false
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-2">
      <div class="flex items-center">
        <Button
          size="sm"
          class="rounded-r-none"
          :disabled="ops.anyRunning.value"
          @click="ops.handleUp()"
        >
          <Loader2Icon v-if="ops.up.running.value" class="mr-1.5 size-3.5 animate-spin" />
          <PlayIcon v-else class="mr-1.5 size-3.5" />
          Up
        </Button>
        <Popover v-model:open="upOpen">
          <PopoverTrigger as-child>
            <Button
              size="sm"
              class="rounded-l-none border-l border-l-background/20 px-1.5"
              :disabled="ops.anyRunning.value"
            >
              <ChevronDownIcon class="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" class="w-56 p-3">
            <div class="space-y-3">
              <p class="text-xs font-medium text-muted-foreground">Start options</p>
              <label class="flex items-center justify-between">
                <span class="text-sm">No cache</span>
                <Switch v-model="upNoCache" />
              </label>
              <label class="flex items-center justify-between">
                <span class="text-sm">Force recreate</span>
                <Switch v-model="upForce" />
              </label>
              <Button size="sm" class="w-full" :disabled="ops.anyRunning.value" @click="runUp">
                <PlayIcon class="mr-1.5 size-3.5" />
                Start
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button size="sm" variant="outline" :disabled="ops.anyRunning.value" @click="ops.handleDown()">
        <Loader2Icon v-if="ops.down.running.value" class="mr-1.5 size-3.5 animate-spin" />
        <SquareIcon v-else class="mr-1.5 size-3.5" />
        Down
      </Button>

      <div class="flex items-center">
        <Button
          size="sm"
          variant="outline"
          class="rounded-r-none"
          :disabled="ops.anyRunning.value"
          @click="ops.handleBuild()"
        >
          <Loader2Icon v-if="ops.build.running.value" class="mr-1.5 size-3.5 animate-spin" />
          <HammerIcon v-else class="mr-1.5 size-3.5" />
          Build
        </Button>
        <Popover v-model:open="buildOpen">
          <PopoverTrigger as-child>
            <Button
              size="sm"
              variant="outline"
              class="rounded-l-none border-l-0 px-1.5"
              :disabled="ops.anyRunning.value"
            >
              <ChevronDownIcon class="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" class="w-56 p-3">
            <div class="space-y-3">
              <p class="text-xs font-medium text-muted-foreground">Build options</p>
              <label class="flex items-center justify-between">
                <span class="text-sm">No cache</span>
                <Switch v-model="buildNoCache" />
              </label>
              <Button size="sm" variant="outline" class="w-full" :disabled="ops.anyRunning.value" @click="runBuild">
                <HammerIcon class="mr-1.5 size-3.5" />
                Build
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <Button size="sm" variant="secondary" :disabled="ops.anyRunning.value" @click="ops.handleUpdate()">
        <Loader2Icon v-if="ops.update.running.value" class="mr-1.5 size-3.5 animate-spin" />
        <RefreshCwIcon v-else class="mr-1.5 size-3.5" />
        Update
      </Button>

      <div class="flex items-center">
        <Button
          size="sm"
          variant="destructive"
          class="rounded-r-none"
          :disabled="ops.anyRunning.value"
          @click="ops.handlePrune()"
        >
          <Loader2Icon v-if="ops.prune.running.value" class="mr-1.5 size-3.5 animate-spin" />
          <Trash2Icon v-else class="mr-1.5 size-3.5" />
          Prune
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              size="sm"
              variant="destructive"
              class="rounded-l-none border-l border-l-background/20 px-1.5"
              :disabled="ops.anyRunning.value"
            >
              <ChevronDownIcon class="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem @click="ops.handlePrune('all')">All</DropdownMenuItem>
            <DropdownMenuItem @click="ops.handlePrune('servers')">Servers</DropdownMenuItem>
            <DropdownMenuItem @click="ops.handlePrune('images')">Images</DropdownMenuItem>
            <DropdownMenuItem @click="ops.handlePrune('data')">Data</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div class="flex items-center">
        <Button
          size="sm"
          variant="destructive"
          class="rounded-r-none"
          :disabled="ops.anyRunning.value"
          @click="ops.handleClean()"
        >
          <Loader2Icon v-if="ops.clean.running.value" class="mr-1.5 size-3.5 animate-spin" />
          <EraserIcon v-else class="mr-1.5 size-3.5" />
          Clean
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              size="sm"
              variant="destructive"
              class="rounded-l-none border-l border-l-background/20 px-1.5"
              :disabled="ops.anyRunning.value"
            >
              <ChevronDownIcon class="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem @click="ops.handleClean('all')">All</DropdownMenuItem>
            <DropdownMenuItem @click="ops.handleClean('cache')">Cache</DropdownMenuItem>
            <DropdownMenuItem @click="ops.handleClean('builds')">Builds</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button
        v-if="ops.anyRunning.value"
        size="sm"
        variant="outline"
        @click="ops.cancelActive()"
      >
        <XIcon class="mr-1.5 size-3.5" />
        Cancel
      </Button>
    </div>

    <div v-if="showLog" class="mt-4">
      <ProjectStreamLog
        :lines="currentOp?.lines.value ?? []"
        :running="currentOp?.running.value ?? false"
      />
      <div class="mt-2 flex items-center justify-between">
        <Alert
          v-if="currentOp?.aborted.value"
          class="flex-1 py-2"
        >
          <AlertDescription class="text-xs text-muted-foreground">
            Operation cancelled
          </AlertDescription>
        </Alert>
        <Alert
          v-else-if="currentOp?.error.value"
          variant="destructive"
          class="flex-1 py-2"
        >
          <AlertDescription class="text-xs">
            {{ currentOp?.error.value }}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  </div>
</template>
