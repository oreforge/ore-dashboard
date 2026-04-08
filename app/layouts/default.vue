<script setup lang="ts">
const route = useRoute()

const breadcrumbs = computed(() => {
  const crumbs: { label: string; to?: string }[] = [{ label: 'Projects', to: '/' }]
  const name = route.params.name as string | undefined
  if (!name) return crumbs

  crumbs.push({ label: name, to: `/projects/${name}` })

  if (route.path.endsWith('/console')) {
    crumbs.push({ label: 'Console' })
  } else if (route.path.endsWith('/settings')) {
    crumbs.push({ label: 'Settings' })
  }

  return crumbs
})
</script>

<template>
  <SidebarProvider>
    <ShellSidebar />
    <SidebarInset class="flex min-h-screen flex-col">
      <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <template v-for="(crumb, i) in breadcrumbs" :key="crumb.label">
              <BreadcrumbSeparator v-if="i > 0" />
              <BreadcrumbItem>
                <BreadcrumbLink v-if="crumb.to && i < breadcrumbs.length - 1" as-child>
                  <NuxtLink :to="crumb.to">{{ crumb.label }}</NuxtLink>
                </BreadcrumbLink>
                <BreadcrumbPage v-else>{{ crumb.label }}</BreadcrumbPage>
              </BreadcrumbItem>
            </template>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main class="flex min-h-0 flex-1 flex-col p-6">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
