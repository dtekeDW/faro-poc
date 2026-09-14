/**
 * Lets ?display=<id> swap the display face across the whole site while a
 * headline is being chosen. Judging a face on a specimen wall and judging it
 * on the real page are different exercises; this makes the second one cheap.
 */
export function useDisplayOverride() {
  const route = useRoute()

  const face = computed(() =>
    HEADLINE_FACES.find(candidate => candidate.id === String(route.query.display)) ?? null,
  )

  onMounted(() => watchEffect(() => {
    const root = document.documentElement

    if (!face.value) {
      root.style.removeProperty('--font-display')
      return
    }

    root.style.setProperty('--font-display', `"${face.value.name}", ui-sans-serif, sans-serif`)
  }))

  return { face }
}
