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
    ? photo(HERO_IMAGE, 2400, 1600)
    : photo(HERO_IMAGE, 1600, 900),
)
</script>

<template>
  <section class="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
    <img
      :key="src"
      :src="src"
      :width="isDegraded ? undefined : 1600"
      :height="isDegraded ? undefined : 900"
      :fetchpriority="isDegraded ? 'auto' : 'high'"
      :loading="isDegraded ? 'lazy' : 'eager'"
      alt=""
      data-testid="hero-media"
      class="photo absolute inset-0 size-full object-cover"
    >
    <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/70" />

    <!--
      One choreographed entrance rather than four independent ones: the
      headline resolves, the rule draws itself under it, and only then does
      the supporting row arrive. Each delay starts where the previous move has
      visibly settled, which is what separates a sequence from a pile-up.
    -->
    <div class="relative px-6 pb-14 md:px-10 md:pb-20">
      <h1 class="max-w-[16ch] type-hero">
        <FocusBlurResolve
          text="We make videos people remember"
          :delay="140"
          :duration="1450"
        />
      </h1>

      <div class="hero-rule mt-16 h-px origin-left bg-chalk/15 md:mt-20" />

      <div class="hero-tail mt-7 flex flex-wrap items-end justify-between gap-6">
        <p class="type-body max-w-[42ch] text-mute">
          A production studio working across brand film, documentary and
          commercial. Rated
          <span class="type-data text-chalk">4.9</span> from
          <span class="type-data text-chalk">480</span> verified reviews.
        </p>

        <a
          href="#works"
          class="group inline-flex items-center gap-3 text-sm font-medium text-chalk"
        >
          <span class="link-wipe"><PerCharacterRise text="Play showreel" :delay="1750" /></span>
          <span class="grid size-10 place-items-center rounded-full border border-chalk/25 transition-colors duration-300 group-hover:border-dodger group-hover:bg-dodger group-hover:text-ink">
            <svg viewBox="0 0 24 24" class="size-3.5" aria-hidden="true">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Starts once the headline has largely resolved (140 + 1450 ≈ 1600). */
.hero-rule {
  animation: hero-rule 1100ms cubic-bezier(0.22, 1, 0.36, 1) 1150ms both;
}

/* Threads in just behind the rule, while it is still travelling. */
.hero-tail {
  animation: hero-tail 900ms cubic-bezier(0.22, 1, 0.36, 1) 1650ms both;
}

@keyframes hero-rule {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes hero-tail {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .hero-rule,
  .hero-tail {
    animation: none;
  }
}
</style>
