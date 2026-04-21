export function formatUptime(secs: number): string {
  const mins = Math.floor(secs / 60)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${mins % 60}m`
  if (mins > 0) return `${mins}m ${secs % 60}s`
  return `${secs}s`
}

export function formatBytes(bytes: number): string {
  if (bytes < 0 || !Number.isFinite(bytes)) return '—'
  if (bytes === 0) return '0 B'
  const kb = bytes / 1024
  if (kb < 1) return `${bytes} B`
  const mb = kb / 1024
  if (mb < 1) return `${kb.toFixed(0)} KB`
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb.toFixed(0)} MB`
}

export function formatMemory(mem: {
  used_bytes: number
  limit_bytes: number
  percent: number
}): string {
  if (!mem.limit_bytes && !mem.used_bytes) return '—'
  const used = formatBytes(mem.used_bytes)
  if (!mem.limit_bytes) return used
  const limit = formatBytes(mem.limit_bytes)
  return `${used} / ${limit}`
}

export function formatCpu(cpu: { limit: number; percent: number }): string {
  if (!cpu.limit && !cpu.percent) return '—'
  if (cpu.percent > 0) return `${cpu.percent}%`
  return `${cpu.limit} cores`
}

export function formatDurationMs(ms: number): string {
  if (!ms || ms < 0) return '—'
  if (ms < 1000) return `${ms} ms`
  const secs = ms / 1000
  if (secs < 60) return `${secs.toFixed(1)}s`
  const mins = Math.floor(secs / 60)
  const remSecs = Math.round(secs - mins * 60)
  if (mins < 60) return `${mins}m ${remSecs}s`
  const hours = Math.floor(mins / 60)
  return `${hours}h ${mins % 60}m`
}

export function formatRelativeTime(ts?: string): string {
  if (!ts) return '—'
  const then = new Date(ts).getTime()
  if (Number.isNaN(then)) return ts
  const diff = Date.now() - then
  if (diff < 0) return 'just now'
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export function formatAbsoluteTime(ts?: string): string {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ts
  }
}

export function formatPorts(
  ports?: { host_port: number; container_port: number; protocol: string }[],
): string {
  if (!ports || ports.length === 0) return '—'
  return ports.map((p) => `${p.host_port}:${p.container_port}/${p.protocol}`).join(', ')
}
