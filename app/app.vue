<script setup lang="ts">
useHead({ titleTemplate: '%s | OreForge', htmlAttrs: { class: 'dark' } })
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
