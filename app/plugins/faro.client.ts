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
export default defineNuxtPlugin({
  name: 'faro',
  // Run before other plugins so errors thrown during their setup are captured.
  enforce: 'pre',

  setup(nuxtApp) {
    const { faro: config } = useRuntimeConfig().public

    if (!config.url) {
      console.warn('[faro] NUXT_PUBLIC_FARO_URL is not set — telemetry disabled.')
      return
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

    nuxtApp.provide('faro', faro)
  },
})
