<script setup lang="ts">
import type { NetworkStatus } from '@oreforge/sdk'
import { ActivityIcon, HeartPulseIcon, NetworkIcon, ServerIcon } from 'lucide-vue-next'

const route = useRoute()
const name = computed(() => route.params.name as string)

const { status, loading, error, fetchedAt } = inject('projectStatus') as {
  status: Ref<NetworkStatus | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchedAt: Ref<number>
}

const serverCount = computed(() => status.value?.servers.length ?? 0)
const serviceCount = computed(() => status.value?.services?.length ?? 0)
const runningCount = computed(
  () => status.value?.servers.filter((s) => s.container.state === 'running').length ?? 0,
)
const healthyCount = computed(
  () => status.value?.servers.filter((s) => s.container.health === 'healthy').length ?? 0,
)

const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  ticker = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})
onUnmounted(() => {
  if (ticker) clearInterval(ticker)
})

function liveUptime(snapshotNs?: number) {
  if (!snapshotNs || !fetchedAt.value) return '—'
  const elapsedMs = now.value - fetchedAt.value
  const totalSecs = Math.floor(snapshotNs / 1_000_000_000) + Math.floor(elapsedMs / 1000)
  return formatUptime(totalSecs)
}

function formatUptime(secs: number) {
  const mins = Math.floor(secs / 60)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${mins % 60}m`
  if (mins > 0) return `${mins}m ${secs % 60}s`
  return `${secs}s`
}

function formatMemory(bytes: number) {
  if (!bytes) return '—'
  const mb = bytes / (1024 * 1024)
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb.toFixed(0)} MB`
}

function formatPorts(ports?: { host_port: number; container_port: number; protocol: string }[]) {
  if (!ports || ports.length === 0) return '—'
  return ports.map((p) => `${p.host_port}:${p.container_port}/${p.protocol}`).join(', ')
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight">{{ name }}</h1>
      <p v-if="status" class="mt-0.5 text-sm text-muted-foreground">{{ status.network }}</p>
    </div>

    <Alert v-if="error" variant="destructive" class="mb-6">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div v-if="loading" class="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="i in 4" :key="i">
        <CardHeader>
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-8 w-12" />
        </CardHeader>
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

    <div class="mb-8">
      <ProjectActionBar :project-name="name" />
    </div>

    <template v-if="!loading && status">
      <div v-if="status.servers.length > 0" class="space-y-8">
        <div>
          <h2 class="mb-3 flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            <ServerIcon class="size-3.5" /> Servers
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
                <TableRow v-for="server in status.servers" :key="server.name">
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
                    {{ formatMemory(server.container.memory_bytes) }}
                  </TableCell>
                  <TableCell class="tabular-nums text-muted-foreground">
                    {{ server.container.cpus || '—' }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>

        <div v-if="status.services && status.services.length > 0">
          <h2 class="mb-3 flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            <NetworkIcon class="size-3.5" /> Services
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
                <TableRow v-for="service in status.services" :key="service.name">
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
