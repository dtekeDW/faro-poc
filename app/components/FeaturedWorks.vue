<script setup lang="ts">
const projects = [
  { title: 'After School', year: 2025, tags: ['Documentary', 'Social'], scale: 'lg', image: WORK_IMAGES[0] },
  { title: 'Code in the Capsule', year: 2026, tags: ['Motion', 'Social'], scale: 'sm', image: WORK_IMAGES[1] },
  { title: 'Light Through the Archive', year: 2025, tags: ['Documentary', 'Corporate'], scale: 'sm', image: WORK_IMAGES[2] },
  { title: 'Northbound', year: 2026, tags: ['Commercial', 'Product'], scale: 'lg', image: WORK_IMAGES[3] },
] as const
</script>

<template>
  <section id="works" class="section-loose">
    <h2 class="max-w-[14ch] type-section">
      A few projects we're proud of
    </h2>

    <!--
      Deliberately uneven: two large slots and two small ones, so the grid
      reads as an edit rather than as a row of equal cards.
    -->
    <div class="mt-20 grid gap-x-8 gap-y-24 md:grid-cols-12">
      <article
        v-for="project in projects"
        :key="project.title"
        class="group photo-reveal"
        :class="project.scale === 'lg' ? 'md:col-span-8' : 'md:col-span-4 md:self-end'"
      >
        <div class="overflow-hidden bg-ink-raised">
          <img
            :src="photo(project.image, 1600, project.scale === 'lg' ? 1000 : 1200)"
            :width="1600"
            :height="project.scale === 'lg' ? 1000 : 1200"
            loading="lazy"
            decoding="async"
            :alt="project.title"
            class="photo w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          >
        </div>

        <div class="mt-6 flex items-baseline justify-between gap-6 border-t border-chalk/12 pt-5">
          <h3 class="type-title">
            {{ project.title }}
          </h3>
          <span class="type-data shrink-0 type-data text-sm text-mute">{{ project.year }}</span>
        </div>
        <p class="mt-1 text-sm text-mute">
          {{ project.tags.join(' · ') }}
        </p>
      </article>
    </div>
  </section>
</template>
