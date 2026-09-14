<script setup lang="ts">
const scenario = findScenario('inp')

useHead({ title: `${scenario.label} — Sequence` })
</script>

<template>
  <ScenarioShell id="inp">
    <InpLab />
  </ScenarioShell>
</template>
