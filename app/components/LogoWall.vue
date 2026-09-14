<script setup lang="ts">
const { isDegraded } = defineProps<{ isDegraded: boolean }>()

const clients = [
  'Catalog', 'CloudPeak', 'Convergence', 'Datanova',
  'Command+R', 'Basil & Co.', 'Global Bank', 'VitaCare',
].map((name, index) => ({ name, image: CLIENT_IMAGES[index]! }))

/**
 * Degraded mode withholds the intrinsic size and delays the render, so each
 * logo reserves no space until it decodes and shifts every row beneath it.
 */
const isReady = ref(!isDegraded)

onMounted(() => {
  if (isDegraded)
    setTimeout(() => { isReady.value = true }, 700)
})
</script>

<template>
  <section id="clients" class="section-tight">
    <p class="type-body max-w-[46ch] text-mute">
      Every logo here represents a creative partnership, a shared vision, and a
      project we are glad to put our name on.
    </p>

    <ul data-testid="logo-wall" class="mt-10 grid grid-cols-2 gap-px bg-chalk/10 md:grid-cols-4">
      <li
        v-for="client in clients"
        :key="client.name"
        class="flex h-28 items-center justify-center bg-ink px-4"
      >
        <img
          v-if="isReady"
          :src="photo(client.image, 160, 48)"
          :width="isDegraded ? undefined : 160"
          :height="isDegraded ? undefined : 48"
          :alt="client.name"
          loading="lazy"
          class="photo opacity-40 transition-opacity duration-500 hover:opacity-90"
        >
      </li>
    </ul>
  </section>
</template>
