<template>
  <!--
    The only full-bleed image on the page after the hero. It exists as a
    rhythm break: everything around it is left-aligned and dense, so one wide
    centred moment resets the reading before the closing sections.
  -->
  <section class="relative isolate flex min-h-[70svh] items-center justify-center overflow-hidden">
    <img
      :src="photo(QUOTE_IMAGE, 2000, 1200)"
      width="2000"
      height="1200"
      loading="lazy"
      decoding="async"
      alt=""
      class="photo absolute inset-0 -z-10 size-full object-cover"
    >
    <div class="absolute inset-0 -z-10 bg-ink/72" />

    <figure class="mx-auto max-w-[22ch] px-6 text-center md:px-10">
      <blockquote class="type-section">
        They said it better than we could
      </blockquote>
      <p class="type-body mx-auto mt-8 max-w-[46ch] text-chalk">
        “They shot for four days and came back with a film we are still running
        two years later. Nobody on our side had to explain the brand twice.”
      </p>
      <figcaption class="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-mute">
        <span class="text-chalk">Marta Ellis</span>
        <span aria-hidden="true">&ast;</span>
        <span>Brand Director, CloudPeak</span>
      </figcaption>
    </figure>
  </section>
</template>
