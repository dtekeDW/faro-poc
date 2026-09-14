<script setup lang="ts">
const scenario = findScenario('errors')

useHead({ title: `${scenario.label} — Sequence` })
</script>

<template>
  <ScenarioShell id="errors">
    <ErrorsLab />
  </ScenarioShell>
</template>
