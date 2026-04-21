<script setup lang="ts">
import {
  ChevronDownIcon,
  HammerIcon,
  PlayIcon,
  RefreshCwIcon,
  SquareIcon,
  Trash2Icon,
} from 'lucide-vue-next'

const props = defineProps<{ projectName: string }>()

const ops = useProjectOperations(() => props.projectName)

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

const confirmAction = ref<{ label: string; action: () => void } | null>(null)

function confirmAndRun(label: string, action: () => void) {
  confirmAction.value = { label, action }
}

function executeConfirmed() {
  confirmAction.value?.action()
  confirmAction.value = null
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-2">
      <ButtonGroup>
        <Button size="sm" :disabled="ops.anyRunning.value" @click="ops.handleUp()">
          <Spinner v-if="ops.up.running.value" class="mr-1.5" />
          <PlayIcon v-else class="mr-1.5 size-3.5" />
          Up
        </Button>
        <Popover v-model:open="upOpen">
          <PopoverTrigger as-child>
            <Button size="sm" class="px-1.5" :disabled="ops.anyRunning.value">
              <ChevronDownIcon class="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" class="w-56 p-3">
            <FieldGroup>
              <p class="text-xs font-medium text-muted-foreground">Start options</p>
              <Field orientation="horizontal">
                <FieldLabel for="up-no-cache">No cache</FieldLabel>
                <Switch id="up-no-cache" v-model="upNoCache" />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel for="up-force">Force recreate</FieldLabel>
                <Switch id="up-force" v-model="upForce" />
              </Field>
              <Button size="sm" class="w-full" :disabled="ops.anyRunning.value" @click="runUp">
                <PlayIcon class="mr-1.5 size-3.5" />
                Start
              </Button>
            </FieldGroup>
          </PopoverContent>
        </Popover>
      </ButtonGroup>

      <Button size="sm" variant="outline" :disabled="ops.anyRunning.value" @click="ops.handleDown()">
        <Spinner v-if="ops.down.running.value" class="mr-1.5" />
        <SquareIcon v-else class="mr-1.5 size-3.5" />
        Down
      </Button>

      <ButtonGroup>
        <Button size="sm" variant="outline" :disabled="ops.anyRunning.value" @click="ops.handleBuild()">
          <Spinner v-if="ops.build.running.value" class="mr-1.5" />
          <HammerIcon v-else class="mr-1.5 size-3.5" />
          Build
        </Button>
        <Popover v-model:open="buildOpen">
          <PopoverTrigger as-child>
            <Button size="sm" variant="outline" class="px-1.5" :disabled="ops.anyRunning.value">
              <ChevronDownIcon class="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" class="w-56 p-3">
            <FieldGroup>
              <p class="text-xs font-medium text-muted-foreground">Build options</p>
              <Field orientation="horizontal">
                <FieldLabel for="build-no-cache">No cache</FieldLabel>
                <Switch id="build-no-cache" v-model="buildNoCache" />
              </Field>
              <Button size="sm" variant="outline" class="w-full" :disabled="ops.anyRunning.value" @click="runBuild">
                <HammerIcon class="mr-1.5 size-3.5" />
                Build
              </Button>
            </FieldGroup>
          </PopoverContent>
        </Popover>
      </ButtonGroup>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <Button size="sm" variant="secondary" :disabled="ops.anyRunning.value" @click="ops.handleUpdate()">
        <Spinner v-if="ops.update.running.value" class="mr-1.5" />
        <RefreshCwIcon v-else class="mr-1.5 size-3.5" />
        Update
      </Button>

      <ButtonGroup>
        <Button
          size="sm"
          variant="destructive"
          :disabled="ops.anyRunning.value"
          @click="confirmAndRun('Clean all', () => ops.handleClean())"
        >
          <Spinner v-if="ops.clean.running.value" class="mr-1.5" />
          <Trash2Icon v-else class="mr-1.5 size-3.5" />
          Clean
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button size="sm" variant="destructive" class="px-1.5" :disabled="ops.anyRunning.value">
              <ChevronDownIcon class="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem @click="confirmAndRun('Clean all', () => ops.handleClean('all'))">All</DropdownMenuItem>
            <DropdownMenuItem @click="confirmAndRun('Clean containers', () => ops.handleClean('containers'))">Containers</DropdownMenuItem>
            <DropdownMenuItem @click="confirmAndRun('Clean images', () => ops.handleClean('images'))">Images</DropdownMenuItem>
            <DropdownMenuItem @click="confirmAndRun('Clean volumes', () => ops.handleClean('volumes'))">Volumes</DropdownMenuItem>
            <DropdownMenuItem @click="confirmAndRun('Clean cache', () => ops.handleClean('cache'))">Cache</DropdownMenuItem>
            <DropdownMenuItem @click="confirmAndRun('Clean builds', () => ops.handleClean('builds'))">Builds</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>

    <Dialog :open="!!confirmAction" @update:open="confirmAction = null">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will <span class="font-semibold text-foreground lowercase">{{ confirmAction?.label }}</span>
            resources for this project. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="confirmAction = null">Cancel</Button>
          <Button variant="destructive" @click="executeConfirmed">
            {{ confirmAction?.label }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
