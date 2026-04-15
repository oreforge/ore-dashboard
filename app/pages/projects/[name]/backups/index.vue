<script setup lang="ts">
import type { BackupKind, BackupResponse, BackupStatus } from '@oreforge/sdk'
import {
  ArchiveIcon,
  CheckCircle2Icon,
  HistoryIcon,
  MoreHorizontalIcon,
  PlusIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from 'lucide-vue-next'
import { formatBytes } from '~/utils/formatters'

const route = useRoute()
const name = computed(() => route.params.name as string)

useHead({ title: () => `Backups · ${name.value}` })

const ALL = '__all__'
const filterVolume = ref<string>(ALL)
const filterStatus = ref<string>(ALL)

const filter = computed(() => ({
  volume: filterVolume.value === ALL ? undefined : filterVolume.value,
  status: (filterStatus.value === ALL ? undefined : filterStatus.value) as BackupStatus | undefined,
}))

const { backups, loading, error, fetchedAt, refresh, create, remove, restore, verify } = useBackups(
  name,
  filter,
)

const { volumes } = useVolumes(name)

const createOpen = ref(false)
const createVolume = ref<string>('')
const createTags = ref<string[]>([])
const createBusy = ref(false)

const canCreate = computed(() => !createBusy.value && !!createVolume.value)

async function submitCreate() {
  if (!canCreate.value) return
  createBusy.value = true
  const ok = await create({
    volume: createVolume.value,
    tags: createTags.value.length ? createTags.value : undefined,
  })
  createBusy.value = false
  if (ok) {
    createOpen.value = false
    createVolume.value = ''
    createTags.value = []
  }
}

const deleteTarget = ref<BackupResponse | null>(null)
const deleteBusy = ref(false)

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleteBusy.value = true
  const ok = await remove(deleteTarget.value.id)
  deleteBusy.value = false
  if (ok) deleteTarget.value = null
}

const restoreTarget = ref<BackupResponse | null>(null)
const restoreKeep = ref(true)
const restoreBusy = ref(false)

function askRestore(b: BackupResponse) {
  restoreTarget.value = b
  restoreKeep.value = true
}

async function confirmRestore() {
  if (!restoreTarget.value) return
  restoreBusy.value = true
  const ok = await restore(restoreTarget.value.id, restoreKeep.value)
  restoreBusy.value = false
  if (ok) restoreTarget.value = null
}

function handleVerify(b: BackupResponse) {
  void verify(b.id)
}

function kindBadgeClass(kind: BackupKind) {
  switch (kind) {
    case 'manual':
      return 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
    case 'scheduled':
      return 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400'
    case 'pre-restore':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
  }
}

function statusBadgeClass(status: BackupStatus) {
  switch (status) {
    case 'completed':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    case 'running':
      return 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400'
    case 'pending':
      return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
    case 'failed':
      return 'border-destructive/30 bg-destructive/10 text-destructive'
  }
}

function statusLabel(status: BackupStatus) {
  switch (status) {
    case 'running':
      return 'in progress'
    case 'pending':
      return 'queued'
    default:
      return status
  }
}

function formatDate(ts?: string) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ts
  }
}

function shortId(id: string) {
  return id.length > 12 ? id.slice(0, 12) : id
}

function ratio(b: BackupResponse) {
  if (!b.sizeBytes || !b.compressed) return '—'
  const r = b.compressed / b.sizeBytes
  return `${(r * 100).toFixed(0)}%`
}

const statusOptions: BackupStatus[] = ['pending', 'running', 'completed', 'failed']
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ArchiveIcon class="size-6 text-muted-foreground" />
          Backups
        </h1>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Create, verify and restore snapshots of project volumes.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <LastUpdated v-if="fetchedAt" :fetched-at="fetchedAt" />
        <RefreshButton :refresh="refresh" />
        <Button :disabled="volumes.length === 0" @click="createOpen = true">
          <PlusIcon class="mr-1.5 size-4" />
          New backup
        </Button>
      </div>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">Volume</span>
        <Select v-model="filterVolume">
          <SelectTrigger class="h-8 w-[180px] text-sm">
            <SelectValue placeholder="All volumes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="ALL">All volumes</SelectItem>
            <SelectItem v-for="v in volumes" :key="v.name" :value="v.name">
              {{ v.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">Status</span>
        <Select v-model="filterStatus">
          <SelectTrigger class="h-8 w-[150px] text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="ALL">All statuses</SelectItem>
            <SelectItem v-for="s in statusOptions" :key="s" :value="s">
              {{ statusLabel(s) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Alert v-if="error" variant="destructive" class="mb-4">
      <AlertTitle>Failed to load backups</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div v-if="loading && backups.length === 0" class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead v-for="i in 8" :key="i"><Skeleton class="h-4 w-16" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="i in 3" :key="i">
            <TableCell v-for="j in 8" :key="j" class="h-12"><Skeleton class="h-4 w-20" /></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Empty v-else-if="backups.length === 0" class="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ArchiveIcon />
        </EmptyMedia>
        <EmptyTitle>No backups</EmptyTitle>
        <EmptyDescription>
          Create a backup to capture a volume's current state.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button :disabled="volumes.length === 0" @click="createOpen = true">
          <PlusIcon class="mr-1.5 size-4" />
          New backup
        </Button>
      </EmptyContent>
    </Empty>

    <div v-else class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>Kind</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Size</TableHead>
            <TableHead class="text-right">Compressed</TableHead>
            <TableHead>Algorithm</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead class="w-[1%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="b in backups" :key="b.id">
            <TableCell class="font-mono text-xs">{{ shortId(b.id) }}</TableCell>
            <TableCell>{{ b.volume }}</TableCell>
            <TableCell>
              <Badge variant="outline" :class="kindBadgeClass(b.kind)" class="text-[11px]">
                {{ b.kind }}
              </Badge>
            </TableCell>
            <TableCell>
              <Tooltip v-if="b.status === 'failed' && b.error">
                <TooltipTrigger as-child>
                  <Badge
                    variant="outline"
                    :class="statusBadgeClass(b.status)"
                    class="cursor-help text-[11px]"
                  >
                    {{ statusLabel(b.status) }}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent class="max-w-sm">
                  <p class="font-mono text-xs leading-relaxed break-words whitespace-pre-wrap">
                    {{ b.error }}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Badge
                v-else
                variant="outline"
                :class="statusBadgeClass(b.status)"
                class="text-[11px]"
              >
                <Spinner v-if="b.status === 'running'" class="mr-1 size-3" />
                {{ statusLabel(b.status) }}
              </Badge>
            </TableCell>
            <TableCell class="text-right font-mono tabular-nums">{{ formatBytes(b.sizeBytes) }}</TableCell>
            <TableCell class="text-right font-mono tabular-nums">
              {{ formatBytes(b.compressed) }}
              <span class="ml-1 text-xs text-muted-foreground">({{ ratio(b) }})</span>
            </TableCell>
            <TableCell class="text-sm text-muted-foreground">{{ b.algorithm }}</TableCell>
            <TableCell class="text-sm text-muted-foreground">{{ formatDate(b.createdAt) }}</TableCell>
            <TableCell>
              <CheckCircle2Icon v-if="b.verified" class="size-4 text-emerald-500" />
              <span v-else class="text-sm text-muted-foreground">—</span>
            </TableCell>
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
                  <DropdownMenuItem :disabled="b.status !== 'completed'" @click="askRestore(b)">
                    <HistoryIcon class="mr-2 size-4" />
                    Restore…
                  </DropdownMenuItem>
                  <DropdownMenuItem :disabled="b.status !== 'completed'" @click="handleVerify(b)">
                    <ShieldCheckIcon class="mr-2 size-4" />
                    Verify
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="text-destructive focus:text-destructive" @click="deleteTarget = b">
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

    <Dialog v-model:open="createOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New backup</DialogTitle>
          <DialogDescription>Snapshot a volume's current contents.</DialogDescription>
        </DialogHeader>
        <form @submit.prevent="submitCreate">
          <FieldGroup>
            <Field>
              <FieldLabel>Volume</FieldLabel>
              <Select v-model="createVolume">
                <SelectTrigger>
                  <SelectValue placeholder="Select a volume" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="v in volumes" :key="v.name" :value="v.name">
                    {{ v.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>
                Tags
                <span class="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <TagsInput v-model="createTags">
                <TagsInputItem v-for="tag in createTags" :key="tag" :value="tag">
                  <TagsInputItemText />
                  <TagsInputItemDelete />
                </TagsInputItem>
                <TagsInputInput placeholder="Add tag…" />
              </TagsInput>
            </Field>
          </FieldGroup>
          <DialogFooter class="pt-6">
            <Button type="button" variant="outline" @click="createOpen = false">Cancel</Button>
            <Button type="submit" :disabled="!canCreate">
              <Spinner v-if="createBusy" class="mr-1.5" />
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog :open="!!restoreTarget" @update:open="(v) => { if (!v) restoreTarget = null }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restore backup</DialogTitle>
          <DialogDescription>
            <template v-if="restoreTarget">
              Restore <span class="font-mono">{{ restoreTarget.volume }}</span> from backup
              <span class="font-mono">{{ shortId(restoreTarget.id) }}</span>.
            </template>
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-3 text-sm">
          <label class="flex items-center gap-2">
            <Checkbox :model-value="restoreKeep" @update:model-value="(v) => (restoreKeep = v === true)" />
            <span>Create a pre-restore snapshot first (recommended)</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" :disabled="restoreBusy" @click="restoreTarget = null">Cancel</Button>
          <Button :disabled="restoreBusy" @click="confirmRestore">
            <Spinner v-if="restoreBusy" class="mr-1.5" />
            Restore
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog :open="!!deleteTarget" @update:open="(v) => { if (!v) deleteTarget = null }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete backup</DialogTitle>
          <DialogDescription>
            <template v-if="deleteTarget">
              Delete backup <span class="font-mono">{{ shortId(deleteTarget.id) }}</span>?
              This action cannot be undone.
            </template>
          </DialogDescription>
        </DialogHeader>
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
