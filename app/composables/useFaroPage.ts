/**
 * Files every signal under a page identity the dashboard can group by.
 *
 * Faro's `page.id` is what the Page Performance table shows in its first
 * column. Left unset it falls back to the path, so two labelled runs of the
 * same route land in one indistinguishable row.
 *
 * Every query parameter joins the id here, because comparing labelled runs of
 * the same route is the entire point of this app. That is a demo decision, not
 * a default worth copying: page id is a grouping key, and in a real product a
 * single unbounded parameter — a search term, a tracking token, a session id —
 * turns a readable table into thousands of one-visit rows. A production
 * integration should allow-list the parameters that may become identity and
 * leave the rest as attributes.
 */

/** Stable, readable identity: `/inp?heavy&v=1` rather than raw URL order. */
function buildPageId(path: string, query: Record<string, unknown>) {
  const parts = Object.keys(query)
    .sort()
    .map((key) => {
      const value = query[key]

      // `?flag` with no value arrives as null; it is still a label.
      if (value === null || value === '')
        return key

      if (Array.isArray(value))
        return `${key}=${value.filter(entry => entry !== null).join(',')}`

      return `${key}=${String(value)}`
    })

  return parts.length ? `${path}?${parts.join('&')}` : path
}

export function useFaroPage(scenarioId: () => string) {
  const route = useRoute()
  const { $faro } = useNuxtApp()

  onMounted(() => {
    watchEffect(() => {
      const scenario = findScenario(scenarioId())

      const attributes: Record<string, string> = {
        scenario: scenario.id,
        metric: scenario.metric,
      }

      for (const [key, value] of Object.entries(route.query)) {
        attributes[`param_${key}`] = value === null || value === undefined
          ? 'true'
          : String(value)
      }

      $faro?.api?.setPage({
        id: buildPageId(route.path, route.query),
        url: window.location.href,
        attributes,
      })

      $faro?.api?.setView({ name: scenario.id })

      /*
       * Only the scenario goes on the session. Query parameters must not:
       * sessions outlive navigations, so a `param_v=heavy` set on one page
       * follows the visitor to the next and mislabels everything after it.
       * Parameters belong to the page, which is replaced on every route change.
       */
      $faro?.api?.setSession({
        ...$faro?.api?.getSession?.(),
        attributes: {
          ...$faro?.api?.getSession?.()?.attributes,
          scenario: scenario.id,
          metric: scenario.metric,
        },
      })
    })
  })
}
