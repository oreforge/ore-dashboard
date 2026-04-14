import type { OperationResponse } from '@oreforge/sdk'
import { defineStore } from 'pinia'

export const useActiveOperationsStore = defineStore('activeOperations', () => {
  const operations = ref(new Map<string, OperationResponse>())
  let primePromise: Promise<void> | null = null

  async function fetchAll(): Promise<OperationResponse[]> {
    const client = useOreClient()
    const [pending, running] = await Promise.all([
      client.operations.list({ status: 'pending' }),
      client.operations.list({ status: 'running' }),
    ])
    return [...pending.operations, ...running.operations]
  }

  function ensurePrimed(): Promise<void> {
    if (!primePromise) {
      primePromise = fetchAll().then(
        (ops) => {
          const next = new Map<string, OperationResponse>()
          for (const op of ops) next.set(op.id, op)
          operations.value = next
        },
        () => {
          primePromise = null
        },
      )
    }
    return primePromise
  }

  async function refresh(): Promise<void> {
    primePromise = null
    await ensurePrimed()
  }

  function operationsFor(project: string, target?: string): OperationResponse[] {
    const out: OperationResponse[] = []
    for (const op of operations.value.values()) {
      if (op.project !== project) continue
      if (target === undefined ? !op.target : op.target === target) out.push(op)
    }
    return out
  }

  function claim(id: string): void {
    if (operations.value.delete(id)) triggerRef(operations)
  }

  return { operations, ensurePrimed, refresh, operationsFor, claim }
})
