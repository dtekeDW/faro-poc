<script setup lang="ts">
const { isOpen, toggle, close } = useMenu()

/**
 * The menu is the scenario navigator. Marketing anchors were the wrong content
 * for it: this is a demonstration surface, and the thing a viewer needs to move
 * between is the defects, with the metric each one ruins named right there.
 */
const links = computed(() =>
  SCENARIOS.map(scenario => ({
    label: scenario.menuLabel,
    to: scenario.id === 'healthy' ? '/' : `/${scenario.id}`,
    meta: scenario.metric === 'none' ? 'control' : scenario.metric,
  })),
)

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape')
    close()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="min-h-screen font-display text-chalk antialiased">
    <header class="fixed inset-x-0 top-0 z-50">
      <div
        class="flex items-center justify-between px-6 py-5 md:px-10"
        :class="isOpen ? 'text-ink' : 'text-chalk mix-blend-difference'"
      >
        <NuxtLink
          to="/"
          class="text-[15px] font-extrabold tracking-[-0.04em]"
          @click="close()"
        >
          Sequence
        </NuxtLink>

        <button
          type="button"
          data-testid="menu-toggle"
          :aria-expanded="isOpen"
          aria-controls="site-menu"
          class="group relative h-5 w-8 cursor-pointer"
          @click="toggle()"
        >
          <span class="sr-only">{{ isOpen ? 'Close menu' : 'Open menu' }}</span>
          <span
            class="absolute left-0 block h-px w-8 bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            :class="isOpen ? 'top-1/2 rotate-45' : 'top-1 group-hover:w-6'"
          />
          <span
            class="absolute left-0 block h-px w-8 bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            :class="isOpen ? 'top-1/2 -rotate-45' : 'bottom-1'"
          />
        </button>
      </div>
    </header>

    <!--
      The panel stays mounted and animates its clip-path. Toggling it with v-if
      inside a Transition makes SSR emit nothing where the client expects a
      comment anchor, which is a hydration mismatch, and it would rebuild the
      whole list on every open.
    -->
    <nav
      id="site-menu"
      :inert="!isOpen"
      :aria-hidden="!isOpen"
      class="fixed inset-0 z-40 flex flex-col justify-end bg-dodger px-6 pb-10 pt-24 text-ink transition-[clip-path] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] md:px-10"
      :class="isOpen ? '[clip-path:inset(0_0_0_0)]' : 'pointer-events-none [clip-path:inset(0_0_100%_0)]'"
    >
      <ul class="border-t border-ink/15">
        <li v-for="(link, index) in links" :key="link.label">
          <NuxtLink
            :to="link.to"
            class="group flex items-baseline justify-between gap-6 border-b border-ink/15 py-4 transition-opacity duration-300 hover:opacity-55 md:py-5"
            :style="{ transitionDelay: `${index * 40}ms` }"
            @click="close()"
          >
            <span class="type-nav">
              {{ link.label }}
            </span>
            <span v-if="link.meta" class="type-data shrink-0 text-sm md:text-base">
              {{ link.meta }}
            </span>
          </NuxtLink>
        </li>
      </ul>

      <!-- The lab is a different kind of destination from the scenarios, so it
           sits with the utilities rather than competing in the same list. -->
      <div class="mt-10 flex flex-wrap items-baseline gap-x-12 gap-y-3 text-sm text-ink/70">
        <NuxtLink to="/lab" class="link-wipe font-medium text-ink" @click="close()">
          Metrics lab
        </NuxtLink>
        <a href="mailto:hello@sequence.com" class="hover:text-ink">hello@sequence.com</a>
        <span class="type-data">(217) 555-0134</span>
        <span>123 Main Street, Austin TX</span>
      </div>
    </nav>

    <main>
      <!-- Injection point for the layout-shift lab. Content placed here sits
           above everything, so it displaces the entire visible page the way a
           late consent bar does — which is what makes the shift score large. -->
      <div id="shift-zone" />
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>
