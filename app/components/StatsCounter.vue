<script setup lang="ts">
const stats = [
  { value: 8, suffix: '', label: 'Years creating' },
  { value: 412, suffix: '', label: 'Videos delivered' },
  { value: 120, suffix: '+', label: 'Creative partners' },
  { value: 87, suffix: '%', label: 'Repeat clients' },
]

const shown = ref(stats.map(() => 0))
const root = ref<HTMLElement | null>(null)

/**
 * Counts up once, when the block first reaches the viewport. Driven by rAF
 * rather than a transition because the values are text, and eased so the
 * numbers decelerate into place instead of ticking linearly.
 */
function run() {
  const started = performance.now()
  const duration = 1600

  function frame(now: number) {
    const t = Math.min((now - started) / duration, 1)
    const eased = 1 - (1 - t) ** 4

    shown.value = stats.map(stat => Math.round(stat.value * eased))

    if (t < 1)
      requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}

onMounted(() => {
  if (!root.value)
    return

  const observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) {
      run()
      observer.disconnect()
    }
  }, { threshold: 0.35 })

  observer.observe(root.value)
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <section ref="root" class="border-y border-chalk/10 section">
    <dl class="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
      <div v-for="(stat, index) in stats" :key="stat.label">
        <dt class="text-sm text-mute">
          {{ stat.label }}
        </dt>
        <dd class="type-data mt-2 type-section">
          {{ shown[index] }}<span class="text-dodger">{{ stat.suffix }}</span>
        </dd>
      </div>
    </dl>
  </section>
</template>
