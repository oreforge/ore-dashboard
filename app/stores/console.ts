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

export const useConsoleStore = defineStore('console', () => {
  const sessions = ref<Record<string, ConsoleSession>>({})

  function get(project: string, server: string): ConsoleSession {
    return sessions.value[sessionKey(project, server)] ?? emptySession()
  }

  function upsert(project: string, server: string, patch: Partial<ConsoleSession>) {
    const id = sessionKey(project, server)
    const current = sessions.value[id] ?? emptySession()
    sessions.value[id] = { ...current, ...patch }
  }

  function remove(project: string, server: string) {
    delete sessions.value[sessionKey(project, server)]
  }

  return { sessions, get, upsert, remove }
})
