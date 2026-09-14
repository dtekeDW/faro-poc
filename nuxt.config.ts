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
      // Sans headline candidates for the specimen wall at /fonts.
      { name: 'Clash Display', provider: 'fontshare', weights: [600] },
      { name: 'Cabinet Grotesk', provider: 'fontshare', weights: [700] },
      { name: 'Supreme', provider: 'fontshare', weights: [700] },
      { name: 'General Sans', provider: 'fontshare', weights: [600] },
      { name: 'Switzer', provider: 'fontshare', weights: [700] },
      { name: 'Chillax', provider: 'fontshare', weights: [600] },
      { name: 'Unbounded', provider: 'google', weights: [600] },
      { name: 'League Spartan', provider: 'google', weights: [700] },
      { name: 'Onest', provider: 'google', weights: [700] },
      { name: 'Golos Text', provider: 'google', weights: [700] },
      { name: 'Hanken Grotesk', provider: 'google', weights: [700] },
      { name: 'Commissioner', provider: 'google', weights: [700] },
      { name: 'Red Hat Display', provider: 'google', weights: [700] },
      { name: 'Figtree', provider: 'google', weights: [800] },
      { name: 'Archivo', provider: 'google', weights: [700] },
      { name: 'Darker Grotesque', provider: 'google', weights: [700] },
      // In use on the site.
      { name: 'Epilogue', provider: 'google', weights: [400, 500, 700, 800] },
      { name: 'Instrument Sans', provider: 'google', weights: [400, 500, 700] },
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
      },
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Sequence — Video Production',
    },
  },
})
