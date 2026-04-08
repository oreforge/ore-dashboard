<script setup lang="ts">
import type { ServerStatus } from '@oreforge/sdk'
import { TerminalIcon } from 'lucide-vue-next'

const route = useRoute()
const name = computed(() => route.params.name as string)

useHead({ title: computed(() => `Console — ${name.value}`) })

const projectStatus = inject<ProjectStatusContext>('projectStatus')
if (!projectStatus) throw new Error('projectStatus not provided')
const { status } = projectStatus

const allServers = computed<ServerStatus[]>(() => {
  if (!status.value) return []
  return [...status.value.servers, ...(status.value.services ?? [])]
})

const selectedServer = ref('')

watch(
  allServers,
  (servers) => {
    if (!selectedServer.value && servers.length > 0) {
      selectedServer.value = servers[0].container.name
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="mb-6 shrink-0">
      <h1 class="text-2xl font-semibold tracking-tight">Console</h1>
      <p class="mt-0.5 text-sm text-muted-foreground">{{ name }}</p>
    </div>

    <div
      v-if="allServers.length === 0"
      class="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16"
    >
      <div class="flex size-14 items-center justify-center rounded-full bg-muted">
        <TerminalIcon class="size-6 text-muted-foreground" />
      </div>
      <h2 class="mt-4 text-base font-semibold">No servers available</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Start the project first to access the console.
      </p>
    </div>

    <div v-else class="flex min-h-0 flex-1 flex-col gap-4">
      <div class="flex shrink-0 items-center gap-3">
        <label class="text-sm font-medium">Server</label>
        <Select v-model="selectedServer">
          <SelectTrigger class="w-[220px]">
            <SelectValue placeholder="Select server" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="server in allServers"
              :key="server.container.name"
              :value="server.container.name"
            >
              {{ server.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ConsoleTerminal
        v-if="selectedServer"
        class="min-h-0 flex-1"
        :project-name="name"
        :server-name="selectedServer"
      />
    </div>
  </div>
</template>
