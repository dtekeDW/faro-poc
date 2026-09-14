/**
 * Identifies one run so its measurements can be told apart from every other.
 *
 * Shaped `2026-09-14-1755-k3f9`: sortable, readable at a glance in a dashboard
 * row, and unique enough that two runs a second apart cannot collide. The date
 * is in the id rather than only in the timestamp because the id is what ends up
 * in the Page ID column, and a reader should not have to cross-reference a
 * clock to know which run they are looking at.
 */
export function buildRunId(prefix = 'run') {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')

  const stamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join('-')

  const time = `${pad(now.getHours())}${pad(now.getMinutes())}`
  const suffix = Math.random().toString(36).slice(2, 6)

  return `${prefix}-${stamp}-${time}-${suffix}`
}

/** Appends a parameter to a path that may already carry a query string. */
export function withParam(path: string, key: string, value: string) {
  return `${path}${path.includes('?') ? '&' : '?'}${key}=${encodeURIComponent(value)}`
}
