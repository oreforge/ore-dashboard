import { OreClient } from '@oreforge/sdk'

let client: OreClient | null = null

export function useOreClient(): OreClient {
  if (!client) {
    client = new OreClient({ baseUrl: window.location.origin })
  }
  return client
}
