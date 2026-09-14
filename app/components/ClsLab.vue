<script setup lang="ts">
interface Severity {
  id: string
  label: string
  /** Height in pixels the injected block occupies once it arrives. */
  height: number
  note: string
  /**
   * How many blocks arrive. More than one lands them inside a single burst,
   * which is the only way separate shifts ever add together.
   */
  bursts: number
}

/**
 * A shift's value is roughly how much of the viewport moved multiplied by how
 * far it travelled, so taller injected content scores disproportionately worse.
 * These three straddle the 0.1 and 0.25 thresholds in a single press.
 */
const severities: Severity[] = [
  { id: 'light', label: 'Light', height: 90, note: 'A thin notice bar. Noticeable, usually still inside the good band.', bursts: 1 },
  { id: 'heavy', label: 'Heavy', height: 340, note: 'An image block. Pushes most of the visible page down.', bursts: 1 },
  { id: 'severe', label: 'Severe', height: 720, note: 'A full hero arriving late. Everything the reader had found leaves the screen.', bursts: 1 },
  { id: 'storm', label: 'Storm', height: 260, note: 'Four separate arrivals, each a third of a second apart — they chain into one burst and their values add up.', bursts: 4 },
]

interface Block {
  key: string
  height: number
  label: string
}

const blocks = ref<Block[]>([])
const pending = ref(0)
const lastPressed = ref<Severity | null>(null)

/**
 * Shifts within 500ms of a user interaction carry `hadRecentInput` and are
 * excluded by design — an accordion opening is expected movement. Injecting on
 * click therefore provokes nothing at all, so the block is delayed past the
 * window, which is also how real offenders behave: an ad slot, a late consent
 * bar, a font swapping in after the paragraph has been read.
 */
const INPUT_EXCLUSION_MS = 900

/** Worst five-second burst — this is the reported metric. */
const cls = ref(0)
/** Everything that ever moved. Shown alongside to make the difference visible. */
const total = ref(0)

let windowValue = 0
let windowFirst = 0
let windowLast = 0

onMounted(() => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const shift = entry as PerformanceEntry & { value: number, hadRecentInput: boolean }
      if (shift.hadRecentInput)
        continue

      total.value += shift.value

      /*
       * The session-window rule from the web-vitals library: shifts join the
       * current burst while they stay within 1s of the previous one and 5s of
       * the first. CLS is the largest burst, never the sum — which is why a
       * page can shift all day and still score well if it never does it all at
       * once, and why one late hero scores worse than twenty small nudges.
       */
      if (windowValue && shift.startTime - windowLast < 1000 && shift.startTime - windowFirst < 5000) {
        windowValue += shift.value
      }
      else {
        windowValue = shift.value
        windowFirst = shift.startTime
      }

      windowLast = shift.startTime
      cls.value = Math.max(cls.value, windowValue)
    }
  })

  observer.observe({ type: 'layout-shift', buffered: true })
  onBeforeUnmount(() => observer.disconnect())
})

const timers: ReturnType<typeof setTimeout>[] = []

function provoke(severity: Severity) {
  lastPressed.value = severity
  pending.value++

  for (let index = 0; index < severity.bursts; index++) {
    // Spaced under a second apart so consecutive arrivals chain into the same
    // five-second burst rather than each starting a new one.
    timers.push(setTimeout(() => {
      blocks.value = [...blocks.value, {
        key: `${severity.id}-${Date.now()}-${index}`,
        height: severity.height,
        label: severity.label,
      }]

      if (index === severity.bursts - 1)
        pending.value--
    }, INPUT_EXCLUSION_MS + index * 320))
  }
}

function reset() {
  blocks.value = []
  cls.value = 0
  total.value = 0
  windowValue = 0
}

onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <section>
    <div data-testid="cls-triggers" class="flex flex-wrap gap-3">
      <button
        v-for="severity in severities"
        :key="severity.id"
        type="button"
        :data-active="lastPressed?.id === severity.id"
        class="pill"
        @click="provoke(severity)"
      >
        {{ severity.label }}
        <span class="type-data ml-2 opacity-60">{{ severity.height }}px</span>
      </button>
      <button type="button" class="pill" @click="reset()">
        Clear
      </button>
    </div>

    <p v-if="lastPressed" class="type-body mt-6 text-sm text-mute">
      {{ lastPressed.note }}
    </p>

    <p v-if="pending" class="type-data mt-4 text-sm text-dodger">
      shifting in a moment…
    </p>

    <div class="mt-12 grid gap-10 md:grid-cols-[1.6fr_1fr] md:items-start">
      <div data-testid="cls-stage" class="border border-chalk/12 p-6">
        <p class="type-body text-mute">
          This paragraph has not changed. Everything that moves it was inserted
          above it after the page had settled — which is precisely what
          Cumulative Layout Shift measures: content the reader had already
          located, moving out from under them.
        </p>
      </div>

      <div class="space-y-8">
        <MetricReadout :value="cls" unit="" :good="0.1" :poor="0.25" :digits="3">
          <template #label>
            Cumulative Layout Shift
          </template>
        </MetricReadout>

        <div class="rule border-t pt-6">
          <p class="text-xs text-mute">
            Sum of every shift
          </p>
          <p class="type-data mt-2 text-3xl text-mute">
            {{ total.toFixed(3) }}
          </p>
          <p class="type-body mt-4 text-xs text-mute">
            The reported score is the worst five-second burst, not this sum.
            Shifts join a burst while they land within a second of the previous
            one. Twenty small nudges spread over a minute score far better than
            one late hero — which is why pressing
            <span class="text-chalk">Severe</span> once beats pressing
            <span class="text-chalk">Light</span> twenty times.
          </p>
        </div>
      </div>
    </div>

    <!--
      Injected at the very top of the page rather than inside this box. A shift
      is scored by how much of the viewport moved times how far it travelled,
      so displacing everything on screen scores an order of magnitude worse
      than nudging one paragraph that has already scrolled out of view.
    -->
    <Teleport to="#shift-zone">
      <div
        v-for="block in blocks"
        :key="block.key"
        class="grid place-items-center border-b border-chalk/10 bg-ink-raised text-xs text-mute"
        :style="{ height: `${block.height}px` }"
      >
        {{ block.label }} block
      </div>
    </Teleport>

    <p class="type-body mt-10 text-sm text-mute">
      The score never falls back, and it keeps accumulating for as long as the
      page is open — there is no window after load in which shifts stop
      counting. It is reported when the page is hidden or left.
    </p>
  </section>
</template>
