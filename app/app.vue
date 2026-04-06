<script setup lang="ts">
useHead({ htmlAttrs: { class: 'dark' } })
</script>

<template>
  <NuxtRouteAnnouncer />
  <TooltipProvider>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </TooltipProvider>
  <Toaster rich-colors position="bottom-right" />
</template>
