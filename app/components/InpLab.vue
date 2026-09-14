<script setup lang="ts">
interface Severity {
  id: string
  label: string
  /** Milliseconds the handler blocks the main thread before painting. */
  block: number
  note: string
}

/**
 * Google's thresholds: 200ms good, 200–500ms needs improvement, 500ms+ poor.
 * The block values straddle them deliberately so a viewer can walk the scale.
 */
const severities: Severity[] = [
  { id: 'instant', label: 'Instant', block: 0, note: 'No work in the handler. This is what every control should feel like.' },
  { id: 'light', label: 'Light', block: 120, note: 'Under the threshold. Perceptible to a trained eye, still rated good.' },
  { id: 'heavy', label: 'Heavy', block: 350, note: 'Past 200ms. Rated “needs improvement” — the click feels sticky.' },
  { id: 'severe', label: 'Severe', block: 800, note: 'Past 500ms. Rated poor. The interface reads as frozen.' },
]

interface Reading {
  id: number
  label: string
  duration: number
}

const readings = ref<Reading[]>([])
const lastPressed = ref<Severity | null>(null)
let counter = 0

const { $faro } = useNuxtApp()

function rate(duration: number) {
  if (duration <= 200)
    return { word: 'good', tone: 'text-dodger' }
  if (duration <= 500)
    return { word: 'needs improvement', tone: 'text-chalk' }
  return { word: 'poor', tone: 'text-[#ff6b5e]' }
}

const router = useRouter()
const route = useRoute()

/** Blocks the main thread inside the handler, which is what INP measures. */
function press(severity: Severity) {
  lastPressed.value = severity

  /*
   * Records the severity in the query string, which `useFaroPage` folds into
   * the page id. Without it every button lands under `/inp` and the dashboard
   * cannot say which weight produced the reading. Replaced rather than pushed,
   * so the document — and the interaction being measured — survives.
   */
  router.replace({ query: { ...route.query, level: severity.id } })

  const until = performance.now() + severity.block
  while (performance.now() < until) { /* deliberate busy wait */ }
}

onMounted(() => {
  /**
   * Reads the browser's own interaction latency rather than timing the handler
   * ourselves. This is the same Event Timing data the web-vitals library feeds
   * INP from, so the number shown here is the number that reaches Grafana.
   */
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // interactionId is still missing from lib.dom; it is what separates a
      // discrete interaction from the individual events inside it.
      const event = entry as PerformanceEventTiming & { interactionId?: number }
      if (!event.interactionId || event.name !== 'pointerup')
        continue

      const label = lastPressed.value?.label ?? 'Interaction'
      readings.value = [
        { id: counter++, label, duration: Math.round(event.duration) },
        ...readings.value,
      ].slice(0, 8)

      $faro?.api?.pushMeasurement({
        type: 'inp_demo',
        values: { duration: event.duration },
      }, { context: { severity: lastPressed.value?.id ?? 'unknown' } })
    }
  })

  observer.observe({ type: 'event', durationThreshold: 16, buffered: true } as PerformanceObserverInit)
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <section>
    <p class="type-body text-mute">
      Each button blocks the main thread for a different length of time before
      the click is allowed to paint. The reading underneath is the browser's own
      interaction latency — the same measurement that reaches Grafana, not a
      stopwatch of our own.
    </p>

    <div data-testid="inp-triggers" class="mt-12 flex flex-wrap gap-3">
      <button
        v-for="severity in severities"
        :key="severity.id"
        type="button"
        :data-active="lastPressed?.id === severity.id"
        class="pill"
        @click="press(severity)"
      >
        {{ severity.label }}
        <span class="type-data ml-2 opacity-60">{{ severity.block }}ms</span>
      </button>
    </div>

    <p v-if="lastPressed" class="type-body mt-6 max-w-[56ch] text-sm text-mute">
      {{ lastPressed.note }}
    </p>

    <div class="mt-12 grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-start">
      <div class="rule border-t pt-6">
        <p class="text-xs text-mute">
          Last measured
        </p>
        <p
          v-if="readings.length"
          class="type-data mt-2 text-6xl"
          :class="rate(readings[0]!.duration).tone"
        >
          {{ readings[0]!.duration }}<span class="text-2xl text-mute">ms</span>
        </p>
        <p v-else class="type-data mt-2 text-6xl text-mute">
          —
        </p>
        <p v-if="readings.length" class="mt-2 text-sm" :class="rate(readings[0]!.duration).tone">
          {{ rate(readings[0]!.duration).word }}
        </p>
      </div>

      <ol v-if="readings.length" class="rule border-t pt-6">
        <li
          v-for="reading in readings"
          :key="reading.id"
          class="flex items-baseline justify-between gap-4 border-b border-chalk/10 py-2.5 text-sm"
        >
          <span class="text-mute">{{ reading.label }}</span>
          <span class="type-data" :class="rate(reading.duration).tone">{{ reading.duration }}ms</span>
        </li>
      </ol>
      <p v-else class="rule border-t pt-6 text-sm text-mute">
        Readings appear here as you press.
      </p>
    </div>
  </section>
</template>
