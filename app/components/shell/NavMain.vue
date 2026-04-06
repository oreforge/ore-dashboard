<script setup lang="ts">
import { GaugeIcon, SettingsIcon, TerminalSquareIcon } from 'lucide-vue-next'

const route = useRoute()
const projectName = computed(() => route.params.name as string | undefined)

const hasProject = computed(() => !!projectName.value)

const items = computed(() => {
  const base = projectName.value ? `/projects/${projectName.value}` : ''
  return [
    { label: 'Overview', icon: GaugeIcon, to: base || '#' },
    { label: 'Console', icon: TerminalSquareIcon, to: base ? `${base}/console` : '#' },
    { label: 'Settings', icon: SettingsIcon, to: base ? `${base}/settings` : '#' },
  ]
})

function isActive(to: string) {
  return route.path === to
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>Manage</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem v-for="item in items" :key="item.label">
          <SidebarMenuButton
            v-if="hasProject"
            as-child
            :is-active="isActive(item.to)"
          >
            <NuxtLink :to="item.to">
              <component :is="item.icon" class="size-4" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </SidebarMenuButton>
          <SidebarMenuButton
            v-else
            disabled
          >
            <component :is="item.icon" class="size-4" />
            <span>{{ item.label }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
