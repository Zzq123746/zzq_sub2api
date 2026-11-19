import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import GanglLanding from '../GanglLanding.vue'

vi.mock('vue-i18n', async (importOriginal) => ({ ...await importOriginal<typeof import('vue-i18n')>(), useI18n: () => ({ t: (key: string) => key }) }))
const wrappers: ReturnType<typeof mount>[] = []
function render() {
  const wrapper = mount(GanglLanding, {
    props: { siteName: 'GanglAPI', siteLogo: '', siteSubtitle: 'Gateway', docUrl: '', isAuthenticated: false, dashboardPath: '/dashboard', isDark: false, showModelPlazaEntry: false },
    global: { stubs: { RouterLink: RouterLinkStub, LocaleSwitcher: true } },
  })
  wrappers.push(wrapper)
  return wrapper
}
afterEach(() => { wrappers.splice(0).forEach(wrapper => wrapper.unmount()); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('GanglLanding protocol examples', () => {
  it('shows a copyable request in the integration section and switches all three protocols', async () => {
    const wrapper = render()
    expect(wrapper.find('.landing-connection .landing-code-panel').exists()).toBe(true)
    const tabs = wrapper.findAll('[role="tab"]')
    await tabs[1].trigger('click')
    expect(tabs[1].attributes('aria-selected')).toBe('true')
    expect(tabs[0].attributes('aria-selected')).toBe('false')
    expect(wrapper.get('.landing-code-panel code').text()).toContain('/v1/messages')
    await tabs[2].trigger('click')
    expect(wrapper.get('.landing-code-panel code').text()).toContain('/v1beta/models/YOUR_MODEL:generateContent')
    expect(wrapper.get('.landing-code-panel code').text()).toContain('x-goog-api-key: $API_KEY')
    expect(wrapper.get('[role="tabpanel"]').attributes('aria-labelledby')).toBe(tabs[2].attributes('id'))
  })

  it('supports Home, End and wraparound navigation between protocol tabs', async () => {
    const wrapper = render()
    await wrapper.get('[role="tab"]').trigger('keydown', { key: 'End' })
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('Gemini')
    await wrapper.get('[aria-selected="true"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('OpenAI')
    await wrapper.get('[aria-selected="true"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('Gemini')
    await wrapper.get('[aria-selected="true"]').trigger('keydown', { key: 'Home' })
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('OpenAI')
    expect(wrapper.findAll('[role="tab"][tabindex="0"]')).toHaveLength(1)
  })

  it('does not confirm a previous copy after the user switches protocols', async () => {
    let finishCopy!: () => void
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn(() => new Promise<void>(resolve => { finishCopy = resolve })) } })
    const wrapper = render()
    await wrapper.get('.landing-copy-button').trigger('click')
    await wrapper.findAll('[role="tab"]')[2].trigger('click')
    finishCopy()
    await flushPromises()
    expect(wrapper.get('.landing-copy-status').text()).toBe('')
    expect(wrapper.get('.landing-code-panel code').text()).toContain('generateContent')
  })

  it('moves the navigation highlight with keyboard focus and clears it when focus leaves', async () => {
    const wrapper = render()
    const rail = wrapper.get('.landing-nav-links')
    const link = rail.get('a')
    vi.spyOn(rail.element, 'getBoundingClientRect').mockReturnValue({ left: 20 } as DOMRect)
    vi.spyOn(link.element, 'getBoundingClientRect').mockReturnValue({ left: 50, width: 96 } as DOMRect)
    await link.trigger('focusin')
    const highlight = wrapper.get('.landing-nav-highlight')
    expect(highlight.attributes('style')).toContain('translateX(30px)')
    expect(highlight.attributes('style')).toContain('width: 96px')
    expect(highlight.attributes('style')).toContain('opacity: 1')
    await link.trigger('focusout', { relatedTarget: null })
    expect(highlight.attributes('style')).toContain('opacity: 0')
  })

  it('does not leave a hover highlight behind after a touch interaction', async () => {
    const wrapper = render()
    await wrapper.get('.landing-nav-links a').trigger('pointerover', { pointerType: 'touch' })
    expect(wrapper.get('.landing-nav-highlight').attributes('style')).toContain('opacity: 0')
  })

  it('switches protocol with the keyboard and copies the currently displayed request', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const wrapper = render()
    await wrapper.get('[role="tab"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('Anthropic')
    expect(wrapper.get('.landing-code-panel code').text()).toContain('/v1/messages')
    await wrapper.get('.landing-copy-button').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith(wrapper.get('.landing-code-panel code').text())
    expect(wrapper.get('.landing-copy-button').text()).toContain('experience.copied')
    await wrapper.get('[aria-selected="true"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.get('.landing-code-panel code').text()).toContain('/v1/responses')
    expect(wrapper.get('.landing-copy-button').text()).toContain('experience.copy')
    vi.unstubAllGlobals()
  })

  it('shows a useful fallback when clipboard access is denied', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    const wrapper = render()
    await wrapper.get('.landing-copy-button').trigger('click')
    await flushPromises()
    expect(wrapper.get('.landing-code-panel [aria-live="polite"]').text()).toBe('experience.copyFailed')
    expect(wrapper.get('.landing-code-panel code').text()).toContain('YOUR_MODEL')
    vi.unstubAllGlobals()
  })
})
