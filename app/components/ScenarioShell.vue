<script setup lang="ts">
/**
 * Shared chrome for every scenario page.
 *
 * The scenarios used to render the whole marketing homepage underneath, which
 * broke the measurement: its hero was the largest element on every route, so
 * each page reported a big LCP regardless of the defect it was built for. A
 * focused page keeps one metric attributable to one cause.
 */
const { id } = defineProps<{ id: string }>()

const scenario = computed(() => findScenario(id))

const others = computed(() =>
  SCENARIOS.filter(entry => entry.id !== id && entry.id !== 'healthy'),
)

const { $faro } = useNuxtApp()

/**
 * Tags the signals with the scenario twice over, because the two dimensions
 * answer different questions in the dashboard: the view name groups the paint
 * metrics per page, while the session attributes survive a navigation and make
 * a whole visit filterable. Existing attributes are spread back in — the SDK
 * keeps its own `isSampled` there and replacing the object drops it.
 */
onMounted(() => {
  watchEffect(() => {
    // Set explicitly rather than relying on trackNavigation alone: the page a
    // signal is filed under is the whole point of the demo, and it must not
    // depend on an experimental flag continuing to behave.
    $faro?.api?.setPage({ url: window.location.href })
    $faro?.api?.setView({ name: scenario.value.id })
    $faro?.api?.setSession({
      ...$faro?.api?.getSession?.(),
      attributes: {
        ...$faro?.api?.getSession?.()?.attributes,
        scenario: scenario.value.id,
        metric: scenario.value.metric,
      },
    })
  })
})
</script>

<template>
  <div class="section pt-32">
    <header class="max-w-[52ch]">
      <p class="type-data text-sm text-dodger">
        {{ scenario.metric === 'none' ? 'Control' : scenario.metric }}
      </p>
      <h1 class="type-section mt-4">
        <PerCharacterRise :text="scenario.label" />
      </h1>
      <p class="type-body mt-7 text-mute">
        {{ scenario.cause }}
      </p>
      <p class="type-body mt-3 text-chalk/75">
        {{ scenario.effect }}
      </p>
    </header>

    <div class="mt-20">
      <slot />
    </div>

    <nav class="rule mt-28 flex flex-wrap items-center gap-x-8 gap-y-3 pt-8 text-sm">
      <NuxtLink to="/lab" class="link-wipe text-dodger">
        Back to the lab
      </NuxtLink>
      <NuxtLink
        v-for="other in others"
        :key="other.id"
        :to="`/${other.id}`"
        class="text-mute transition-colors duration-300 hover:text-chalk"
      >
        {{ other.metric }}
      </NuxtLink>
    </nav>
  </div>
</template>
