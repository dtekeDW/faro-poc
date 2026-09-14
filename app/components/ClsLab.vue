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
  injected.value = [...injected.value, `${shift.id}-${Date.now()}`]
}

function reset() {
  injected.value = []
}
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
      Each press inserts content above the text below it. Watch the paragraph
      move, then watch the score climb — it never goes back down.
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
