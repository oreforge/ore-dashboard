import type { ContainerState, HealthState } from '@oreforge/sdk'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { h } from 'vue'
import HealthBadge from '~/components/project/containers/ProjectContainersHealthBadge.vue'
import LiveUptime from '~/components/project/containers/ProjectContainersLiveUptime.vue'
import ContainerRowActions from '~/components/project/containers/ProjectContainersRowActions.vue'
import StatusBadge from '~/components/project/containers/ProjectContainersStatusBadge.vue'
import Checkbox from '~/components/ui/checkbox/Checkbox.vue'

export interface ServerRow {
  name: string
  container: {
    state: ContainerState
    health: HealthState
    image: string
    ports?: { host_port: number; container_port: number; protocol: string }[]
    uptime?: number
    resources: {
      memory: { used_bytes: number; limit_bytes: number; percent: number }
      cpu: { limit: number; percent: number }
    }
  }
}

export function createServerColumns(
  projectName: MaybeRefOrGetter<string>,
  fetchedAt: Ref<number>,
): ColumnDef<ServerRow>[] {
  return [
    {
      id: 'select',
      size: 32,
      header: ({ table }) =>
        h(Checkbox, {
          modelValue:
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate'),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
            table.toggleAllPageRowsSelected(!!value),
          ariaLabel: 'Select all',
        }),
      cell: ({ row }) =>
        h(Checkbox, {
          modelValue: row.getIsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
          ariaLabel: 'Select row',
        }),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => h('span', { class: 'font-medium' }, row.getValue('name') as string),
    },
    {
      id: 'state',
      header: 'State',
      size: 110,
      accessorFn: (row) => row.container.state,
      cell: ({ row }) =>
        h(StatusBadge, {
          state: row.original.container.state,
        }),
    },
    {
      id: 'health',
      header: 'Health',
      size: 110,
      accessorFn: (row) => row.container.health,
      cell: ({ row }) =>
        h(HealthBadge, {
          health: row.original.container.health,
        }),
    },
    {
      id: 'image',
      header: 'Image',
      accessorFn: (row) => row.container.image,
      cell: ({ row }) =>
        h(
          'span',
          { class: 'truncate font-mono text-xs text-muted-foreground' },
          row.original.container.image || '\u2014',
        ),
    },
    {
      id: 'ports',
      header: 'Ports',
      cell: ({ row }) =>
        h(
          'span',
          { class: 'whitespace-nowrap truncate font-mono text-xs text-muted-foreground' },
          formatPorts(row.original.container.ports),
        ),
    },
    {
      id: 'uptime',
      header: 'Uptime',
      size: 100,
      cell: ({ row }) =>
        h(LiveUptime, {
          uptimeNs: row.original.container.uptime,
          fetchedAt: fetchedAt.value,
        }),
    },
    {
      id: 'memory',
      header: 'Memory',
      size: 130,
      cell: ({ row }) =>
        h(
          'span',
          { class: 'whitespace-nowrap tabular-nums text-muted-foreground' },
          formatMemory(row.original.container.resources.memory),
        ),
    },
    {
      id: 'cpu',
      header: 'CPUs',
      size: 80,
      cell: ({ row }) =>
        h(
          'span',
          { class: 'whitespace-nowrap tabular-nums text-muted-foreground' },
          formatCpu(row.original.container.resources.cpu),
        ),
    },
    {
      id: 'actions',
      size: 48,
      enableHiding: false,
      cell: ({ row }) =>
        h(
          'div',
          { class: 'flex justify-end' },
          h(ContainerRowActions, {
            projectName: toValue(projectName),
            containerName: row.original.name,
            containerState: row.original.container.state,
            type: 'server',
          }),
        ),
    },
  ]
}
