import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLandingScroll } from '../useLandingScroll'

let preference: MediaQueryList
let queued: FrameRequestCallback | undefined
let cancel: ReturnType<typeof vi.fn>
const wrappers: ReturnType<typeof mount>[] = []
const Harness = defineComponent({
  setup() {
    const root = ref<HTMLElement>()
    const { activeStep } = useLandingScroll(root)
    return { root, activeStep }
  },
  template: '<div ref="root"><section class="landing-hero"></section><section data-scroll-scene>Content</section><ol class="landing-steps"><li>Key</li><li>Model</li><li>Request</li></ol><output>{{ activeStep }}</output></div>',
})
function render() {
  const wrapper = mount(Harness)
  wrappers.push(wrapper)
  Object.defineProperty(wrapper.get('[data-scroll-scene]').element, 'offsetTop', { configurable: true, value: 1200 })
  Object.defineProperty(wrapper.get('[data-scroll-scene]').element, 'offsetHeight', { configurable: true, value: 400 })
  wrapper.findAll('li').forEach((item, index) => Object.defineProperty(item.element, 'offsetTop', { configurable: true, value: 1200 + index * 400 }))
  return wrapper
}
function frame() { const callback = queued; queued = undefined; callback?.(0) }
function scroll(y: number) { Object.defineProperty(window, 'scrollY', { configurable: true, value: y }); window.dispatchEvent(new Event('scroll')); frame() }

beforeEach(() => {
  queued = undefined
  preference = Object.assign(new EventTarget(), { matches: false }) as MediaQueryList
  vi.spyOn(window, 'matchMedia').mockReturnValue(preference)
  vi.stubGlobal('requestAnimationFrame', vi.fn(callback => { queued = callback; return 1 }))
  cancel = vi.fn(() => { queued = undefined })
  vi.stubGlobal('cancelAnimationFrame', cancel)
  vi.stubGlobal('innerHeight', 900)
  vi.stubGlobal('scrollY', 0)
})
afterEach(() => { wrappers.splice(0).forEach(wrapper => wrapper.unmount()); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('landing scroll behavior', () => {
  it('reverses scene progress and the active step when scrolling back up', async () => {
    const wrapper = render()
    frame()
    const scene = wrapper.get('[data-scroll-scene]').element as HTMLElement
    expect(scene.style.getPropertyValue('--scroll-enter')).toBe('0.0000')
    scroll(1800)
    await wrapper.vm.$nextTick()
    expect(scene.style.getPropertyValue('--scroll-enter')).toBe('1.0000')
    expect(wrapper.get('output').text()).toBe('2')
    scroll(0)
    await wrapper.vm.$nextTick()
    expect(scene.style.getPropertyValue('--scroll-enter')).toBe('0.0000')
    expect(wrapper.get('output').text()).toBe('0')
  })

  it('immediately restores static content when reduced motion is enabled', () => {
    const wrapper = render()
    frame()
    Object.assign(preference, { matches: true })
    preference.dispatchEvent(new Event('change'))
    expect(wrapper.classes()).not.toContain('scroll-enhanced')
    const scene = wrapper.get('[data-scroll-scene]').element as HTMLElement
    expect(scene.style.getPropertyValue('--scroll-enter')).toBe('')
    vi.mocked(requestAnimationFrame).mockClear()
    scroll(1000)
    expect(requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('does not start scroll effects for an existing reduced-motion preference', () => {
    Object.assign(preference, { matches: true })
    const wrapper = render()
    expect(wrapper.classes()).not.toContain('scroll-enhanced')
    expect(requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('batches a burst of scroll events into one animation frame', () => {
    render()
    frame()
    vi.mocked(requestAnimationFrame).mockClear()
    for (let index = 0; index < 6; index++) window.dispatchEvent(new Event('scroll'))
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
    frame()
    window.dispatchEvent(new Event('scroll'))
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2)
  })

  it('cancels pending work while hidden and resumes at the current scroll position', async () => {
    let hidden = false
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
    const wrapper = render()
    hidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    vi.mocked(requestAnimationFrame).mockClear()
    scroll(1800)
    expect(requestAnimationFrame).not.toHaveBeenCalled()
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    frame()
    await wrapper.vm.$nextTick()
    expect(wrapper.get('output').text()).toBe('2')
  })

  it('resets the static stage caption when reduced motion is enabled mid-story', async () => {
    const wrapper = render()
    scroll(1800)
    await wrapper.vm.$nextTick()
    expect(wrapper.get('output').text()).toBe('2')
    Object.assign(preference, { matches: true })
    preference.dispatchEvent(new Event('change'))
    await wrapper.vm.$nextTick()
    expect(wrapper.get('output').text()).toBe('0')
  })

  it('removes scroll work and cancels queued frames on unmount', () => {
    const wrapper = render()
    wrapper.unmount()
    wrappers.pop()
    vi.mocked(requestAnimationFrame).mockClear()
    window.dispatchEvent(new Event('scroll'))
    expect(requestAnimationFrame).not.toHaveBeenCalled()
    expect(cancel).toHaveBeenCalled()
  })
})
