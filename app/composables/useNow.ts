const now = ref(Date.now())

if (import.meta.client) {
  setInterval(() => {
    now.value = Date.now()
  }, 1000)
}

export function useNow() {
  return now
}
