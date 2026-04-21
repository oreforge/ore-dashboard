import type { OperationAction, OperationResponse } from '@oreforge/sdk'
import { toast } from 'vue-sonner'
import { watchOperation } from '~/composables/useActiveOperations'
import { useOperationsStore } from '~/stores/operations'
import { parseOreError } from '~/utils/parseOreError'

interface BatchStreamKey {
  project: MaybeRefOrGetter<string>
  action: OperationAction
  label: string
}

function useBatchStream(key: BatchStreamKey) {
  const store = useOperationsStore()
  const project = computed(() => toValue(key.project))

  const running = computed(() => store.isActionRunning(project.value, key.action))

  function announceResult(op: OperationResponse, count: number) {
    if (op.status === 'failed') {
      toast.error(`${key.label} failed`, { description: op.error ?? undefined })
    } else if (op.status === 'cancelled') {
      toast.warning(`${key.label} cancelled`)
    } else {
      toast.success(`${key.label} completed`, { description: `${count} target(s)` })
    }
  }

  async function trigger(count: number, kickoff: () => Promise<OperationResponse>): Promise<void> {
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
      watchOperation(op.id, (final) => announceResult(final, count))
    } else {
      announceResult(op, count)
    }
  }

  return reactive({ running, trigger })
}

type ContainerKind = 'server' | 'service'

function resourceFor(kind: ContainerKind) {
  return kind === 'server' ? ('servers' as const) : ('services' as const)
}

function containerLabel(kind: ContainerKind, action: 'start' | 'stop' | 'restart') {
  const noun = kind === 'server' ? 'servers' : 'services'
  const verb = action === 'start' ? 'Start' : action === 'stop' ? 'Stop' : 'Restart'
  return `${verb} ${noun}`
}

export function useBatchContainerOperations(
  projectName: MaybeRefOrGetter<string>,
  kind: ContainerKind,
) {
  const client = useOreClient()

  const startStream = useBatchStream({
    project: projectName,
    action: 'batch.start',
    label: containerLabel(kind, 'start'),
  })
  const stopStream = useBatchStream({
    project: projectName,
    action: 'batch.stop',
    label: containerLabel(kind, 'stop'),
  })
  const restartStream = useBatchStream({
    project: projectName,
    action: 'batch.restart',
    label: containerLabel(kind, 'restart'),
  })

  function resource() {
    return client.projects.get(toValue(projectName))[resourceFor(kind)]
  }

  async function handleStart(targets: string[]) {
    if (targets.length === 0) return
    await startStream.trigger(targets.length, () => resource().batchStart(targets))
  }

  async function handleStop(targets: string[]) {
    if (targets.length === 0) return
    await stopStream.trigger(targets.length, () => resource().batchStop(targets))
  }

  async function handleRestart(targets: string[]) {
    if (targets.length === 0) return
    await restartStream.trigger(targets.length, () => resource().batchRestart(targets))
  }

  return reactive({
    start: startStream,
    stop: stopStream,
    restart: restartStream,
    handleStart,
    handleStop,
    handleRestart,
  })
}

export function useBatchVolumeOperations(projectName: MaybeRefOrGetter<string>) {
  const client = useOreClient()

  const deleteStream = useBatchStream({
    project: projectName,
    action: 'batch.volume.remove',
    label: 'Delete volumes',
  })

  async function handleDelete(targets: string[], force = false) {
    if (targets.length === 0) return
    await deleteStream.trigger(targets.length, () =>
      client.projects.get(toValue(projectName)).volumes.batchDelete(targets, { force }),
    )
  }

  return reactive({
    delete: deleteStream,
    handleDelete,
  })
}
