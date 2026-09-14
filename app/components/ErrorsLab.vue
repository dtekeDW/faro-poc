<script setup lang="ts">
interface Failure {
  id: string
  label: string
  note: string
}

const failures: Failure[] = [
  { id: 'throw', label: 'Uncaught exception', note: 'A thrown Error carries a stack trace, which is what makes it actionable in the dashboard.' },
  { id: 'reject', label: 'Unhandled rejection', note: 'A promise nobody caught. Invisible to the user, and the most commonly missed class of failure.' },
  { id: 'fetch', label: 'Failed request', note: 'A request to a host that does not answer. Recorded with its URL and status rather than a stack.' },
  { id: 'console', label: 'Console error', note: 'Captured too, which is why noisy logging quietly becomes noisy monitoring.' },
]

const sent = ref<{ id: number, label: string }[]>([])
let counter = 0

const { $faro } = useNuxtApp()

function provoke(failure: Failure) {
  sent.value = [{ id: counter++, label: failure.label }, ...sent.value].slice(0, 8)

  switch (failure.id) {
    case 'throw':
      setTimeout(() => {
        throw new Error('Showreel player failed to initialise: codec descriptor missing')
      }, 0)
      break
    case 'reject':
      void Promise.reject(new Error('Colour grade manifest rejected: unsupported LUT version'))
      break
    case 'fetch':
      fetch('https://localhost:9/api/showreel-manifest').catch(() => {
        // Swallowed on purpose; Faro records the failed request itself.
      })
      break
    case 'console':
      console.error('[showreel] dropped 3 frames during playback')
      break
  }

  $faro?.api?.pushEvent('demo_failure', { kind: failure.id })
}
</script>

<template>
  <section>
    <div class="flex flex-wrap gap-3">
      <button
        v-for="failure in failures"
        :key="failure.id"
        type="button"
        class="pill"
        @click="provoke(failure)"
      >
        {{ failure.label }}
      </button>
    </div>

    <div class="mt-12 grid gap-10 md:grid-cols-[1.6fr_1fr] md:items-start">
      <ul class="space-y-4">
        <li
          v-for="failure in failures"
          :key="failure.id"
          class="border-b border-chalk/10 pb-4"
        >
          <p class="type-title">
            {{ failure.label }}
          </p>
          <p class="type-body mt-1 text-sm text-mute">
            {{ failure.note }}
          </p>
        </li>
      </ul>

      <div class="rule border-t pt-6">
        <p class="text-xs text-mute">
          Sent this session
        </p>
        <ol v-if="sent.length" class="mt-4 space-y-2">
          <li
            v-for="entry in sent"
            :key="entry.id"
            class="flex items-baseline justify-between gap-4 border-b border-chalk/10 pb-2 text-sm"
          >
            <span class="text-mute">{{ entry.label }}</span>
            <span class="type-data text-dodger">sent</span>
          </li>
        </ol>
        <p v-else class="type-data mt-2 text-6xl text-mute">
          —
        </p>
      </div>
    </div>
  </section>
</template>
