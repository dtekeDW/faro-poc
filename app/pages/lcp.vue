<script setup lang="ts">
const route = useRoute()
const scenario = findScenario('lcp')

useHead({ title: `${scenario.label} — Sequence` })

const variants: Record<string, { width: number, delay: number }> = {
  good: { width: 1600, delay: 0 },
  heavy: { width: 2400, delay: 0 },
  slow: { width: 2400, delay: 2600 },
  lazy: { width: 2400, delay: 3800 },
}

const active = computed(() => variants[String(route.query.v)] ?? variants.good!)
const isDeferred = computed(() => route.query.v === 'lazy')
</script>

<template>
  <ScenarioShell id="lcp">
    <template #lead>
      <!--
        First element on the page and the full viewport wide. LCP only considers
        what is inside the viewport, so this has to lead — behind a header it is
        never a candidate and the page scores green however late it arrives.
      -->
      <figure class="relative h-[70svh] w-full overflow-hidden bg-ink-raised">
        <img
          :key="String(route.query.v ?? 'good')"
          :src="`/api/image?id=${HERO_IMAGE}&w=${active.width}&h=${Math.round(active.width * 9 / 16)}&delay=${active.delay}`"
          :width="isDeferred ? undefined : active.width"
          :height="isDeferred ? undefined : Math.round(active.width * 9 / 16)"
          :fetchpriority="isDeferred ? 'auto' : 'high'"
          :loading="isDeferred ? 'lazy' : 'eager'"
          alt=""
          data-testid="lcp-media"
          class="photo size-full object-cover"
        >
      </figure>
    </template>

    <LcpLab />
  </ScenarioShell>
</template>
