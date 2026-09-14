<script setup lang="ts">
/**
 * Carries the studio facts that would otherwise sit as an eyebrow above the
 * headline. As a moving strip they read as a masthead rather than as a label
 * the heading has to compete with.
 */
const facts = ['New York', 'Est. 2015', '120+ brands', 'Award winning', '8 years']
</script>

<template>
  <!-- No ground and no rules: the strip should feel like it drifts across the
       page rather than sitting in a band of its own. -->
  <div class="overflow-hidden py-16 md:py-20">
    <div class="flex w-max animate-[marquee_44s_linear_infinite] gap-8 pr-8">
      <template v-for="pass in 2" :key="pass">
        <span
          v-for="fact in facts"
          :key="`${pass}-${fact}`"
          class="flex shrink-0 items-center gap-8 whitespace-nowrap text-xs font-medium uppercase tracking-[0.32em] text-mute"
        >
          {{ fact }}
          <span class="text-base leading-none text-dodger" aria-hidden="true">&ast;</span>
        </span>
      </template>
    </div>
  </div>
</template>

<style>
@keyframes marquee {
  to { transform: translateX(-50%); }
}
</style>
