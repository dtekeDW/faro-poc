<script setup lang="ts">
useHead({ title: 'Headline faces — Sequence' })

const line = ref('We make videos people remember')
const filter = ref<'all' | 'Fontshare' | 'Google'>('all')

const { eliminated, isReady, eliminate, restoreAll } = useShortlist('headline')

const faces = computed(() => {
  const bySource = filter.value === 'all'
    ? HEADLINE_FACES
    : HEADLINE_FACES.filter(face => face.source === filter.value)

  // Before the stored list is read, show everything: hiding rows on the server
  // and revealing them on mount would flash the full wall on every load.
  return isReady.value
    ? bySource.filter(face => !eliminated.value.includes(face.id))
    : bySource
})
</script>

<template>
  <div class="pb-32 pt-28">
    <header class="px-6 md:px-10">
      <h1 class="type-section">
        Headline faces
      </h1>
      <p class="type-body mt-5 text-mute">
        The same line in every candidate. Dismiss the ones that are clearly out
        so the remaining comparison gets easier, and open any of them on the
        real homepage before deciding.
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
            class="pill text-xs"
            @click="filter = option"
          >
            {{ option === 'all' ? 'All' : option }}
          </button>
        </div>
      </div>

      <p
        v-if="isReady && eliminated.length"
        class="mt-5 flex items-center gap-4 text-xs text-mute"
      >
        <span class="type-data">{{ eliminated.length }} dismissed · {{ faces.length }} left</span>
        <button type="button" class="link-wipe cursor-pointer text-dodger" @click="restoreAll()">
          Bring them all back
        </button>
      </p>
    </header>

    <TransitionGroup
      tag="ol"
      class="mt-12"
      enter-active-class="transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      enter-from-class="opacity-0"
      leave-active-class="absolute w-full transition duration-300 ease-[cubic-bezier(0.7,0,0.84,0)]"
      leave-to-class="opacity-0 -translate-y-2"
      move-class="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <li
        v-for="(face, index) in faces"
        :key="face.id"
        class="rule group relative px-6 py-10 transition-colors duration-500 hover:bg-ink-raised md:px-10"
      >
        <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1 pr-12">
          <span class="type-data text-xs text-dodger">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="text-sm font-medium">{{ face.name }}</span>
          <span class="text-xs uppercase tracking-widest text-mute">{{ face.source }}</span>
          <span class="ml-auto hidden max-w-[46ch] text-xs leading-relaxed text-mute opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block">
            {{ face.feel }}
          </span>
        </div>

        <button
          type="button"
          :aria-label="`Dismiss ${face.name}`"
          class="absolute right-4 top-9 grid size-8 cursor-pointer place-items-center rounded-full border border-chalk/15 text-mute opacity-0 transition duration-300 hover:border-dodger hover:bg-dodger hover:text-ink focus-visible:opacity-100 group-hover:opacity-100 md:right-8"
          @click="eliminate(face.id)"
        >
          <svg viewBox="0 0 24 24" class="size-3.5" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>

        <NuxtLink
          :to="`/?display=${face.id}`"
          class="link-wipe mt-4 inline-block text-xs text-dodger"
        >
          See the homepage in {{ face.name }}
        </NuxtLink>

        <p
          :class="face.css"
          :style="{ fontWeight: face.weight }"
          class="mt-5 max-w-[16ch] text-[13vw] leading-[0.84] tracking-[-0.03em] text-balance md:text-[8.5vw]"
        >
          {{ line }}
        </p>
      </li>
    </TransitionGroup>

    <p v-if="isReady && !faces.length" class="px-6 pt-16 text-sm text-mute md:px-10">
      Everything is dismissed.
      <button type="button" class="link-wipe cursor-pointer text-dodger" @click="restoreAll()">
        Start over
      </button>
    </p>
  </div>
</template>
