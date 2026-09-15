import type { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import process from 'node:process'

/**
 * Starts a seeding run from the lab.
 *
 * The lab used to drive the scenarios in an iframe, which registered the page
 * loads but lost the measurements: web-vitals reports LCP, CLS and INP when a
 * page is hidden or unloaded, and swapping an iframe's src does not deliver
 * those signals reliably. Playwright performs real top-level navigations, so
 * the same run produces the metrics the demo is about.
 *
 * Local demo only. Spawning a process from a request handler has no place in
 * anything deployed.
 */
export default defineEventHandler(async (event) => {
  interface SeedRequest { passes?: number, target?: string, name?: string, headed?: boolean }

  const body: SeedRequest = await readBody<SeedRequest>(event).catch(() => ({}))
  const passes = Math.min(Math.max(Number(body.passes) || 3, 1), 30)

  const allowed = ['all', 'worst', 'lcp', 'cls', 'inp', 'ttfb', 'errors']
  const target = allowed.includes(body.target ?? '') ? body.target! : 'all'

  /*
   * The run id leads with the target, so a dashboard filter reads as the
   * question it answers. A name given in the lab replaces the random suffix,
   * which is what makes a run findable during a demo — `run=inp-po-demo` beats
   * scanning a list of timestamps for the one you just started.
   */
  // Transliterated first: stripping accents outright turns "Käsekuchen" into
  // "k-sekuchen", which is neither the name typed nor a usable label.
  const slug = String(body.name ?? '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32)

  /*
   * The stamp is always appended, name or not. A run called `kaesekuchen` is
   * findable today and ambiguous next week, when there are three of them —
   * knowing roughly when a measurement was taken is part of being able to
   * trust it.
   */
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  const stamp = `${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`

  const runId = slug ? `${target}-${slug}-${stamp}` : `${target}-${stamp}`

  const child = spawn('pnpm', ['exec', 'tsx', 'scripts/seed.ts'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      SEED_PASSES: String(passes),
      SEED_RUN_ID: runId,
      SEED_TARGET: target,
      // Demo mode: the run happens in a window the room can watch.
      SEED_HEADED: body.headed ? '1' : '',
    },
    detached: false,
  })

  const job = useSeedJobs()
  job.start(runId, passes)

  child.stdout?.on('data', (chunk: Buffer) => job.append(runId, chunk.toString()))
  child.stderr?.on('data', (chunk: Buffer) => job.append(runId, chunk.toString()))
  child.on('close', code => job.finish(runId, code ?? 0))

  return { runId, passes, target, headed: Boolean(body.headed) }
})
