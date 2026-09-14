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
  interface SeedRequest { passes?: number, target?: string }

  const body: SeedRequest = await readBody<SeedRequest>(event).catch(() => ({}))
  const passes = Math.min(Math.max(Number(body.passes) || 3, 1), 30)

  const allowed = ['all', 'lcp', 'cls', 'inp', 'ttfb', 'errors']
  const target = allowed.includes(body.target ?? '') ? body.target! : 'all'

  /*
   * The run id leads with the target, so a dashboard filter reads as the
   * question it answers: `run=inp-2026-09-14-1801-k3f9`.
   */
  const stamp = new Date().toISOString().slice(0, 10)
  const time = new Date().toTimeString().slice(0, 5).replace(':', '')
  const runId = `${target}-${stamp}-${time}-${Date.now().toString(36).slice(-4)}`

  const child = spawn('pnpm', ['exec', 'tsx', 'scripts/seed.ts'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      SEED_PASSES: String(passes),
      SEED_RUN_ID: runId,
      SEED_TARGET: target,
    },
    detached: false,
  })

  const job = useSeedJobs()
  job.start(runId, passes)

  child.stdout?.on('data', (chunk: Buffer) => job.append(runId, chunk.toString()))
  child.stderr?.on('data', (chunk: Buffer) => job.append(runId, chunk.toString()))
  child.on('close', code => job.finish(runId, code ?? 0))

  return { runId, passes, target }
})
