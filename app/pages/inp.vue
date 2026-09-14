<script setup lang="ts">
const scenario = findScenario('inp')

useHead({ title: `${scenario.label} — Sequence` })
</script>

<template>
  <div class="pt-24">
    <InpLab />
    <HomeSurface scenario="inp" />
  </div>
</template>
