<script setup lang="ts">
/**
 * Pulls whatever it wraps toward the pointer.
 *
 * A port of smoothui's `magnetic-button`, values carried over unchanged:
 * `strength 0.3`, `radius 150`, and the spring's 0.4s settle. Two deviations
 * the site requires. The original *is* a button; this wraps an existing
 * control instead, because the element it pulls here is a link and should stay
 * one. And the spring is a transition on the same 0.4s rather than the motion
 * runtime's — the pointer already supplies the position each frame, so what is
 * left for the spring to do is the settle back to centre.
 *
 * The effect is skipped entirely without a fine pointer: on a touch screen
 * there is no cursor to be attracted to, and the padding that widens the
 * catchment would only swallow taps.
 */
const { strength = 0.3, radius = 150 } = defineProps<{
  // How far the element travels toward the pointer, as a fraction of distance.
  strength?: number

  // Catchment in pixels. Outside it the element sits still.
  radius?: number
}>()

const target = ref<HTMLElement | null>(null)
const offset = ref({ x: 0, y: 0 })
const isPullable = ref(false)

onMounted(() => {
  isPullable.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

function pull(event: MouseEvent) {
  const element = target.value
  if (!isPullable.value || !element)
    return

  const rect = element.getBoundingClientRect()
  const x = event.clientX - (rect.left + rect.width / 2)
  const y = event.clientY - (rect.top + rect.height / 2)
  const distance = Math.hypot(x, y)

  if (distance >= radius) {
    release()
    return
  }

  const falloff = (1 - distance / radius) * strength

  offset.value = { x: x * falloff, y: y * falloff }
}

function release() {
  offset.value = { x: 0, y: 0 }
}
</script>

<template>
  <span
    class="magnetic"
    :style="{ margin: `-${radius / 2}px`, padding: `${radius / 2}px` }"
    @mousemove="pull"
    @mouseleave="release"
  >
    <span
      ref="target"
      class="magnetic-target"
      :style="{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }"
    ><slot /></span>
  </span>
</template>

<style scoped>
.magnetic {
  display: inline-block;
}

.magnetic-target {
  display: inline-block;
  transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  .magnetic-target {
    transform: none !important;
    transition: none;
  }
}
</style>
