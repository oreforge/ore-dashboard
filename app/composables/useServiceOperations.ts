import { createOperationGroup } from './internal/createOperationGroup'

type Action = 'start' | 'stop' | 'restart'

function createGroup(projectName: string, serviceName: string) {
  const client = useOreClient()

  return createOperationGroup<Action>({
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
}

type Group = ReturnType<typeof createGroup>

function streamProxy(getStream: () => Group['streams'][Action]) {
  return {
    get running() {
      return getStream().running
    },
    get error() {
      return getStream().error
    },
    get operationId() {
      return getStream().operationId
    },
    execute: (...args: Parameters<Group['streams'][Action]['execute']>) =>
      getStream().execute(...args),
    attach: (id: string) => getStream().attach(id),
    cancel: () => getStream().cancel(),
  }
}

export function useServiceOperations(
  projectName: MaybeRefOrGetter<string>,
  serviceName: MaybeRefOrGetter<string>,
) {
  const project = computed(() => toValue(projectName))
  const service = computed(() => toValue(serviceName))
  const groupRef = shallowRef(createGroup(project.value, service.value))

  watch([project, service], ([p, s], [pp, sp]) => {
    if (p === pp && s === sp) return
    groupRef.value.dispose()
    groupRef.value = createGroup(p, s)
  })

  onScopeDispose(() => groupRef.value.dispose())

  const group = () => groupRef.value

  return {
    start: streamProxy(() => group().streams.start),
    stop: streamProxy(() => group().streams.stop),
    restart: streamProxy(() => group().streams.restart),
    anyRunning: computed(() => group().anyRunning.value),
    handleStart: () => group().handle('start'),
    handleStop: () => group().handle('stop'),
    handleRestart: () => group().handle('restart'),
  }
}
