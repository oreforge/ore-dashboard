import { createOperationGroup } from './internal/createOperationGroup'

type Action = 'start' | 'stop' | 'restart'

const groups = new Map<string, ReturnType<typeof createGroup>>()

function createGroup(projectName: string, serverName: string) {
  const client = useOreClient()

  const group = createOperationGroup<Action>({
    actions: ['start', 'stop', 'restart'],
    labels: {
      start: `Start ${serverName}`,
      stop: `Stop ${serverName}`,
      restart: `Restart ${serverName}`,
    },
    project: projectName,
    target: serverName,
    trigger: (action, signal) => {
      const server = client.projects.get(projectName).servers.get(serverName)
      return server[action]({ signal })
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

export function useServerOperations(projectName: MaybeRef<string>, serverName: MaybeRef<string>) {
  const key = `${toValue(projectName)}/${toValue(serverName)}`
  let ops = groups.get(key)
  if (!ops) {
    ops = createGroup(toValue(projectName), toValue(serverName))
    groups.set(key, ops)
  }
  return ops
}
