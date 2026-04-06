<script setup lang="ts">
import { PlusIcon, ServerIcon } from 'lucide-vue-next'

const { projects, loading, error } = useProjects()
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

    <Alert v-if="error" variant="destructive" class="mb-6">
      <AlertTitle>Failed to load projects</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div v-if="loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="i in 3" :key="i">
        <CardHeader class="flex flex-row items-start gap-3 space-y-0">
          <Skeleton class="size-10 rounded-lg" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-4 w-28" />
            <Skeleton class="h-3 w-20" />
          </div>
          <Skeleton class="h-5 w-16 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-3.5 w-24" />
        </CardContent>
      </Card>
    </div>

    <div
      v-else-if="projects.length === 0 && !error"
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
