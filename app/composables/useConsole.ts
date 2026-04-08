import type { OreConsole } from '@oreforge/sdk'
import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'

let colorCtx: CanvasRenderingContext2D | null = null

function resolveColor(el: HTMLElement): string {
  if (!colorCtx) colorCtx = document.createElement('canvas').getContext('2d')
  if (!colorCtx) return ''
  colorCtx.fillStyle = getComputedStyle(el).backgroundColor
  return colorCtx.fillStyle
}

export function useConsole(projectName: MaybeRef<string>, serverName: MaybeRef<string>) {
  const terminalRef = ref<HTMLElement | null>(null)
  const connecting = ref(false)
  const connected = ref(false)
  const error = ref<string | null>(null)

  let terminal: Terminal | null = null
  let fitAddon: FitAddon | null = null
  let oreConsole: OreConsole | null = null
  function fit() {
    fitAddon?.fit()
  }

  function connect() {
    if (!terminalRef.value) return
    disconnect()
    connecting.value = true

    const bg = resolveColor(terminalRef.value)

    terminal = new Terminal({
      cursorBlink: true,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 14,
      scrollback: 1000,
      overviewRuler: { width: 0 },
      theme: { background: bg },
    })
    fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(terminalRef.value)
    fitAddon.fit()

    const client = useOreClient()
    oreConsole = client.projects.get(toValue(projectName)).console({
      server: toValue(serverName),
      cols: terminal.cols,
      rows: terminal.rows,
    })

    terminal.onResize(({ cols, rows }) => {
      oreConsole?.resize(cols, rows)
    })

    oreConsole.onData((data) => {
      connecting.value = false
      connected.value = true
      terminal?.write(data)
    })
    oreConsole.onClose(() => {
      connecting.value = false
      connected.value = false
    })
    oreConsole.onError((e) => {
      error.value = e.message
      connecting.value = false
      connected.value = false
    })

    queueMicrotask(() => {
      terminal?.onData((data) => oreConsole?.write(new TextEncoder().encode(data)))
    })

    window.addEventListener('resize', fit)
  }

  function disconnect() {
    window.removeEventListener('resize', fit)
    oreConsole?.close()
    oreConsole = null
    terminal?.dispose()
    terminal = null
    fitAddon = null
    connecting.value = false
    connected.value = false
    error.value = null
  }

  onUnmounted(disconnect)

  return { terminalRef, connecting, connected, error, connect, disconnect, fit }
}
