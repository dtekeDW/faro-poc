<script setup lang="ts">
import { AccordionContent, AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from 'reka-ui'
import { Plus } from 'lucide-vue-next'

const { isDegraded } = defineProps<{ isDegraded: boolean }>()

const questions = [
  {
    q: 'How long does a typical production take?',
    a: 'Most brand films run four to six weeks from kickoff to final delivery, including two rounds of revisions.',
  },
  {
    q: 'Do you handle scripting and storyboarding?',
    a: 'Yes. Every package includes concept development, scripting and a shot-by-shot storyboard before we roll.',
  },
  {
    q: 'Can you work with an existing brand guideline?',
    a: 'We work inside your guidelines by default and will flag anything that limits the edit.',
  },
  {
    q: 'What does post production include?',
    a: 'Colour grading, sound design, motion graphics and delivery in every aspect ratio your channels need.',
  },
]

const open = ref<string[]>([])

/**
 * Recomputes a pointless layout-reading loop on every toggle. Reading
 * `offsetHeight` in a loop forces synchronous layout, which is a realistic
 * stand-in for the accidental thrashing that shows up in real accordions.
 */
function onToggle() {
  if (!isDegraded)
    return

  const nodes = document.querySelectorAll('[data-faq-item]')
  for (let pass = 0; pass < 400; pass++) {
    nodes.forEach((node) => {
      void (node as HTMLElement).offsetHeight
    })
  }
}
</script>

<template>
  <section id="questions" class="border-t border-chalk/10 px-6 py-24 md:px-10 md:py-32">
    <h2 class="max-w-[14ch] text-[11vw] font-extrabold leading-[0.86] tracking-[-0.05em] md:text-[5.5vw]">
      The questions before the cameras roll
    </h2>

    <AccordionRoot v-model="open" type="multiple" data-testid="faq" class="mt-14 max-w-[70ch]">
      <AccordionItem
        v-for="item in questions"
        :key="item.q"
        :value="item.q"
        data-faq-item
        class="border-b border-chalk/12"
      >
        <AccordionHeader>
          <AccordionTrigger
            class="group flex w-full items-center justify-between gap-6 cursor-pointer py-6 text-left text-lg transition-colors duration-300 hover:text-dodger"
            @click="onToggle"
          >
            {{ item.q }}
            <Plus class="size-5 shrink-0 transition group-data-[state=open]:rotate-45" />
          </AccordionTrigger>
        </AccordionHeader>

        <AccordionContent class="overflow-hidden pb-6 text-[15px] leading-relaxed text-mute">
          {{ item.a }}
        </AccordionContent>
      </AccordionItem>
    </AccordionRoot>
  </section>
</template>
