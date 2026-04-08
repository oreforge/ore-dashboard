export type AggregateState = 'running' | 'partial' | 'stopped' | 'unknown'

export function containerStateClass(state: string): string {
  switch (state) {
    case 'running':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'exited':
    case 'dead':
      return 'bg-red-500/10 text-red-400 border-red-500/20'
    case 'created':
    case 'paused':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    case 'not found':
      return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function healthStateClass(health: string): string {
  switch (health) {
    case 'healthy':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'unhealthy':
      return 'bg-red-500/10 text-red-400 border-red-500/20'
    case 'starting':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function getAggregateState(
  status: { servers: { container: { state: string } }[] } | null,
): AggregateState {
  if (!status || status.servers.length === 0) return 'unknown'
  const states = status.servers.map((s) => s.container.state)
  if (states.every((s) => s === 'running')) return 'running'
  if (states.some((s) => s === 'running')) return 'partial'
  return 'stopped'
}

export function aggregateStateClass(state: AggregateState): string {
  switch (state) {
    case 'running':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'partial':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    case 'stopped':
      return 'bg-red-500/10 text-red-400 border-red-500/20'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

const DOT_COLORS: Record<AggregateState, string> = {
  running: 'bg-emerald-500',
  partial: 'bg-yellow-500',
  stopped: 'bg-red-500',
  unknown: 'bg-muted-foreground/50',
}

export function aggregateStatusDot(
  status: { servers: { container: { state: string } }[] } | null,
): string {
  return DOT_COLORS[getAggregateState(status)]
}
