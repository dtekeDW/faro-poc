import type { Faro } from '@grafana/faro-web-sdk'
import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk'
import { TracingInstrumentation } from '@grafana/faro-web-tracing'

/**
 * Initializes the Grafana Faro Web SDK.
 *
 * Client-only by design: the SDK reads `window`, `PerformanceObserver` and
 * `navigator` at construction time, all of which are absent during Nuxt's
 * server render. The `.client.ts` suffix is what keeps it out of SSR — do not
 * rename this file without moving the guard somewhere else.
 *
 * The `ignoreErrors` defaults follow Grafana's own faro-setup recommendations:
 * every entry is browser noise rather than an application fault, and leaving
 * them in drowns the error panel on day one.
 */
declare global {
  interface Window {
    __faro?: Faro
  }
}

/**
 * Stable, readable identity: `/lcp?v=lazy`, with parameters sorted so that
 * `?b=2&a=1` and `?a=1&b=2` are the same row rather than two.
 */
function buildPageId(pathname: string, search: string) {
  const params = new URLSearchParams(search)
  const parts = [...new Set(params.keys())]
    .sort()
    .map((key) => {
      const value = params.get(key)

      return value ? `${key}=${value}` : key
    })

  return parts.length ? `${pathname}?${parts.join('&')}` : pathname
}

export default defineNuxtPlugin({
  name: 'faro',
  // Run before other plugins so errors thrown during their setup are captured.
  enforce: 'pre',

  setup() {
    const { faro: config } = useRuntimeConfig().public

    if (!config.url) {
      console.warn('[faro] NUXT_PUBLIC_FARO_URL is not set — telemetry disabled.')
      return
    }

    /**
     * Guarded because HMR re-runs plugins: a second initializeFaro on the same
     * document leaves the first instance's transport without its logger, which
     * surfaces as "Cannot read properties of undefined (reading
     * 'internalLogger')" on every batch it then tries to send.
     */
    if (window.__faro) {
      return { provide: { faro: window.__faro } }
    }

    const faro: Faro = initializeFaro({
      url: config.url,

      app: {
        name: 'faro-poc',
        version: config.version,
        environment: config.environment,
      },

      instrumentations: [
        ...getWebInstrumentations(),
        new TracingInstrumentation(),
      ],

      ignoreErrors: [
        // Layout quirks — harmless, not real errors.
        /^ResizeObserver loop limit exceeded$/,
        /^ResizeObserver loop completed with undelivered notifications$/,
        // Cross-origin scripts that arrive without a usable stack.
        /^Script error\.$/,
        // Browser extension interference.
        /chrome-extension:\/\//,
        /moz-extension:\/\//,
      ],

      // Nuxt routes client-side, so navigations are not document loads.
      // Without this every signal after the first paint collapses onto "/".
      experimental: { trackNavigation: true },
    })

    // Name the view after the route so the dashboard can break metrics down
    // per page instead of per session.
    const router = useRouter()
    router.afterEach((to) => {
      faro.api.setView({ name: to.name?.toString() ?? to.path })
    })

    /*
     * Named before anything can report.
     *
     * Paint metrics — TTFB, FCP and LCP — are emitted during load, well before
     * Vue mounts, so a page identity set from a component arrives too late and
     * those measurements are filed under Faro's placeholder `/*`. Setting it
     * here, synchronously after init, is what makes per-route paint comparison
     * possible at all. Components still refresh it on client-side navigation.
     */
    faro.api.setPage({
      id: buildPageId(window.location.pathname, window.location.search),
      url: window.location.href,
    })

    window.__faro = faro

    // Returned rather than passed to nuxtApp.provide(): only this form carries
    // the type through to `useNuxtApp().$faro` at the call sites.
    return { provide: { faro } }
  },
})
