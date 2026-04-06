import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'

export function useConsole(projectName: MaybeRef<string>, containerName: MaybeRef<string>) {
  const terminalRef = ref<HTMLElement | null>(null)
  const connected = ref(false)
  const error = ref<string | null>(null)

  let terminal: Terminal | null = null
  let fitAddon: FitAddon | null = null
  let oreConsole: ReturnType<ReturnType<typeof useOreClient>['projects']['get']>['console'] extends (
    opts: infer _O,
  ) => infer R
    ? R
    : never
  let resizeObserver: ResizeObserver | null = null

  function connect() {
    if (!terminalRef.value) return
    disconnect()

    terminal = new Terminal({
      cursorBlink: true,
      theme: { background: '#09090b', foreground: '#fafafa' },
      fontFamily: 'monospace',
      fontSize: 14,
    })
    fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(terminalRef.value)
    fitAddon.fit()

    const client = useOreClient()
    const consolInstance = client.projects.get(toValue(projectName)).console({
      container: toValue(containerName),
      cols: terminal.cols,
      rows: terminal.rows,
    })
    oreConsole = consolInstance as typeof oreConsole

    consolInstance.onData((data: Uint8Array) => terminal!.write(data))
    consolInstance.onClose(() => {
      connected.value = false
    })
    consolInstance.onError((e: Error) => {
      error.value = e.message
      connected.value = false
    })

    terminal.onData((data: string) => {
      consolInstance.write(new TextEncoder().encode(data))
    })

    resizeObserver = new ResizeObserver(() => {
      if (fitAddon && terminal) {
        fitAddon.fit()
        consolInstance.resize(terminal.cols, terminal.rows)
      }
    })
    resizeObserver.observe(terminalRef.value)

    connected.value = true
    error.value = null
  }

  function disconnect() {
    resizeObserver?.disconnect()
    resizeObserver = null
    if (oreConsole) {
      try {
        ;(oreConsole as { close: () => void }).close()
      } catch {}
    }
    terminal?.dispose()
    terminal = null
    fitAddon = null
    connected.value = false
  }

  onUnmounted(disconnect)

  return { terminalRef, connected, error, connect, disconnect }
}
