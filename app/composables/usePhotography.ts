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

/** One reel per gallery filter. */
export const REEL_IMAGES: Record<string, readonly PhotoSource[]> = {
  // The opening reel is hand-picked photography rather than catalogue frames:
  // it is the one every visitor sees before touching a filter.
  kyoto: [
    'https://images.pexels.com/photos/19763424/pexels-photo-19763424.jpeg',
    'https://images.pexels.com/photos/33142341/pexels-photo-33142341.jpeg',
    'https://images.pexels.com/photos/37785861/pexels-photo-37785861.jpeg',
    'https://images.pexels.com/photos/39277645/pexels-photo-39277645.jpeg',
    'https://images.pexels.com/photos/31429483/pexels-photo-31429483.jpeg',
    'https://images.pexels.com/photos/31001136/pexels-photo-31001136.jpeg',
  ],
  reykjavik: [10, 13, 29, 49, 87],
  lisbon: [17, 28, 33, 62, 66],
  oaxaca: [51, 52, 54, 61, 74],
  busan: [16, 46, 58, 68, 69],
}

/**
 * A picture is either an id from the picsum catalogue or an absolute Unsplash
 * URL. Both are asked for at an explicit size, which is what keeps the hero
 * story honest: a picture that arrives at the size it is displayed at.
 */
export type PhotoSource = number | string

/** One frame per capability, shown large beside the format it belongs to. */
export const CAPABILITY_IMAGES: Record<string, PhotoSource> = {
  'Social Media': 'https://images.unsplash.com/photo-1497015289639-54688650d173',
  'Brand Film': 57,
  'Product': 78,
  'UGC': 65,
  'Documentary': 27,
  'Corporate': 42,
  'Commercial': 74,
  'Event': 61,
}

/**
 * Builds an image URL at an explicit size.
 *
 * Every source crops and re-encodes on its own CDN, so the browser is handed
 * the pixels it will actually paint — a 2600px original squeezed into a 960px
 * frame is the single most common reason a gallery ruins a page. The query
 * differs per host; the size never does.
 */
export function photo(source: PhotoSource, width: number, height: number) {
  if (typeof source !== 'string')
    return `https://picsum.photos/id/${source}/${width}/${height}`

  const size = `w=${width}&h=${height}&fit=crop`

  // `auto=format` hands modern browsers AVIF or WebP instead of JPEG.
  if (source.includes('images.unsplash.com'))
    return `${source}?${size}&auto=format&q=80`

  return `${source}?${size}&auto=compress&cs=tinysrgb`
}
