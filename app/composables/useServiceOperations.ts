import { toast } from 'vue-sonner'

const serviceOpsMap = new Map<string, ReturnType<typeof createServiceOps>>()

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

function createServiceOps(projectName: string, serviceName: string) {
  const client = useOreClient()
  const start = useStreamOperation()
  const stop = useStreamOperation()
  const restart = useStreamOperation()

  const anyRunning = computed(
    () => start.running.value || stop.running.value || restart.running.value,
  )

  const runStart = withToast(start, `Start ${serviceName}`)
  const runStop = withToast(stop, `Stop ${serviceName}`)
  const runRestart = withToast(restart, `Restart ${serviceName}`)

  function handleStart() {
    runStart((signal) =>
      client.projects.get(projectName).services.get(serviceName).start({ signal }),
    )
  }

  function handleStop() {
    runStop((signal) => client.projects.get(projectName).services.get(serviceName).stop({ signal }))
  }

  function handleRestart() {
    runRestart((signal) =>
      client.projects.get(projectName).services.get(serviceName).restart({ signal }),
    )
  }

  return { start, stop, restart, anyRunning, handleStart, handleStop, handleRestart }
}

export function useServiceOperations(projectName: MaybeRef<string>, serviceName: MaybeRef<string>) {
  const key = `${toValue(projectName)}/${toValue(serviceName)}`
  let ops = serviceOpsMap.get(key)
  if (!ops) {
    ops = createServiceOps(toValue(projectName), toValue(serviceName))
    serviceOpsMap.set(key, ops)
  }
  return ops
}
