/**
 * Curated photography.
 *
 * Every image on the site comes from one hand-picked set rather than from
 * random seeds. The direction is atmospheric and wide — landscape, coast,
 * forest, empty architecture — with muted light and no product, office or
 * flat-lay subjects. A film studio's stills would share a look; randomly
 * seeded photos never do, however good each one is on its own.
 *
 * Ids reference picsum's fixed catalogue (`/id/<n>/<w>/<h>`), not the random
 * `/seed/<word>` endpoint, so the same picture comes back every time.
 */

/** Wide, quiet, a figure in the landscape. Carries the hero. */
export const HERO_IMAGE = 27

/** Four frames with distinct subjects but one grade: alley, forest, pier, field. */
export const WORK_IMAGES = [57, 67, 77, 62] as const

/** One reel per gallery filter, five frames each. */
export const REEL_IMAGES: Record<string, readonly number[]> = {
  kyoto: [44, 47, 57, 67, 77],
  reykjavik: [10, 13, 29, 49, 87],
  lisbon: [17, 28, 33, 62, 66],
  oaxaca: [51, 52, 54, 61, 74],
  busan: [16, 46, 58, 68, 69],
}

/** One frame per capability, shown large beside the format it belongs to. */
export const CAPABILITY_IMAGES: Record<string, number> = {
  'Social Media': 64,
  'Brand Film': 57,
  'Product': 78,
  'UGC': 65,
  'Documentary': 27,
  'Corporate': 42,
  'Commercial': 74,
  'Event': 61,
}

/** The pull quote sits over this one. */
export const QUOTE_IMAGE = 44

/** Texture crops. Shown small, desaturated and dim, so subject matters least. */
export const CLIENT_IMAGES = [19, 41, 72, 78, 83, 11, 37, 71] as const

/** Builds a catalogue URL at an explicit size. */
export function photo(id: number, width: number, height: number) {
  return `https://picsum.photos/id/${id}/${width}/${height}`
}
