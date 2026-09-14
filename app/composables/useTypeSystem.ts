/**
 * The three candidate type packages, switchable at runtime so each one can be
 * judged on the real page rather than on a specimen sheet.
 */
export interface TypePackage {
  id: string
  name: string
  claim: string
  display: string
  text: string
  mono: string
  /** Optional italic accent face, used for asides and metadata. */
  accent: string
  notes: string
}

export const TYPE_PACKAGES: TypePackage[] = [
  {
    id: '1',
    name: 'Epilogue',
    claim: 'Refined sans, quietly distinctive',
    display: '"Epilogue"',
    text: '"Instrument Sans"',
    mono: '"Geist Mono"',
    accent: '"Epilogue"',
    notes: 'Slightly narrow with subtly flared stems and open apertures. It reads faster than a grotesque at large sizes and has enough drawing personality to avoid looking generic, without a single decorative move.',
  },
  {
    id: '2',
    name: 'Albert',
    claim: 'Geometric, generous, calm',
    display: '"Albert Sans"',
    text: '"Instrument Sans"',
    mono: '"Geist Mono"',
    accent: '"Albert Sans"',
    notes: 'Built on 1920s Berlin geometric models: near-circular bowls, even stroke, wide counters. The elegance comes from proportion rather than contrast, which keeps it legible the instant it appears.',
  },
  {
    id: '3',
    name: 'Newsreader',
    claim: 'Editorial serif, built for screens',
    display: '"Newsreader"',
    text: '"Instrument Sans"',
    mono: '"Geist Mono"',
    accent: '"Newsreader"',
    notes: 'The only serif in the set. Moderate contrast and sturdy serifs drawn for screen reading rather than print, so it carries real elegance without the fragility of a display serif. A studio that tells stories rather than sells software.',
  },
  {
    id: '4',
    name: 'Urbanist',
    claim: 'Low-contrast geometric, modern',
    display: '"Urbanist"',
    text: '"Instrument Sans"',
    mono: '"Geist Mono"',
    accent: '"Urbanist"',
    notes: 'Tighter and cooler than Albert, closer to a classic geometric without Futura coldness. Very even colour in long headlines, which suits the long line the hero uses.',
  },
  {
    id: '5',
    name: 'Literata',
    claim: 'Warm serif, maximum readability',
    display: '"Literata"',
    text: '"Instrument Sans"',
    mono: '"Geist Mono"',
    accent: '"Literata"',
    notes: 'Commissioned for extended reading, so it stays comfortable at any size. Warmer and slightly heavier than Newsreader — the same elegant direction with more weight behind it.',
  },
]

const STACK = {
  sans: 'ui-sans-serif, system-ui, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, monospace',
}

/**
 * Applies a package by rewriting the font custom properties on the document
 * element, which every component already reads through its Tailwind utility.
 */
export function useTypeSystem() {
  const route = useRoute()

  const active = computed(() =>
    TYPE_PACKAGES.find(pkg => pkg.id === String(route.query.type)) ?? TYPE_PACKAGES[0]!,
  )

  function apply(pkg: TypePackage) {
    if (import.meta.server)
      return

    const root = document.documentElement
    root.style.setProperty('--font-display', `${pkg.display}, ${STACK.sans}`)
    root.style.setProperty('--font-text', `${pkg.text}, ${STACK.sans}`)
    root.style.setProperty('--font-mono', `${pkg.mono}, ${STACK.mono}`)
    root.style.setProperty('--font-accent', `${pkg.accent}, ${STACK.sans}`)
  }

  onMounted(() => watchEffect(() => apply(active.value)))

  return { active, packages: TYPE_PACKAGES }
}
