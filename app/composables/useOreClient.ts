import { OreClient } from '@oreforge/sdk'

let client: OreClient | null = null

export function useOreClient(): OreClient {
  if (!client) {
    const baseUrl = import.meta.client ? window.location.origin : ''
    client = new OreClient({ baseUrl })
  }
  return client
}
