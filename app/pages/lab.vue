<script setup lang="ts">
useHead({ title: 'Metrics lab — Sequence' })

interface SeedJob {
  runId: string
  passes: number
  lines: string[]
  isRunning: boolean
  exitCode: number | null
}

/**
 * Targeted runs. Each one touches only the pages that provoke the metric it is
 * named after, plus the control — so everything it sends answers one question,
 * and `run=inp-…` becomes a dashboard filter rather than just a timestamp.
 */
const targets = [
  { id: 'all', label: 'Everything' },
  { id: 'lcp', label: 'LCP' },
  { id: 'cls', label: 'CLS' },
  { id: 'inp', label: 'INP' },
  { id: 'ttfb', label: 'TTFB' },
  { id: 'errors', label: 'Errors' },
]

const target = ref('all')
const passes = ref(3)
const runId = ref<string | null>(null)
const job = ref<SeedJob | null>(null)
const isStarting = ref(false)
const error = ref<string | null>(null)

const config = useRuntimeConfig().public.faro
const dashboardUrl = computed(() => config.dashboardUrl || '')

let poll: ReturnType<typeof setInterval> | null = null

/**
 * Drives the run through Playwright on the server rather than through an
 * iframe in this page. The iframe version registered the page loads but lost
 * the measurements: web-vitals reports LCP, CLS and INP when a page is hidden
 * or unloaded, and swapping an iframe's src does not deliver those signals
 * reliably. A real top-level navigation does — and Playwright's input is
 * trusted, which is the only way INP can be produced without a human clicking.
 */
async function start() {
  if (isStarting.value || job.value?.isRunning)
    return

  isStarting.value = true
  error.value = null

  try {
    const started = await $fetch<{ runId: string }>('/api/seed', {
      method: 'POST',
      body: { passes: passes.value, target: target.value },
    })

    runId.value = started.runId
    watchJob(started.runId)
  }
  catch (cause) {
    error.value = (cause as Error).message
  }
  finally {
    isStarting.value = false
  }
}

function watchJob(id: string) {
  if (poll)
    clearInterval(poll)

  poll = setInterval(async () => {
    try {
      job.value = await $fetch<SeedJob>(`/api/seed/${id}`)

      if (!job.value.isRunning && poll) {
        clearInterval(poll)
        poll = null
      }
    }
    catch {
      // The run may not be registered for a beat; the next tick retries.
    }
  }, 1000)
}

onBeforeUnmount(() => {
  if (poll)
    clearInterval(poll)
})

const completed = computed(() =>
  (job.value?.lines ?? []).filter(line => / ok$/.test(line)).length,
)

/** Step count depends on the target, so it is read from the run's own log. */
const expected = computed(() => {
  const line = (job.value?.lines ?? []).find(entry => entry.includes('passes over'))
  const match = line?.match(/(\d+) passes over (\d+) steps/)

  return match ? Number(match[1]) * Number(match[2]) : null
})
</script>

<template>
  <div class="section pt-32">
    <header class="max-w-[60ch]">
      <h1 class="type-section">
        <PerCharacterRise text="Metrics lab" />
      </h1>
      <p class="type-body mt-7 text-mute">
        Every route below is the same page with exactly one thing wrong with it.
        A run walks all of them in a real browser and sends one clean set of
        measurements per defect, so the dashboard reads as a table with a single
        red cell per row.
      </p>
    </header>

    <div class="mt-10 flex flex-wrap gap-2">
      <button
        v-for="option in targets"
        :key="option.id"
        type="button"
        :data-active="target === option.id"
        class="pill"
        :disabled="job?.isRunning"
        @click="target = option.id"
      >
        {{ option.label }}
      </button>
    </div>

    <div class="mt-8 flex flex-wrap items-center gap-4">
      <button
        type="button"
        class="pill"
        :disabled="isStarting || job?.isRunning"
        @click="start()"
      >
        {{ job?.isRunning ? 'Running…' : 'Start run' }}
      </button>

      <label class="flex items-center gap-2 text-sm text-mute">
        Passes
        <input
          v-model.number="passes"
          type="number"
          min="1"
          max="30"
          class="type-data w-16 border-b border-chalk/20 bg-transparent pb-1 text-center outline-none focus:border-dodger"
        >
      </label>

      <span v-if="job" class="type-data text-sm text-mute">
        {{ completed }}<template v-if="expected"> / {{ expected }}</template>
      </span>

      <a
        v-if="dashboardUrl"
        :href="dashboardUrl"
        target="_blank"
        rel="noopener"
        class="link-wipe text-sm text-dodger"
      >
        Open the dashboard
      </a>
    </div>

    <p v-if="runId" class="type-data mt-5 text-sm text-dodger">
      {{ runId }}
    </p>
    <p v-if="runId" class="type-body mt-2 text-sm text-mute">
      Every measurement from this run carries that label, so it can be told
      apart from every other run in the dashboard.
    </p>

    <p v-if="error" class="mt-5 text-sm text-[#ff6b5e]">
      {{ error }}
    </p>

    <div class="mt-14 grid gap-10 lg:grid-cols-[1fr_1.15fr]">
      <ol class="rule border-t">
        <li
          v-for="scenario in SCENARIOS"
          :key="scenario.id"
          class="border-b border-chalk/10 py-6"
        >
          <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span class="type-data text-xs text-dodger">
              {{ scenario.metric === 'none' ? '—' : scenario.metric }}
            </span>
            <NuxtLink
              :to="scenario.id === 'healthy' ? '/' : `/${scenario.id}`"
              class="type-title link-wipe"
            >
              {{ scenario.label }}
            </NuxtLink>
          </div>
          <p class="type-body mt-2 text-sm text-mute">
            {{ scenario.cause }}
          </p>
          <p class="mt-1 text-sm text-chalk/70">
            {{ scenario.effect }}
          </p>
        </li>
      </ol>

      <div>
        <ol
          v-if="job?.lines.length"
          class="type-data max-h-[30rem] space-y-1 overflow-y-auto border border-chalk/12 p-5 text-xs text-mute"
        >
          <li v-for="(line, index) in [...job.lines].reverse()" :key="index">
            {{ line }}
          </li>
        </ol>
        <div v-else class="grid min-h-[16rem] place-items-center border border-chalk/12 text-sm text-mute">
          The run log appears here
        </div>

        <p v-if="job && !job.isRunning" class="type-body mt-5 text-sm text-mute">
          Finished. Signals reach Grafana within about a minute — filter on
          <span class="type-data text-chalk">run={{ runId }}</span>.
        </p>
      </div>
    </div>
  </div>
</template>
