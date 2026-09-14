<script setup lang="ts">
const { isDegraded } = defineProps<{ isDegraded: boolean }>()

interface Frame {
  id: number
  title: string
  format: string
  aspect: 'tall' | 'wide' | 'square'
}

const FORMATS = ['Brand Film', 'Documentary', 'Commercial', 'Product'] as const

const frames: Frame[] = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  title: ['Northbound', 'After School', 'Capsule', 'The Archive', 'Long Coast', 'Signal'][index % 6]!,
  format: FORMATS[index % FORMATS.length]!,
  aspect: (['tall', 'wide', 'square'] as const)[index % 3]!,
}))

const activeFormat = ref<string | null>(null)
const lightboxIndex = ref<number | null>(null)

const visible = computed(() =>
  activeFormat.value
    ? frames.filter(frame => frame.format === activeFormat.value)
    : frames,
)

const current = computed(() =>
  lightboxIndex.value === null ? null : visible.value[lightboxIndex.value] ?? null,
)

const spans: Record<Frame['aspect'], string> = {
  tall: 'row-span-2 aspect-[3/4]',
  wide: 'md:col-span-2 aspect-[16/10]',
  square: 'aspect-square',
}

function sizeFor(frame: Frame) {
  // Degraded mode ships one oversized original for every tile regardless of
  // the slot it lands in, so the browser decodes far more pixels than it paints.
  if (isDegraded)
    return { w: 1600, h: 1600 }

  return frame.aspect === 'tall'
    ? { w: 600, h: 800 }
    : frame.aspect === 'wide'
      ? { w: 1000, h: 625 }
      : { w: 700, h: 700 }
}

/**
 * Filtering re-sorts the full set on every click. The optimized path does the
 * obvious thing; the degraded path runs a deliberately quadratic pass first,
 * which is the shape of the accidental O(n²) work that shows up in real
 * filter and sort handlers.
 */
function selectFormat(format: string | null) {
  if (isDegraded) {
    let sink = 0
    for (let i = 0; i < frames.length; i++)
      for (let j = 0; j < 90_000; j++)
        sink += (i * j) % 7

    void sink
  }

  activeFormat.value = format
  lightboxIndex.value = null
}

function open(index: number) {
  lightboxIndex.value = index
}

function step(delta: number) {
  if (lightboxIndex.value === null)
    return

  const next = lightboxIndex.value + delta
  lightboxIndex.value = (next + visible.value.length) % visible.value.length
}

function onKey(event: KeyboardEvent) {
  if (lightboxIndex.value === null)
    return

  if (event.key === 'Escape')
    lightboxIndex.value = null
  if (event.key === 'ArrowRight')
    step(1)
  if (event.key === 'ArrowLeft')
    step(-1)
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <section id="gallery" class="px-6 py-24 md:px-10 md:py-32">
    <div class="flex flex-wrap items-end justify-between gap-8">
      <h2 class="max-w-[12ch] text-[11vw] font-extrabold leading-[0.86] tracking-[-0.05em] md:text-[5.5vw]">
        Stills from the cutting room
      </h2>

      <div data-testid="gallery-filter" class="flex flex-wrap gap-2">
        <button
          type="button"
          :data-active="activeFormat === null"
          class="cursor-pointer rounded-full border border-chalk/20 px-4 py-1.5 text-sm transition-colors duration-300 data-[active=true]:border-dodger data-[active=true]:bg-dodger data-[active=true]:text-ink"
          @click="selectFormat(null)"
        >
          All <span class="tnum opacity-60">{{ frames.length }}</span>
        </button>
        <button
          v-for="format in FORMATS"
          :key="format"
          type="button"
          :data-active="activeFormat === format"
          class="cursor-pointer rounded-full border border-chalk/20 px-4 py-1.5 text-sm transition-colors duration-300 data-[active=true]:border-dodger data-[active=true]:bg-dodger data-[active=true]:text-ink"
          @click="selectFormat(format)"
        >
          {{ format }}
        </button>
      </div>
    </div>

    <ul
      data-testid="gallery-grid"
      class="mt-12 grid auto-rows-[minmax(0,auto)] grid-cols-2 gap-3 md:grid-cols-4"
    >
      <li
        v-for="(frame, index) in visible"
        :key="frame.id"
        :class="spans[frame.aspect]"
        class="group relative overflow-hidden bg-ink-raised"
      >
        <button
          type="button"
          class="size-full cursor-pointer"
          @click="open(index)"
        >
          <span class="sr-only">Open {{ frame.title }}</span>
          <img
            :src="`https://picsum.photos/seed/frame-${frame.id}/${sizeFor(frame).w}/${sizeFor(frame).h}`"
            :width="isDegraded ? undefined : sizeFor(frame).w"
            :height="isDegraded ? undefined : sizeFor(frame).h"
            loading="lazy"
            decoding="async"
            alt=""
            class="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          >
          <span
            class="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-ink/90 to-transparent px-3 pb-3 pt-10 text-left opacity-0 transition-opacity duration-400 group-hover:opacity-100"
          >
            <span class="text-sm font-medium">{{ frame.title }}</span>
            <span class="tnum text-xs text-dodger">{{ String(frame.id).padStart(2, '0') }}</span>
          </span>
        </button>
      </li>
    </ul>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
        enter-from-class="opacity-0 backdrop-blur-none"
        leave-active-class="transition duration-250"
        leave-to-class="opacity-0"
      >
        <div
          v-if="current"
          class="fixed inset-0 z-[60] grid place-items-center bg-ink/92 p-4 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          @click.self="lightboxIndex = null"
        >
          <figure class="max-h-full w-full max-w-4xl">
            <img
              :src="`https://picsum.photos/seed/frame-${current.id}/1400/900`"
              width="1400"
              height="900"
              alt=""
              class="max-h-[75vh] w-full rounded-sm object-contain"
            >
            <figcaption class="mt-4 flex items-center justify-between gap-6 text-sm">
              <span>
                <span class="font-medium">{{ current.title }}</span>
                <span class="ml-3 font-accent italic text-mute">{{ current.format }}</span>
              </span>
              <span class="tnum text-mute">
                {{ String((lightboxIndex ?? 0) + 1).padStart(2, '0') }} / {{ String(visible.length).padStart(2, '0') }}
              </span>
            </figcaption>
          </figure>

          <button
            type="button"
            class="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-chalk/20 transition-colors hover:border-dodger hover:bg-dodger hover:text-ink"
            @click.stop="step(-1)"
          >
            <span class="sr-only">Previous</span>
            <svg viewBox="0 0 24 24" class="size-4" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.75" /></svg>
          </button>
          <button
            type="button"
            class="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-chalk/20 transition-colors hover:border-dodger hover:bg-dodger hover:text-ink"
            @click.stop="step(1)"
          >
            <span class="sr-only">Next</span>
            <svg viewBox="0 0 24 24" class="size-4" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.75" /></svg>
          </button>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
