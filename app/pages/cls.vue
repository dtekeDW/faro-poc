<script setup lang="ts">
const scenario = findScenario('cls')

useHead({ title: `${scenario.label} — Sequence` })
</script>

<template>
  <ScenarioShell id="cls">
    <ClsLab />
  </ScenarioShell>
</template>
