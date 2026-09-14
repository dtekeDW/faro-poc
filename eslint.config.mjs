import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  formatters: {
    css: true,
    html: true,
    markdown: true,
  },
  ignores: [
    // Vendored from the nxui registry — kept byte-identical so it can be
    // re-pulled without replaying our formatting on top of it.
    'app/components/ui/**',
    // Self-hosted third-party runtime, minified.
    'public/motionview-runtime.js',
    '.nuxt/**',
    '.output/**',
  ],
})
