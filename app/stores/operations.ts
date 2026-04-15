import type { OperationResponse } from '@oreforge/sdk'
import { defineStore } from 'pinia'

export const useOperationsStore = defineStore('operations', () => {
  const entries = ref<Record<string, OperationResponse>>({})
  const primed = ref(false)

  const list = computed<OperationResponse[]>(() => Object.values(entries.value))
  const count = computed(() => Object.keys(entries.value).length)

  function forProject(project: string): OperationResponse[] {
    return list.value.filter((op) => op.project === project)
  }

  function forTarget(project: string, target: string | undefined): OperationResponse[] {
    return list.value.filter(
      (op) => op.project === project && (target === undefined ? !op.target : op.target === target),
    )
  }

  function setMany(ops: OperationResponse[]) {
    const next: Record<string, OperationResponse> = {}
    for (const op of ops) next[op.id] = op
    entries.value = next
  }

  function upsert(op: OperationResponse) {
    entries.value[op.id] = op
  }

  function remove(id: string) {
    delete entries.value[id]
  }

  function clear() {
    entries.value = {}
  }

  function setPrimed(value: boolean) {
    primed.value = value
  }

  return {
    entries,
    primed,
    list,
    count,
    forProject,
    forTarget,
    setMany,
    upsert,
    remove,
    clear,
    setPrimed,
  }
})
