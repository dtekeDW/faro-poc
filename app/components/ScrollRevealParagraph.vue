<script setup lang="ts">
/**
 * A paragraph that lights up word by word as it is scrolled into place.
 *
 * A port of smoothui's `scroll-reveal-paragraph`. The original drives each
 * word's opacity from a `useScroll` progress value between the offsets
 * `start 0.9` and `start 0.25` — the reveal begins when the paragraph's top
 * edge is nine tenths down the viewport and completes a quarter of the way
 * down. Those two offsets are carried over exactly; the progress is read from
 * `getBoundingClientRect` on a scroll listener rather than from the motion
 * runtime, so the page carries no animation library.
 *
 * Every word is rendered twice: a dim copy holding the space, and a lit copy
 * over it whose opacity is the animated value. Only the lit copy is exposed to
 * assistive technology — the original reads the text twice.
 */
const { text } = defineProps<{ text: string }>()

const REVEAL_START = 0.9
const REVEAL_END = 0.25

const words = computed(() => text.split(' '))
const root = ref<HTMLElement | null>(null)
const progress = ref(0)

function opacityFor(index: number) {
  const span = 1 / words.value.length
  const start = index * span

  return Math.min(Math.max((progress.value - start) / span, 0), 1)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    progress.value = 1
    return
  }

  let frame = 0

  const measure = () => {
    frame = 0

    const element = root.value
    if (!element)
      return

    const from = window.innerHeight * REVEAL_START
    const to = window.innerHeight * REVEAL_END
    const top = element.getBoundingClientRect().top

    progress.value = Math.min(Math.max((from - top) / (from - to), 0), 1)
  }

  const schedule = () => {
    // Coalesced into one frame: scroll fires far more often than the screen
    // is painted, and a layout read per event is how a smooth page starts to
    // stutter under the thumb.
    if (!frame)
      frame = requestAnimationFrame(measure)
  }

  measure()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    if (frame)
      cancelAnimationFrame(frame)
  })
})
</script>

<template>
  <p ref="root">
    <span
      v-for="(word, index) in words"
      :key="`${index}-${word}`"
      class="srp-word"
    ><span class="srp-dim" aria-hidden="true">{{ word }}</span><span
      class="srp-lit"
      :style="{ opacity: opacityFor(index) }"
    >{{ word }}</span></span>
  </p>
</template>

<style scoped>
.srp-word {
  position: relative;
  display: inline-block;
  margin-right: 0.28em;
}

.srp-dim {
  color: color-mix(in oklab, var(--color-chalk) 14%, transparent);
}

.srp-lit {
  position: absolute;
  inset: 0;
  color: var(--color-chalk);
}
</style>
