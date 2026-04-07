<script setup lang="ts">
import { Loader2Icon, PlayIcon, SquareIcon } from 'lucide-vue-next'
import type { ProjectEntry } from '~/types/project'
import { aggregateStateClass, aggregateStatusDot } from '~/utils/status-colors'

const props = defineProps<{ project: ProjectEntry }>()

const serverCount = computed(() => props.project.status?.servers.length ?? 0)
const serviceCount = computed(() => props.project.status?.services?.length ?? 0)

const runningCount = computed(
  () => props.project.status?.servers.filter((s) => s.container.state === 'running').length ?? 0,
)

const aggregateState = computed(() => {
  if (!props.project.status) return 'unknown'
  const states = props.project.status.servers.map((s) => s.container.state)
  if (states.length === 0) return 'unknown'
  if (states.every((s) => s === 'running')) return 'running'
  if (states.some((s) => s === 'running')) return 'partial'
  return 'stopped'
})

const aggregateClass = computed(() => aggregateStateClass(aggregateState.value))

const upOp = useStreamOperation()
const downOp = useStreamOperation()
const busy = computed(() => upOp.running.value || downOp.running.value)
const client = useOreClient()

function handleUp(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  upOp.execute((signal) => client.projects.get(props.project.name).up({}, { signal }))
}

function handleDown(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  downOp.execute((signal) => client.projects.get(props.project.name).down({ signal }))
}
</script>

<template>
  <NuxtLink :to="`/projects/${project.name}`" class="group block">
    <Card class="transition-colors group-hover:border-foreground/15">
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <span
              class="inline-block size-2 shrink-0 rounded-full"
              :class="aggregateStatusDot(project.status)"
            />
            <CardTitle class="truncate text-sm font-semibold">
              {{ project.name }}
            </CardTitle>
          </div>
          <Badge variant="outline" :class="aggregateClass" class="shrink-0 text-[11px] font-medium capitalize">
            {{ aggregateState }}
          </Badge>
        </div>
        <p v-if="project.status" class="truncate text-xs text-muted-foreground">
          {{ project.status.network }}
        </p>
      </CardHeader>
      <CardContent class="pt-0">
        <div class="flex items-center justify-between">
          <div class="flex gap-3 text-xs tabular-nums text-muted-foreground">
            <span>{{ runningCount }}/{{ serverCount }} servers</span>
            <span v-if="serviceCount > 0">{{ serviceCount }} services</span>
          </div>
          <div class="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              class="size-7"
              :disabled="busy"
              @click="handleUp"
            >
              <Loader2Icon v-if="upOp.running.value" class="size-3.5 animate-spin" />
              <PlayIcon v-else class="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              class="size-7"
              :disabled="busy"
              @click="handleDown"
            >
              <Loader2Icon v-if="downOp.running.value" class="size-3.5 animate-spin" />
              <SquareIcon v-else class="size-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </NuxtLink>
</template>
