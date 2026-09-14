<script setup lang="ts">
const scenario = findScenario('lcp')

useHead({ title: `${scenario.label} — Sequence` })
</script>

<template>
  <ScenarioShell id="lcp">
    <LcpLab />
  </ScenarioShell>
</template>
