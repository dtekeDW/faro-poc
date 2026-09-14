<script setup lang="ts">
const { isDegraded } = defineProps<{ isDegraded: boolean }>()

/**
 * The LCP element. Optimized serves a viewport-sized frame with explicit
 * dimensions and a high priority hint; degraded serves the 2400px original
 * lazily and without dimensions, which is the most common way a hero ruins
 * an otherwise healthy page.
 */
const src = computed(() =>
  isDegraded
    ? 'https://picsum.photos/seed/sequence-hero/2400/1600'
    : 'https://picsum.photos/seed/sequence-hero/1600/900',
)
</script>

<template>
  <section class="relative flex min-h-[100svh] flex-col justify-between overflow-hidden">
    <img
      :key="src"
      :src="src"
      :width="isDegraded ? undefined : 1600"
      :height="isDegraded ? undefined : 900"
      :fetchpriority="isDegraded ? 'auto' : 'high'"
      :loading="isDegraded ? 'lazy' : 'eager'"
      alt=""
      data-testid="hero-media"
      class="absolute inset-0 size-full object-cover"
    >
    <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/70" />

    <div class="relative mt-auto px-6 pb-8 md:px-10">
      <h1 class="max-w-[16ch] text-[13vw] font-extrabold leading-[0.84] tracking-[-0.05em] text-balance md:text-[8.5vw]">
        We make videos people remember
      </h1>

      <div class="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-chalk/15 pt-5">
        <p class="max-w-[42ch] text-sm leading-relaxed text-mute">
          A production studio working across brand film, documentary and
          commercial. Rated
          <span class="tnum text-chalk">4.9</span> from
          <span class="tnum text-chalk">480</span> verified reviews.
        </p>

        <a
          href="#works"
          class="group inline-flex items-center gap-3 text-sm font-medium text-chalk"
        >
          <span class="relative">
            Play showreel
            <span class="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-100 bg-dodger transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-0" />
          </span>
          <span class="grid size-9 place-items-center rounded-full border border-chalk/25 transition-colors duration-300 group-hover:border-dodger group-hover:bg-dodger group-hover:text-ink">
            <svg viewBox="0 0 24 24" class="size-3.5" aria-hidden="true">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  </section>
</template>
