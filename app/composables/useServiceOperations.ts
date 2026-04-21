import { createOperationGroup } from './internal/createOperationGroup'

type Action = 'start' | 'stop' | 'restart'

export function useServiceOperations(
  projectName: MaybeRefOrGetter<string>,
  serviceName: MaybeRefOrGetter<string>,
) {
  const client = useOreClient()

  const group = createOperationGroup<Action>({
    labels: {
      start: 'Start',
      stop: 'Stop',
      restart: 'Restart',
    },
    project: projectName,
    target: serviceName,
    trigger: (action) => {
      const service = client.projects.get(toValue(projectName)).services.get(toValue(serviceName))
      return service[action]()
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
