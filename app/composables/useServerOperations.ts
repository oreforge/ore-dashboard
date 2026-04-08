import { toast } from 'vue-sonner'

const serverOpsMap = new Map<string, ReturnType<typeof createServerOps>>()

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

function createServerOps(projectName: string, serverName: string) {
  const client = useOreClient()
  const start = useStreamOperation()
  const stop = useStreamOperation()
  const restart = useStreamOperation()

  const anyRunning = computed(
    () => start.running.value || stop.running.value || restart.running.value,
  )

  const runStart = withToast(start, `Start ${serverName}`)
  const runStop = withToast(stop, `Stop ${serverName}`)
  const runRestart = withToast(restart, `Restart ${serverName}`)

  function handleStart() {
    runStart((signal) => client.projects.get(projectName).servers.get(serverName).start({ signal }))
  }

  function handleStop() {
    runStop((signal) => client.projects.get(projectName).servers.get(serverName).stop({ signal }))
  }

  function handleRestart() {
    runRestart((signal) =>
      client.projects.get(projectName).servers.get(serverName).restart({ signal }),
    )
  }

  return { start, stop, restart, anyRunning, handleStart, handleStop, handleRestart }
}

export function useServerOperations(projectName: MaybeRef<string>, serverName: MaybeRef<string>) {
  const key = `${toValue(projectName)}/${toValue(serverName)}`
  let ops = serverOpsMap.get(key)
  if (!ops) {
    ops = createServerOps(toValue(projectName), toValue(serverName))
    serverOpsMap.set(key, ops)
  }
  return ops
}
