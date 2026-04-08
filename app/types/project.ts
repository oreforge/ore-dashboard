import type { NetworkStatus } from '@oreforge/sdk'
import type { Ref } from 'vue'

export interface ProjectEntry {
  name: string
  status: NetworkStatus | null
  loading: boolean
  error: string | null
}

export interface ProjectStatusContext {
  status: Ref<NetworkStatus | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchedAt: Ref<number>
}
