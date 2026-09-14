<script setup lang="ts">
const scenario = findScenario('errors')

useHead({ title: `${scenario.label} — Sequence` })

/**
 * Two distinct failures, because they surface differently in Faro: a thrown
 * exception carries a stack trace, a failed request carries a status and a URL.
 */
onMounted(() => {
  setTimeout(() => {
    throw new Error('Showreel player failed to initialise: codec descriptor missing')
  }, 400)

  fetch('https://localhost:9/api/showreel-manifest')
    .catch(() => { /* Swallowed on purpose; Faro records the failed request. */ })
})
</script>

<template>
  <HomeSurface scenario="errors" />
</template>
