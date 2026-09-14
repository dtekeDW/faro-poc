<script setup lang="ts">
const { isDegraded } = defineProps<{ isDegraded: boolean }>()

interface MotionViewInstance {
  canvas: HTMLCanvasElement
  destroy: () => void
}

declare global {
  interface Window {
    MotionView?: {
      mount: (target: string | HTMLElement, config: Record<string, unknown>) => MotionViewInstance
    }
  }
}

const FORMATS = ['Brand Film', 'Documentary', 'Commercial', 'Product'] as const

/** One reel per format. The caption pair drives the two MotionView text layers. */
const reels = {
  'All': { place: 'KYOTO', month: 'OCTOBER 2026', seed: 'kyoto' },
  'Brand Film': { place: 'REYKJAVÍK', month: 'MARCH 2026', seed: 'reykjavik' },
  'Documentary': { place: 'LISBON', month: 'JUNE 2025', seed: 'lisbon' },
  'Commercial': { place: 'OAXACA', month: 'JANUARY 2026', seed: 'oaxaca' },
  'Product': { place: 'BUSAN', month: 'AUGUST 2025', seed: 'busan' },
} as const

const activeFormat = ref<keyof typeof reels>('All')

const canvas = ref<HTMLCanvasElement | null>(null)
let instance: MotionViewInstance | null = null

// Degraded mode feeds 2400px originals into a canvas painted at ~900px, so the
// browser decodes roughly seven times the pixels it will ever show.
const edge = computed(() => (isDegraded ? 2400 : 960))

function imagesFor(seed: string) {
  return (REEL_IMAGES[seed] ?? []).map(
    id => photo(id, edge.value, Math.round(edge.value * 9 / 16)),
  )
}

/** Exactly the configuration from the MotionView studio export. */
function configFor(key: keyof typeof reels) {
  const reel = reels[key]

  return {
    familyKey: 'orbit',
    imageCount: 5,
    aspectId: '16:9',
    loopSec: 16,
    params: {
      big: 0.5,
      tilt: 0.55,
      window: 0.65,
      arc: 0.3,
      fade: 0.3,
      life: 0.5,
      persp: 0.2,
    },
    // The studio export ships 'paper', a cream ground that reads as a bright
    // slab on this page. Custom lets the canvas take the page ground exactly,
    // so the frames float instead of sitting in a box.
    bgId: 'custom',
    customBg: '#060606',
    radius: 0.02,
    focus: 0.4,
    focusMode: 'vignette',
    focusReach: 0.6,
    focusSoft: 2.2,
    easePts: [0.6, 0, 0.4, 1],
    images: imagesFor(reel.seed),
    texts: [
      {
        content: reel.place,
        x: 0.5,
        y: 0.465,
        size: 0.135,
        weight: 400,
        color: '#ffffff',
        font: 'display',
        tracking: 0.06,
        id: 'tx-place',
      },
      {
        content: reel.month,
        x: 0.5,
        y: 0.565,
        size: 0.0155,
        weight: 700,
        color: '#dcd6cc',
        font: 'sans',
        tracking: 0.46,
        id: 'tx-month',
      },
    ],
  }
}

function mount() {
  if (!canvas.value || !window.MotionView)
    return

  instance?.destroy()
  instance = window.MotionView.mount(canvas.value, configFor(activeFormat.value))
}

/**
 * Switching reels tears the canvas down and remounts it. The degraded path runs
 * a quadratic pass first — the shape of the accidental O(n²) work that hides in
 * real filter handlers, and it lands squarely in INP because it blocks the
 * click before the remount can paint.
 */
function selectFormat(format: keyof typeof reels) {
  if (isDegraded) {
    let sink = 0
    for (let i = 0; i < 40; i++)
      for (let j = 0; j < 90_000; j++)
        sink += (i * j) % 7
    void sink
  }

  activeFormat.value = format
  mount()
}

onMounted(() => {
  if (window.MotionView) {
    mount()
    return
  }

  const script = document.createElement('script')
  script.src = '/motionview-runtime.js'
  script.onload = () => mount()
  document.head.appendChild(script)
})

onBeforeUnmount(() => instance?.destroy())
</script>

<template>
  <section id="gallery" class="py-24 md:py-32">
    <div class="flex flex-wrap items-end justify-between gap-8 px-6 md:px-10">
      <h2 class="max-w-[12ch] type-section">
        <PerCharacterRise text="Stills from the cutting room" trigger-on-view />
      </h2>

      <div data-testid="gallery-filter" class="flex flex-wrap gap-2">
        <button
          v-for="key in (['All', ...FORMATS] as (keyof typeof reels)[])"
          :key="key"
          type="button"
          :data-active="activeFormat === key"
          class="pill"
          @click="selectFormat(key)"
        >
          {{ key }}
        </button>
      </div>
    </div>

    <!-- Full bleed: with the canvas ground matched to the page, any width cap
         would read as a framed box rather than as frames floating on the page. -->
    <canvas
      ref="canvas"
      data-testid="orbit"
      class="photo mt-14 block w-full"
    />
  </section>
</template>
