import type { BuildRequest, CleanRequest, OperationResponse, UpRequest } from '@oreforge/sdk'
import { createOperationGroup } from './internal/createOperationGroup'

type Action = 'up' | 'down' | 'build' | 'update' | 'clean'

const LABELS: Record<Action, string> = {
  up: 'Up',
  down: 'Down',
  build: 'Build',
  update: 'Update',
  clean: 'Clean',
}

function createGroup(projectName: string) {
  const client = useOreClient()

  return createOperationGroup<Action>({
    actions: ['up', 'down', 'build', 'update', 'clean'],
    labels: LABELS,
    project: projectName,
    trigger: (action, signal, args): Promise<OperationResponse> => {
      const project = client.projects.get(projectName)
      switch (action) {
        case 'up': {
          const opts = (args ?? {}) as UpRequest
          return project.up({ no_cache: opts.no_cache, force: opts.force }, { signal })
        }
        case 'down':
          return project.down({ signal })
        case 'build': {
          const opts = (args ?? {}) as BuildRequest
          return project.build({ no_cache: opts.no_cache }, { signal })
        }
        case 'update':
          return client.projects.update(projectName, { signal })
        case 'clean': {
          const target = (args as CleanRequest['target']) ?? 'all'
          return project.clean({ target }, { signal })
        }
      }
    },
  })
}

type Group = ReturnType<typeof createGroup>

function makeStreamProxy(getStream: () => Group['streams'][Action]) {
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

export function useProjectOperations(projectName: MaybeRef<string>) {
  const name = computed(() => toValue(projectName))
  const groupRef = shallowRef(createGroup(name.value))

  watch(name, (next, prev) => {
    if (next === prev) return
    groupRef.value.dispose()
    groupRef.value = createGroup(next)
  })

  onScopeDispose(() => groupRef.value.dispose())

  const group = () => groupRef.value

  return {
    up: makeStreamProxy(() => group().streams.up),
    down: makeStreamProxy(() => group().streams.down),
    build: makeStreamProxy(() => group().streams.build),
    update: makeStreamProxy(() => group().streams.update),
    clean: makeStreamProxy(() => group().streams.clean),
    anyRunning: computed(() => group().anyRunning.value),
    handleUp: (opts?: UpRequest) => group().handle('up', opts),
    handleDown: () => group().handle('down'),
    handleBuild: (opts?: BuildRequest) => group().handle('build', opts),
    handleUpdate: () => group().handle('update'),
    handleClean: (target: CleanRequest['target'] = 'all') => group().handle('clean', target),
  }
}
