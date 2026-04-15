<script setup lang="ts">
import { PlusIcon, ServerIcon } from 'lucide-vue-next'

useHead({ title: 'Projects' })

const { projects, loading, fetchedAt, refresh } = useProjects()
const showAddDialog = ref(false)
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Projects</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Manage your game server networks.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <LastUpdated v-if="fetchedAt" :fetched-at="fetchedAt" />
        <RefreshButton :refresh="refresh" />
        <Button @click="showAddDialog = true">
          <PlusIcon class="mr-1.5 size-4" />
          Add Project
        </Button>
      </div>
    </div>

    <div v-if="loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="i in 3" :key="i">
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between">
            <Skeleton class="h-5 w-28" />
            <Skeleton class="h-5 w-16 rounded-full" />
          </div>
          <Skeleton class="h-4 w-20" />
        </CardHeader>
        <CardContent class="pt-0">
          <Skeleton class="h-4 w-32" />
        </CardContent>
      </Card>
    </div>

    <Empty v-else-if="projects.length === 0" class="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ServerIcon />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>Get started by adding your first project.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" @click="showAddDialog = true">
          <PlusIcon class="mr-1.5 size-4" />
          Add Project
        </Button>
      </EmptyContent>
    </Empty>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ProjectCard v-for="project in projects" :key="project.name" :project="project" />
    </div>

    <ProjectAddDialog v-model:open="showAddDialog" />
  </div>
</template>
