<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

const { isDegraded } = defineProps<{ isDegraded: boolean }>()

/**
 * The film is served from wherever NUXT_PUBLIC_SHOWREEL_URL points — a release
 * asset on GitHub's CDN, not a tracked file. No URL, no film: the hero keeps
 * its still and requests nothing at all.
 */
const FILM = useRuntimeConfig().public.showreelUrl

/**
 * The still is the first frame of the film, so the film arriving reads as the
 * frame coming to life rather than as a cut.
 *
 * Optimized serves a viewport-sized frame with explicit dimensions and a high
 * priority hint; degraded serves the 2400px original lazily and without
 * dimensions, which is the most common way a hero ruins an otherwise healthy
 * page.
 */
const still = computed(() =>
  isDegraded ? '/media/showreel-poster-2400.jpg' : '/media/showreel-poster.jpg',
)

const hero = useTemplateRef<HTMLElement>('hero')
const film = useTemplateRef<HTMLVideoElement>('film')

/** Empty until the page has painted and gone quiet; no source, no download. */
const source = ref<string>()
const isPlaying = ref(false)
const isWanted = ref(true)
const isOnScreen = ref(false)

useIntersectionObserver(hero, ([entry]) => {
  isOnScreen.value = entry?.isIntersecting ?? false
}, { threshold: 0.1 })

/*
 * Nothing about the film may compete with the still. The still fills the
 * viewport and is therefore what LCP measures; a video attached during load
 * would spend the same bandwidth on bytes nobody is waiting for yet. So the
 * source is set after the load event and then only in an idle moment — and
 * never at all for a visitor who asked for less motion.
 */
onMounted(() => {
  if (!FILM)
    return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isWanted.value = false
    return
  }

  const attach = () => {
    window.requestIdleCallback(() => {
      source.value = FILM
    })
  }

  if (document.readyState === 'complete')
    attach()
  else
    window.addEventListener('load', attach, { once: true })
})

/* A video playing off screen decodes frames nobody is looking at. */
watchEffect(() => {
  const element = film.value

  if (!element || !source.value)
    return

  if (isWanted.value && isOnScreen.value) {
    // Set here as well: autoplay is only permitted for a video the browser
    // knows is silent before play() is called.
    element.muted = true
    element.play().catch(() => {
      isPlaying.value = false
    })
  }
  else {
    element.pause()
  }
})
</script>

<template>
  <section ref="hero" class="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
    <img
      :key="still"
      :src="still"
      :width="isDegraded ? undefined : 1600"
      :height="isDegraded ? undefined : 900"
      :fetchpriority="isDegraded ? 'auto' : 'high'"
      :loading="isDegraded ? 'lazy' : 'eager'"
      alt=""
      data-testid="hero-media"
      class="photo absolute inset-0 size-full object-cover"
    >

    <!--
      Exactly the box the still occupies, so the film can never become a
      larger paint candidate than the frame it replaces. It fades in once it
      is actually running, and back out the moment it is paused.
    -->
    <video
      v-if="source"
      ref="film"
      :src="source"
      muted
      loop
      playsinline
      preload="auto"
      aria-hidden="true"
      tabindex="-1"
      data-testid="hero-film"
      class="absolute inset-0 size-full object-cover transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
      :class="isPlaying ? 'opacity-100' : 'opacity-0'"
      @playing="isPlaying = true"
      @pause="isPlaying = false"
      @error="source = undefined"
    />

    <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/70" />

    <!-- Anything that moves by itself for longer than five seconds needs a way
         to stop it. Only offered once there is something to stop. -->
    <button
      v-if="source"
      type="button"
      :aria-label="isWanted ? 'Pause the film' : 'Play the film'"
      class="film-toggle absolute right-6 top-28 z-10 grid size-10 place-items-center rounded-full border border-chalk/25 text-chalk transition-colors duration-300 hover:border-dodger hover:bg-dodger hover:text-ink md:right-10"
      @click="isWanted = !isWanted"
    >
      <svg v-if="isWanted" viewBox="0 0 24 24" class="size-3" aria-hidden="true">
        <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" />
      </svg>
      <svg v-else viewBox="0 0 24 24" class="size-3.5" aria-hidden="true">
        <path d="M8 5v14l11-7z" fill="currentColor" />
      </svg>
    </button>

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

      <div class="mt-7 flex flex-wrap items-end justify-between gap-6">
        <p class="hero-lede type-body max-w-[42ch] text-mute">
          A production studio working across brand film, documentary and
          commercial. Rated
          <span class="type-data text-chalk">4.9</span> from
          <span class="type-data text-chalk">480</span> verified reviews.
        </p>

        <a
          href="#works"
          class="hero-cta group inline-flex items-center gap-3 text-sm font-medium text-chalk"
        >
          <span class="link-wipe"><PerCharacterRise text="Play showreel" :delay="2050" /></span>
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
/* Arrives with the rest of the entrance rather than appearing over it. */
.film-toggle {
  animation: hero-cta 800ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Starts once the headline has largely resolved (140 + 1450 ≈ 1600). */
.hero-rule {
  animation: hero-rule 1100ms cubic-bezier(0.22, 1, 0.36, 1) 1150ms both;
}

/*
 * The lede resolves rather than merely fading: a quieter member of the same
 * family as the headline, so the two read as one idea at two volumes. Arriving
 * as one block with the call to action made both feel incidental.
 */
.hero-lede {
  animation: hero-lede 1200ms cubic-bezier(0.22, 1, 0.36, 1) 1500ms both;
}

/* Last in, once the line it sits on has settled. */
.hero-cta {
  animation: hero-cta 800ms cubic-bezier(0.22, 1, 0.36, 1) 1950ms both;
}

@keyframes hero-rule {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@keyframes hero-lede {
  from {
    filter: blur(6px);
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    filter: blur(0);
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hero-cta {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .film-toggle,
  .hero-rule,
  .hero-lede,
  .hero-cta {
    animation: none;
  }
}
</style>
