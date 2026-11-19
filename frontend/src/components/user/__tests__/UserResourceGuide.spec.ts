import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount, RouterLinkStub } from '@vue/test-utils'
import UserResourceGuide from '../UserResourceGuide.vue'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
enableAutoUnmount(afterEach)

function render(props: { showModelPlaza: boolean; docUrl?: string; dashboard?: boolean }) {
  return mount(UserResourceGuide, { props, global: { stubs: { RouterLink: RouterLinkStub } } })
}

describe('user resource navigation', () => {
  it('hides disabled model plaza and provides internal documentation when no URL is configured', () => {
    const wrapper = render({ showModelPlaza: false })
    expect(wrapper.find('[data-resource="models"]').exists()).toBe(false)
    expect(wrapper.findAllComponents(RouterLinkStub).map(link => link.props('to'))).toEqual([
      '/docs/quickstart', '/keys', '/docs/quickstart',
    ])
  })

  it('uses the configured external documentation and preserves the model plaza route', () => {
    const wrapper = render({ showModelPlaza: true, docUrl: 'https://docs.example.com/api' })
    const docs = wrapper.get('[data-resource="docs"]')
    expect(docs.attributes('href')).toBe('https://docs.example.com/api')
    expect(docs.attributes('target')).toBe('_blank')
    expect(docs.attributes('rel')).toBe('noopener noreferrer')
    expect(wrapper.findAllComponents(RouterLinkStub).map(link => link.props('to'))).toContain('/model-plaza')
  })

  it('falls back to the guide for unsafe documentation URLs', () => {
    const wrapper = render({ showModelPlaza: false, docUrl: 'javascript:alert(1)' })
    expect(wrapper.findAllComponents(RouterLinkStub).map(link => link.props('to'))).toContain('/docs/quickstart')
    expect(wrapper.get('[data-resource="docs"]').attributes('target')).toBeUndefined()
  })

  it('gives signed-in dashboard users direct access to usage history', () => {
    const wrapper = render({ showModelPlaza: true, dashboard: true })
    expect(wrapper.find('[data-resource="start"]').exists()).toBe(false)
    expect(wrapper.find('[data-resource="usage"]').exists()).toBe(true)
    expect(wrapper.findAllComponents(RouterLinkStub).map(link => link.props('to'))).toContain('/usage')
  })
})
