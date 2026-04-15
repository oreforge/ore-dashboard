import type { OperationResponse } from '@oreforge/sdk'
import { toast } from 'vue-sonner'
import { useActiveOperations } from '~/composables/useActiveOperations'
import { useOperationStream } from '~/composables/useOperationStream'
import { useOperationsStore } from '~/stores/operations'

type StreamOp = ReturnType<typeof useOperationStream>

export interface OperationGroupConfig<A extends string> {
  actions: readonly A[]
  labels: Record<A, string>
  project: string
  target?: string
  trigger: (action: A, signal: AbortSignal, args?: unknown) => Promise<OperationResponse>
}

export function createOperationGroup<A extends string>(config: OperationGroupConfig<A>) {
  const scope = effectScope(true)
  const streams = scope.run(() => {
    const map = {} as Record<A, StreamOp>
    for (const action of config.actions) map[action] = useOperationStream()
    return map
  }) as Record<A, StreamOp>

  const anyRunning = computed(() => config.actions.some((action) => streams[action].running.value))

  async function handle(action: A, args?: unknown): Promise<void> {
    const stream = streams[action]
    if (!stream) return
    await stream.execute((signal) => config.trigger(action, signal, args))
    const label = config.labels[action]
    if (stream.error.value) {
      toast.error(`${label} failed`, { description: stream.error.value })
    } else {
      toast.success(`${label} completed`)
    }
  }

  const store = useOperationsStore()
  const active = useActiveOperations()
  active.ensurePrimed().then(() => {
    for (const op of store.forTarget(config.project, config.target)) {
      const stream = streams[op.action as A]
      if (!stream || stream.running.value) continue
      void stream.attach(op.id)
    }
  })

  return { streams, anyRunning, handle, dispose: () => scope.stop() }
}
