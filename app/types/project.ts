import type { NetworkStatus } from '@oreforge/sdk'

export interface ProjectEntry {
  name: string
  status: NetworkStatus | null
  loading: boolean
  error: string | null
}
