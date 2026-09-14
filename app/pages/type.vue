<script setup lang="ts">
const { packages } = useTypeSystem()

useHead({ title: 'Type packages — Sequence' })

/** Faces are named literally so each specimen renders in its own package,
 *  independent of whatever the runtime switcher has applied to the page. */
const faceClass: Record<string, { display: string, text: string, mono: string, accent: string }> = {
  1: { display: 'fs-epilogue', text: 'fs-instrument', mono: 'fs-geist', accent: 'fs-epilogue' },
  2: { display: 'fs-albert', text: 'fs-instrument', mono: 'fs-geist', accent: 'fs-albert' },
  3: { display: 'fs-newsreader', text: 'fs-instrument', mono: 'fs-geist', accent: 'fs-newsreader' },
  4: { display: 'fs-urbanist', text: 'fs-instrument', mono: 'fs-geist', accent: 'fs-urbanist' },
  5: { display: 'fs-literata', text: 'fs-instrument', mono: 'fs-geist', accent: 'fs-literata' },
}
</script>

<template>
  <div class="px-6 pb-32 pt-28 md:px-10">
    <header class="border-b border-chalk/12 pb-10">
      <h1 class="fs-instrument max-w-[20ch] text-4xl font-bold tracking-[-0.03em] md:text-5xl">
        Three type packages, same words
      </h1>
      <p class="fs-instrument mt-4 max-w-[62ch] text-sm leading-relaxed text-mute">
        Each block below sets identical copy from the site in one package, so the
        only variable is the typeface. Use the link under each to browse the
        actual homepage in that package.
      </p>
    </header>

    <section
      v-for="pkg in packages"
      :key="pkg.id"
      class="border-b border-chalk/12 py-16"
    >
      <div class="flex flex-wrap items-baseline justify-between gap-4">
        <h2 :class="faceClass[pkg.id]!.display" class="text-2xl font-extrabold tracking-[-0.03em]">
          <span class="fs-geist mr-3 text-sm text-dodger">0{{ pkg.id }}</span>{{ pkg.name }}
        </h2>
        <p :class="faceClass[pkg.id]!.text" class="text-sm text-mute">
          {{ pkg.claim }}
        </p>
      </div>

      <!-- The headline is the real test: it is the largest type on the site. -->
      <p
        :class="faceClass[pkg.id]!.display"
        class="mt-8 max-w-[16ch] text-[12vw] font-extrabold leading-[0.86] tracking-[-0.05em] text-balance md:text-[6.5vw]"
      >
        We make videos people remember
      </p>

      <div class="mt-10 grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p :class="faceClass[pkg.id]!.text" class="max-w-[68ch] text-[15px] leading-relaxed text-chalk">
            A production studio working across brand film, documentary and
            commercial. Most productions run four to six weeks from kickoff to
            final delivery, including two rounds of revisions and colour grading,
            sound design and motion graphics in post.
          </p>
          <p :class="faceClass[pkg.id]!.text" class="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-mute">
            Secondary copy at the same measure, so the contrast between primary
            and muted text can be judged in the actual face rather than in
            isolation.
          </p>

          <p :class="faceClass[pkg.id]!.accent" class="mt-6 text-lg italic text-mute">
            Display face at text size, for asides and captions
          </p>
        </div>

        <div class="space-y-6">
          <!-- Nav labels: the face has to hold up at small size in all caps. -->
          <ul :class="faceClass[pkg.id]!.text" class="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <li v-for="label in ['Works', 'Gallery', 'Playground', 'Questions', 'Contact']" :key="label">
              {{ label }}
            </li>
          </ul>

          <!-- The orbit caption: wide tracking is where faces fall apart. -->
          <div class="border border-chalk/12 px-5 py-6 text-center">
            <p :class="faceClass[pkg.id]!.display" class="text-3xl font-extrabold uppercase tracking-[0.06em]">
              Kyoto
            </p>
            <p :class="faceClass[pkg.id]!.text" class="mt-2 text-[10px] font-bold uppercase tracking-[0.42em] text-mute">
              October 2026
            </p>
          </div>

          <!-- Figures and timecodes, where the mono face earns its place. -->
          <dl :class="faceClass[pkg.id]!.mono" class="grid grid-cols-3 gap-4 text-center">
            <div>
              <dt class="text-[10px] uppercase tracking-widest text-mute">Films</dt>
              <dd class="tnum mt-1 text-2xl">412</dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-widest text-mute">Runtime</dt>
              <dd class="tnum mt-1 text-2xl">01:42:08</dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-widest text-mute">Repeat</dt>
              <dd class="tnum mt-1 text-2xl">87%</dd>
            </div>
          </dl>
        </div>
      </div>

      <p :class="faceClass[pkg.id]!.text" class="mt-10 max-w-[70ch] text-sm leading-relaxed text-mute">
        {{ pkg.notes }}
      </p>

      <NuxtLink
        :to="`/?type=${pkg.id}`"
        class="group mt-6 inline-flex items-center gap-3 text-sm font-medium text-dodger"
        :class="faceClass[pkg.id]!.text"
      >
        <span class="relative">
          See the homepage in {{ pkg.name }}
          <span class="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-dodger transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-100" />
        </span>
        <span aria-hidden="true">&rarr;</span>
      </NuxtLink>
    </section>
  </div>
</template>
