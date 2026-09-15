<script setup lang="ts">
/**
 * Replaces the pointer inside its region with a dot that swells into a label
 * over anything carrying `data-cursor-text`.
 *
 * A port of smoothui's `cursor-follow`, values carried over: a 16px dot, a
 * 40px tall bubble, 32px of padding around the label. The original springs the
 * position with `damping 40, stiffness 350`; here the dot follows on a short
 * transition, which lands in the same place — a touch behind the pointer,
 * catching up as it stops.
 *
 * Only ever on a fine pointer. Hiding the system cursor on a touch device
 * hides nothing and leaves a dot chasing taps.
 */
const label = ref<string | null>(null)
const position = ref({ x: 0, y: 0 })
const isActive = ref(false)
const hasPointer = ref(false)

onMounted(() => {
  hasPointer.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
})

function track(event: MouseEvent) {
  if (!hasPointer.value)
    return

  isActive.value = true
  position.value = { x: event.clientX, y: event.clientY }

  const element = (event.target as HTMLElement | null)?.closest('[data-cursor-text]')

  label.value = element?.getAttribute('data-cursor-text') ?? null
}

function leave() {
  isActive.value = false
  label.value = null
}
</script>

<template>
  <div
    class="cursor-follow"
    :class="{ 'is-taking-over': hasPointer }"
    @mousemove="track"
    @mouseleave="leave"
  >
    <slot />

    <Teleport to="body">
      <div
        v-if="hasPointer && isActive"
        class="cursor-bubble"
        :class="{ 'has-label': label }"
        :style="{ transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)` }"
        aria-hidden="true"
      >
        <span v-if="label" class="type-micro">{{ label }}</span>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.cursor-follow.is-taking-over,
.cursor-follow.is-taking-over :deep(*) {
  cursor: none;
}

.cursor-bubble {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background-color: var(--color-dodger);
  color: var(--color-ink);
  pointer-events: none;
  transition:
    width 400ms var(--ease-out-expo),
    height 400ms var(--ease-out-expo),
    transform 90ms linear;
}

.cursor-bubble.has-label {
  width: auto;
  height: 40px;
  padding-inline: 16px;
}

@media (prefers-reduced-motion: reduce) {
  .cursor-bubble {
    transition: none;
  }
}
</style>
