<script setup lang="ts">
const route = useRoute()

/**
 * LCP is recorded once per document load, so a variant cannot be swapped in
 * place — each one needs a real navigation. The buttons therefore reload the
 * page rather than toggling state, which is itself worth showing: it is the
 * reason a single-page app cannot measure paint metrics per view.
 */
const variants = [
  { id: 'good', label: 'Optimised', width: 1600, note: 'Viewport-sized, explicit dimensions, fetchpriority high, eager.' },
  { id: 'heavy', label: 'Oversized source', width: 2400, note: 'A 2400px original painted at viewport width. Decoding alone costs time.' },
  { id: 'lazy', label: 'Oversized and deferred', width: 2400, note: 'Same original, loaded lazily and with no priority hint — the browser has no reason to hurry.' },
]

const active = computed(() => variants.find(v => v.id === route.query.v) ?? variants[0]!)
const isDeferred = computed(() => active.value.id === 'lazy')

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

    <div class="mt-12 grid gap-10 md:grid-cols-[1.6fr_1fr] md:items-start">
      <figure class="relative aspect-[16/9] overflow-hidden bg-ink-raised">
        <img
          :key="active.id"
          :src="photo(HERO_IMAGE, active.width, Math.round(active.width * 9 / 16))"
          :width="isDeferred ? undefined : active.width"
          :height="isDeferred ? undefined : Math.round(active.width * 9 / 16)"
          :fetchpriority="isDeferred ? 'auto' : 'high'"
          :loading="isDeferred ? 'lazy' : 'eager'"
          alt=""
          data-testid="lcp-media"
          class="photo size-full object-cover"
        >
      </figure>

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
  </section>
</template>
