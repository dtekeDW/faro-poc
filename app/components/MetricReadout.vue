<script setup lang="ts">
/**
 * The measured value, read from the browser's own performance entries rather
 * than from a stopwatch of our own — so the number on screen is the number
 * that reaches Grafana.
 */
const { value, unit = 'ms', good, poor, digits = 0 } = defineProps<{
  value: number | null
  unit?: string
  // Upper bound of the good band.
  good: number
  // Lower bound of the poor band.
  poor: number
  digits?: number
}>()

const rating = computed(() => {
  if (value === null)
    return { word: 'not measured yet', tone: 'text-mute' }
  if (value <= good)
    return { word: 'good', tone: 'text-dodger' }
  if (value <= poor)
    return { word: 'needs improvement', tone: 'text-chalk' }

  return { word: 'poor', tone: 'text-[#ff6b5e]' }
})
</script>

<template>
  <div class="rule border-t pt-6">
    <p class="text-xs text-mute">
      <slot name="label">
        Measured
      </slot>
    </p>
    <p class="type-data mt-2 text-6xl" :class="rating.tone">
      <template v-if="value === null">
        —
      </template>
      <template v-else>
        {{ value.toFixed(digits) }}<span class="text-2xl text-mute">{{ unit }}</span>
      </template>
    </p>
    <p class="mt-2 text-sm" :class="rating.tone">
      {{ rating.word }}
    </p>
    <p class="mt-4 text-xs text-mute">
      good ≤ {{ good }}{{ unit }} · poor &gt; {{ poor }}{{ unit }}
    </p>
  </div>
</template>
