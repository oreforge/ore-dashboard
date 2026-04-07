<script setup lang="ts">
import { PlusIcon, ServerIcon } from 'lucide-vue-next'

const { projects, loading } = useProjects()
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
      <Button @click="showAddDialog = true">
        <PlusIcon class="mr-1.5 size-4" />
        Add Project
      </Button>
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

    <div
      v-else-if="projects.length === 0"
      class="flex flex-col items-center justify-center rounded-xl border border-dashed py-16"
    >
      <div class="flex size-14 items-center justify-center rounded-full bg-muted">
        <ServerIcon class="size-6 text-muted-foreground" />
      </div>
      <h2 class="mt-4 text-base font-semibold">No projects yet</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Get started by adding your first project.
      </p>
      <Button class="mt-5" variant="outline" @click="showAddDialog = true">
        <PlusIcon class="mr-1.5 size-4" />
        Add Project
      </Button>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ProjectCard v-for="project in projects" :key="project.name" :project="project" />
    </div>

    <ProjectAddDialog v-model:open="showAddDialog" />
  </div>
</template>
