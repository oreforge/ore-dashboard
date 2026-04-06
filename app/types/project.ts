import type { NetworkStatus } from '@oreforge/sdk'

export interface ProjectEntry {
  name: string
  status: NetworkStatus | null
  loading: boolean
  error: string | null
}

export type UpOptions = { no_cache?: boolean; force?: boolean }
export type BuildOptions = { no_cache?: boolean }
export type PruneTarget = 'all' | 'servers' | 'images' | 'data'
export type CleanTarget = 'all' | 'cache' | 'builds'
