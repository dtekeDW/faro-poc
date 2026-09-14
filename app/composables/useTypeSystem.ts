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
    name: 'Geist',
    claim: 'One system, no seams',
    display: '"Geist"',
    text: '"Instrument Sans"',
    mono: '"Geist Mono"',
    accent: '"Geist"',
    notes: 'The sans companion to the mono already in use, so headline and timecode come from one drawing hand. Neutral, tightly spaced, zero ornament — the closest thing here to a precision instrument.',
  },
  {
    id: '2',
    name: 'Host',
    claim: 'Contemporary grotesque, tight',
    display: '"Host Grotesk"',
    text: '"Instrument Sans"',
    mono: '"Geist Mono"',
    accent: '"Host Grotesk"',
    notes: 'Released 2024 and still almost unseen. Slightly narrower than a classic grotesque with a high x-height, so large headlines stay dense and even without any characterful quirk.',
  },
  {
    id: '3',
    name: 'Madefor',
    claim: 'Built for headlines',
    display: '"Wix Madefor Display"',
    text: '"Instrument Sans"',
    mono: '"Geist Mono"',
    accent: '"Wix Madefor Display"',
    notes: 'Drawn specifically as a display cut rather than a text face scaled up: tighter joints and shorter terminals that hold together at very large sizes. Barely used outside its origin.',
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
