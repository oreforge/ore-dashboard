<script setup lang="ts">
const { version } = useAppConfig()
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <ProjectSwitcher />
    </SidebarHeader>

    <SidebarContent>
      <ShellNavMain />
    </SidebarContent>

    <SidebarFooter>
      <div class="px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
        OreForge v{{ version }}
      </div>
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
