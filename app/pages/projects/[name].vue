<script setup lang="ts">
const route = useRoute()
const name = computed(() => route.params.name as string)

const { status, loading, error, fetchedAt } = useProjectStatus(name)

useProjectOperations(name)

provide('projectStatus', { status, loading, error, fetchedAt })
</script>

<template>
  <NuxtPage class="flex min-h-0 flex-1 flex-col" />
</template>
