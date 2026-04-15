import { OreApiError, OreConnectionError, OreStreamError } from '@oreforge/sdk'

export function parseOreError(e: unknown, fallback = 'Something went wrong'): string {
  if (e instanceof OreStreamError) return e.line.error ?? e.message
  if (e instanceof OreConnectionError) return 'Unable to reach the server. Check your connection.'
  if (e instanceof OreApiError) return String(e.detail)
  if (e instanceof Error) return e.message
  return fallback
}
