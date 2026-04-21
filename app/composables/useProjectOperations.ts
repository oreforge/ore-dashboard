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

export function useProjectOperations(projectName: MaybeRefOrGetter<string>) {
  const client = useOreClient()

  const group = createOperationGroup<Action>({
    labels: LABELS,
    project: projectName,
    trigger: (action, args): Promise<OperationResponse> => {
      const name = toValue(projectName)
      const project = client.projects.get(name)
      switch (action) {
        case 'up': {
          const opts = (args ?? {}) as UpRequest
          return project.up({ no_cache: opts.no_cache, force: opts.force })
        }
        case 'down':
          return project.down()
        case 'build': {
          const opts = (args ?? {}) as BuildRequest
          return project.build({ no_cache: opts.no_cache })
        }
        case 'update':
          return client.projects.update(name)
        case 'clean': {
          const target = (args as CleanRequest['target']) ?? 'all'
          return project.clean({ target })
        }
      }
    },
  })

  return reactive({
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
  })
}
