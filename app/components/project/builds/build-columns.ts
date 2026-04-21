import type { BuildEntry } from '@oreforge/sdk'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { formatAbsoluteTime, formatDurationMs, formatRelativeTime } from '~/utils/formatters'

function mono(text: string, extra = '') {
  return h(
    'span',
    {
      class: `block truncate pr-4 font-mono text-xs text-muted-foreground ${extra}`,
      title: text,
    },
    text,
  )
}

export function createBuildColumns(): ColumnDef<BuildEntry>[] {
  return [
    {
      accessorKey: 'server_name',
      header: 'Server',
      cell: ({ row }) =>
        h('span', { class: 'truncate pr-4 text-sm font-medium' }, row.original.server_name),
    },
    {
      accessorKey: 'image_tag',
      header: 'Image',
      cell: ({ row }) => mono(row.original.image_tag),
    },
    {
      accessorKey: 'software_id',
      header: 'Software',
      cell: ({ row }) => mono(row.original.software_id),
    },
    {
      accessorKey: 'cache_key',
      header: 'Cache key',
      cell: ({ row }) => mono(row.original.cache_key),
    },
    {
      accessorKey: 'built_at',
      header: 'Built',
      size: 150,
      cell: ({ row }) =>
        h(
          'span',
          {
            class: 'whitespace-nowrap text-sm text-muted-foreground',
            title: formatAbsoluteTime(row.original.built_at),
          },
          formatRelativeTime(row.original.built_at),
        ),
    },
    {
      accessorKey: 'duration_ms',
      header: () => h('div', { class: 'pr-4 text-right' }, 'Duration'),
      size: 120,
      cell: ({ row }) =>
        h(
          'div',
          { class: 'pr-4 text-right font-mono text-xs tabular-nums text-muted-foreground' },
          formatDurationMs(row.original.duration_ms),
        ),
    },
  ]
}
