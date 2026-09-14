<script setup lang="ts">
const { isDegraded } = defineProps<{ isDegraded: boolean }>()

interface Capability {
  name: string
  summary: string
  deliverables: string
  turnaround: string
  films: number
}

const capabilities: Capability[] = [
  { name: 'Social Media', summary: 'Vertical cutdowns built from the same shoot as the hero film, graded for small screens and sound-off viewing.', deliverables: '9:16, 1:1, 4:5', turnaround: '2 weeks', films: 84 },
  { name: 'Brand Film', summary: 'The anchor piece. Three to five minutes that a company can stand behind for years rather than a quarter.', deliverables: 'Master, 60s, 30s', turnaround: '6 weeks', films: 41 },
  { name: 'Product', summary: 'Tabletop and in-use coverage with controlled light, shot so a single setup carries an entire catalogue.', deliverables: 'Stills, 15s loops', turnaround: '3 weeks', films: 66 },
  { name: 'UGC', summary: 'Creator-led footage directed remotely, so it keeps the texture of the platform without losing the brand.', deliverables: 'Raw, edited, captioned', turnaround: '10 days', films: 52 },
  { name: 'Documentary', summary: 'Long-form interviews and observational shooting. The format that needs the most trust and the least direction.', deliverables: 'Feature, episodic', turnaround: '12 weeks', films: 23 },
  { name: 'Corporate', summary: 'Internal comms, recruitment and reporting that people actually finish watching.', deliverables: 'Master, subtitled', turnaround: '4 weeks', films: 58 },
  { name: 'Commercial', summary: 'Broadcast and pre-roll built around a single idea, cleared and delivered to every spec a media plan needs.', deliverables: 'TVC, 30s, 15s, 6s', turnaround: '8 weeks', films: 37 },
  { name: 'Event', summary: 'Multi-camera coverage with same-day turnaround for the clips that have to run while the room is still warm.', deliverables: 'Recap, highlights', turnaround: '48 hours', films: 51 },
]

const active = ref(capabilities[0]!)

/**
 * Blocks the main thread inside the click handler before committing state.
 * INP measures the whole path from input to next paint, so work done
 * synchronously here lands directly in the metric.
 */
function select(capability: Capability) {
  if (isDegraded) {
    const until = performance.now() + 320
    while (performance.now() < until) { /* deliberate busy wait */ }
  }

  active.value = capability
}
</script>

<template>
  <section id="playground" class="section-loose">
    <h2 class="type-section max-w-[12ch]">
      Our playground
    </h2>

    <div data-testid="category-filter" class="mt-10 flex flex-wrap gap-2">
      <button
        v-for="capability in capabilities"
        :key="capability.name"
        type="button"
        :data-active="capability.name === active.name"
        class="pill"
        @click="select(capability)"
      >
        {{ capability.name }}
      </button>
    </div>

    <!--
      The badges used to select nothing: the section announced a playground and
      then showed a single line. Each one now swaps a full panel, which is what
      makes the filter worth having.
    -->
    <div class="mt-14 grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-end md:gap-16">
      <div>
        <Transition
          mode="out-in"
          enter-active-class="transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          enter-from-class="opacity-0 translate-y-3"
          leave-active-class="transition duration-200"
          leave-to-class="opacity-0"
        >
          <div :key="active.name">
            <p class="type-section">
              {{ active.name }}
            </p>
            <p class="type-body mt-6 text-mute">
              {{ active.summary }}
            </p>

            <dl class="mt-10 grid grid-cols-3 gap-6 border-t border-chalk/12 pt-6">
              <div>
                <dt class="text-xs text-mute">
                  Films
                </dt>
                <dd class="type-data mt-1 text-2xl">
                  {{ active.films }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-mute">
                  Turnaround
                </dt>
                <dd class="type-data mt-1 text-2xl">
                  {{ active.turnaround }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-mute">
                  Delivery
                </dt>
                <dd class="mt-1 text-sm leading-snug">
                  {{ active.deliverables }}
                </dd>
              </div>
            </dl>
          </div>
        </Transition>
      </div>

      <figure class="photo-reveal relative aspect-[4/3] overflow-hidden bg-ink-raised">
        <Transition
          enter-active-class="transition duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          enter-from-class="opacity-0 scale-105"
          leave-active-class="absolute inset-0 transition duration-500"
          leave-to-class="opacity-0"
        >
          <img
            :key="active.name"
            :src="photo(CAPABILITY_IMAGES[active.name]!, 1000, 750)"
            width="1000"
            height="750"
            loading="lazy"
            decoding="async"
            alt=""
            class="photo size-full object-cover"
          >
        </Transition>
      </figure>
    </div>
  </section>
</template>
