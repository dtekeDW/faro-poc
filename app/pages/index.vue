<script setup lang="ts">
const degradations = useDegradations()
const variant = useVariantLabel()

const { $faro } = useNuxtApp()

/**
 * Tags every subsequent beacon with the active variant so a dashboard panel
 * can put the optimized and degraded runs of the same module side by side.
 */
watchEffect(() => {
  $faro?.api?.setSession({ attributes: { variant: variant.value } })
})
</script>

<template>
  <div>
    <HeroShowreel :is-degraded="degradations.hero" />
    <MarqueeStrip />
    <FeaturedWorks />
    <OrbitGallery :is-degraded="degradations.gallery" />
    <StatsCounter />
    <LogoWall :is-degraded="degradations.logos" />
    <CategoryFilter :is-degraded="degradations.filter" />
    <FaqAccordion :is-degraded="degradations.faq" />
  </div>
</template>
