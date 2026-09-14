import { Buffer } from 'node:buffer'

/**
 * Streams a photograph after an artificial delay.
 *
 * Serving an oversized original is not enough to ruin LCP on a fast
 * connection: a 2400px image still arrives from localhost in milliseconds. The
 * measurement is about *when the largest element finishes painting*, so the
 * only reliable way to push it into the red is to make the byte stream late —
 * which is also the realistic failure, a slow origin or an uncached CDN miss.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const id = Math.min(Math.max(Number(query.id) || 27, 0), 1084)
  const width = Math.min(Math.max(Number(query.w) || 1600, 100), 3000)
  const height = Math.min(Math.max(Number(query.h) || 900, 100), 3000)
  const delay = Math.min(Math.max(Number(query.delay) || 0, 0), 8000)

  if (delay > 0)
    await new Promise(resolve => setTimeout(resolve, delay))

  const upstream = await fetch(`https://picsum.photos/id/${id}/${width}/${height}`)

  setHeader(event, 'Content-Type', upstream.headers.get('content-type') ?? 'image/jpeg')
  // Never cached: a cached hero would make the second measurement meaningless.
  setHeader(event, 'Cache-Control', 'no-store')

  return Buffer.from(await upstream.arrayBuffer())
})
