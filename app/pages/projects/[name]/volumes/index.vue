<script setup lang="ts">
import type { VolumeResponse } from '@oreforge/sdk'
import { DatabaseIcon, MoreHorizontalIcon, Trash2Icon } from 'lucide-vue-next'

const route = useRoute()
const name = computed(() => route.params.name as string)

useHead({ title: () => `Volumes · ${name.value}` })

const { volumes, loading, error, fetchedAt, refresh, remove } = useVolumes(name)

const deleteTarget = ref<VolumeResponse | null>(null)
const deleteForce = ref(false)
const deleteBusy = ref(false)

function askDelete(v: VolumeResponse) {
  deleteTarget.value = v
  deleteForce.value = false
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleteBusy.value = true
  const ok = await remove(deleteTarget.value.name, deleteForce.value)
  deleteBusy.value = false
  if (ok) deleteTarget.value = null
}

function formatDate(ts?: string) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ts
  }
}

function ownerBadgeClass(kind: 'server' | 'service') {
  return kind === 'server'
    ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
    : 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400'
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <DatabaseIcon class="size-6 text-muted-foreground" />
          Volumes
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Persistent storage attached to this project.
        </p>
      </div>
      <div class="flex items-center gap-3">
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
            <TableHead v-for="i in 6" :key="i"><Skeleton class="h-4 w-16" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="i in 3" :key="i">
            <TableCell v-for="j in 6" :key="j" class="h-12"><Skeleton class="h-4 w-20" /></TableCell>
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

    <div v-else class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Logical</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>In use by</TableHead>
            <TableHead>Created</TableHead>
            <TableHead class="w-[1%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="v in volumes" :key="v.name">
            <TableCell class="font-mono text-xs">{{ v.name }}</TableCell>
            <TableCell>{{ v.logical }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <Badge variant="outline" :class="ownerBadgeClass(v.ownerKind)" class="text-[11px]">
                  {{ v.ownerKind }}
                </Badge>
                <span class="text-sm">{{ v.owner }}</span>
              </div>
            </TableCell>
            <TableCell class="text-sm text-muted-foreground">{{ v.driver }}</TableCell>
            <TableCell>
              <span v-if="v.inUseBy.length === 0" class="text-sm text-muted-foreground">—</span>
              <span v-else class="text-sm">{{ v.inUseBy.join(', ') }}</span>
            </TableCell>
            <TableCell class="text-sm text-muted-foreground">{{ formatDate(v.createdAt) }}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" class="size-8">
                    <MoreHorizontalIcon class="size-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel class="text-xs">Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="text-destructive focus:text-destructive" @click="askDelete(v)">
                    <Trash2Icon class="mr-2 size-4" />
                    Delete…
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog :open="!!deleteTarget" @update:open="(v) => { if (!v) deleteTarget = null }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete volume</DialogTitle>
          <DialogDescription>
            <template v-if="deleteTarget">
              Delete <span class="font-mono">{{ deleteTarget.name }}</span>? This action cannot be undone.
            </template>
          </DialogDescription>
        </DialogHeader>
        <div v-if="deleteTarget" class="space-y-3 text-sm">
          <div v-if="deleteTarget.inUseBy.length" class="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs">
            In use by: {{ deleteTarget.inUseBy.join(', ') }}. Force delete required.
          </div>
          <label class="flex items-center gap-2">
            <Checkbox :model-value="deleteForce" @update:model-value="(v) => (deleteForce = v === true)" />
            <span>Force (remove even if in use)</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" :disabled="deleteBusy" @click="deleteTarget = null">Cancel</Button>
          <Button variant="destructive" :disabled="deleteBusy" @click="confirmDelete">
            <Spinner v-if="deleteBusy" class="mr-1.5" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
