<script setup lang="ts">
/**
 * Letters slide up from below with no blur — crisp and deliberate.
 *
 * A faithful port of smoothui's `per-character-rise`, values carried over
 * unchanged: 0.7s on `cubic-bezier(0.2, 0.8, 0.2, 1)`, a 24ms per-character
 * stagger, from `opacity 0` and `y 32`.
 *
 * One correction the original needs on this site: it emits every character as
 * its own inline-block, which lets a line break fall inside a word. Characters
 * are grouped per word here, so the stagger is identical while words stay
 * whole — the section headings run to three lines and would otherwise split.
 */
const {
  text,
  delay = 0,
  stagger = 24,
  triggerOnView = false,
} = defineProps<{
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
  <span ref="root" :aria-label="text" class="per-character-rise">
    <span
      v-for="word in words"
      :key="word.key"
      class="pcr-word"
      aria-hidden="true"
    ><span
      v-for="character in word.characters"
      :key="character.index"
      class="pcr-char"
      :class="{ 'is-playing': hasEntered }"
      :style="{ animationDelay: `${delay + character.index * stagger}ms` }"
    >{{ character.character }}</span><span
      class="pcr-char"
      :class="{ 'is-playing': hasEntered }"
      :style="{ animationDelay: `${delay + word.space * stagger}ms` }"
    >&nbsp;</span></span>
  </span>
</template>

<style scoped>
.pcr-word {
  display: inline-block;
  white-space: nowrap;
}

.pcr-char {
  display: inline-block;
  white-space: pre;
  opacity: 0;
}

.pcr-char.is-playing {
  animation: per-character-rise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

@keyframes per-character-rise {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}

/* The original renders instantly with no animation at all. */
@media (prefers-reduced-motion: reduce) {
  .pcr-char {
    opacity: 1;
  }

  .pcr-char.is-playing {
    animation: none;
  }
}
</style>
