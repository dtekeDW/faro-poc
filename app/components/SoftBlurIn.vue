<script setup lang="ts">
/**
 * Characters fade in from a soft blur with a gentle upward drift — Apple's
 * hero-title reveal.
 *
 * A faithful port of smoothui's `soft-blur-in`, which is React plus the
 * `motion` runtime. Every value is carried over unchanged: 0.9s on
 * `cubic-bezier(0.22, 1, 0.36, 1)`, a 25ms per-character stagger, from
 * `blur(12px)`, `opacity 0` and `y 16`. CSS drives it instead of a JS
 * animation loop, so the text still arrives when scripting fails.
 *
 * One correction the original needs on this site: it emits every character as
 * its own inline-block, which lets a line break fall inside a word. Characters
 * are grouped per word here, so the stagger is identical while words stay
 * whole — the hero runs to two lines and would otherwise split.
 */
const {
  text,
  delay = 0,
  stagger = 25,
  triggerOnView = false,
} = defineProps<{
  // The line to animate. Kept as a prop rather than a slot so it can also be
  // the accessible label on the wrapper.
  text: string

  // Delay before the animation starts, in milliseconds.
  delay?: number

  // Per-character stagger, in milliseconds.
  stagger?: number

  // Animate only once the text scrolls into view.
  triggerOnView?: boolean
}>()

/** Words carrying their characters, each with its index in the whole string. */
const words = computed(() => {
  let index = 0

  return text.split(' ').map(word => ({
    key: `${word}-${index}`,
    characters: Array.from(word).map(character => ({ character, index: index++ })),
    // Consume the separating space so the stagger keeps counting through it.
    space: index++,
  }))
})

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
  }, { threshold: 0.2 })

  observer.observe(root.value)
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <span ref="root" :aria-label="text" class="soft-blur-in">
    <span
      v-for="word in words"
      :key="word.key"
      class="sbi-word"
      aria-hidden="true"
    ><span
      v-for="character in word.characters"
      :key="character.index"
      class="sbi-char"
      :class="{ 'is-playing': hasEntered }"
      :style="{ animationDelay: `${delay + character.index * stagger}ms` }"
    >{{ character.character }}</span><span
      class="sbi-char"
      :class="{ 'is-playing': hasEntered }"
      :style="{ animationDelay: `${delay + word.space * stagger}ms` }"
    >&nbsp;</span></span>
  </span>
</template>

<style scoped>
.sbi-word {
  display: inline-block;
  white-space: nowrap;
}

.sbi-char {
  display: inline-block;
  white-space: pre;
  opacity: 0;
}

.sbi-char.is-playing {
  animation: soft-blur-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes soft-blur-in {
  from {
    filter: blur(12px);
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    filter: blur(0);
    opacity: 1;
    transform: translateY(0);
  }
}

/* The original renders instantly with no animation at all. */
@media (prefers-reduced-motion: reduce) {
  .sbi-char {
    opacity: 1;
  }

  .sbi-char.is-playing {
    animation: none;
  }
}
</style>
