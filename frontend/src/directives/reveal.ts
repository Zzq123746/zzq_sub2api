import type { ObjectDirective } from 'vue'

const cleanups = new WeakMap<HTMLElement, () => void>()

/** Progressive enhancement: content stays visible when observers or animation are unavailable. */
export const vReveal: ObjectDirective<HTMLElement, number | false | undefined> = {
  mounted(element, binding) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (binding.value === false || reduced.matches || typeof IntersectionObserver === 'undefined') return
    const delay = Math.max(0, Math.min(binding.value || 0, 300))
    element.style.setProperty('--reveal-delay', `${delay}ms`)
    const reveal = () => {
      element.classList.add('is-revealed')
      observer.disconnect()
    }
    const onPreference = () => { if (reduced.matches) reveal() }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) reveal()
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' })
    element.classList.add('motion-reveal')
    observer.observe(element)
    reduced.addEventListener?.('change', onPreference)
    cleanups.set(element, () => {
      observer.disconnect()
      reduced.removeEventListener?.('change', onPreference)
    })
  },
  unmounted(element) {
    cleanups.get(element)?.()
    cleanups.delete(element)
  },
}
