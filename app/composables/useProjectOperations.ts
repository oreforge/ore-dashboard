import type { BuildRequest, CleanRequest, PruneRequest, UpRequest } from '@oreforge/sdk'

const operationsMap = new Map<string, ReturnType<typeof createOperations>>()

function createOperations(projectName: string) {
  const client = useOreClient()
  const up = useStreamOperation()
  const down = useStreamOperation()
  const build = useStreamOperation()
  const update = useStreamOperation()
  const prune = useStreamOperation()
  const clean = useStreamOperation()

  const anyRunning = computed(
    () =>
      up.running.value ||
      down.running.value ||
      build.running.value ||
      update.running.value ||
      prune.running.value ||
      clean.running.value,
  )

  const activeOp = computed(() => {
    if (up.running.value) return up
    if (down.running.value) return down
    if (build.running.value) return build
    if (update.running.value) return update
    if (prune.running.value) return prune
    if (clean.running.value) return clean
    return null
  })

  const lastOp = computed(() => {
    const ops = [up, down, build, update, prune, clean]
    return ops.find((op) => op.lines.value.length > 0)
  })

  function handleUp(opts?: UpRequest) {
    up.execute((signal) =>
      client.projects
        .get(projectName)
        .up({ no_cache: opts?.no_cache, force: opts?.force }, { signal }),
    )
  }
  function handleDown() {
    down.execute((signal) => client.projects.get(projectName).down({ signal }))
  }
  function handleBuild(opts?: BuildRequest) {
    build.execute((signal) =>
      client.projects.get(projectName).build({ no_cache: opts?.no_cache }, { signal }),
    )
  }
  function handleUpdate() {
    update.execute((signal) => client.projects.update(projectName, { signal }))
  }
  function handlePrune(target: PruneRequest['target'] = 'all') {
    prune.execute((signal) => client.projects.get(projectName).prune({ target }, { signal }))
  }
  function handleClean(target: CleanRequest['target'] = 'all') {
    clean.execute((signal) => client.projects.get(projectName).clean({ target }, { signal }))
  }

  function cancelActive() {
    if (up.running.value) up.abort()
    else if (down.running.value) down.abort()
    else if (build.running.value) build.abort()
    else if (update.running.value) update.abort()
    else if (prune.running.value) prune.abort()
    else if (clean.running.value) clean.abort()
  }

  return {
    up,
    down,
    build,
    update,
    prune,
    clean,
    anyRunning,
    activeOp,
    lastOp,
    handleUp,
    handleDown,
    handleBuild,
    handleUpdate,
    handlePrune,
    handleClean,
    cancelActive,
  }
}

export function useProjectOperations(projectName: MaybeRef<string>) {
  const name = toValue(projectName)
  if (!operationsMap.has(name)) {
    operationsMap.set(name, createOperations(name))
  }
  return operationsMap.get(name) as ReturnType<typeof createOperations>
}
