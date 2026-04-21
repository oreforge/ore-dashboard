import { createOperationGroup } from './internal/createOperationGroup'

type Action = 'start' | 'stop' | 'restart'

export function useServerOperations(
  projectName: MaybeRefOrGetter<string>,
  serverName: MaybeRefOrGetter<string>,
) {
  const client = useOreClient()

  const group = createOperationGroup<Action>({
    labels: {
      start: 'Start',
      stop: 'Stop',
      restart: 'Restart',
    },
    project: projectName,
    target: serverName,
    trigger: (action) => {
      const server = client.projects.get(toValue(projectName)).servers.get(toValue(serverName))
      return server[action]()
    },
  })

  return reactive({
    start: group.streams.start,
    stop: group.streams.stop,
    restart: group.streams.restart,
    anyRunning: group.anyRunning,
    handleStart: () => group.handle('start'),
    handleStop: () => group.handle('stop'),
    handleRestart: () => group.handle('restart'),
  })
}
