/**
 * Narrows a specimen wall by eliminating candidates.
 *
 * Choosing between sixteen faces at once is the hard version of the task;
 * removing the clear misses first makes the remaining comparison tractable.
 * The list survives reloads so the work is not lost between sessions.
 */
export function useShortlist(storageKey: string) {
  const eliminated = useState<string[]>(`shortlist-${storageKey}`, () => [])
  const isReady = ref(false)

  onMounted(() => {
    try {
      const stored = localStorage.getItem(`shortlist:${storageKey}`)
      if (stored)
        eliminated.value = JSON.parse(stored) as string[]
    }
    catch {
      // Private windows and blocked site data both throw here. An empty
      // shortlist is the correct fallback, not an error.
    }
    isReady.value = true
  })

  function persist() {
    try {
      localStorage.setItem(`shortlist:${storageKey}`, JSON.stringify(eliminated.value))
    }
    catch {
      // Nothing to recover: the page works without the stored copy.
    }
  }

  function eliminate(id: string) {
    if (!eliminated.value.includes(id))
      eliminated.value = [...eliminated.value, id]

    persist()
  }

  function restore(id: string) {
    eliminated.value = eliminated.value.filter(entry => entry !== id)
    persist()
  }

  function restoreAll() {
    eliminated.value = []
    persist()
  }

  return { eliminated, isReady, eliminate, restore, restoreAll }
}
