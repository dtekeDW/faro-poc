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
  /** Run after load to provoke the metric that needs interaction. */
  drive?: (page: Page) => Promise<void>
}

const steps: Step[] = [
  { path: '/', label: 'control', target: 'control' },
  { path: '/lcp?v=good', label: 'lcp optimised', target: 'lcp' },
  { path: '/lcp?v=heavy', label: 'lcp oversized', target: 'lcp' },
  { path: '/lcp?v=slow', label: 'lcp slow origin', target: 'lcp' },
  { path: '/lcp?v=lazy', label: 'lcp slow deferred', target: 'lcp' },
  { path: '/ttfb?delay=0', label: 'ttfb none', target: 'ttfb' },
  { path: '/ttfb?delay=900', label: 'ttfb slow', target: 'ttfb' },
  { path: '/ttfb?delay=2000', label: 'ttfb very slow', target: 'ttfb' },
  {
    path: '/cls',
    label: 'cls storm',
    target: 'cls',
    drive: async (page) => {
      await page.getByRole('button', { name: /Storm/ }).click()
      // The lab delays injection past the input exclusion window on purpose.
      await page.waitForTimeout(3500)
    },
  },
  {
    path: '/inp',
    label: 'inp severe',
    target: 'inp',
    drive: async (page) => {
      for (const name of [/Heavy/, /Severe/, /Light/]) {
        await page.getByRole('button', { name }).click()
        await page.waitForTimeout(900)
      }
    },
  },
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
    await page.goto(`${BASE_URL}${withRun(step.path)}`, { waitUntil: 'load', timeout: 45_000 })
    // Let the paint metrics settle before anything else happens.
    await page.waitForTimeout(2500)

    await step.drive?.(page)

    /*
     * Faro reports CLS and INP when the page is hidden, and flushes its batch
     * on the same signal. Closing without this would discard the very metrics
     * the step exists to produce.
     */
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await page.waitForTimeout(1500)

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

  const browser = await chromium.launch({ headless: true })

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
