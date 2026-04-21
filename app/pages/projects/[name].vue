<script setup lang="ts">
const route = useRoute()
const name = computed(() => route.params.name as string)

useHead({ title: name })

const { status, loading, error, fetchedAt } = useProjectStatus(name)

await useActiveOperations().ensurePrimed()
useProjectOperations(name)

provide<ProjectStatusContext>('projectStatus', { status, loading, error, fetchedAt })
</script>

<template>
  <NuxtPage class="flex min-h-0 min-w-0 flex-1 flex-col" />
</template>
