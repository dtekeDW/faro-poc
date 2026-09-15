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
       * Where the hero film is served from. A URL, not a bundled file: the
       * video is fetched from its own host, so it never travels with a
       * deployment. GitHub hands it out as `application/octet-stream` behind
       * a redirect — Chrome sniffs the container and plays it anyway, other
       * engines are stricter, so a host that answers `video/mp4` is the safer
       * home. Blank leaves the hero on its still and requests nothing.
       */
      showreelUrl: 'https://github.com/dtekeDW/faro-poc/releases/download/media-v1/showreel.mp4',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Sequence — Video Production',
    },
  },
})
