import type { OperationAction, OperationResponse, OperationStatus } from '@oreforge/sdk'
import { defineStore } from 'pinia'

const ACTIVE_STATUSES: ReadonlySet<OperationStatus> = new Set(['pending', 'running'])

const matchesTarget = (op: OperationResponse, target: string | undefined) =>
  target === undefined ? !op.target : op.target === target

const isActive = (op: OperationResponse) => ACTIVE_STATUSES.has(op.status)

export const useOperationsStore = defineStore('operations', () => {
  const entries = ref<Record<string, OperationResponse>>({})
  const primed = ref(false)

  const list = computed(() => Object.values(entries.value))
  const count = computed(() => list.value.length)

  function setMany(ops: OperationResponse[]) {
    const next: Record<string, OperationResponse> = {}
    for (const op of ops) next[op.id] = op
    entries.value = next
  }

  function upsert(op: OperationResponse) {
    entries.value[op.id] = op
  }

  function setPrimed(value: boolean) {
    primed.value = value
  }

  function isRunning(
    project: string,
    target: string | undefined,
    action: OperationAction,
  ): boolean {
    return list.value.some(
      (op) =>
        op.project === project && op.action === action && matchesTarget(op, target) && isActive(op),
    )
  }

  function anyRunning(project: string, target: string | undefined): boolean {
    return list.value.some(
      (op) => op.project === project && matchesTarget(op, target) && isActive(op),
    )
  }

  function isActionRunning(project: string, action: OperationAction): boolean {
    return list.value.some((op) => op.project === project && op.action === action && isActive(op))
  }

  return {
    entries,
    primed,
    list,
    count,
    setMany,
    upsert,
    setPrimed,
    isRunning,
    anyRunning,
    isActionRunning,
  }
})
