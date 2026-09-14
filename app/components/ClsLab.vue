<script setup lang="ts">
interface Shift {
  id: string
  label: string
  note: string
}

const shifts: Shift[] = [
  { id: 'image', label: 'Unsized image', note: 'An image without width and height arrives and pushes everything below it down.' },
  { id: 'banner', label: 'Late banner', note: 'A notice is inserted above the content after load — the classic consent-bar shift.' },
  { id: 'font', label: 'Font swap', note: 'A late font with different metrics reflows the paragraph it sits in.' },
]

const injected = ref<string[]>([])
const cls = ref(0)
const pending = ref(0)

/**
 * Shifts within 500ms of a user interaction carry `hadRecentInput` and are
 * excluded from CLS by design — an accordion opening is expected movement and
 * should not be penalised. A button that injects on click therefore provokes
 * nothing at all, which is the trap this lab exists to make visible.
 *
 * The injection is delayed past that window so the shift counts, exactly as an
 * ad slot or a late consent bar would behave in the wild.
 */
const INPUT_EXCLUSION_MS = 900

/**
 * Layout shift accumulates across the life of the document, so unlike LCP it
 * can be provoked repeatedly without reloading. The score only ever climbs,
 * which is worth seeing: one bad component poisons the whole visit.
 */
onMounted(() => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const shift = entry as PerformanceEntry & { value: number, hadRecentInput: boolean }
      if (!shift.hadRecentInput)
        cls.value += shift.value
    }
  })

  observer.observe({ type: 'layout-shift', buffered: true })
  onBeforeUnmount(() => observer.disconnect())
})

function provoke(shift: Shift) {
  pending.value++

  setTimeout(() => {
    injected.value = [...injected.value, `${shift.id}-${Date.now()}`]
    pending.value--
  }, INPUT_EXCLUSION_MS)
}

function reset() {
  injected.value = []
}

const timers: number[] = []
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <section>
    <div class="flex flex-wrap gap-3">
      <button
        v-for="shift in shifts"
        :key="shift.id"
        type="button"
        class="pill"
        @click="provoke(shift)"
      >
        {{ shift.label }}
      </button>
      <button type="button" class="pill" @click="reset()">
        Clear
      </button>
    </div>

    <p class="type-body mt-6 text-sm text-mute">
      Each press inserts content above the paragraph below —
      <span class="text-chalk">after a short delay, on purpose</span>. Layout
      shifts within half a second of a click carry the browser's
      <span class="type-data">hadRecentInput</span> flag and are excluded from
      the score, because movement you asked for is not movement that hurt you.
      Injecting immediately would provoke nothing at all.
    </p>

    <p v-if="pending" class="type-data mt-4 text-sm text-dodger">
      shifting in a moment…
    </p>

    <div class="mt-12 grid gap-10 md:grid-cols-[1.6fr_1fr] md:items-start">
      <div data-testid="cls-stage" class="min-h-[22rem] border border-chalk/12 p-6">
        <!-- Deliberately unsized: reserving no space is the entire defect. -->
        <img
          v-for="key in injected"
          :key="key"
          :src="photo(WORK_IMAGES[injected.indexOf(key) % WORK_IMAGES.length]!, 900, 300)"
          alt=""
          class="photo mb-4 w-full"
        >

        <p class="type-body text-mute">
          This paragraph has not changed. Everything that moves it was inserted
          above it after the page had already settled, which is precisely what
          Cumulative Layout Shift measures — content the reader had already
          located, moving out from under them.
        </p>
      </div>

      <MetricReadout :value="cls" unit="" :good="0.1" :poor="0.25" :digits="3">
        <template #label>
          Cumulative Layout Shift
        </template>
      </MetricReadout>
    </div>
  </section>
</template>
