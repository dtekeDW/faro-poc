<script setup lang="ts">
const route = useRoute()

/**
 * LCP is recorded once per document load, so a variant cannot be swapped in
 * place — each one needs a real navigation. The buttons therefore reload the
 * page rather than toggling state, which is itself worth showing: it is the
 * reason a single-page app cannot measure paint metrics per view.
 */
const variants = [
  { id: 'good', label: 'Optimised', width: 1600, delay: 0, note: 'Viewport-sized, explicit dimensions, fetchpriority high, eager. Arrives from cache-friendly storage.' },
  { id: 'heavy', label: 'Oversized source', width: 2400, delay: 0, note: 'A 2400px original painted at viewport width. Decoding costs time, but on a fast connection not enough to fail.' },
  { id: 'slow', label: 'Slow origin', width: 2400, delay: 2600, note: 'The same original, held by the server for 2.6s before the first byte. This is what actually ruins LCP.' },
  { id: 'lazy', label: 'Slow and deferred', width: 2400, delay: 3800, note: 'Late bytes plus no priority hint and lazy loading — the browser has no reason to hurry, and nothing to paint until it does.' },
]

const active = computed(() => variants.find(v => v.id === route.query.v) ?? variants[0]!)

const lcp = ref<number | null>(null)

onMounted(() => {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const last = entries[entries.length - 1]
    if (last)
      lcp.value = last.startTime
  })

  observer.observe({ type: 'largest-contentful-paint', buffered: true })
  onBeforeUnmount(() => observer.disconnect())
})

function load(id: string) {
  // A full document load, not a router push: the metric depends on it.
  window.location.href = `/lcp?v=${id}`
}
</script>

<template>
  <section>
    <div class="flex flex-wrap gap-3">
      <button
        v-for="variant in variants"
        :key="variant.id"
        type="button"
        :data-active="variant.id === active.id"
        class="pill"
        @click="load(variant.id)"
      >
        {{ variant.label }}
        <span class="type-data ml-2 opacity-60">{{ variant.width }}px</span>
      </button>
    </div>

    <p class="type-body mt-6 text-sm text-mute">
      {{ active.note }}
    </p>

    <div class="mt-12 max-w-sm">
      <MetricReadout :value="lcp" :good="2500" :poor="4000">
        <template #label>
          Largest Contentful Paint
        </template>
      </MetricReadout>
    </div>

    <p class="type-body mt-10 text-sm text-mute">
      Each button triggers a full page load. Largest Contentful Paint is
      recorded once per document, so it cannot be re-measured by swapping the
      image in place — which is exactly why client-side navigation alone never
      produces a second reading.
    </p>

    <p class="type-body mt-3 text-sm text-mute">
      File size alone rarely fails this metric. A 2400px original still arrives
      from a nearby server in milliseconds; what fails it is
      <span class="text-chalk">late bytes</span> — a slow origin, an uncached
      CDN miss, a hero behind a redirect. The last two variants delay the
      response itself, which is why only they turn the reading red.
    </p>
  </section>
</template>
