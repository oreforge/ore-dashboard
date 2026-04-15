import { useIntervalFn } from '@vueuse/core'
import { NOW_INTERVAL } from '~/config/polling'

const now = ref(Date.now())

interface NowSource {
  subscribers: number
  start: () => void
  stop: () => void
}

let source: NowSource | null = null

function getSource(): NowSource {
  if (source) return source
  const scope = effectScope(true)
  const created = scope.run(() => {
    const interval = useIntervalFn(
      () => {
        now.value = Date.now()
      },
      NOW_INTERVAL,
      { immediate: false, immediateCallback: false },
    )
    return {
      subscribers: 0,
      start: interval.resume,
      stop: () => {
        interval.pause()
        scope.stop()
        source = null
      },
    } satisfies NowSource
  })
  if (!created) throw new Error('useNow: scope init failed')
  source = created
  return created
}

export function useNow() {
  const s = getSource()
  onMounted(() => {
    s.subscribers++
    if (s.subscribers === 1) {
      now.value = Date.now()
      s.start()
    }
  })
  onUnmounted(() => {
    s.subscribers--
    if (s.subscribers === 0) s.stop()
  })
  return { now }
}
