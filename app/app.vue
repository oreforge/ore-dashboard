<script setup lang="ts">
useHead({ titleTemplate: '%s | OreForge', htmlAttrs: { class: 'dark' } })
void useActiveOperations({ poll: true }).ensurePrimed()
</script>

<template>
  <NuxtRouteAnnouncer />
  <TooltipProvider>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </TooltipProvider>
  <Toaster rich-colors theme="dark" position="bottom-right" />
</template>
