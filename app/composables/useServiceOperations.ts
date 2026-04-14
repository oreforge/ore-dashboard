import { createOperationGroup } from './internal/createOperationGroup'

type Action = 'start' | 'stop' | 'restart'

const groups = new Map<string, ReturnType<typeof createGroup>>()

function createGroup(projectName: string, serviceName: string) {
  const client = useOreClient()

  const group = createOperationGroup<Action>({
    actions: ['start', 'stop', 'restart'],
    labels: {
      start: `Start ${serviceName}`,
      stop: `Stop ${serviceName}`,
      restart: `Restart ${serviceName}`,
    },
    project: projectName,
    target: serviceName,
    trigger: (action, signal) => {
      const service = client.projects.get(projectName).services.get(serviceName)
      return service[action]({ signal })
    },
  })

  return {
    start: group.streams.start,
    stop: group.streams.stop,
    restart: group.streams.restart,
    anyRunning: group.anyRunning,
    handleStart: () => group.handle('start'),
    handleStop: () => group.handle('stop'),
    handleRestart: () => group.handle('restart'),
  }
}

export function useServiceOperations(projectName: MaybeRef<string>, serviceName: MaybeRef<string>) {
  const key = `${toValue(projectName)}/${toValue(serviceName)}`
  let ops = groups.get(key)
  if (!ops) {
    ops = createGroup(toValue(projectName), toValue(serviceName))
    groups.set(key, ops)
  }
  return ops
}
