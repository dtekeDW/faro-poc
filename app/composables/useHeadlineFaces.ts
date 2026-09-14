/**
 * Sans headline candidates for the specimen wall.
 *
 * Ordered by width and weight of voice: expressive display cuts first, then
 * neutral workhorses, so scrolling moves through a gradient of loudness rather
 * than jumping between unrelated voices.
 */
export interface HeadlineFace {
  id: string
  name: string
  css: string
  source: 'Fontshare' | 'Google'
  weight: number
  /** What this face makes the sentence feel like. */
  feel: string
}

export const HEADLINE_FACES: HeadlineFace[] = [
  { id: 'clash', name: 'Clash Display', css: 'fs-clash', source: 'Fontshare', weight: 600, feel: 'Purpose-built display cut. Tight, squared, unmistakably contemporary.' },
  { id: 'cabinet', name: 'Cabinet Grotesk', css: 'fs-cabinet', source: 'Fontshare', weight: 700, feel: 'Wide confident caps with slightly quirky joints. Studio signage.' },
  { id: 'unbounded', name: 'Unbounded', css: 'fs-unbounded', source: 'Google', weight: 600, feel: 'Geometric and airy with unusual proportions. Loud without decoration.' },
  { id: 'league', name: 'League Spartan', css: 'fs-league', source: 'Google', weight: 700, feel: 'Heavy geometric. Poster weight, very even colour.' },
  { id: 'supreme', name: 'Supreme', css: 'fs-supreme', source: 'Fontshare', weight: 700, feel: 'Neo-grotesque with softened corners. Modern and approachable.' },
  { id: 'general', name: 'General Sans', css: 'fs-general', source: 'Fontshare', weight: 600, feel: 'The clean middle. Neutral, generous, effortless to read.' },
  { id: 'switzer', name: 'Switzer', css: 'fs-switzer', source: 'Fontshare', weight: 700, feel: 'Swiss precision, zero personality tax. Pure legibility.' },
  { id: 'chillax', name: 'Chillax', css: 'fs-chillax', source: 'Fontshare', weight: 600, feel: 'Rounded terminals, relaxed and warm. Friendly without being cute.' },
  { id: 'onest', name: 'Onest', css: 'fs-onest', source: 'Google', weight: 700, feel: 'Humanist, open, slightly warm. Reads instantly at any size.' },
  { id: 'golos', name: 'Golos Text', css: 'fs-golos', source: 'Google', weight: 700, feel: 'Broad and grounded. Solid mass in large headlines.' },
  { id: 'hanken', name: 'Hanken Grotesk', css: 'fs-hanken', source: 'Google', weight: 700, feel: 'Compact grotesque, tidy and unfussy.' },
  { id: 'commissioner', name: 'Commissioner', css: 'fs-commissioner', source: 'Google', weight: 700, feel: 'Low-contrast humanist. Calm authority.' },
  { id: 'redhat', name: 'Red Hat Display', css: 'fs-redhat', source: 'Google', weight: 700, feel: 'Engineered clarity with subtly angled cuts.' },
  { id: 'figtree', name: 'Figtree', css: 'fs-figtree', source: 'Google', weight: 800, feel: 'Geometric with a soft edge. Current and unthreatening.' },
  { id: 'archivo', name: 'Archivo', css: 'fs-archivo', source: 'Google', weight: 700, feel: 'Grotesque built for high performance. Sturdy, newsroom energy.' },
  { id: 'darker', name: 'Darker Grotesque', css: 'fs-darker', source: 'Google', weight: 700, feel: 'Tall and narrow. Fits long headlines in very little width.' },
]
