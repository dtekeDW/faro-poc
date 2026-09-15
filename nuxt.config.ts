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
       * Where the hero film is served from: the copy that ships in public/,
       * so it arrives as `video/mp4` from the same origin as the page. A
       * release asset was tried and works in Chrome, but GitHub serves it as
       * `application/octet-stream` behind a redirect to a signed URL on
       * another host — a wrong media type and two extra round trips to save
       * 2.9 MB. Point this at a CDN if the film ever outgrows the repository;
       * blank leaves the hero on its still and requests nothing.
       */
      showreelUrl: '/media/showreel.mp4',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Sequence — Video Production',
    },
  },
})
