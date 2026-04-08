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
  if (!bytes) return '—'
  const mb = bytes / (1024 * 1024)
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

export function formatPorts(
  ports?: { host_port: number; container_port: number; protocol: string }[],
): string {
  if (!ports || ports.length === 0) return '—'
  return ports.map((p) => `${p.host_port}:${p.container_port}/${p.protocol}`).join(', ')
}
