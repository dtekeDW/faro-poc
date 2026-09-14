<script setup lang="ts">
const scenario = findScenario('inp')

useHead({ title: `${scenario.label} — Sequence` })
</script>

<template>
  <HomeSurface scenario="inp" />
</template>
