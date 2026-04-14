import type { OperationResponse } from '@oreforge/sdk'
import { toast } from 'vue-sonner'

type StreamOp = ReturnType<typeof useStreamOperation>

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
    for (const action of config.actions) map[action] = useStreamOperation()
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

  const activeOps = useActiveOperationsStore()
  activeOps.ensurePrimed().then(() => {
    for (const op of activeOps.operationsFor(config.project, config.target)) {
      const stream = streams[op.action as A]
      if (!stream || stream.running.value) continue
      activeOps.claim(op.id)
      void stream.attach(op.id)
    }
  })

  return { streams, anyRunning, handle, dispose: () => scope.stop() }
}
