import type { BuildRequest, CleanRequest, UpRequest } from '@oreforge/sdk'
import { toast } from 'vue-sonner'

const operationsMap = new Map<string, ReturnType<typeof createOperations>>()

function withToast(op: ReturnType<typeof useStreamOperation>, label: string) {
  return async (streamFn: Parameters<ReturnType<typeof useStreamOperation>['execute']>[0]) => {
    await op.execute(streamFn)
    if (op.error.value) {
      toast.error(`${label} failed`, { description: op.error.value })
    } else {
      toast.success(`${label} completed`)
    }
  }
}

function createOperations(projectName: string) {
  const client = useOreClient()
  const up = useStreamOperation()
  const down = useStreamOperation()
  const build = useStreamOperation()
  const update = useStreamOperation()
  const clean = useStreamOperation()

  const anyRunning = computed(
    () =>
      up.running.value ||
      down.running.value ||
      build.running.value ||
      update.running.value ||
      clean.running.value,
  )

  const runUp = withToast(up, 'Up')
  const runDown = withToast(down, 'Down')
  const runBuild = withToast(build, 'Build')
  const runUpdate = withToast(update, 'Update')
  const runClean = withToast(clean, 'Clean')

  function handleUp(opts?: UpRequest) {
    runUp((signal) =>
      client.projects
        .get(projectName)
        .up({ no_cache: opts?.no_cache, force: opts?.force }, { signal }),
    )
  }
  function handleDown() {
    runDown((signal) => client.projects.get(projectName).down({ signal }))
  }
  function handleBuild(opts?: BuildRequest) {
    runBuild((signal) =>
      client.projects.get(projectName).build({ no_cache: opts?.no_cache }, { signal }),
    )
  }
  function handleUpdate() {
    runUpdate((signal) => client.projects.update(projectName, { signal }))
  }
  function handleClean(target: CleanRequest['target'] = 'all') {
    runClean((signal) => client.projects.get(projectName).clean({ target }, { signal }))
  }

  return {
    up,
    down,
    build,
    update,
    clean,
    anyRunning,
    handleUp,
    handleDown,
    handleBuild,
    handleUpdate,
    handleClean,
  }
}

export function useProjectOperations(projectName: MaybeRef<string>) {
  const name = toValue(projectName)
  let ops = operationsMap.get(name)
  if (!ops) {
    ops = createOperations(name)
    operationsMap.set(name, ops)
  }
  return ops
}
