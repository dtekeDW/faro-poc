<script setup lang="ts">
const { isDegraded } = defineProps<{ isDegraded: boolean }>()

interface Frame {
  id: number
  title: string
  place: string
  format: string
  month: string
}

const FORMATS = ['Brand Film', 'Documentary', 'Commercial', 'Product'] as const

const PLACES = [
  ['Kyoto', 'October 2026'], ['Reykjavík', 'March 2026'], ['Lisbon', 'June 2025'],
  ['Oaxaca', 'January 2026'], ['Tallinn', 'August 2025'], ['Busan', 'April 2026'],
] as const

const frames: Frame[] = Array.from({ length: 18 }, (_, index) => {
  const [place, month] = PLACES[index % PLACES.length]!
  return {
    id: index + 1,
    title: ['Northbound', 'After School', 'Capsule', 'The Archive', 'Long Coast', 'Signal'][index % 6]!,
    place,
    month,
    format: FORMATS[index % FORMATS.length]!,
  }
})

const activeFormat = ref<string | null>(null)
const visible = computed(() =>
  activeFormat.value ? frames.filter(f => f.format === activeFormat.value) : frames,
)

const stage = ref<HTMLElement | null>(null)
const cards = ref<HTMLElement[]>([])

/** Orbit position in turns. Advanced by rAF, nudged by drag. */
const offset = ref(0)
const isDragging = ref(false)
const isPaused = ref(false)
const lightbox = ref<Frame | null>(null)

/** Index nearest the front of the orbit — the one the caption describes. */
const frontIndex = computed(() => {
  const count = visible.value.length
  if (!count)
    return 0

  return ((Math.round(-offset.value * count) % count) + count) % count
})

const front = computed(() => visible.value[frontIndex.value] ?? null)

function layout() {
  const count = visible.value.length
  if (!count)
    return

  for (let index = 0; index < count; index++) {
    const node = cards.value[index]
    if (!node)
      continue

    const theta = ((index / count) + offset.value) * Math.PI * 2
    const depth = Math.cos(theta)

    const x = Math.sin(theta) * 46
    const z = depth * 28
    // Gentle vertical arc so the ring reads as a tilted orbit, not a carousel.
    const y = Math.sin(theta * 2) * 4
    const scale = 0.62 + (depth + 1) * 0.24
    const near = (depth + 1) / 2

    node.style.zIndex = String(Math.round(near * 100))
    node.style.opacity = String(0.18 + near * 0.82)
    node.style.filter = near > 0.86 ? 'none' : `blur(${((1 - near) * 5).toFixed(2)}px)`

    if (isDegraded) {
      // Positioning through layout properties forces a full reflow of the ring
      // on every frame. Same visual result, a main thread that never rests.
      node.style.left = `${50 + x}%`
      node.style.top = `${50 + y}%`
      node.style.width = `${scale * 46}%`
      node.style.marginLeft = `${-scale * 23}%`
      void node.offsetHeight
    }
    else {
      node.style.transform =
        `translate3d(calc(-50% + ${x}cqw), calc(-50% + ${y}cqh), ${z}px) scale(${scale.toFixed(3)})`
    }
  }
}

let raf = 0
let last = 0

function tick(now: number) {
  const delta = last ? (now - last) / 1000 : 0
  last = now

  if (!isPaused.value && !isDragging.value)
    offset.value += delta / 26

  layout()
  raf = requestAnimationFrame(tick)
}

/**
 * Filtering rebuilds the ring. The degraded path runs a quadratic pass first —
 * the shape of the accidental O(n²) work that hides in real filter handlers.
 */
function selectFormat(format: string | null) {
  if (isDegraded) {
    let sink = 0
    for (let i = 0; i < frames.length; i++)
      for (let j = 0; j < 70_000; j++)
        sink += (i * j) % 7
    void sink
  }

  activeFormat.value = format
  offset.value = 0
  cards.value = []
  nextTick(layout)
}

let dragX = 0

function onPointerDown(event: PointerEvent) {
  isDragging.value = true
  dragX = event.clientX
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!isDragging.value)
    return

  const width = stage.value?.clientWidth ?? 1
  offset.value += (event.clientX - dragX) / width * 0.6
  dragX = event.clientX
}

function onPointerUp() {
  isDragging.value = false
}

function stepTo(index: number) {
  const count = visible.value.length
  offset.value = -index / count
}

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  isPaused.value = reduced
  layout()
  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => cancelAnimationFrame(raf))

watch(visible, () => nextTick(layout))
</script>

<template>
  <section id="gallery" class="py-24 md:py-32">
    <div class="flex flex-wrap items-end justify-between gap-8 px-6 md:px-10">
      <h2 class="max-w-[12ch] text-[11vw] font-extrabold leading-[0.86] tracking-[-0.05em] md:text-[5.5vw]">
        Stills from the cutting room
      </h2>

      <div data-testid="gallery-filter" class="flex flex-wrap gap-2">
        <button
          type="button"
          :data-active="activeFormat === null"
          class="cursor-pointer rounded-full border border-chalk/20 px-4 py-1.5 text-sm transition-colors duration-300 hover:border-chalk/50 data-[active=true]:border-dodger data-[active=true]:bg-dodger data-[active=true]:text-ink"
          @click="selectFormat(null)"
        >
          All <span class="tnum opacity-60">{{ frames.length }}</span>
        </button>
        <button
          v-for="format in FORMATS"
          :key="format"
          type="button"
          :data-active="activeFormat === format"
          class="cursor-pointer rounded-full border border-chalk/20 px-4 py-1.5 text-sm transition-colors duration-300 hover:border-chalk/50 data-[active=true]:border-dodger data-[active=true]:bg-dodger data-[active=true]:text-ink"
          @click="selectFormat(format)"
        >
          {{ format }}
        </button>
      </div>
    </div>

    <!--
      The ring lives in its own container-query context so the card offsets can
      be expressed in cqw/cqh and stay proportional at every viewport.
    -->
    <div
      ref="stage"
      data-testid="orbit"
      class="relative mt-14 h-[58vh] min-h-[380px] cursor-grab touch-pan-y select-none [container-type:size] [perspective:1400px] active:cursor-grabbing"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @mouseenter="isPaused = true"
      @mouseleave="isPaused = false"
    >
      <div
        v-for="(frame, index) in visible"
        :key="frame.id"
        :ref="el => { if (el) cards[index] = el as HTMLElement }"
        class="absolute left-1/2 top-1/2 w-[46cqw] max-w-[520px] [transform-style:preserve-3d] will-change-transform"
      >
        <button
          type="button"
          class="block w-full cursor-pointer overflow-hidden bg-ink-raised shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)]"
          @click="lightbox = frame"
        >
          <span class="sr-only">Open {{ frame.title }}, {{ frame.place }}</span>
          <img
            :src="`https://picsum.photos/seed/orbit-${frame.id}/${isDegraded ? 1600 : 960}/${isDegraded ? 900 : 540}`"
            :width="isDegraded ? undefined : 960"
            :height="isDegraded ? undefined : 540"
            loading="lazy"
            decoding="async"
            alt=""
            class="aspect-video w-full object-cover"
          >
        </button>
      </div>

      <!-- Caption rides above the ring, naming whichever frame is at the front. -->
      <div class="pointer-events-none absolute inset-x-0 bottom-6 z-[110] text-center">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          enter-from-class="opacity-0 translate-y-2"
          leave-active-class="transition duration-200"
          leave-to-class="opacity-0"
        >
          <p v-if="front" :key="front.id">
            <span class="block text-[9vw] font-extrabold uppercase leading-none tracking-[0.04em] md:text-[3.4vw]">
              {{ front.place }}
            </span>
            <span class="mt-3 block text-[11px] font-bold uppercase tracking-[0.42em] text-mute">
              {{ front.month }}
            </span>
          </p>
        </Transition>
      </div>
    </div>

    <div class="mt-8 flex items-center justify-center gap-2 px-6">
      <button
        v-for="(frame, index) in visible"
        :key="frame.id"
        type="button"
        :aria-label="`Show ${frame.place}`"
        :data-active="index === frontIndex"
        class="h-1 w-6 cursor-pointer rounded-full bg-chalk/20 transition-colors duration-300 hover:bg-chalk/45 data-[active=true]:bg-dodger"
        @click="stepTo(index)"
      />
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
        enter-from-class="opacity-0"
        leave-active-class="transition duration-250"
        leave-to-class="opacity-0"
      >
        <div
          v-if="lightbox"
          class="fixed inset-0 z-[200] grid place-items-center bg-ink/92 p-4 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          @click.self="lightbox = null"
        >
          <figure class="w-full max-w-4xl">
            <img
              :src="`https://picsum.photos/seed/orbit-${lightbox.id}/1400/787`"
              width="1400"
              height="787"
              alt=""
              class="max-h-[74vh] w-full object-contain"
            >
            <figcaption class="mt-4 flex items-center justify-between gap-6 text-sm">
              <span>
                <span class="font-medium">{{ lightbox.title }}</span>
                <span class="ml-3 font-accent text-lg italic text-mute">{{ lightbox.place }}</span>
              </span>
              <span class="tnum text-mute">{{ lightbox.month }}</span>
            </figcaption>
          </figure>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
