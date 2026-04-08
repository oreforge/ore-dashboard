<script setup lang="ts">
import { GaugeIcon, SettingsIcon, TerminalSquareIcon } from 'lucide-vue-next'

const route = useRoute()
const projectName = computed(() => route.params.name as string | undefined)

const hasProject = computed(() => !!projectName.value)

const navItems = [
  { label: 'Overview', icon: GaugeIcon, path: '' },
  { label: 'Console', icon: TerminalSquareIcon, path: '/console' },
  { label: 'Settings', icon: SettingsIcon, path: '/settings' },
]

function resolveTo(path: string) {
  return `/projects/${projectName.value}${path}`
}

function isActive(path: string) {
  return route.path === resolveTo(path)
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>Manage</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem v-for="item in navItems" :key="item.label">
          <SidebarMenuButton
            v-if="hasProject"
            as-child
            :is-active="isActive(item.path)"
          >
            <NuxtLink :to="resolveTo(item.path)">
              <component :is="item.icon" class="size-4" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </SidebarMenuButton>
          <SidebarMenuButton v-else disabled>
            <component :is="item.icon" class="size-4" />
            <span>{{ item.label }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
