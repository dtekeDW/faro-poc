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
      // Headline candidates for the specimen wall at /fonts.
      { name: 'Clash Display', provider: 'fontshare', weights: [600] },
      { name: 'Cabinet Grotesk', provider: 'fontshare', weights: [700] },
      { name: 'League Spartan', provider: 'google', weights: [700] },
      { name: 'Darker Grotesque', provider: 'google', weights: [700] },
      { name: 'Archivo', provider: 'google', weights: [700] },
      { name: 'Red Hat Display', provider: 'google', weights: [700] },
      { name: 'Chillax', provider: 'fontshare', weights: [600] },
      // Secondary-text candidates for the specimen wall at /text.
      { name: 'Switzer', provider: 'fontshare', weights: [400, 500] },
      { name: 'General Sans', provider: 'fontshare', weights: [400, 500] },
      { name: 'Supreme', provider: 'fontshare', weights: [400, 500] },
      { name: 'Synonym', provider: 'fontshare', weights: [400, 500] },
      { name: 'Author', provider: 'fontshare', weights: [400, 500] },
      { name: 'Ranade', provider: 'fontshare', weights: [400, 500] },
      { name: 'Public Sans', provider: 'google', weights: [400, 500] },
      { name: 'IBM Plex Sans', provider: 'google', weights: [400, 500] },
      { name: 'Commissioner', provider: 'google', weights: [400, 500] },
      { name: 'Golos Text', provider: 'google', weights: [400, 500, 600, 700, 800] },
      { name: 'Be Vietnam Pro', provider: 'google', weights: [400, 500] },
      { name: 'Karla', provider: 'google', weights: [400, 500] },
      { name: 'Hanken Grotesk', provider: 'google', weights: [400, 500] },
      { name: 'Figtree', provider: 'google', weights: [400, 500] },
      { name: 'Onest', provider: 'google', weights: [400, 500] },
      { name: 'Chivo', provider: 'google', weights: [400, 500] },
      { name: 'Spline Sans', provider: 'google', weights: [400, 500] },
      { name: 'Wix Madefor Text', provider: 'google', weights: [400, 500] },
      { name: 'Unbounded', provider: 'google', weights: [400, 500, 600, 700] },
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
