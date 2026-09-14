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

interface Step {
  path: string
  label: string
  /** Run after load to provoke the metric that needs interaction. */
  drive?: (page: Page) => Promise<void>
}

const steps: Step[] = [
  { path: '/', label: 'control' },
  { path: '/lcp?v=good', label: 'lcp optimised' },
  { path: '/lcp?v=heavy', label: 'lcp oversized' },
  { path: '/lcp?v=lazy', label: 'lcp deferred' },
  { path: '/ttfb?delay=0', label: 'ttfb none' },
  { path: '/ttfb?delay=900', label: 'ttfb slow' },
  { path: '/ttfb?delay=2000', label: 'ttfb very slow' },
  {
    path: '/cls',
    label: 'cls storm',
    drive: async (page) => {
      await page.getByRole('button', { name: /Storm/ }).click()
      // The lab delays injection past the input exclusion window on purpose.
      await page.waitForTimeout(3500)
    },
  },
  {
    path: '/inp',
    label: 'inp severe',
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
    await page.goto(`${BASE_URL}${step.path}`, { waitUntil: 'load', timeout: 45_000 })
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
  console.warn(`Seeding ${BASE_URL} — ${PASSES} passes over ${steps.length} scenarios`)

  const browser = await chromium.launch({ headless: true })

  for (let pass = 1; pass <= PASSES; pass++) {
    for (const step of steps)
      await runStep(browser, step, pass)
  }

  await browser.close()
  console.warn('Done. Signals reach Grafana within about a minute.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
