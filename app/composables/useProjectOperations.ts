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

const groups = new Map<string, ReturnType<typeof createGroup>>()

function createGroup(projectName: string) {
  const client = useOreClient()

  const group = createOperationGroup<Action>({
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

  return {
    up: group.streams.up,
    down: group.streams.down,
    build: group.streams.build,
    update: group.streams.update,
    clean: group.streams.clean,
    anyRunning: group.anyRunning,
    handleUp: (opts?: UpRequest) => group.handle('up', opts),
    handleDown: () => group.handle('down'),
    handleBuild: (opts?: BuildRequest) => group.handle('build', opts),
    handleUpdate: () => group.handle('update'),
    handleClean: (target: CleanRequest['target'] = 'all') => group.handle('clean', target),
  }
}

export function useProjectOperations(projectName: MaybeRef<string>) {
  const name = toValue(projectName)
  let ops = groups.get(name)
  if (!ops) {
    ops = createGroup(name)
    groups.set(name, ops)
  }
  return ops
}
