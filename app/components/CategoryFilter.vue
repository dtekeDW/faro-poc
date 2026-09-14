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
  <section id="playground" class="px-6 py-24 md:px-10 md:py-32">
    <h2 class="max-w-[12ch] text-[11vw] font-extrabold leading-[0.86] tracking-[-0.05em] md:text-[5.5vw]">
      Our playground
    </h2>

    <div data-testid="category-filter" class="mt-12 flex flex-wrap gap-2">
      <button
        v-for="category in categories"
        :key="category"
        type="button"
        :data-active="category === active"
        class="cursor-pointer rounded-full border border-chalk/20 px-5 py-2 text-sm transition-colors duration-300 hover:border-chalk/50 data-[active=true]:border-dodger data-[active=true]:bg-dodger data-[active=true]:text-ink"
        @click="select(category)"
      >
        {{ category }}
      </button>
    </div>

    <p class="mt-8 text-sm text-mute">
      Showing work in <span class="font-accent text-lg italic text-chalk">{{ active }}</span>
    </p>
  </section>
</template>
