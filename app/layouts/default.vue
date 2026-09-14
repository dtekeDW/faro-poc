<script setup lang="ts">
const { isOpen, toggle, close } = useMenu()

const links = [
  { label: 'Works', to: '#works', meta: '24 films' },
  { label: 'Gallery', to: '#gallery', meta: '68 stills' },
  { label: 'Playground', to: '#playground', meta: '8 formats' },
  { label: 'Questions', to: '#questions', meta: null },
  { label: 'Contact', to: '#contact', meta: null },
]

onMounted(() => {
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape')
      close()
  }
  window.addEventListener('keydown', onKey)
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
})
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
      The panel clips down from the top edge rather than fading: the ground is
      already inverting underneath, and a second opacity animation on top of
      that reads as two unrelated effects instead of one gesture.
    -->
    <Transition
      enter-active-class="transition-[clip-path] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      enter-from-class="[clip-path:inset(0_0_100%_0)]"
      enter-to-class="[clip-path:inset(0_0_0_0)]"
      leave-active-class="transition-[clip-path] duration-[600ms] ease-[cubic-bezier(0.7,0,0.84,0)]"
      leave-from-class="[clip-path:inset(0_0_0_0)]"
      leave-to-class="[clip-path:inset(0_0_100%_0)]"
    >
      <nav
        v-if="isOpen"
        id="site-menu"
        class="fixed inset-0 z-40 flex flex-col justify-end bg-dodger px-6 pb-10 pt-24 text-ink md:px-10"
      >
        <ul class="border-t border-ink/15">
          <li v-for="(link, index) in links" :key="link.label">
            <a
              :href="link.to"
              class="group flex items-baseline justify-between gap-6 border-b border-ink/15 py-4 transition-opacity duration-300 hover:opacity-55 md:py-5"
              :style="{ transitionDelay: `${index * 40}ms` }"
              @click="close()"
            >
              <span class="text-[13vw] font-extrabold leading-[0.82] tracking-[-0.05em] md:text-[7vw]">
                {{ link.label }}
              </span>
              <span v-if="link.meta" class="tnum shrink-0 font-accent text-base italic md:text-xl">
                {{ link.meta }}
              </span>
            </a>
          </li>
        </ul>

        <div class="mt-10 flex flex-wrap gap-x-12 gap-y-3 text-sm text-ink/70">
          <a href="mailto:hello@sequence.com" class="hover:text-ink">hello@sequence.com</a>
          <span class="tnum">(217) 555-0134</span>
          <span>123 Main Street, Austin TX</span>
        </div>
      </nav>
    </Transition>

    <main>
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>
