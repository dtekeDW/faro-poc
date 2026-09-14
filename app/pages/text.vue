<script setup lang="ts">
useHead({ title: 'Secondary text faces — Sequence' })

const filter = ref<'all' | 'Fontshare' | 'Google'>('all')

const { eliminated, isReady, eliminate, restoreAll } = useShortlist('text')

const faces = computed(() => {
  const bySource = filter.value === 'all'
    ? TEXT_FACES
    : TEXT_FACES.filter(face => face.source === filter.value)

  return isReady.value
    ? bySource.filter(face => !eliminated.value.includes(face.id))
    : bySource
})
</script>

<template>
  <div class="pb-32 pt-28">
    <header class="px-6 md:px-10">
      <h1 class="type-section">
        Secondary text
      </h1>
      <p class="type-body mt-5 text-mute">
        Unbounded is fixed. Each block below pairs it with one candidate for
        body copy, so the judgement is about the pairing and about how the face
        reads at the size it will actually be used.
      </p>

      <div class="mt-8 flex gap-2">
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
      class="mt-14"
      enter-active-class="transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      enter-from-class="opacity-0"
      leave-active-class="absolute w-full transition duration-300 ease-[cubic-bezier(0.7,0,0.84,0)]"
      leave-to-class="opacity-0 -translate-y-2"
      move-class="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <li
        v-for="(face, index) in faces"
        :key="face.id"
        class="rule group relative px-6 py-14 transition-colors duration-500 hover:bg-ink-raised md:px-10"
      >
        <button
          type="button"
          :aria-label="`Dismiss ${face.name}`"
          class="absolute right-4 top-12 grid size-8 cursor-pointer place-items-center rounded-full border border-chalk/15 text-mute opacity-0 transition duration-300 hover:border-dodger hover:bg-dodger hover:text-ink focus-visible:opacity-100 group-hover:opacity-100 md:right-8"
          @click="eliminate(face.id)"
        >
          <svg viewBox="0 0 24 24" class="size-3.5" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>

        <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1 pr-12">
          <span class="type-data text-xs text-dodger">{{ String(index + 1).padStart(2, '0') }}</span>
          <span :class="face.css" class="text-sm font-medium">{{ face.name }}</span>
          <span :class="face.css" class="text-xs uppercase tracking-widest text-mute">{{ face.source }}</span>
        </div>

        <!-- The display face is the constant, so the pairing is what is judged. -->
        <p class="type-section mt-6">
          We make videos people remember
        </p>

        <div class="mt-7 grid gap-8 md:grid-cols-[1.5fr_1fr]">
          <div :class="face.css">
            <p class="max-w-[68ch] text-[15px] leading-[1.65] text-chalk">
              A production studio working across brand film, documentary and
              commercial. Most productions run four to six weeks from kickoff to
              final delivery, including two rounds of revisions, with colour
              grading, sound design and motion graphics handled in post.
            </p>
            <p class="mt-3 max-w-[68ch] text-[15px] leading-[1.65] text-mute">
              Secondary copy at the same measure. This is the size almost every
              word on the site is set at, so if a face is going to tire you out,
              it will show here and nowhere else.
            </p>
            <p class="mt-4 text-[13px] leading-[1.6] text-mute">
              And smaller still, at thirteen pixels — captions, metadata, the
              fine print under a form field.
            </p>
          </div>

          <div :class="face.css" class="space-y-5">
            <ul class="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <li v-for="label in ['Works', 'Gallery', 'Playground', 'Contact']" :key="label">
                {{ label }}
              </li>
            </ul>

            <!-- Figures decide whether this face can also carry the data role. -->
            <dl class="grid grid-cols-3 gap-3 border border-chalk/12 px-4 py-4 text-center">
              <div>
                <dt class="text-[10px] uppercase tracking-widest text-mute">Films</dt>
                <dd class="mt-1 text-xl [font-variant-numeric:tabular-nums]">412</dd>
              </div>
              <div>
                <dt class="text-[10px] uppercase tracking-widest text-mute">Runtime</dt>
                <dd class="mt-1 text-xl [font-variant-numeric:tabular-nums]">01:42</dd>
              </div>
              <div>
                <dt class="text-[10px] uppercase tracking-widest text-mute">Repeat</dt>
                <dd class="mt-1 text-xl [font-variant-numeric:tabular-nums]">87%</dd>
              </div>
            </dl>

            <p class="text-xs leading-relaxed text-mute">
              {{ face.feel }}
            </p>
          </div>
        </div>
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
