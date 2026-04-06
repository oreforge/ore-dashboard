<script setup lang="ts">
import { ChevronsUpDownIcon, FolderOpenIcon, PlusIcon } from 'lucide-vue-next'
import { useSidebar } from '~/components/ui/sidebar'
import { aggregateStatusDot } from '~/utils/status-colors'

const { projects, loading } = useProjects()
const route = useRoute()
const router = useRouter()
const { isMobile } = useSidebar()

const activeProject = computed(() => {
  const name = route.params.name as string | undefined
  if (!name) return null
  return projects.value.find((p) => p.name === name) ?? null
})

function selectProject(name: string) {
  router.push(`/projects/${name}`)
}

const showAddDialog = ref(false)
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <ChevronsUpDownIcon class="hidden shrink-0 group-data-[collapsible=icon]:m-auto group-data-[collapsible=icon]:block" />
            <div class="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span class="truncate font-semibold">
                {{ activeProject?.name ?? 'Select project' }}
              </span>
              <span class="truncate text-xs text-muted-foreground">
                {{ activeProject?.status?.network ?? 'oreforge' }}
              </span>
            </div>
            <ChevronsUpDownIcon class="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="start"
          :side-offset="4"
        >
          <DropdownMenuLabel class="text-xs text-muted-foreground">Projects</DropdownMenuLabel>
          <template v-if="loading">
            <div v-for="i in 3" :key="i" class="flex items-center gap-2 p-2">
              <Skeleton class="size-6 rounded-sm" />
              <Skeleton class="h-4 flex-1" />
            </div>
          </template>
          <template v-else-if="projects.length === 0">
            <DropdownMenuItem disabled>No projects yet</DropdownMenuItem>
          </template>
          <template v-else>
            <DropdownMenuItem
              v-for="project in projects"
              :key="project.name"
              class="gap-2 p-2"
              @click="selectProject(project.name)"
            >
              <span class="flex-1 truncate">{{ project.name }}</span>
              <span class="inline-block size-2 shrink-0 rounded-full" :class="aggregateStatusDot(project.status)" />
            </DropdownMenuItem>
          </template>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="gap-2 p-2" @click="router.push('/')">
            <FolderOpenIcon class="size-4 text-muted-foreground" />
            <span class="font-medium text-muted-foreground">Manage projects</span>
          </DropdownMenuItem>
          <DropdownMenuItem class="gap-2 p-2" @click="showAddDialog = true">
            <PlusIcon class="size-4 text-muted-foreground" />
            <span class="font-medium text-muted-foreground">Add project</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>

  <ProjectAddDialog v-model:open="showAddDialog" />
</template>
