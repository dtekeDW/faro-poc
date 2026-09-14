<script setup lang="ts">
const scenario = findScenario('ttfb')
const route = useRoute()

useHead({ title: `${scenario.label} — Sequence` })

/**
 * Holds the server render before any byte goes out. Blocking here rather than
 * in a client fetch is what makes it land in TTFB — a slow client request would
 * surface as a failed network row instead.
 */
await useAsyncData(`ttfb-${route.query.delay ?? 0}`, async () => {
  const delay = Math.min(Number(route.query.delay ?? 0) || 0, 5000)

  if (import.meta.server && delay > 0)
    await new Promise(resolve => setTimeout(resolve, delay))

  return { delay }
})
</script>

<template>
  <ScenarioShell id="ttfb">
    <TtfbLab />
  </ScenarioShell>
</template>
