/**
 * Files every signal under a page identity the dashboard can group by.
 *
 * Faro's `page.id` is what the Page Performance table shows in its first
 * column. Left unset it falls back to the path, which is why two runs of the
 * same route were indistinguishable.
 *
 * Only deliberate labelling parameters become part of the id. Folding every
 * query parameter into it would be wrong outside a demo: page id is a grouping
 * key, and one unbounded parameter — a search term, a session token — turns a
 * readable table into thousands of one-visit rows. Everything else is still
 * filterable, just as attributes rather than as identity.
 */
const LABEL_PARAMS = ['test', 'run', 'v', 'delay'] as const

export function useFaroPage(scenarioId: () => string) {
  const route = useRoute()
  const { $faro } = useNuxtApp()

  onMounted(() => {
    watchEffect(() => {
      const scenario = findScenario(scenarioId())

      const labels = LABEL_PARAMS
        .map(key => [key, route.query[key]] as const)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}=${String(value)}`)

      const id = labels.length
        ? `${route.path}?${labels.join('&')}`
        : route.path

      const attributes: Record<string, string> = {
        scenario: scenario.id,
        metric: scenario.metric,
      }

      for (const [key, value] of Object.entries(route.query)) {
        if (value !== undefined && value !== null)
          attributes[`param_${key}`] = String(value)
      }

      $faro?.api?.setPage({ id, url: window.location.href, attributes })
      $faro?.api?.setView({ name: scenario.id })
      $faro?.api?.setSession({
        ...$faro?.api?.getSession?.(),
        attributes: {
          ...$faro?.api?.getSession?.()?.attributes,
          ...attributes,
        },
      })
    })
  })
}
