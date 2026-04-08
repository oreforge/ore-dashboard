<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { ActivityIcon, HeartPulseIcon, NetworkIcon, PlayIcon, ServerIcon } from 'lucide-vue-next'
import { aggregateStateClass, getAggregateState } from '~/utils/status-colors'

const route = useRoute()
const name = computed(() => route.params.name as string)

const projectStatus = inject<ProjectStatusContext>('projectStatus')
if (!projectStatus) throw new Error('projectStatus not provided')
const { status, loading, fetchedAt } = projectStatus

const serverCount = computed(() => status.value?.servers.length ?? 0)
const serviceCount = computed(() => status.value?.services?.length ?? 0)
const runningCount = computed(
  () => status.value?.servers.filter((s) => s.container.state === 'running').length ?? 0,
)
const healthyCount = computed(
  () => status.value?.servers.filter((s) => s.container.health === 'healthy').length ?? 0,
)
const aggregateState = computed(() => getAggregateState(status.value))
const ops = useProjectOperations(() => name.value)

const now = ref(Date.now())
useIntervalFn(() => {
  now.value = Date.now()
}, 1000)

function liveUptime(snapshotNs?: number) {
  if (!snapshotNs || !fetchedAt.value) return '—'
  const elapsedMs = now.value - fetchedAt.value
  const totalSecs = Math.floor(snapshotNs / 1_000_000_000) + Math.floor(elapsedMs / 1000)
  return formatUptime(totalSecs)
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <template v-if="loading">
          <Skeleton class="h-8 w-40" />
          <Skeleton class="mt-0.5 h-5 w-24" />
        </template>
        <template v-else>
          <div class="flex items-center gap-2.5">
            <h1 class="text-2xl font-semibold tracking-tight">{{ name }}</h1>
            <Badge
              v-if="status && aggregateState !== 'unknown'"
              variant="outline"
              :class="aggregateStateClass(aggregateState)"
              class="text-[11px] font-medium capitalize"
            >
              {{ aggregateState }}
            </Badge>
          </div>
          <p v-if="status" class="mt-0.5 text-sm text-muted-foreground">{{ status.network }}</p>
        </template>
      </div>
      <ProjectActionBar v-if="!loading" :project-name="name" />
    </div>

    <div v-if="loading" class="space-y-6">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card v-for="i in 4" :key="i">
          <CardHeader>
            <Skeleton class="h-5 w-16" />
            <Skeleton class="h-9 w-10" />
          </CardHeader>
        </Card>
      </div>
      <Card class="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead v-for="i in 6" :key="i"><Skeleton class="h-4 w-16" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="i in 3" :key="i">
              <TableCell v-for="j in 6" :key="j"><Skeleton class="h-4 w-20" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>

    <div v-else-if="status" class="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription class="flex items-center gap-1.5">
            <ServerIcon class="size-3.5" /> Servers
          </CardDescription>
          <CardTitle class="font-mono text-3xl tabular-nums">{{ serverCount }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription class="flex items-center gap-1.5">
            <ActivityIcon class="size-3.5" /> Running
          </CardDescription>
          <CardTitle class="font-mono text-3xl tabular-nums">
            {{ runningCount }}<span class="text-lg text-muted-foreground">/{{ serverCount }}</span>
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription class="flex items-center gap-1.5">
            <HeartPulseIcon class="size-3.5" /> Healthy
          </CardDescription>
          <CardTitle class="font-mono text-3xl tabular-nums">
            {{ healthyCount }}<span class="text-lg text-muted-foreground">/{{ serverCount }}</span>
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription class="flex items-center gap-1.5">
            <NetworkIcon class="size-3.5" /> Services
          </CardDescription>
          <CardTitle class="font-mono text-3xl tabular-nums">{{ serviceCount }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <template v-if="!loading && status">
      <div v-if="status.servers.length === 0" class="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
        <div class="flex size-14 items-center justify-center rounded-full bg-muted">
          <ServerIcon class="size-6 text-muted-foreground" />
        </div>
        <h2 class="mt-4 text-base font-semibold">No servers running</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Start the project to bring up your servers.
        </p>
        <Button class="mt-5" variant="outline" :disabled="ops.anyRunning.value" @click="ops.handleUp()">
          <PlayIcon class="mr-1.5 size-4" />
          Start project
        </Button>
      </div>

      <div v-else class="space-y-8">
        <div>
          <h2 class="mb-3 flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            <ServerIcon class="size-3.5" /> Servers
            <span class="text-muted-foreground/60">({{ serverCount }})</span>
          </h2>
          <Card class="overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead class="whitespace-nowrap">State</TableHead>
                  <TableHead class="whitespace-nowrap">Health</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Ports</TableHead>
                  <TableHead class="whitespace-nowrap">Uptime</TableHead>
                  <TableHead class="whitespace-nowrap">Memory</TableHead>
                  <TableHead class="whitespace-nowrap">CPUs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="server in status.servers" :key="server.name" class="hover:bg-muted/50">
                  <TableCell class="truncate font-medium">{{ server.name }}</TableCell>
                  <TableCell><ProjectStatusBadge :state="server.container.state" /></TableCell>
                  <TableCell><ProjectHealthBadge :health="server.container.health" /></TableCell>
                  <TableCell class="truncate font-mono text-xs text-muted-foreground">
                    {{ server.container.image || '—' }}
                  </TableCell>
                  <TableCell class="truncate font-mono text-xs text-muted-foreground">
                    {{ formatPorts(server.container.ports) }}
                  </TableCell>
                  <TableCell class="tabular-nums text-muted-foreground">
                    {{ liveUptime(server.container.uptime) }}
                  </TableCell>
                  <TableCell class="tabular-nums text-muted-foreground">
                    {{ formatMemory(server.container.resources.memory) }}
                  </TableCell>
                  <TableCell class="tabular-nums text-muted-foreground">
                    {{ formatCpu(server.container.resources.cpu) }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>

        <div v-if="status.services && status.services.length > 0">
          <h2 class="mb-3 flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            <NetworkIcon class="size-3.5" /> Services
            <span class="text-muted-foreground/60">({{ serviceCount }})</span>
          </h2>
          <Card class="overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead class="whitespace-nowrap">State</TableHead>
                  <TableHead class="whitespace-nowrap">Health</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Ports</TableHead>
                  <TableHead class="whitespace-nowrap">Uptime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="service in status.services" :key="service.name" class="hover:bg-muted/50">
                  <TableCell class="truncate font-medium">{{ service.name }}</TableCell>
                  <TableCell><ProjectStatusBadge :state="service.container.state" /></TableCell>
                  <TableCell><ProjectHealthBadge :health="service.container.health" /></TableCell>
                  <TableCell class="truncate font-mono text-xs text-muted-foreground">
                    {{ service.container.image || '—' }}
                  </TableCell>
                  <TableCell class="truncate font-mono text-xs text-muted-foreground">
                    {{ formatPorts(service.container.ports) }}
                  </TableCell>
                  <TableCell class="tabular-nums text-muted-foreground">
                    {{ liveUptime(service.container.uptime) }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>
