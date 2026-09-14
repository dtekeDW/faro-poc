/**
 * Secondary-text candidates, judged against the fixed Unbounded display face.
 *
 * Each entry also renders a figure sample: a text face with solid tabular
 * numerals can absorb the data role too, which would take the system from
 * three faces down to two.
 */
export interface TextFace {
  id: string
  name: string
  css: string
  source: 'Fontshare' | 'Google'
  feel: string
}

export const TEXT_FACES: TextFace[] = [
  { id: 'switzer', name: 'Switzer', css: 'ts-switzer', source: 'Fontshare', feel: 'Swiss neutral. Disappears completely behind the words.' },
  { id: 'general', name: 'General Sans', css: 'ts-general', source: 'Fontshare', feel: 'Open and generous. Effortless at small sizes.' },
  { id: 'supreme', name: 'Supreme', css: 'ts-supreme', source: 'Fontshare', feel: 'Softened grotesque. Slightly warmer than neutral.' },
  { id: 'synonym', name: 'Synonym', css: 'ts-synonym', source: 'Fontshare', feel: 'Compact and even. Fits more words per line.' },
  { id: 'author', name: 'Author', css: 'ts-author', source: 'Fontshare', feel: 'Humanist with calligraphic roots. Reads like prose.' },
  { id: 'ranade', name: 'Ranade', css: 'ts-ranade', source: 'Fontshare', feel: 'Narrow with tall ascenders. Editorial texture.' },
  { id: 'public', name: 'Public Sans', css: 'ts-public', source: 'Google', feel: 'Built for government forms. Plain in the best sense.' },
  { id: 'plex', name: 'IBM Plex Sans', css: 'ts-plex', source: 'Google', feel: 'Engineered, slightly mechanical. Strong figures.' },
  { id: 'commissioner', name: 'Commissioner', css: 'ts-commissioner', source: 'Google', feel: 'Low contrast humanist. Calm over long paragraphs.' },
  { id: 'golos', name: 'Golos Text', css: 'ts-golos', source: 'Google', feel: 'Broad and grounded. Confident at small sizes.' },
  { id: 'vietnam', name: 'Be Vietnam Pro', css: 'ts-vietnam', source: 'Google', feel: 'Tidy geometric. Crisp edges, even rhythm.' },
  { id: 'karla', name: 'Karla', css: 'ts-karla', source: 'Google', feel: 'Grotesque with odd details. Quietly characterful.' },
  { id: 'hanken', name: 'Hanken Grotesk', css: 'ts-hanken', source: 'Google', feel: 'Compact and unfussy. No wasted width.' },
  { id: 'figtree', name: 'Figtree', css: 'ts-figtree', source: 'Google', feel: 'Soft geometric. Friendly, current.' },
  { id: 'onest', name: 'Onest', css: 'ts-onest', source: 'Google', feel: 'Open apertures, high x-height. Very fast to read.' },
  { id: 'chivo', name: 'Chivo', css: 'ts-chivo', source: 'Google', feel: 'Sturdy grotesque. Holds up at tiny sizes.' },
  { id: 'spline', name: 'Spline Sans', css: 'ts-spline', source: 'Google', feel: 'Slightly condensed, technical undertone.' },
  { id: 'madefor', name: 'Wix Madefor Text', css: 'ts-madefor', source: 'Google', feel: 'Drawn as a text cut. Optimised for exactly this size.' },
]
