import type { VolumeResponse } from '@oreforge/sdk'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import VolumeRowActions from '~/components/project/volumes/ProjectVolumesRowActions.vue'
import Badge from '~/components/ui/badge/Badge.vue'
import Checkbox from '~/components/ui/checkbox/Checkbox.vue'
import { formatBytes } from '~/utils/formatters'

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
      accessorKey: 'logical',
      header: 'Name',
      cell: ({ row }) =>
        h('div', { class: 'flex min-w-0 flex-col pr-4' }, [
          h('span', { class: 'truncate text-sm font-medium' }, row.original.logical),
          h(
            'span',
            { class: 'truncate font-mono text-[11px] text-muted-foreground' },
            row.original.name,
          ),
        ]),
    },
    {
      id: 'usedBy',
      header: 'Used by',
      accessorFn: (row) => [row.owner, ...row.inUseBy].join(', '),
      cell: ({ row }) => {
        const { owner, ownerKind, inUseBy } = row.original
        const consumers = Array.from(new Set([owner, ...inUseBy]))
        return h(
          'div',
          { class: 'flex min-w-0 flex-wrap items-center gap-1.5 pr-4' },
          consumers.map((name) => {
            const isOwner = name === owner
            return h(
              Badge,
              {
                variant: 'outline',
                title: isOwner ? `owner (${ownerKind})` : 'mounted',
                class: [
                  'text-[11px]',
                  isOwner
                    ? ownerBadgeClass(ownerKind)
                    : 'border-muted-foreground/20 text-muted-foreground',
                ],
              },
              () => name,
            )
          }),
        )
      },
    },
    {
      accessorKey: 'sizeBytes',
      header: 'Size',
      size: 120,
      cell: ({ row }) =>
        h(
          'span',
          { class: 'font-mono text-xs tabular-nums text-muted-foreground' },
          formatBytes(row.original.sizeBytes),
        ),
    },
    {
      id: 'createdAt',
      header: 'Created',
      size: 190,
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
      size: 56,
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
