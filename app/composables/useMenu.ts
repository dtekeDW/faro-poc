/**
 * Menu state plus the ground inversion it drives.
 *
 * The page ground lives in a single custom property on the document element so
 * the header, the panel and every section below it invert together in one
 * transition rather than each animating its own background.
 */
export function useMenu() {
  const isOpen = useState('menu-open', () => false)

  function apply(open: boolean) {
    if (import.meta.server)
      return

    const root = document.documentElement
    root.style.setProperty('--ground', open ? 'var(--color-dodger)' : 'var(--color-ink)')
    root.style.overflow = open ? 'hidden' : ''
  }

  function toggle() {
    isOpen.value = !isOpen.value
    apply(isOpen.value)
  }

  function close() {
    if (!isOpen.value)
      return

    isOpen.value = false
    apply(false)
  }

  return { isOpen, toggle, close }
}
