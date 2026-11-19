import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

const clamp = (value: number) => Math.min(1, Math.max(0, value))

// Layout coordinates ignore the transforms this composable applies, preventing
// visual feedback from changing the next frame's scroll progress.
function layoutBounds(element: HTMLElement) {
  let top = 0
  let current: HTMLElement | null = element
  while (current) {
    top += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }
  return { top: top - window.scrollY, height: element.offsetHeight }
}

/** Native scrolling with frame-batched, reversible visual progress. No wheel interception. */
export function useLandingScroll(root: Ref<HTMLElement | undefined>) {
  const activeStep = ref(0)
  const enabled = ref(false)
  let frame = 0
  let preference: MediaQueryList | undefined
  let observer: ResizeObserver | undefined
  let hero: HTMLElement | null = null
  let sections: HTMLElement[] = []
  let steps: HTMLElement[] = []
  let mounted = false

  function update() {
    frame = 0
    const page = root.value
    if (!mounted || !page || document.hidden || !enabled.value) return
    const height = window.innerHeight
    let heroProgress: string | undefined
    if (hero) {
      const rect = hero.getBoundingClientRect()
      const distance = window.innerWidth > 850 && height > 680 ? rect.height - height + 112 : rect.height
      heroProgress = clamp((112 - rect.top) / Math.max(1, distance)).toFixed(4)
    }
    // Read all positions before writing styles to avoid repeated layout work.
    const positions = sections.map(element => {
      const rect = layoutBounds(element)
      const enter = clamp((height * .94 - rect.top) / Math.max(1, Math.min(rect.height * .65, height * .48)))
      const progress = element.querySelector(':focus-visible') ? '1.0000' : enter.toFixed(4)
      return { element, progress }
    })
    const stepPositions = steps.map(layoutBounds)
    // Write only changed values after every layout read has finished. Fully
    // revealed/offscreen scenes then stay untouched throughout normal scrolling.
    if (hero && heroProgress !== undefined) setProgress(hero, '--hero-progress', heroProgress)
    positions.forEach(({ element, progress }) => setProgress(element, '--scroll-enter', progress))
    let nextStep = 0
    stepPositions.forEach((rect, index) => { if (rect.top <= height * .56) nextStep = index })
    activeStep.value = nextStep
  }

  function setProgress(element: HTMLElement, property: string, value: string) {
    if (element.style.getPropertyValue(property) !== value) {
      element.style.setProperty(property, value)
    }
  }

  function schedule() {
    if (!frame && enabled.value && !document.hidden) frame = requestAnimationFrame(update)
  }

  function syncPreference() {
    enabled.value = !preference?.matches
    const page = root.value
    if (!page) return
    page.classList.toggle('scroll-enhanced', enabled.value)
    if (enabled.value) schedule()
    else {
      cancelAnimationFrame(frame)
      frame = 0
      activeStep.value = 0
      hero?.style.removeProperty('--hero-progress')
      sections.forEach(element => element.style.removeProperty('--scroll-enter'))
    }
  }

  function visibilityChanged() {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0 }
    else schedule()
  }

  // Keep keyboard navigation usable even for an element not yet revealed by scrolling.
  function focusIn(event: FocusEvent) {
    const target = event.target
    if (!(target instanceof Element) || !target.matches(':focus-visible')) return
    const section = target.closest<HTMLElement>('[data-scroll-scene]')
    if (section) setProgress(section, '--scroll-enter', '1.0000')
  }

  onMounted(() => {
    const page = root.value
    if (!page || typeof window.matchMedia !== 'function') return
    mounted = true
    hero = page.querySelector('.landing-hero')
    sections = Array.from(page.querySelectorAll<HTMLElement>('[data-scroll-scene]'))
    steps = Array.from(page.querySelectorAll<HTMLElement>('.landing-steps > li'))
    preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    preference.addEventListener?.('change', syncPreference)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    document.addEventListener('visibilitychange', visibilityChanged)
    page.addEventListener('focusin', focusIn)
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(schedule)
      observer.observe(page)
    }
    syncPreference()
  })

  onBeforeUnmount(() => {
    mounted = false
    cancelAnimationFrame(frame)
    observer?.disconnect()
    preference?.removeEventListener?.('change', syncPreference)
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    document.removeEventListener('visibilitychange', visibilityChanged)
    root.value?.removeEventListener('focusin', focusIn)
    root.value?.classList.remove('scroll-enhanced')
  })

  return { activeStep, scrollEnabled: enabled }
}
