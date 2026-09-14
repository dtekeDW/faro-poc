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
    name: 'Signal',
    claim: 'Precise, technical, quiet',
    display: '"Funnel Display"',
    text: '"Instrument Sans"',
    mono: '"Geist Mono"',
    accent: '"Instrument Sans"',
    notes: 'Funnel Display is from 2024 and barely used anywhere. Narrow caps build pressure in large headlines without shouting. Mono carries timecodes, which for a studio is measurement rather than costume.',
  },
  {
    id: '2',
    name: 'Reel',
    claim: 'Editorial, characterful',
    display: '"Bricolage Grotesque"',
    text: '"Schibsted Grotesk"',
    mono: '"Geist Mono"',
    accent: '"Bricolage Grotesque"',
    notes: 'Bricolage is variable across optical size and width, so large headlines tighten and gain quirk on their own. Schibsted comes out of newspaper setting and stays legible at small sizes.',
  },
  {
    id: '3',
    name: 'Frame',
    claim: 'Warm, contemporary, disciplined',
    display: '"Schibsted Grotesk"',
    text: '"Instrument Sans"',
    mono: '"Geist Mono"',
    accent: '"Bricolage Grotesque"',
    notes: 'One family carries display and text, separated only by weight and size. Reads more unified than any pairing; Bricolage italic sets occasional accents.',
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
