<script setup lang="ts">
const scenario = findScenario('ttfb')

useHead({ title: `${scenario.label} — Sequence` })

/**
 * Holds the server render before any byte goes out. Blocking here rather than
 * in a client fetch is what makes it land in TTFB — a slow client request would
 * show up as a failed network row instead.
 */
await useAsyncData('ttfb-delay', async () => {
  if (import.meta.server)
    await new Promise(resolve => setTimeout(resolve, 900))

  return { delayed: true }
})
</script>

<template>
  <HomeSurface scenario="ttfb" />
</template>
