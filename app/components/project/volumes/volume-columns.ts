import type { VolumeResponse } from '@oreforge/sdk'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import VolumeRowActions from '~/components/project/volumes/ProjectVolumesRowActions.vue'
import Badge from '~/components/ui/badge/Badge.vue'
import Checkbox from '~/components/ui/checkbox/Checkbox.vue'

function ownerBadgeClass(kind: 'server' | 'service') {
  return kind === 'server'
    ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
    : 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400'
}

function formatDate(ts?: string) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ts
  }
}

export function createVolumeColumns(
  onDelete: (v: VolumeResponse) => void,
): ColumnDef<VolumeResponse>[] {
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
      cell: ({ row }) => h('span', { class: 'font-mono text-xs' }, row.getValue('name') as string),
    },
    {
      accessorKey: 'logical',
      header: 'Logical',
      cell: ({ row }) => h('span', { class: 'text-sm' }, row.getValue('logical') as string),
    },
    {
      id: 'owner',
      header: 'Owner',
      accessorFn: (row) => row.owner,
      cell: ({ row }) =>
        h('div', { class: 'flex items-center gap-2' }, [
          h(
            Badge,
            {
              variant: 'outline',
              class: `text-[11px] ${ownerBadgeClass(row.original.ownerKind)}`,
            },
            () => row.original.ownerKind,
          ),
          h('span', { class: 'text-sm' }, row.original.owner),
        ]),
    },
    {
      accessorKey: 'driver',
      header: 'Driver',
      size: 100,
      cell: ({ row }) =>
        h('span', { class: 'text-sm text-muted-foreground' }, row.getValue('driver') as string),
    },
    {
      id: 'inUseBy',
      header: 'In use by',
      accessorFn: (row) => row.inUseBy.join(', '),
      cell: ({ row }) => {
        const list = row.original.inUseBy
        if (list.length === 0) {
          return h('span', { class: 'text-sm text-muted-foreground' }, '—')
        }
        return h('span', { class: 'truncate text-sm' }, list.join(', '))
      },
    },
    {
      id: 'createdAt',
      header: 'Created',
      size: 180,
      accessorFn: (row) => row.createdAt ?? '',
      cell: ({ row }) =>
        h(
          'span',
          { class: 'whitespace-nowrap text-sm text-muted-foreground' },
          formatDate(row.original.createdAt),
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
          h(VolumeRowActions, {
            inUse: row.original.inUseBy.length > 0,
            onDelete: () => onDelete(row.original),
          }),
        ),
    },
  ]
}
