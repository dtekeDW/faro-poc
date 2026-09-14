<script setup lang="ts">
const { isDegraded } = defineProps<{ isDegraded: boolean }>()

const categories = [
  'Social Media', 'Brand Film', 'Product', 'UGC',
  'Documentary', 'Corporate', 'Commercial', 'Event',
]

const active = ref(categories[0]!)

/**
 * Blocks the main thread inside the click handler before committing state.
 * INP measures the whole path from input to next paint, so work done
 * synchronously here lands directly in the metric.
 */
function select(category: string) {
  if (isDegraded) {
    const until = performance.now() + 320
    while (performance.now() < until) { /* deliberate busy wait */ }
  }

  active.value = category
}
</script>

<template>
  <section id="playground" class="section">
    <h2 class="max-w-[12ch] type-section">
      Our playground
    </h2>

    <div data-testid="category-filter" class="mt-12 flex flex-wrap gap-2">
      <button
        v-for="category in categories"
        :key="category"
        type="button"
        :data-active="category === active"
        class="pill"
        @click="select(category)"
      >
        {{ category }}
      </button>
    </div>

    <p class="mt-8 text-sm text-mute">
      Showing work in <span class="type-title text-chalk">{{ active }}</span>
    </p>
  </section>
</template>
