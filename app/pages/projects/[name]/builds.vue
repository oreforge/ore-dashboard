<script setup lang="ts">
import type { BinaryEntry, BuildEntry } from '@oreforge/sdk'
import { BoxIcon, HammerIcon, PackageIcon } from 'lucide-vue-next'
import { createBinaryColumns } from '~/components/project/builds/binary-columns'
import { createBuildColumns } from '~/components/project/builds/build-columns'

const route = useRoute()
const name = computed(() => route.params.name as string)

useHead({ title: () => `Builds · ${name.value}` })

const { builds, binaries, loading, error, fetchedAt, refresh } = useBuilds(name)

const buildColumns = createBuildColumns()
const binaryColumns = createBinaryColumns()

const firstLoading = computed(
  () => loading.value && builds.value.length === 0 && binaries.value.length === 0,
)
</script>

<template>
  <div>
    <div class="mb-6 space-y-4">
      <div class="flex items-start gap-3">
        <div class="min-w-0 flex-1">
          <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <HammerIcon class="size-6 shrink-0 text-muted-foreground" />
            Builds
          </h1>
          <p class="mt-0.5 text-sm text-muted-foreground">
            Build artifacts and cached binaries for this project.
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <LastUpdated v-if="fetchedAt" :fetched-at="fetchedAt" />
          <RefreshButton :refresh="refresh" />
        </div>
      </div>
      <ProjectBuildsActions :project-name="name" />
    </div>

    <Alert v-if="error" variant="destructive" class="mb-4">
      <AlertTitle>Failed to load builds</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div v-if="firstLoading" class="space-y-6">
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead v-for="i in buildColumns.length" :key="i"><Skeleton class="h-4 w-16" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="i in 3" :key="i">
              <TableCell v-for="j in buildColumns.length" :key="j" class="h-12">
                <Skeleton class="h-4 w-20" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <div v-else class="space-y-8">
      <section>
        <div class="mb-3 flex items-center gap-2">
          <BoxIcon class="size-4 text-muted-foreground" />
          <h2 class="text-sm font-medium">Builds</h2>
          <span class="text-xs text-muted-foreground">{{ builds.length }}</span>
        </div>
        <Empty v-if="builds.length === 0" class="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BoxIcon />
            </EmptyMedia>
            <EmptyTitle>No builds</EmptyTitle>
            <EmptyDescription>
              Builds appear here after servers have been built at least once.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
        <ProjectDataTable
          v-else
          :columns="buildColumns"
          :data="builds"
          :get-row-id="(row: BuildEntry) => row.cache_key"
        />
      </section>

      <section>
        <div class="mb-3 flex items-center gap-2">
          <PackageIcon class="size-4 text-muted-foreground" />
          <h2 class="text-sm font-medium">Cached binaries</h2>
          <span class="text-xs text-muted-foreground">{{ binaries.length }}</span>
        </div>
        <Empty v-if="binaries.length === 0" class="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageIcon />
            </EmptyMedia>
            <EmptyTitle>No cached binaries</EmptyTitle>
            <EmptyDescription>
              Downloaded server binaries are cached here to speed up future builds.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
        <ProjectDataTable
          v-else
          :columns="binaryColumns"
          :data="binaries"
          :get-row-id="(row: BinaryEntry) => row.sha256 || row.filename"
        />
      </section>
    </div>
  </div>
</template>
