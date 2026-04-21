import type { BinaryEntry } from '@oreforge/sdk'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import ProjectBuildsBinaryRowActions from '~/components/project/builds/ProjectBuildsBinaryRowActions.vue'
import { formatAbsoluteTime, formatBytes, formatRelativeTime } from '~/utils/formatters'

export function createBinaryColumns(): ColumnDef<BinaryEntry>[] {
  return [
    {
      accessorKey: 'filename',
      header: 'Filename',
      cell: ({ row }) =>
        h(
          'span',
          {
            class: 'block truncate pr-4 font-mono text-xs font-medium',
            title: row.original.filename,
          },
          row.original.filename,
        ),
    },
    {
      accessorKey: 'software_id',
      header: 'Software',
      cell: ({ row }) =>
        h(
          'span',
          {
            class: 'block truncate pr-4 font-mono text-xs text-muted-foreground',
            title: row.original.software_id,
          },
          row.original.software_id,
        ),
    },
    {
      accessorKey: 'size_bytes',
      header: () => h('div', { class: 'pr-4 text-right' }, 'Size'),
      size: 110,
      cell: ({ row }) =>
        h(
          'div',
          { class: 'pr-4 text-right font-mono text-xs tabular-nums text-muted-foreground' },
          formatBytes(row.original.size_bytes),
        ),
    },
    {
      accessorKey: 'sha256',
      header: 'SHA-256',
      cell: ({ row }) =>
        h(
          'span',
          {
            class: 'block truncate pr-4 font-mono text-xs text-muted-foreground',
            title: row.original.sha256,
          },
          `${row.original.sha256.slice(0, 16)}…`,
        ),
    },
    {
      accessorKey: 'cached_at',
      header: 'Cached',
      size: 150,
      cell: ({ row }) =>
        h(
          'span',
          {
            class: 'whitespace-nowrap text-sm text-muted-foreground',
            title: formatAbsoluteTime(row.original.cached_at),
          },
          formatRelativeTime(row.original.cached_at),
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
          h(ProjectBuildsBinaryRowActions, { binary: row.original }),
        ),
    },
  ]
}
