import type { OperationResponse } from '@oreforge/sdk'
import { defineStore } from 'pinia'

interface OperationsState {
  entries: Record<string, OperationResponse>
  primed: boolean
}

export const useOperationsStore = defineStore('operations', {
  state: (): OperationsState => ({ entries: {}, primed: false }),
  getters: {
    list: (state): OperationResponse[] => Object.values(state.entries),
    count: (state): number => Object.keys(state.entries).length,
    forProject:
      (state) =>
      (project: string): OperationResponse[] =>
        Object.values(state.entries).filter((op) => op.project === project),
    forTarget:
      (state) =>
      (project: string, target: string | undefined): OperationResponse[] =>
        Object.values(state.entries).filter(
          (op) =>
            op.project === project && (target === undefined ? !op.target : op.target === target),
        ),
  },
  actions: {
    setMany(ops: OperationResponse[]) {
      const next: Record<string, OperationResponse> = {}
      for (const op of ops) next[op.id] = op
      this.entries = next
    },
    upsert(op: OperationResponse) {
      this.entries[op.id] = op
    },
    remove(id: string) {
      delete this.entries[id]
    },
    clear() {
      this.entries = {}
    },
    setPrimed(value: boolean) {
      this.primed = value
    },
  },
})
