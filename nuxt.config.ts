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
      { name: 'Bodoni Moda', provider: 'google', weights: [700] },
      { name: 'Cormorant Garamond', provider: 'google', weights: [600] },
      { name: 'Instrument Serif', provider: 'google', weights: [400] },
      { name: 'DM Serif Display', provider: 'google', weights: [400] },
      { name: 'Frank Ruhl Libre', provider: 'google', weights: [700] },
      { name: 'EB Garamond', provider: 'google', weights: [600] },
      { name: 'Young Serif', provider: 'google', weights: [400] },
      { name: 'Newsreader', provider: 'google', weights: [600] },
      { name: 'Spectral', provider: 'google', weights: [600] },
      { name: 'Literata', provider: 'google', weights: [600] },
      { name: 'Petrona', provider: 'google', weights: [600] },
      { name: 'Source Serif 4', provider: 'google', weights: [600] },
      { name: 'Syne', provider: 'google', weights: [700] },
      { name: 'Jost', provider: 'google', weights: [600] },
      { name: 'Outfit', provider: 'google', weights: [600] },
      { name: 'Sora', provider: 'google', weights: [600] },
      { name: 'Gabarito', provider: 'google', weights: [700] },
      { name: 'Familjen Grotesk', provider: 'google', weights: [700] },
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
