/**
 * Degradation variants the showcase can be driven into.
 *
 * Each module ships an optimized and a deliberately regressed implementation.
 * The dashboard filters on these values, which is what turns the demo from
 * "here is a slow page" into "here is the same module, before and after".
 */
export type DegradationModule = 'hero' | 'gallery' | 'logos' | 'faq' | 'filter'

export interface Degradations {
  // Oversized, non-lazy hero media — drives LCP.
  hero: boolean
  // Oversized tiles plus a quadratic filter pass — drives LCP and INP.
  gallery: boolean
  // Logo wall without width/height attributes — drives CLS.
  logos: boolean
  // Accordion with a blocking handler — drives INP.
  faq: boolean
  // Category filter doing synchronous work per click — drives INP.
  filter: boolean
}

const MODULES: DegradationModule[] = ['hero', 'gallery', 'logos', 'faq', 'filter']

/**
 * Reads the active degradations from the query string.
 *
 * `?degrade=all` turns every module into its regressed variant; a comma
 * separated list such as `?degrade=faq,hero` targets individual ones.
 */
export function useDegradations() {
  const route = useRoute()

  return computed<Degradations>(() => {
    const raw = String(route.query.degrade ?? '')
    const isAll = raw === 'all'
    const active = new Set(raw.split(',').map(part => part.trim()))

    return Object.fromEntries(
      MODULES.map(module => [module, isAll || active.has(module)]),
    ) as unknown as Degradations
  })
}

/**
 * Human readable label for the current variant, attached to every Faro beacon
 * so a dashboard panel can group by it.
 */
export function useVariantLabel() {
  const degradations = useDegradations()

  return computed(() => {
    const active = Object.entries(degradations.value)
      .filter(([, isActive]) => isActive)
      .map(([module]) => module)

    return active.length ? `degraded:${active.join('+')}` : 'optimized'
  })
}
