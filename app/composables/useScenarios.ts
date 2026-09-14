import type { Degradations } from './useDegradation'

/**
 * One route, one broken metric.
 *
 * Query parameters were the wrong container for this: Faro groups signals by
 * page, so a single route toggled by `?degrade=` collapses every scenario into
 * one row. As separate routes the dashboard becomes a table with exactly one
 * red cell per line, which is what makes it readable without explanation.
 */
export interface Scenario {
  // Route path and the id used as the Faro view name.
  id: string

  // Shown in the lab and as the dashboard row label.
  label: string

  /**
   * One word for the menu. At that size a sentence wraps and the list stops
   * scanning; the metric beside it already says which measurement is at stake,
   * so the label only has to name the symptom.
   */
  menuLabel: string

  /** The metric this scenario is built to ruin. */
  metric: 'LCP' | 'CLS' | 'INP' | 'TTFB' | 'Errors' | 'none'

  /** One plain sentence — this is what a non-technical reader goes by. */
  cause: string

  /** What the viewer should expect to see in the dashboard. */
  effect: string

  /** Which modules run degraded on this route. */
  degradations: Partial<Degradations>

  /** Whether the lab needs to click something to produce the metric. */
  needsInteraction: boolean
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'healthy',
    menuLabel: 'Reference',
    label: 'Reference',
    metric: 'none',
    cause: 'Nothing is wrong. Images are sized and prioritised, handlers are cheap, the server answers immediately.',
    effect: 'Every metric green. This is the control the other rows are read against.',
    degradations: {},
    needsInteraction: true,
  },
  {
    id: 'lcp',
    menuLabel: 'Paint',
    label: 'Slow hero image',
    metric: 'LCP',
    cause: 'The hero ships a 2400px original, loads it lazily and gives the browser no priority hint.',
    effect: 'Largest Contentful Paint climbs well past the 2.5s threshold. Everything else stays green.',
    degradations: { hero: true },
    needsInteraction: false,
  },
  {
    id: 'cls',
    menuLabel: 'Shift',
    label: 'Images without dimensions',
    metric: 'CLS',
    cause: 'Content without width and height arrives after the page has settled, so everything below it jumps.',
    effect: 'Cumulative Layout Shift climbs past 0.1 and never falls back, while load speed stays untouched.',
    degradations: { logos: true },
    needsInteraction: false,
  },
  {
    id: 'inp',
    menuLabel: 'Response',
    label: 'Blocking interaction',
    metric: 'INP',
    cause: 'The format filter does 320ms of work on the main thread before the click can paint.',
    effect: 'Interaction to Next Paint lands in the red. Only visible once someone actually clicks.',
    degradations: { filter: true, faq: true },
    needsInteraction: true,
  },
  {
    id: 'ttfb',
    menuLabel: 'Waiting',
    label: 'Slow server response',
    metric: 'TTFB',
    cause: 'The server holds the response for 900ms before sending the first byte.',
    effect: 'Time to First Byte and every paint after it shift later. Nothing in the page markup is at fault.',
    degradations: {},
    needsInteraction: false,
  },
  {
    id: 'errors',
    menuLabel: 'Breakage',
    label: 'Broken scripts',
    metric: 'Errors',
    cause: 'A handler throws on load and a background request fails against a host that does not answer.',
    effect: 'Exceptions and failed requests appear in the error panel, with stack traces and the session that produced them.',
    degradations: {},
    needsInteraction: false,
  },
]

export function findScenario(id: string) {
  return SCENARIOS.find(scenario => scenario.id === id) ?? SCENARIOS[0]!
}
