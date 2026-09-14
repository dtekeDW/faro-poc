<script setup lang="ts">
/**
 * Carries the studio facts that would otherwise sit as an eyebrow above the
 * headline. As a moving strip they read as a masthead rather than as a label
 * the heading has to compete with.
 */
const facts = ['New York', 'Est. 2015', '120+ brands', 'Award winning', '8 years']
</script>

<template>
  <div class="overflow-hidden border-y border-chalk/10 bg-ink-raised py-3">
    <div class="flex w-max animate-[marquee_38s_linear_infinite] gap-10 pr-10">
      <template v-for="pass in 2" :key="pass">
        <span
          v-for="fact in facts"
          :key="`${pass}-${fact}`"
          class="flex shrink-0 items-center gap-10 text-sm tracking-[-0.01em] text-mute"
        >
          {{ fact }}
          <span class="size-1 rounded-full bg-dodger" />
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
