<script setup lang="ts">
useHead({ title: 'Metrics lab — Sequence' })

interface SeedJob {
  runId: string
  passes: number
  lines: string[]
  isRunning: boolean
  exitCode: number | null
}

const targets = [
  { id: 'worst', label: 'Worst of each' },
  { id: 'all', label: 'Everything' },
  { id: 'lcp', label: 'LCP' },
  { id: 'cls', label: 'CLS' },
  { id: 'inp', label: 'INP' },
  { id: 'ttfb', label: 'TTFB' },
  { id: 'errors', label: 'Errors' },
]

const target = ref('worst')
const passes = ref(3)
const name = ref('')

/*
 * Off by default: an invisible browser is faster and does not take the screen
 * away from whatever is being shown. Turned on, the run becomes the thing to
 * look at — which is the only way an audience sees that these numbers come
 * from real page loads rather than from a fixture.
 */
const isHeaded = ref(false)

const runId = ref<string | null>(null)
const isRunHeaded = ref(false)
const job = ref<SeedJob | null>(null)
const isStarting = ref(false)
const error = ref<string | null>(null)

const dashboardUrl = computed(() => useRuntimeConfig().public.faro.dashboardUrl || '')

let poll: ReturnType<typeof setInterval> | null = null

async function start() {
  if (isStarting.value || job.value?.isRunning)
    return

  isStarting.value = true
  error.value = null
  job.value = null

  try {
    const started = await $fetch<{ runId: string }>('/api/seed', {
      method: 'POST',
      body: { passes: passes.value, target: target.value, name: name.value, headed: isHeaded.value },
    })

    runId.value = started.runId
    isRunHeaded.value = isHeaded.value
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
      // Not registered for a beat; the next tick retries.
    }
  }, 900)
}

onBeforeUnmount(() => {
  if (poll)
    clearInterval(poll)
})

/**
 * Turns the seeder's stdout into rows.
 *
 * Raw console output makes a reader parse a log while a demo is running. The
 * lines are structured — `pass 2  inp severe  ok` — so they can be read back
 * into the shape they always had.
 */
const steps = computed(() => {
  const rows = []

  for (const line of job.value?.lines ?? []) {
    if (!line.startsWith('pass '))
      continue

    // Parsed by hand rather than by pattern: a regex spanning the label
    // between two runs of whitespace backtracks badly on adversarial input,
    // and this format is simple enough not to need one.
    const rest = line.slice(5).trimStart()
    const boundary = rest.indexOf(' ')
    if (boundary < 0)
      continue

    const pass = Number(rest.slice(0, boundary))
    if (!Number.isFinite(pass))
      continue

    const tail = rest.slice(boundary).trim()
    const failed = tail.endsWith('failed') || tail.includes('failed:')

    // `label | /path  status`. The URL is what a viewer sees in the window
    // during a visible run, so the row can be matched to it.
    const separator = tail.indexOf('|')
    const strip = (value: string) => value
      .replace(/\s+ok$/, '')
      .replace(/\s+failed.*$/, '')
      .trim()

    const label = strip(separator < 0 ? tail : tail.slice(0, separator))
    const path = separator < 0 ? '' : strip(tail.slice(separator + 1))

    rows.push({ pass, label, path, failed })
  }

  return rows.reverse()
})

const plan = computed(() => {
  const line = (job.value?.lines ?? []).find(entry => entry.includes('passes over'))
  const match = line?.match(/(\d+) passes over (\d+) steps/)

  return match ? { passes: Number(match[1]), steps: Number(match[2]) } : null
})

const expected = computed(() => (plan.value ? plan.value.passes * plan.value.steps : null))
const failures = computed(() => steps.value.filter(step => step.failed).length)
</script>

<template>
  <div class="section pt-32">
    <header class="max-w-[46ch]">
      <h1 class="type-section">
        <PerCharacterRise text="Metrics lab" />
      </h1>
      <p class="type-body mt-7 text-mute">
        A run walks the pages that provoke one metric, in a real browser, and
        labels everything it sends so the dashboard can single it out.
      </p>
    </header>

    <!-- Controls first, in the order they are used: what to run, what to call
         it, how much of it, then go. -->
    <div class="mt-16 max-w-4xl space-y-8">
      <div class="flex flex-wrap gap-2">
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

      <div class="flex flex-wrap items-end gap-x-10 gap-y-6">
        <label class="min-w-[16rem] flex-1">
          <span class="block text-xs text-mute">Name this run</span>
          <input
            v-model="name"
            type="text"
            placeholder="po-demo"
            :disabled="job?.isRunning"
            class="type-data mt-2 w-full border-b border-chalk/20 bg-transparent pb-2 text-lg outline-none transition-colors placeholder:text-mute/50 focus:border-dodger"
            @keydown.enter="start()"
          >
        </label>

        <label>
          <span class="block text-xs text-mute">Passes</span>
          <input
            v-model.number="passes"
            type="number"
            min="1"
            max="30"
            :disabled="job?.isRunning"
            class="type-data mt-2 w-20 border-b border-chalk/20 bg-transparent pb-2 text-lg outline-none focus:border-dodger"
          >
        </label>

        <label
          class="pill flex select-none items-center gap-2.5 focus-within:border-dodger"
          :data-active="isHeaded"
        >
          <input
            v-model="isHeaded"
            type="checkbox"
            class="sr-only"
            :disabled="job?.isRunning"
          >
          <span
            class="size-1.5 rounded-full transition-colors"
            :class="isHeaded ? 'bg-ink' : 'bg-chalk/40'"
          />
          Watch the browser
        </label>

        <button
          type="button"
          class="pill px-8"
          :disabled="isStarting || job?.isRunning"
          @click="start()"
        >
          {{ job?.isRunning ? 'Running…' : 'Start run' }}
        </button>
      </div>

      <p class="max-w-[52ch] text-sm text-mute">
        <template v-if="isHeaded">
          A Chromium window opens and walks the pages itself — one load per row
          below. Slower, but the room sees where the measurements come from.
        </template>
        <template v-else>
          The run happens in a browser you never see. Switch it on to show the
          loads happening.
        </template>
      </p>

      <p v-if="error" class="text-sm text-[#ff6b5e]">
        {{ error }}
      </p>
    </div>

    <!-- The run itself. Nothing else competes with it once it is going. -->
    <div v-if="runId" class="rule mt-16 max-w-4xl pt-10">
      <div class="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <p class="type-data text-lg text-dodger">
          run={{ runId }}
        </p>
        <p class="type-data text-sm text-mute">
          <span v-if="isRunHeaded" class="mr-4 text-chalk">visible browser</span>
          {{ steps.length }}<template v-if="expected">
            / {{ expected }}
          </template>
          <template v-if="failures">
            · {{ failures }} failed
          </template>
        </p>
      </div>

      <!-- A bar rather than a number: progress is a shape, and a demo audience
           reads a shape faster than a fraction. -->
      <div v-if="expected" class="mt-5 h-px w-full bg-chalk/15">
        <div
          class="h-px bg-dodger transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          :style="{ width: `${Math.min((steps.length / expected) * 100, 100)}%` }"
        />
      </div>

      <ol v-if="steps.length" class="mt-8 max-h-[24rem] overflow-y-auto">
        <li
          v-for="(step, index) in steps"
          :key="`${step.pass}-${step.label}-${index}`"
          class="flex items-baseline justify-between gap-6 border-b border-chalk/10 py-3"
        >
          <span class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span class="text-sm">{{ step.label }}</span>
            <span v-if="step.path" class="type-data text-xs text-mute">{{ step.path }}</span>
          </span>
          <span class="flex items-baseline gap-5">
            <span class="type-data text-xs text-mute">pass {{ step.pass }}</span>
            <span class="type-data text-xs" :class="step.failed ? 'text-[#ff6b5e]' : 'text-dodger'">
              {{ step.failed ? 'failed' : 'sent' }}
            </span>
          </span>
        </li>
      </ol>

      <p v-else class="mt-8 text-sm text-mute">
        {{ isRunHeaded ? 'Opening the browser window…' : 'Starting the browser…' }}
      </p>

      <p v-if="job && !job.isRunning" class="type-body mt-8 text-sm text-mute">
        Finished. Signals reach Grafana within about a minute — filter on
        <span class="type-data text-chalk">run={{ runId }}</span>.
        <a
          v-if="dashboardUrl"
          :href="dashboardUrl"
          target="_blank"
          rel="noopener"
          class="link-wipe ml-2 text-dodger"
        >Open the dashboard</a>
      </p>
    </div>

    <!-- The scenarios keep their explanations on their own pages, where there
         is room for them. Here they only need to be reachable. -->
    <nav class="rule mt-20 flex flex-wrap items-center gap-x-8 gap-y-3 pt-8 text-sm">
      <span class="text-mute">Open a scenario</span>
      <NuxtLink
        v-for="scenario in SCENARIOS"
        :key="scenario.id"
        :to="scenario.id === 'healthy' ? '/' : `/${scenario.id}`"
        class="link-wipe text-chalk"
      >
        {{ scenario.menuLabel }}
      </NuxtLink>
    </nav>
  </div>
</template>
