import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import AppLayout from '../AppLayout.vue'

const state = reactive({ path: '/dashboard', meta: { requiresAdmin: false } })
const auth = reactive({ user: { role: 'user' } })
vi.mock('vue-router', () => ({ useRoute: () => state, useRouter: () => ({}) }))
vi.mock('@/stores', () => ({ useAppStore: () => ({ sidebarCollapsed: false }) }))
vi.mock('@/stores/auth', () => ({ useAuthStore: () => auth }))
vi.mock('@/composables/useOnboardingTour', () => ({ useOnboardingTour: () => ({ replayTour: vi.fn() }) }))
vi.mock('@/stores/onboarding', () => ({ useOnboardingStore: () => ({ setReplayCallback: vi.fn() }) }))
vi.mock('../AppSidebar.vue', () => ({ default: { template: '<aside />' } }))
vi.mock('../AppHeader.vue', () => ({ default: { template: '<header />' } }))

function render() {
  return mount(AppLayout, { global: { stubs: { AtmosphereBackground: { template: '<div data-testid="atmosphere" />' } } }, slots: { default: '<p>Page content</p>' } })
}
beforeEach(() => { state.path = '/dashboard'; state.meta.requiresAdmin = false; auth.user.role = 'user' })

describe('user and administration interface separation', () => {
  it('uses the new appearance on user pages, including when an administrator visits them', async () => {
    auth.user.role = 'admin'
    const wrapper = render()
    expect(wrapper.classes()).toContain('workspace-shell')
    expect(wrapper.find('[data-testid="atmosphere"]').exists()).toBe(true)
    expect(wrapper.find('main').classes()).toContain('workspace-content')
    wrapper.unmount()
  })

  it('restores the original shell and static background when navigating to administration', async () => {
    const wrapper = render()
    state.path = '/admin/dashboard'
    state.meta.requiresAdmin = true
    await wrapper.vm.$nextTick()
    expect(wrapper.classes()).toContain('admin-shell')
    expect(wrapper.classes()).not.toContain('workspace-shell')
    expect(wrapper.find('[data-testid="atmosphere"]').exists()).toBe(false)
    expect(wrapper.find('.bg-mesh-gradient').exists()).toBe(true)
    expect(wrapper.find('main').classes()).not.toContain('workspace-content')
    expect(wrapper.text()).toContain('Page content')
    wrapper.unmount()
  })
})
