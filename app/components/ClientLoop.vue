<script setup lang="ts">
import { LogoLoop } from './ui/logo-loop'

const { isDegraded } = defineProps<{ isDegraded: boolean }>()

/**
 * Drawn marks rather than photographs. The wall used to show eight desaturated
 * stock crops standing in for client logos, which read as filler; a mark and a
 * wordmark in one stroke weight is both honest and quieter.
 */
const clients = [
  { name: 'Catalog', path: 'M4 16 L12 4 L20 16 Z' },
  { name: 'CloudPeak', path: 'M3 15 L9 7 L13 12 L17 6 L21 15' },
  { name: 'Convergence', path: 'M4 4 L20 16 M20 4 L4 16' },
  { name: 'Datanova', path: 'M12 3 A9 9 0 1 1 11.99 3 M12 8 A4 4 0 1 0 12.01 8' },
  { name: 'Command+R', path: 'M6 6 H18 V18 H6 Z M10 10 H14 V14 H10 Z' },
  { name: 'Basil & Co.', path: 'M12 19 C5 14 5 5 12 5 C19 5 19 14 12 19 Z' },
  { name: 'Global Bank', path: 'M3 18 H21 M5 18 V9 M12 18 V9 M19 18 V9 M12 3 L21 9 H3 Z' },
  { name: 'VitaCare', path: 'M12 4 V20 M4 12 H20' },
]

/**
 * Degraded mode drops the intrinsic size from each mark and delays the render,
 * so every row reflows once the loop fills in.
 */
const isReady = ref(!isDegraded)

onMounted(() => {
  if (isDegraded)
    setTimeout(() => { isReady.value = true }, 700)
})
</script>

<template>
  <section id="clients" class="section-tight">
    <p class="type-body text-mute">
      Eight years, 120 brands. Every name here represents a partnership rather
      than a booking.
    </p>

    <div data-testid="logo-wall" class="mt-12">
      <LogoLoop
        :speed="42"
        :gap="72"
        :logo-height="24"
        pause-on-hover
        fade-out
        fade-out-color="#060606"
        aria-label="Selected clients"
      >
        <span
          v-for="client in clients"
          :key="client.name"
          class="flex shrink-0 items-center gap-3 whitespace-nowrap text-mute transition-colors duration-500 hover:text-chalk"
        >
          <svg
            v-if="isReady"
            :width="isDegraded ? undefined : 24"
            :height="isDegraded ? undefined : 24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            class="shrink-0"
          >
            <path :d="client.path" />
          </svg>
          <span class="text-sm font-medium uppercase tracking-[0.18em]">{{ client.name }}</span>
        </span>
      </LogoLoop>
    </div>
  </section>
</template>
