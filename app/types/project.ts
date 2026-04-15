import type { NetworkStatus } from '@oreforge/sdk'
import type { ComputedRef } from 'vue'

export interface ProjectEntry {
  name: string
  status: NetworkStatus | null
  loading: boolean
  error: string | null
}

export interface ProjectStatusContext {
  status: ComputedRef<NetworkStatus | null>
  loading: ComputedRef<boolean>
  error: ComputedRef<string | null>
  fetchedAt: ComputedRef<number>
}
