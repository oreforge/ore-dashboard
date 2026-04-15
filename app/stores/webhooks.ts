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

interface WebhooksState {
  entries: Record<string, WebhookEntry>
}

export const useWebhooksStore = defineStore('webhooks', {
  state: (): WebhooksState => ({ entries: {} }),
  getters: {
    get:
      (state) =>
      (project: string): WebhookEntry =>
        state.entries[project] ?? emptyEntry(),
  },
  actions: {
    upsert(project: string, patch: Partial<WebhookEntry>) {
      const current = this.entries[project] ?? emptyEntry()
      this.entries[project] = { ...current, ...patch }
    },
    remove(project: string) {
      delete this.entries[project]
    },
  },
})
