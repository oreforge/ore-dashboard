import type { OperationAction, OperationResponse } from '@oreforge/sdk'
import { useOperationStream } from '~/composables/useOperationStream'
import { useOperationsStore } from '~/stores/operations'

type StreamOp = ReturnType<typeof useOperationStream>

export interface OperationGroupConfig<A extends OperationAction> {
  labels: Record<A, string>
  project: MaybeRefOrGetter<string>
  target?: MaybeRefOrGetter<string | undefined>
  trigger: (action: A, args?: unknown) => Promise<OperationResponse>
}

export interface OperationGroup<A extends OperationAction> {
  streams: Record<A, StreamOp>
  anyRunning: ComputedRef<boolean>
  handle: (action: A, args?: unknown) => Promise<void>
}

export function createOperationGroup<A extends OperationAction>(
  config: OperationGroupConfig<A>,
): OperationGroup<A> {
  const streams = {} as Record<A, StreamOp>
  for (const action of Object.keys(config.labels) as A[]) {
    streams[action] = useOperationStream({
      project: config.project,
      target: config.target,
      action,
      label: config.labels[action],
    })
  }

  const store = useOperationsStore()
  const anyRunning = computed(() =>
    store.anyRunning(toValue(config.project), toValue(config.target)),
  )

  async function handle(action: A, args?: unknown): Promise<void> {
    await streams[action].trigger(() => config.trigger(action, args))
  }

  return { streams, anyRunning, handle }
}
