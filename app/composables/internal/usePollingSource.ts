import { useDocumentVisibility, useIntervalFn } from '@vueuse/core'

export interface PollingSourceOptions {
  fetcher: () => Promise<void> | void
  interval: number
  immediate?: boolean
}

interface SourceState {
  subscribers: number
  resume: () => void
  pause: () => void
  dispose: () => void
  refresh: () => Promise<void> | void
}

const sources = new Map<string, SourceState>()

function createSource(key: string, options: PollingSourceOptions): SourceState {
  const scope = effectScope(true)
  const state = scope.run(() => {
    const visibility = useDocumentVisibility()
    const interval = useIntervalFn(options.fetcher, options.interval, {
      immediate: false,
      immediateCallback: options.immediate ?? true,
    })
    watch(visibility, (v) => {
      const s = sources.get(key)
      if (!s || s.subscribers === 0) return
      if (v === 'hidden') interval.pause()
      else interval.resume()
    })
    return {
      subscribers: 0,
      pause: interval.pause,
      resume: interval.resume,
      dispose: () => {
        interval.pause()
        scope.stop()
        sources.delete(key)
      },
      refresh: options.fetcher,
    } satisfies SourceState
  })
  if (!state) throw new Error('usePollingSource: failed to initialize scope')
  return state
}

function acquire(key: string, options: PollingSourceOptions): SourceState {
  let state = sources.get(key)
  if (!state) {
    state = createSource(key, options)
    sources.set(key, state)
  }
  state.subscribers++
  if (state.subscribers === 1) state.resume()
  return state
}

function release(state: SourceState) {
  state.subscribers--
  if (state.subscribers === 0) state.dispose()
}

export function usePollingSource(
  key: MaybeRef<string> | (() => string),
  options: PollingSourceOptions,
) {
  const keyRef = computed(() => (typeof key === 'function' ? key() : toValue(key)))
  let current: SourceState | null = null

  onMounted(() => {
    current = acquire(keyRef.value, options)
  })

  watch(keyRef, (next, prev) => {
    if (next === prev || !current) return
    release(current)
    current = acquire(next, options)
  })

  onUnmounted(() => {
    if (current) release(current)
    current = null
  })

  return {
    refresh: () => options.fetcher(),
  }
}
