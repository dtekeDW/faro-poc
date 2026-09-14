<script setup lang="ts">
const route = useRoute()

const delays = [0, 300, 900, 2000]
const active = computed(() => Number(route.query.delay ?? 0))

const ttfb = ref<number | null>(null)

onMounted(() => {
  const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  if (entry)
    ttfb.value = entry.responseStart - entry.requestStart
})

function load(delay: number) {
  window.location.href = `/ttfb?delay=${delay}`
}
</script>

<template>
  <section>
    <div class="flex flex-wrap gap-3">
      <button
        v-for="delay in delays"
        :key="delay"
        type="button"
        :data-active="delay === active"
        class="pill"
        @click="load(delay)"
      >
        <span class="type-data">{{ delay }}ms</span>
      </button>
    </div>

    <p class="type-body mt-6 text-sm text-mute">
      The server holds the response for the selected time before sending a
      single byte. Nothing in the markup changes.
    </p>

    <div class="mt-12 grid gap-10 md:grid-cols-[1.6fr_1fr] md:items-start">
      <div class="border border-chalk/12 p-8">
        <p class="type-body text-mute">
          This is the measurement in the set that the frontend cannot fix. No
          amount of image optimisation, code splitting or lazy loading moves it:
          the browser is simply waiting for the first byte, and every paint that
          follows starts late because of it.
        </p>
        <p class="type-body mt-4 text-mute">
          It is included for exactly that reason. “The site is slow” is not
          automatically a frontend ticket, and this is the row that proves it.
        </p>
      </div>

      <MetricReadout :value="ttfb" :good="800" :poor="1800">
        <template #label>
          Time to First Byte
        </template>
      </MetricReadout>
    </div>
  </section>
</template>
