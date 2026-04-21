import type { OperationAction, OperationResponse } from '@oreforge/sdk'
import { toast } from 'vue-sonner'
import { watchOperation } from '~/composables/useActiveOperations'
import { useOperationsStore } from '~/stores/operations'
import { parseOreError } from '~/utils/parseOreError'

export interface OperationStreamKey {
  project: MaybeRefOrGetter<string>
  target?: MaybeRefOrGetter<string | undefined>
  action: OperationAction
  label: string
}

export function useOperationStream(key: OperationStreamKey) {
  const store = useOperationsStore()
  const project = computed(() => toValue(key.project))
  const target = computed(() => toValue(key.target))

  const running = computed(() => store.isRunning(project.value, target.value, key.action))

  function announceResult(op: OperationResponse) {
    if (op.status === 'failed') {
      toast.error(`${key.label} failed`, { description: op.error ?? undefined })
    } else if (op.status === 'cancelled') {
      toast.warning(`${key.label} cancelled`)
    } else {
      toast.success(`${key.label} completed`)
    }
  }

  async function trigger(kickoff: () => Promise<OperationResponse>): Promise<void> {
    if (running.value) return
    let op: OperationResponse
    try {
      op = await kickoff()
    } catch (e) {
      toast.error(`${key.label} failed`, { description: parseOreError(e) })
      return
    }
    if (op.status === 'pending' || op.status === 'running') {
      store.upsert(op)
      watchOperation(op.id, announceResult)
    } else {
      announceResult(op)
    }
  }

  return reactive({ running, trigger })
}
