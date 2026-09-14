<script setup lang="ts">
const scenario = findScenario('lcp')

useHead({ title: `${scenario.label} — Sequence` })
</script>

<template>
  <HomeSurface scenario="lcp" />
</template>
