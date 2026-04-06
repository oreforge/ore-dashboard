const upstreams = new Map<unknown, { ws: WebSocket; pending: (string | ArrayBuffer)[] }>()

export default defineEventHandler({
  handler: (event) => {
    const { oreApiUrl, oreToken } = useRuntimeConfig(event)
    const url = getRequestURL(event)
    const target = `${oreApiUrl}${url.pathname}${url.search}`

    return proxyRequest(event, target, {
      headers: oreToken ? { authorization: `Bearer ${oreToken}` } : {},
    })
  },

  websocket: {
    open(peer) {
      const { oreApiUrl, oreToken } = useRuntimeConfig()
      const url = new URL(peer.request?.url || '', 'http://localhost')
      const target = new URL(`${oreApiUrl.replace(/^http/, 'ws')}${url.pathname}${url.search}`)
      if (oreToken) target.searchParams.set('token', oreToken)

      const upstream = new WebSocket(target.toString())
      upstream.binaryType = 'arraybuffer'
      upstreams.set(peer, { ws: upstream, pending: [] })

      upstream.onopen = () => {
        const ctx = upstreams.get(peer)
        for (const m of ctx?.pending ?? []) upstream.send(m)
        if (ctx) ctx.pending = []
      }
      upstream.onmessage = (e) => {
        try {
          peer.send(e.data instanceof ArrayBuffer ? new Uint8Array(e.data) : e.data)
        } catch {}
      }
      upstream.onclose = () => {
        try {
          peer.close()
        } catch {}
      }
      upstream.onerror = () => {
        try {
          peer.close()
        } catch {}
      }
    },

    message(peer, msg) {
      const ctx = upstreams.get(peer)
      if (!ctx) return
      const data = msg.rawData as string | ArrayBuffer
      ctx.ws.readyState === WebSocket.OPEN ? ctx.ws.send(data) : ctx.pending.push(data)
    },

    close(peer) {
      upstreams.get(peer)?.ws.close()
      upstreams.delete(peer)
    },
    error(peer) {
      upstreams.get(peer)?.ws.close()
      upstreams.delete(peer)
    },
  },
})
