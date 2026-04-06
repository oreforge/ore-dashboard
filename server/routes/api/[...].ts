const upstreams = new Map<
  unknown,
  { ws: WebSocket; pending: { data: string | ArrayBuffer; binary: boolean }[] }
>()

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
        for (const m of ctx?.pending ?? []) upstream.send(m.data)
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

      const rawWs = (peer as unknown as { _internal: { ws: { on: (...args: never) => unknown } } })
        ._internal?.ws
      if (rawWs) {
        rawWs.on('message', (data: Buffer, isBinary: boolean) => {
          const ctx = upstreams.get(peer)
          if (!ctx) return
          const payload = isBinary
            ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
            : data.toString('utf-8')
          if (ctx.ws.readyState === WebSocket.OPEN) {
            ctx.ws.send(payload)
          } else {
            ctx.pending.push({ data: payload, binary: isBinary })
          }
        })
      }
    },

    message() {},

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
