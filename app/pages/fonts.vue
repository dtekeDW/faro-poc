<script setup lang="ts">
useHead({ title: 'Headline faces — Sequence' })

const line = ref('We make videos people remember')
const filter = ref<'all' | 'Fontshare' | 'Google'>('all')

const faces = computed(() =>
  filter.value === 'all'
    ? HEADLINE_FACES
    : HEADLINE_FACES.filter(face => face.source === filter.value),
)
</script>

<template>
  <div class="pb-32 pt-28">
    <header class="px-6 md:px-10">
      <h1 class="text-3xl font-bold tracking-[-0.03em] md:text-4xl">
        Headline faces
      </h1>
      <p class="mt-3 max-w-[64ch] text-sm leading-relaxed text-mute">
        The same line in every candidate, stacked so the difference is feeling
        rather than detail. Edit the line to test your own words.
      </p>

      <div class="mt-8 flex flex-wrap items-center gap-3">
        <input
          v-model="line"
          type="text"
          aria-label="Specimen text"
          class="min-w-0 flex-1 border-b border-chalk/20 bg-transparent pb-2 text-sm outline-none transition-colors focus:border-dodger"
        >
        <div class="flex gap-2">
          <button
            v-for="option in (['all', 'Fontshare', 'Google'] as const)"
            :key="option"
            type="button"
            :data-active="filter === option"
            class="cursor-pointer rounded-full border border-chalk/20 px-4 py-1.5 text-xs transition-colors duration-300 hover:border-chalk/50 data-[active=true]:border-dodger data-[active=true]:bg-dodger data-[active=true]:text-ink"
            @click="filter = option"
          >
            {{ option === 'all' ? 'All' : option }}
          </button>
        </div>
      </div>
    </header>

    <ol class="mt-12">
      <li
        v-for="(face, index) in faces"
        :key="face.id"
        class="group border-t border-chalk/10 px-6 py-10 transition-colors duration-500 hover:bg-ink-raised md:px-10"
      >
        <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span class="type-data text-xs text-dodger">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="text-sm font-medium">{{ face.name }}</span>
          <span class="text-xs uppercase tracking-widest text-mute">{{ face.source }}</span>
          <span class="ml-auto max-w-[46ch] text-xs leading-relaxed text-mute opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {{ face.feel }}
          </span>
        </div>

        <NuxtLink
          :to="`/?display=${face.id}`"
          class="link-wipe mt-4 inline-block text-xs text-dodger"
        >
          See the homepage in {{ face.name }}
        </NuxtLink>

        <p
          :class="face.css"
          :style="{ fontWeight: face.weight }"
          class="mt-5 max-w-[16ch] text-[13vw] leading-[0.84] tracking-[-0.05em] text-balance md:text-[8.5vw]"
        >
          {{ line }}
        </p>
      </li>
    </ol>

    <p class="mt-16 px-6 text-sm text-mute md:px-10">
      Pick a number and I will build the design system around it.
    </p>
  </div>
</template>
