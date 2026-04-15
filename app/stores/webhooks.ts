import type { WebhookInfoResponse } from '@oreforge/sdk'
import { defineStore } from 'pinia'

export interface WebhookEntry {
  info: WebhookInfoResponse | null
  loading: boolean
  error: string | null
}

function emptyEntry(): WebhookEntry {
  return { info: null, loading: true, error: null }
}

export const useWebhooksStore = defineStore('webhooks', () => {
  const entries = ref<Record<string, WebhookEntry>>({})

  function get(project: string): WebhookEntry {
    return entries.value[project] ?? emptyEntry()
  }

  function upsert(project: string, patch: Partial<WebhookEntry>) {
    const current = entries.value[project] ?? emptyEntry()
    entries.value[project] = { ...current, ...patch }
  }

  function remove(project: string) {
    delete entries.value[project]
  }

  return { entries, get, upsert, remove }
})
