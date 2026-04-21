<script setup lang="ts">
import { PlayIcon, SquareIcon } from 'lucide-vue-next'
import type { ProjectEntry } from '~/types/project'
import { aggregateStateClass, getAggregateState } from '~/utils/status-colors'

const props = defineProps<{ project: ProjectEntry }>()

const serverCount = computed(() => props.project.status?.servers.length ?? 0)
const serviceCount = computed(() => props.project.status?.services?.length ?? 0)
const runningCount = computed(
  () => props.project.status?.servers.filter((s) => s.container.state === 'running').length ?? 0,
)

const aggregateState = computed(() => getAggregateState(props.project.status))
const aggregateClass = computed(() => aggregateStateClass(aggregateState.value))

const ops = useProjectOperations(() => props.project.name)
const busy = computed(() => ops.anyRunning.value)
const { iconUrl: resolveIconUrl } = useProjectIcon()
const iconUrl = computed(() => resolveIconUrl(props.project.name))
const initials = computed(() => props.project.name.slice(0, 2).toUpperCase())

function handleUp(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  ops.handleUp()
}

function handleDown(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  ops.handleDown()
}
</script>

<template>
  <NuxtLink :to="`/projects/${project.name}`" class="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <Card class="transition-colors group-hover:border-foreground/15">
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <div class="flex items-start gap-3 min-w-0">
            <Avatar class="size-10 shrink-0">
              <img :src="iconUrl" :alt="project.name" class="aspect-square size-full object-cover" @error="($event.target as HTMLImageElement).style.display = 'none'">
              <AvatarFallback class="text-sm">{{ initials }}</AvatarFallback>
            </Avatar>
            <div class="min-w-0">
              <CardTitle class="truncate text-sm font-semibold">
                {{ project.name }}
              </CardTitle>
              <p v-if="project.status" class="truncate text-xs text-muted-foreground">
                {{ project.status.network }}
              </p>
            </div>
          </div>
          <Badge variant="outline" :class="aggregateClass" class="shrink-0 text-[11px] font-medium capitalize">
            {{ aggregateState }}
          </Badge>
        </div>
      </CardHeader>
      <CardContent class="pt-0">
        <div class="flex items-center justify-between">
          <div class="flex gap-3 text-xs tabular-nums text-muted-foreground">
            <span>{{ runningCount }}/{{ serverCount }} servers</span>
            <span v-if="serviceCount > 0">{{ serviceCount }} services</span>
          </div>
          <div class="flex gap-1">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  size="icon"
                  variant="ghost"
                  class="size-7"
                  :disabled="busy"
                  @click="handleUp"
                >
                  <Spinner v-if="ops.up.running.value" />
                  <PlayIcon v-else class="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  size="icon"
                  variant="ghost"
                  class="size-7"
                  :disabled="busy"
                  @click="handleDown"
                >
                  <Spinner v-if="ops.down.running.value" />
                  <SquareIcon v-else class="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Stop</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  </NuxtLink>
</template>
