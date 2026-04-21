<script setup lang="ts">
import type { ServerStatus } from '@oreforge/sdk'
import { TerminalIcon } from 'lucide-vue-next'
import type ConsoleTerminal from '~/components/console/ConsoleTerminal.vue'

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
const terminalRef = ref<InstanceType<typeof ConsoleTerminal> | null>(null)

watch(
  allServers,
  (servers) => {
    const first = servers[0]
    if (!selectedServer.value && first) {
      selectedServer.value = first.container.name
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

    <Empty v-if="allServers.length === 0" class="flex-1 border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TerminalIcon />
        </EmptyMedia>
        <EmptyTitle>No servers available</EmptyTitle>
        <EmptyDescription>Start the project first to access the console.</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <div v-else class="flex min-h-0 flex-1 flex-col gap-4">
      <Field orientation="horizontal" class="shrink-0">
        <FieldLabel for="console-server-select">Server</FieldLabel>
        <Select v-model="selectedServer">
          <SelectTrigger id="console-server-select" class="w-[220px]">
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
      </Field>
      <ConsoleTerminal
        v-if="selectedServer"
        ref="terminalRef"
        class="min-h-0 flex-1"
        :project-name="name"
        :server-name="selectedServer"
      />
    </div>
  </div>
</template>
