import { defineStore } from 'pinia'

export type ConsoleState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

export interface ConsoleSession {
  state: ConsoleState
  error: string | null
}

function emptySession(): ConsoleSession {
  return { state: 'idle', error: null }
}

function sessionKey(project: string, server: string) {
  return `${project}/${server}`
}

interface ConsoleStoreState {
  sessions: Record<string, ConsoleSession>
}

export const useConsoleStore = defineStore('console', {
  state: (): ConsoleStoreState => ({ sessions: {} }),
  getters: {
    get:
      (state) =>
      (project: string, server: string): ConsoleSession =>
        state.sessions[sessionKey(project, server)] ?? emptySession(),
  },
  actions: {
    upsert(project: string, server: string, patch: Partial<ConsoleSession>) {
      const id = sessionKey(project, server)
      const current = this.sessions[id] ?? emptySession()
      this.sessions[id] = { ...current, ...patch }
    },
    remove(project: string, server: string) {
      delete this.sessions[sessionKey(project, server)]
    },
  },
})
