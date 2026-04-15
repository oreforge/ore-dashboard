import type { OreConsole } from '@oreforge/sdk'
import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'
import { useConsoleStore } from '~/stores/console'

let colorCtx: CanvasRenderingContext2D | null = null

function resolveColor(el: HTMLElement): string {
  if (!colorCtx) colorCtx = document.createElement('canvas').getContext('2d')
  if (!colorCtx) return ''
  colorCtx.fillStyle = getComputedStyle(el).backgroundColor
  return colorCtx.fillStyle
}

export function useConsole(projectName: MaybeRef<string>, serverName: MaybeRef<string>) {
  const store = useConsoleStore()
  const terminalRef = ref<HTMLElement | null>(null)

  const project = computed(() => toValue(projectName))
  const server = computed(() => toValue(serverName))
  const session = computed(() => store.get(project.value, server.value))

  let terminal: Terminal | null = null
  let fitAddon: FitAddon | null = null
  let oreConsole: OreConsole | null = null
  let resizeBound = false

  function fit() {
    fitAddon?.fit()
  }

  function bindResize() {
    if (resizeBound) return
    window.addEventListener('resize', fit)
    resizeBound = true
  }

  function unbindResize() {
    if (!resizeBound) return
    window.removeEventListener('resize', fit)
    resizeBound = false
  }

  function connect() {
    if (!terminalRef.value) return
    disconnect()
    store.upsert(project.value, server.value, { state: 'connecting', error: null })

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
    oreConsole = client.projects.get(project.value).console({
      server: server.value,
      cols: terminal.cols,
      rows: terminal.rows,
    })

    terminal.onResize(({ cols, rows }) => {
      oreConsole?.resize(cols, rows)
    })

    oreConsole.onData((data) => {
      store.upsert(project.value, server.value, { state: 'connected', error: null })
      terminal?.write(data)
    })
    oreConsole.onClose(() => {
      store.upsert(project.value, server.value, { state: 'disconnected' })
    })
    oreConsole.onError((e) => {
      store.upsert(project.value, server.value, { state: 'error', error: e.message })
    })

    queueMicrotask(() => {
      terminal?.onData((data) => oreConsole?.write(new TextEncoder().encode(data)))
    })

    bindResize()
  }

  function disconnect() {
    unbindResize()
    oreConsole?.close()
    oreConsole = null
    terminal?.dispose()
    terminal = null
    fitAddon = null
    if (store.get(project.value, server.value).state !== 'error') {
      store.upsert(project.value, server.value, { state: 'idle', error: null })
    }
  }

  function reconnect() {
    disconnect()
    nextTick(connect)
  }

  onScopeDispose(disconnect)

  const state = computed(() => session.value.state)
  const error = computed(() => session.value.error)
  const connecting = computed(() => state.value === 'connecting')
  const connected = computed(() => state.value === 'connected')

  return {
    terminalRef,
    state,
    error,
    connecting,
    connected,
    connect,
    disconnect,
    reconnect,
    fit,
  }
}
