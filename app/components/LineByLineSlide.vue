<script setup lang="ts">
/**
 * Lines slide in from the left, one after the other — the staggered subhead
 * from Apple's landing pages.
 *
 * A faithful port of smoothui's `line-by-line-slide`, values carried over
 * unchanged: 0.9s on `cubic-bezier(0.22, 1, 0.36, 1)`, a 120ms per-line
 * stagger, from `opacity 0` and `x -48`.
 *
 * The original takes a string split on newlines. That is kept, and a slot is
 * added beside it: a line here carries marked-up numbers, which a plain string
 * cannot. Each direct child of the slot is one line.
 */
const {
  lines,
  delay = 0,
  stagger = 120,
  triggerOnView = false,
} = defineProps<{
  // Explicit lines. Omit to supply them as slot children instead.
  lines?: string[]

  // Delay before the animation starts, in milliseconds.
  delay?: number

  // Per-line stagger, in milliseconds.
  stagger?: number

  // Animate only once the text scrolls into view.
  triggerOnView?: boolean
}>()

const root = ref<HTMLElement | null>(null)
const hasEntered = ref(!triggerOnView)

/**
 * Only the string form hides its lines from assistive technology, because
 * only it can put the whole text back together as a label. Slot lines stay
 * readable as themselves.
 */
const label = computed(() => lines?.join(' '))

onMounted(() => {
  if (!triggerOnView || !root.value)
    return

  const observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) {
      hasEntered.value = true
      observer.disconnect()
    }
  }, { threshold: 0.2 })

  observer.observe(root.value)
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <span ref="root" :aria-label="label" class="line-by-line-slide">
    <template v-if="lines">
      <span
        v-for="(line, index) in lines"
        :key="index"
        class="lbls-line"
        :class="{ 'is-playing': hasEntered }"
        :style="{ animationDelay: `${delay + index * stagger}ms` }"
        aria-hidden="true"
      >{{ line }}</span>
    </template>

    <template v-else>
      <span
        v-for="(line, index) in $slots.default?.() ?? []"
        :key="index"
        class="lbls-line"
        :class="{ 'is-playing': hasEntered }"
        :style="{ animationDelay: `${delay + index * stagger}ms` }"
      ><component :is="line" /></span>
    </template>
  </span>
</template>

<style scoped>
.line-by-line-slide {
  display: block;
}

.lbls-line {
  display: block;
  opacity: 0;
}

.lbls-line.is-playing {
  animation: line-by-line-slide 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes line-by-line-slide {
  from {
    opacity: 0;
    transform: translateX(-48px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* The original renders instantly with no animation at all. */
@media (prefers-reduced-motion: reduce) {
  .lbls-line {
    opacity: 1;
  }

  .lbls-line.is-playing {
    animation: none;
  }
}
</style>
