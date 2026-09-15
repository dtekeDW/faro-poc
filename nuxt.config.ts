import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: false },

  modules: ['@nuxt/fonts'],

  css: ['~/assets/css/main.css'],

  fonts: {
    // Declared explicitly rather than left to scanning: Tailwind v4 exposes the
    // faces as custom properties inside @theme, which the scanner does not read
    // as font-family declarations, so nothing would be downloaded.
    families: [
      { name: 'Golos Text', provider: 'google', weights: [500, 600, 700, 800] },
      { name: 'Figtree', provider: 'google', weights: [400, 500, 600] },
      { name: 'Geist Mono', provider: 'google', weights: [400, 500] },
    ],
    defaults: {
      weights: [400, 500, 700, 800],
      styles: ['normal', 'italic'],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    public: {
      faro: {
        url: '',
        environment: 'local',
        // Overwritten at build time so dashboards can compare releases.
        version: process.env.GIT_SHA ?? 'dev',

        // Linked from the lab so the run and the result sit one click apart.
        dashboardUrl: '',
      },

      /**
       * Where the hero film is served from. Empty means no film: the hero
       * shows its still and nothing is requested. The file lives on a CDN
       * rather than in this repository — twelve megabytes of video has no
       * business in git, and a hero video is exactly the kind of asset that
       * belongs on an origin built to range-serve it.
       */
      showreelUrl: '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Sequence — Video Production',
    },
  },
})
