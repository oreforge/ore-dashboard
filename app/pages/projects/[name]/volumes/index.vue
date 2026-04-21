<script setup lang="ts">
import type { VolumeResponse } from '@oreforge/sdk'
import { DatabaseIcon } from 'lucide-vue-next'
import { createVolumeColumns } from '~/components/project/volumes/volume-columns'

const route = useRoute()
const name = computed(() => route.params.name as string)

useHead({ title: () => `Volumes · ${name.value}` })

const { volumes, loading, error, fetchedAt, refresh, remove } = useVolumes(name)
const batchVolumes = useBatchVolumeOperations(name)

const deleteTargets = ref<VolumeResponse[]>([])
const deleteForce = ref(false)
const deleteBusy = ref(false)

const deleteOpen = computed(() => deleteTargets.value.length > 0)
const isBulk = computed(() => deleteTargets.value.length > 1)
const anyInUse = computed(() => deleteTargets.value.some((v) => v.inUseBy.length > 0))

function askDelete(v: VolumeResponse) {
  deleteTargets.value = [v]
  deleteForce.value = false
}

function askBulkDelete(rows: VolumeResponse[]) {
  if (rows.length === 0) return
  deleteTargets.value = rows
  deleteForce.value = false
}

function closeDelete() {
  deleteTargets.value = []
}

async function confirmDelete() {
  if (deleteTargets.value.length === 0) return
  deleteBusy.value = true
  try {
    if (deleteTargets.value.length === 1) {
      const target = deleteTargets.value[0]
      if (!target) return
      const ok = await remove(target.name, deleteForce.value)
      if (ok) closeDelete()
      return
    }
    const names = deleteTargets.value.map((v) => v.name)
    await batchVolumes.handleDelete(names, deleteForce.value)
    closeDelete()
    await refresh()
  } finally {
    deleteBusy.value = false
  }
}

const columns = createVolumeColumns(askDelete)
</script>

<template>
  <div>
    <div class="mb-6 flex items-start gap-3">
      <div class="min-w-0 flex-1">
        <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <DatabaseIcon class="size-6 shrink-0 text-muted-foreground" />
          Volumes
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Persistent storage attached to this project.
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <LastUpdated v-if="fetchedAt" :fetched-at="fetchedAt" />
        <RefreshButton :refresh="refresh" />
      </div>
    </div>

    <Alert v-if="error" variant="destructive" class="mb-4">
      <AlertTitle>Failed to load volumes</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div v-if="loading && volumes.length === 0" class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead v-for="i in columns.length" :key="i"><Skeleton class="h-4 w-16" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="i in 3" :key="i">
            <TableCell v-for="j in columns.length" :key="j" class="h-12">
              <Skeleton class="h-4 w-20" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Empty v-else-if="volumes.length === 0" class="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <DatabaseIcon />
        </EmptyMedia>
        <EmptyTitle>No volumes</EmptyTitle>
        <EmptyDescription>
          Volumes appear here once servers or services declare them.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>

    <ProjectDataTable
      v-else
      :columns="columns"
      :data="volumes"
      :get-row-id="(row: VolumeResponse) => row.name"
    >
      <template #toolbar="{ table }">
        <ProjectVolumesTableToolbar :table="table" @bulk-delete="askBulkDelete" />
      </template>
    </ProjectDataTable>

    <Dialog :open="deleteOpen" @update:open="(v) => { if (!v) closeDelete() }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ isBulk ? `Delete ${deleteTargets.length} volumes` : 'Delete volume' }}
          </DialogTitle>
          <DialogDescription>
            <template v-if="isBulk">
              Delete {{ deleteTargets.length }} selected volumes? This action cannot be undone.
            </template>
            <template v-else-if="deleteTargets[0]">
              Delete <span class="font-mono">{{ deleteTargets[0].name }}</span>? This action cannot be undone.
            </template>
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-3 text-sm">
          <div
            v-if="anyInUse"
            class="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs"
          >
            <template v-if="isBulk">
              Some selected volumes are in use. Force delete required.
            </template>
            <template v-else>
              In use by: {{ deleteTargets[0]?.inUseBy.join(', ') }}. Force delete required.
            </template>
          </div>
          <label class="flex items-center gap-2">
            <Checkbox
              :model-value="deleteForce"
              @update:model-value="(v) => (deleteForce = v === true)"
            />
            <span>Force (remove even if in use)</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" :disabled="deleteBusy" @click="closeDelete">Cancel</Button>
          <Button variant="destructive" :disabled="deleteBusy" @click="confirmDelete">
            <Spinner v-if="deleteBusy" class="mr-1.5" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
