<script setup lang="ts">
/**
 * Whole-text entrance that pulls from heavy blur to crisp, with a subtle
 * upward drift and scale settle.
 *
 * A faithful port of smoothui's `focus-blur-resolve`, which is React plus the
 * `motion` runtime. Every value is carried over unchanged — 0.76s,
 * `cubic-bezier(0.22, 1, 0.36, 1)`, `blur(14px)`, `y: 14`, `scale: 1.01` — but
 * driven by CSS rather than a JS animation loop, so the text still resolves
 * when scripting fails and nothing is added to the bundle.
 */
const {
  text,
  delay = 0,
  duration = 760,
  triggerOnView = false,
} = defineProps<{
  // The line to animate. Kept as a prop rather than a slot so it can also be
  // the accessible label on the wrapper.
  text: string

  // Delay before the animation starts, in milliseconds.
  delay?: number

  /**
   * Duration in milliseconds. The original ships 760ms, which reads well at
   * body and section sizes; a hero set at 9.5rem resolves across so much more
   * area that the same duration feels hurried, so large lines pass a longer one.
   */
  duration?: number

  // Animate only once the text scrolls into view.
  triggerOnView?: boolean
}>()

const root = ref<HTMLElement | null>(null)

// A view-triggered line starts resolved and is only animated once the observer
// fires, so it stays readable if scripting never runs.
const hasEntered = ref(!triggerOnView)

onMounted(() => {
  if (!triggerOnView || !root.value)
    return

  const observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) {
      hasEntered.value = true
      observer.disconnect()
    }
  }, { threshold: 0.25 })

  observer.observe(root.value)
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <span ref="root" :aria-label="text">
    <span
      class="focus-blur-resolve"
      :class="{ 'is-playing': hasEntered }"
      :style="{ animationDelay: `${delay}ms`, animationDuration: `${duration}ms` }"
      aria-hidden="true"
    >{{ text }}</span>
  </span>
</template>

<style scoped>
.focus-blur-resolve {
  display: inline-block;
}

.focus-blur-resolve.is-playing {
  animation: focus-blur-resolve cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes focus-blur-resolve {
  from {
    filter: blur(14px);
    opacity: 0;
    transform: translateY(14px) scale(1.01);
  }

  to {
    filter: blur(0);
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* The original renders instantly with no animation at all. */
@media (prefers-reduced-motion: reduce) {
  .focus-blur-resolve.is-playing {
    animation: none;
  }
}
</style>
