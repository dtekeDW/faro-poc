<template>
  <footer id="contact" class="border-t border-chalk/10 px-6 py-20 md:px-10">
    <div class="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-[13vw] font-extrabold leading-[0.86] tracking-[-0.05em] md:text-[6vw]">
          Let's plan it
        </p>
        <a
          href="mailto:hello@sequence.com"
          class="group mt-6 inline-block text-lg text-dodger"
        >
          <span class="relative">
            hello@sequence.com
            <span class="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-dodger transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-100" />
          </span>
        </a>
      </div>

      <dl class="grid gap-y-2 text-sm text-mute">
        <div class="flex gap-4">
          <dt class="w-16 shrink-0">Phone</dt>
          <dd class="tnum text-chalk">(217) 555-0134</dd>
        </div>
        <div class="flex gap-4">
          <dt class="w-16 shrink-0">Studio</dt>
          <dd class="text-chalk">123 Main Street, Austin TX</dd>
        </div>
      </dl>
    </div>

    <p class="mt-20 max-w-[60ch] text-xs leading-relaxed text-mute">
      Synthetic demo application built to exercise Grafana Faro frontend
      observability. Sequence is not a real company and no content here
      describes an actual product or service.
    </p>
  </footer>
</template>
