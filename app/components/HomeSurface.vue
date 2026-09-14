<script setup lang="ts">
import type { Degradations } from '~/composables/useDegradation'

/**
 * The page body every scenario route renders.
 *
 * All routes show identical content and differ only in which module runs
 * degraded, so a dashboard row comparison is about the defect and nothing else.
 */
const { scenario = 'healthy' } = defineProps<{ scenario?: string }>()

const active = computed(() => findScenario(scenario))

const degradations = computed<Degradations>(() => ({
  hero: false,
  gallery: false,
  logos: false,
  faq: false,
  filter: false,
  ...active.value.degradations,
}))

useFaroPage(() => active.value.id)
</script>

<template>
  <div>
    <HeroShowreel :is-degraded="degradations.hero" />
    <MarqueeStrip />
    <FeaturedWorks />
    <OrbitGallery :is-degraded="degradations.gallery" />
    <CategoryFilter :is-degraded="degradations.filter" />
    <PullQuote />
    <StatsCounter />
    <ClientLoop :is-degraded="degradations.logos" />
    <FaqAccordion :is-degraded="degradations.faq" />
  </div>
</template>
