<script setup lang="ts">
useHead({ title: 'Metrics lab — Sequence' })

type Status = 'pending' | 'loading' | 'awaiting-click' | 'done'

const frame = ref<HTMLIFrameElement | null>(null)
const statuses = ref<Record<string, Status>>({})
const current = ref<string | null>(null)
const isRunning = ref(false)
const log = ref<string[]>([])

const config = useRuntimeConfig().public.faro
const dashboardUrl = computed(() => config.dashboardUrl || '')

function reset() {
  statuses.value = Object.fromEntries(SCENARIOS.map(s => [s.id, 'pending'])) as Record<string, Status>
  log.value = []
}

reset()

function note(line: string) {
  log.value = [`${new Date().toLocaleTimeString()}  ${line}`, ...log.value].slice(0, 40)
}

/** Resolves once the frame has fired load for the route just assigned. */
function loadRoute(path: string) {
  return new Promise<void>((resolve) => {
    const node = frame.value
    if (!node) {
      resolve()
      return
    }

    const onLoad = () => {
      node.removeEventListener('load', onLoad)
      resolve()
    }

    node.addEventListener('load', onLoad)
    node.src = path
  })
}

/**
 * INP cannot be produced from here. The Event Timing API only records input
 * the browser considers trusted, and a dispatched click is not — so a scripted
 * run would show an empty INP no matter how slow the handler is. The run pauses
 * instead and waits for a real click inside the frame, which is the more
 * convincing moment anyway.
 */
function awaitRealClick(): Promise<void> {
  return new Promise((resolve) => {
    const doc = frame.value?.contentDocument
    if (!doc) {
      resolve()
      return
    }

    const onClick = () => {
      doc.removeEventListener('click', onClick, true)
      resolve()
    }

    doc.addEventListener('click', onClick, true)
  })
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function run() {
  if (isRunning.value)
    return

  isRunning.value = true
  reset()

  for (const scenario of SCENARIOS) {
    current.value = scenario.id
    statuses.value[scenario.id] = 'loading'
    note(`Loading /${scenario.id === 'healthy' ? '' : scenario.id} — measuring ${scenario.metric}`)

    await loadRoute(scenario.id === 'healthy' ? '/' : `/${scenario.id}`)

    // Paint metrics need a moment after load to settle before the SDK batches.
    await wait(3200)

    if (scenario.needsInteraction) {
      statuses.value[scenario.id] = 'awaiting-click'
      note('Waiting for a real click inside the frame — scripted clicks do not count towards INP')
      await awaitRealClick()
      await wait(1200)
    }

    statuses.value[scenario.id] = 'done'
    note(`Sent — ${scenario.label}`)
  }

  current.value = null
  isRunning.value = false
  note('Run complete. Signals reach Grafana within about a minute.')
}

const progress = computed(() =>
  Object.values(statuses.value).filter(status => status === 'done').length,
)
</script>

<template>
  <div class="section pt-28">
    <header class="max-w-[60ch]">
      <h1 class="type-section">
        <PerCharacterRise text="Metrics lab" />
      </h1>
      <p class="type-body mt-6 text-mute">
        Every route below is the same page with exactly one thing wrong with it.
        Running them in order sends one clean set of measurements per defect, so
        the dashboard reads as a table with a single red cell per row.
      </p>
    </header>

    <div class="mt-10 flex flex-wrap items-center gap-4">
      <button type="button" class="pill" :disabled="isRunning" @click="run()">
        {{ isRunning ? 'Running…' : 'Start run' }}
      </button>
      <span class="type-data text-sm text-mute">
        {{ progress }} / {{ SCENARIOS.length }} sent
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

    <div class="mt-14 grid gap-10 lg:grid-cols-[1fr_1.15fr]">
      <ol class="rule border-t">
        <li
          v-for="scenario in SCENARIOS"
          :key="scenario.id"
          class="border-b border-chalk/10 py-6"
          :data-state="statuses[scenario.id]"
        >
          <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span
              class="type-data text-xs"
              :class="statuses[scenario.id] === 'done' ? 'text-dodger' : 'text-mute'"
            >{{ scenario.metric === 'none' ? '—' : scenario.metric }}</span>
            <span class="type-title">{{ scenario.label }}</span>
            <span class="ml-auto text-xs text-mute">
              <template v-if="statuses[scenario.id] === 'awaiting-click'">click in the frame</template>
              <template v-else-if="statuses[scenario.id] === 'loading'">measuring…</template>
              <template v-else-if="statuses[scenario.id] === 'done'">sent</template>
              <template v-else>waiting</template>
            </span>
          </div>
          <p class="type-body mt-2 text-sm text-mute">
            {{ scenario.cause }}
          </p>
          <p class="mt-1 text-sm text-chalk/70">
            {{ scenario.effect }}
          </p>
        </li>
      </ol>

      <div class="space-y-4">
        <!-- Visible on purpose: each frame load is a real document load, which
             is the only way LCP, FCP and TTFB are measured again per route. -->
        <div class="relative aspect-[4/3] overflow-hidden border border-chalk/12 bg-ink-raised">
          <iframe
            ref="frame"
            title="Scenario preview"
            class="size-full"
            src="about:blank"
          />
          <p
            v-if="!isRunning && !progress"
            class="pointer-events-none absolute inset-0 grid place-items-center text-sm text-mute"
          >
            The run appears here
          </p>
        </div>

        <ol v-if="log.length" class="type-data max-h-52 space-y-1 overflow-y-auto text-xs text-mute">
          <li v-for="(line, index) in log" :key="index">
            {{ line }}
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>
