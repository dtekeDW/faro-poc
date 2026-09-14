import type { Browser, Page } from '@playwright/test'
import process from 'node:process'
import { chromium } from '@playwright/test'

/**
 * Fills the p75 curves before a demo.
 *
 * Three things learned the hard way shape this script:
 *
 * 1. A page that is not rendered measures nothing — no layout shifts, no
 *    animation frames. The browser therefore runs with a real viewport, and
 *    headless mode is the modern one that still composites.
 * 2. LCP, FCP and TTFB are recorded once per document load, so every scenario
 *    is entered by direct navigation. Routing between them would produce one
 *    set of paint metrics for the whole run.
 * 3. INP only counts input the browser trusts. Playwright drives input through
 *    CDP, which is trusted — unlike anything dispatched from page scripts — so
 *    this is the only way to seed INP automatically.
 */

const BASE_URL = process.env.SEED_BASE_URL ?? 'http://localhost:3000'
const PASSES = Number(process.env.SEED_PASSES ?? 12)

/**
 * One label for the whole invocation, carried on every URL. It becomes part of
 * Faro's page id, so every row in the dashboard names the run that produced it
 * — which is what makes two seeding runs comparable instead of merged.
 */
const TARGET = process.env.SEED_TARGET ?? 'all'
const RUN_ID = process.env.SEED_RUN_ID ?? buildRunId(TARGET)

function buildRunId(prefix: string) {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}`

  return `${prefix}-${stamp}-${time}-${Math.random().toString(36).slice(2, 6)}`
}

function withRun(path: string) {
  return `${path}${path.includes('?') ? '&' : '?'}run=${encodeURIComponent(RUN_ID)}`
}

interface Step {
  path: string
  label: string
  /** Which targeted run this step belongs to. */
  target: string
  /**
   * How long to let the page settle before hiding it, in milliseconds.
   * Paint metrics are only reported once the page is hidden, so a step that
   * hides too early reports whatever had painted by then — for a hero held
   * back by the server, that is nothing at all.
   */
  settleMs?: number
  /** Run after load to provoke the metric that needs interaction. */
  drive?: (page: Page) => Promise<void>
}

const steps: Step[] = [
  { path: '/', label: 'control', target: 'control' },
  { path: '/lcp?v=good', label: 'lcp optimised', target: 'lcp', settleMs: 3000 },
  { path: '/lcp?v=heavy', label: 'lcp oversized', target: 'lcp', settleMs: 3000 },
  // The origin holds these for 2.6s and 3.8s; the wait has to outlast that.
  { path: '/lcp?v=slow', label: 'lcp slow origin', target: 'lcp', settleMs: 5500 },
  { path: '/lcp?v=lazy', label: 'lcp slow deferred', target: 'lcp', settleMs: 7000 },
  { path: '/ttfb?delay=0', label: 'ttfb none', target: 'ttfb' },
  { path: '/ttfb?delay=900', label: 'ttfb slow', target: 'ttfb' },
  { path: '/ttfb?delay=2000', label: 'ttfb very slow', target: 'ttfb' },
  ...(['Light', 'Heavy', 'Severe', 'Storm'] as const).map(level => ({
    path: '/cls',
    label: `cls ${level.toLowerCase()}`,
    target: 'cls',
    drive: async (page: Page) => {
      await page.getByRole('button', { name: new RegExp(`^${level}`) }).click()
      // The lab delays injection past the input exclusion window on purpose.
      await page.waitForTimeout(3500)
    },
  })),
  ...(['Instant', 'Light', 'Heavy', 'Severe'] as const).map(level => ({
    path: '/inp',
    label: `inp ${level.toLowerCase()}`,
    target: 'inp',
    drive: async (page: Page) => {
      // Clicked three times so the reported INP is a settled p75, not one
      // outlier: the metric reports a high percentile of all interactions.
      for (let i = 0; i < 3; i++) {
        await page.getByRole('button', { name: new RegExp(`^${level}`) }).click()
        await page.waitForTimeout(700)
      }
    },
  })),
  {
    path: '/errors',
    label: 'errors',
    target: 'errors',
    drive: async (page) => {
      for (const name of [/Uncaught exception/, /Failed request/, /Unhandled rejection/]) {
        await page.getByRole('button', { name }).click()
        await page.waitForTimeout(500)
      }
    },
  },
]

async function runStep(browser: Browser, step: Step, pass: number) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    // A fresh context per step keeps sessions separate, the way real visits are.
    reducedMotion: 'no-preference',
  })

  const page = await context.newPage()

  try {
    await page.goto(`${BASE_URL}${withRun(step.path)}`, { waitUntil: 'load', timeout: 60_000 })

    /*
     * Wait for the largest element to actually arrive. `load` fires before a
     * lazily-loaded hero has bytes, and hiding the page at that point reports
     * an LCP that never saw the image — which is how an entire run of LCP
     * scenarios came back green.
     */
    await page
      .waitForFunction(() => {
        const img = document.querySelector('[data-testid=lcp-media]') as HTMLImageElement | null
        return !img || (img.complete && img.naturalWidth > 0)
      }, undefined, { timeout: 20_000 })
      .catch(() => { /* No hero on this route, or it never arrived. */ })

    await page.waitForTimeout(step.settleMs ?? 2500)

    await step.drive?.(page)

    /*
     * Faro reports CLS and INP when the page is hidden, and flushes its batch
     * on the same signal. Closing without this would discard the very metrics
     * the step exists to produce.
     */
    /*
     * web-vitals listens for the document actually becoming hidden, not for a
     * dispatched event, so the visibility state is overridden before firing.
     * This is the moment LCP, CLS and INP are reported and the batch flushed.
     */
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
      Object.defineProperty(document, 'hidden', { value: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
      window.dispatchEvent(new Event('pagehide'))
    })
    await page.waitForTimeout(2000)

    console.warn(`pass ${pass}  ${step.label.padEnd(16)} ok`)
  }
  catch (error) {
    console.error(`pass ${pass}  ${step.label.padEnd(16)} failed: ${(error as Error).message}`)
  }
  finally {
    await context.close()
  }
}

async function main() {
  /*
   * A targeted run touches only the pages that provoke the metric it is named
   * after, plus the control. Everything it sends therefore belongs to one
   * question, which is what makes `run=inp-…` a useful dashboard filter rather
   * than just a timestamp.
   */
  const selected = TARGET === 'all'
    ? steps
    : steps.filter(step => step.target === TARGET || step.target === 'control')

  if (!selected.length) {
    console.error(`Unknown target "${TARGET}"`)
    process.exit(1)
  }

  console.warn(`Seeding ${BASE_URL} — target ${TARGET}, ${PASSES} passes over ${selected.length} steps`)
  console.warn(`Run id: ${RUN_ID}`)

  /*
   * The full Chromium in new headless mode, not Playwright's default headless
   * shell. web-vitals refuses to report LCP for a page that was hidden before
   * its largest paint, and the shell counts as hidden for its entire life — so
   * every LCP scenario came back with no measurement at all while TTFB, FCP,
   * CLS and INP arrived normally.
   */
  const browser = await chromium.launch({ headless: true, channel: 'chromium' })

  for (let pass = 1; pass <= PASSES; pass++) {
    for (const step of selected)
      await runStep(browser, step, pass)
  }

  await browser.close()
  console.warn(`Done — filter the dashboard on run=${RUN_ID}. Signals arrive within about a minute.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
