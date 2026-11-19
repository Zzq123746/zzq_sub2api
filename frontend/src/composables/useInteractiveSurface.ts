import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Pointer animation is frame-batched and disabled for touch and reduced-motion users. */
export function useInteractiveSurface() {
  const surface = ref<HTMLElement>()
  let frame = 0
  let pointerX = 0
  let pointerY = 0
  let finePointer: MediaQueryList | undefined
  let reducedMotion: MediaQueryList | undefined

  function resetSurface() {
    cancelAnimationFrame(frame)
    frame = 0
    surface.value?.style.removeProperty('--tilt-x')
    surface.value?.style.removeProperty('--tilt-y')
    surface.value?.style.removeProperty('--pointer-x')
    surface.value?.style.removeProperty('--pointer-y')
    surface.value?.classList.remove('pointer-active')
  }

  function moveSurface(event: PointerEvent) {
    if (!finePointer?.matches || reducedMotion?.matches || event.pointerType === 'touch') return
    pointerX = event.clientX
    pointerY = event.clientY
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      const element = surface.value
      if (!element) return
      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const x = Math.min(1, Math.max(0, (pointerX - rect.left) / rect.width))
      const y = Math.min(1, Math.max(0, (pointerY - rect.top) / rect.height))
      element.style.setProperty('--tilt-x', `${(0.5 - y) * 5}deg`)
      element.style.setProperty('--tilt-y', `${(x - 0.5) * 5}deg`)
      element.style.setProperty('--pointer-x', `${x * 100}%`)
      element.style.setProperty('--pointer-y', `${y * 100}%`)
      element.classList.add('pointer-active')
    })
  }
  onMounted(() => {
    finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    finePointer.addEventListener?.('change', resetSurface)
    reducedMotion.addEventListener?.('change', resetSurface)
  })
  onBeforeUnmount(() => {
    resetSurface()
    finePointer?.removeEventListener?.('change', resetSurface)
    reducedMotion?.removeEventListener?.('change', resetSurface)
  })
  return { surface, moveSurface, resetSurface }
}
