<script setup lang="ts">
const projects = [
  { title: 'After School', year: 2025, tags: ['Documentary', 'Social'], scale: 'lg' },
  { title: 'Code in the Capsule', year: 2026, tags: ['Motion', 'Social'], scale: 'sm' },
  { title: 'Light Through the Archive', year: 2025, tags: ['Documentary', 'Corporate'], scale: 'sm' },
  { title: 'Northbound', year: 2026, tags: ['Commercial', 'Product'], scale: 'lg' },
] as const
</script>

<template>
  <section id="works" class="px-6 py-24 md:px-10 md:py-32">
    <h2 class="max-w-[14ch] text-[11vw] font-extrabold leading-[0.86] tracking-[-0.05em] md:text-[5.5vw]">
      A few projects we're proud of
    </h2>

    <!--
      Deliberately uneven: two large slots and two small ones, so the grid
      reads as an edit rather than as a row of equal cards.
    -->
    <div class="mt-14 grid gap-x-6 gap-y-14 md:grid-cols-12">
      <article
        v-for="project in projects"
        :key="project.title"
        class="group"
        :class="project.scale === 'lg' ? 'md:col-span-7' : 'md:col-span-5 md:self-end'"
      >
        <div class="overflow-hidden bg-ink-raised">
          <img
            :src="`https://picsum.photos/seed/${encodeURIComponent(project.title)}/1200/${project.scale === 'lg' ? 750 : 900}`"
            :width="1200"
            :height="project.scale === 'lg' ? 750 : 900"
            loading="lazy"
            decoding="async"
            :alt="project.title"
            class="w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          >
        </div>

        <div class="mt-5 flex items-baseline justify-between gap-6 border-t border-chalk/12 pt-4">
          <h3 class="text-2xl font-bold tracking-[-0.03em] md:text-3xl">
            {{ project.title }}
          </h3>
          <span class="tnum shrink-0 font-accent text-lg italic text-mute">{{ project.year }}</span>
        </div>
        <p class="mt-1 text-sm text-mute">
          {{ project.tags.join(' · ') }}
        </p>
      </article>
    </div>
  </section>
</template>
