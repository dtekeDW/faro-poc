/**
 * Headline candidates for the specimen wall.
 *
 * Ordered from highest contrast to lowest so scanning the page moves through a
 * gradient of feeling rather than jumping between unrelated voices.
 */
export interface HeadlineFace {
  id: string
  name: string
  css: string
  kind: 'Serif' | 'Sans'
  weight: number
  /** What this face makes the sentence feel like. */
  feel: string
}

export const HEADLINE_FACES: HeadlineFace[] = [
  { id: 'bodoni', name: 'Bodoni Moda', css: 'fs-bodoni', kind: 'Serif', weight: 700, feel: 'Fashion house. Dramatic thick-thin, high drama.' },
  { id: 'cormorant', name: 'Cormorant Garamond', css: 'fs-cormorant', kind: 'Serif', weight: 600, feel: 'Delicate and literary. Needs size to breathe.' },
  { id: 'instrument-serif', name: 'Instrument Serif', css: 'fs-instrument-serif', kind: 'Serif', weight: 400, feel: 'Editorial poster. Tight, contemporary, confident.' },
  { id: 'dm-serif', name: 'DM Serif Display', css: 'fs-dm-serif', kind: 'Serif', weight: 400, feel: 'Polished and warm. Classic proportions, modern finish.' },
  { id: 'frank-ruhl', name: 'Frank Ruhl Libre', css: 'fs-frank', kind: 'Serif', weight: 700, feel: 'Sharp serifs, newspaper authority.' },
  { id: 'eb-garamond', name: 'EB Garamond', css: 'fs-garamond', kind: 'Serif', weight: 600, feel: 'Old-world calm. The quietest elegance here.' },
  { id: 'young-serif', name: 'Young Serif', css: 'fs-young', kind: 'Serif', weight: 400, feel: 'Chunky slab-ish serif. Modern and grounded.' },
  { id: 'newsreader', name: 'Newsreader', css: 'fs-newsreader', kind: 'Serif', weight: 600, feel: 'Screen-native editorial. Elegant but sturdy.' },
  { id: 'spectral', name: 'Spectral', css: 'fs-spectral', kind: 'Serif', weight: 600, feel: 'Slightly condensed, measured, intellectual.' },
  { id: 'literata', name: 'Literata', css: 'fs-literata', kind: 'Serif', weight: 600, feel: 'Warm and solid. Reads like a good book.' },
  { id: 'petrona', name: 'Petrona', css: 'fs-petrona', kind: 'Serif', weight: 600, feel: 'Contemporary serif with soft, open forms.' },
  { id: 'source-serif', name: 'Source Serif 4', css: 'fs-source', kind: 'Serif', weight: 600, feel: 'Neutral serif. Clean, never loud.' },
  { id: 'syne', name: 'Syne', css: 'fs-syne', kind: 'Sans', weight: 700, feel: 'Art-institution display. Odd widths, deliberate.' },
  { id: 'jost', name: 'Jost', css: 'fs-jost', kind: 'Sans', weight: 600, feel: 'Geometric Futura lineage. Cool and precise.' },
  { id: 'outfit', name: 'Outfit', css: 'fs-outfit', kind: 'Sans', weight: 600, feel: 'Even circles, friendly and current.' },
  { id: 'sora', name: 'Sora', css: 'fs-sora', kind: 'Sans', weight: 600, feel: 'Technical geometric, slightly squared.' },
  { id: 'gabarito', name: 'Gabarito', css: 'fs-gabarito', kind: 'Sans', weight: 700, feel: 'Rounded and confident. Warm without being soft.' },
  { id: 'familjen', name: 'Familjen Grotesk', css: 'fs-familjen', kind: 'Sans', weight: 700, feel: 'Scandinavian grotesque, narrow and direct.' },
]
