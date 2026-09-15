<template>
  <!--
    No image behind it. A photograph and a statement competing for the same
    rectangle weakens both; the quote carries more on an empty ground, and the
    silence around it is what makes the page feel unhurried.
  -->
  <section class="section-loose text-center">
    <figure class="mx-auto max-w-6xl">
      <blockquote class="type-hero mx-auto max-w-[13ch]">
        <FocusBlurResolve text="They said it better" trigger-on-view />
      </blockquote>

      <!-- The one paragraph on the page that asks to be read rather than
           scanned, so it is the one that rewards reading: the words light as
           the quote travels up the viewport. -->
      <ScrollRevealParagraph
        class="mx-auto mt-16 max-w-[38ch] text-xl leading-[1.5] md:text-2xl"
        text="“They shot for four days and came back with a film we are still running two years later. Nobody on our side had to explain the brand twice.”"
      />

      <figcaption class="mt-14 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
        <span class="text-chalk">Marta Ellis</span>
        <span class="text-dodger" aria-hidden="true">&ast;</span>
        <span class="text-mute">Brand Director, CloudPeak</span>
      </figcaption>
    </figure>
  </section>
</template>
