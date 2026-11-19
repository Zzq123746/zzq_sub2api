import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import HomeModelShowcase from '../HomeModelShowcase.vue'
import { homeModelCatalog } from '@/constants/homeModelCatalog'
import zh from '@/i18n/locales/zh/homeModels'
import en from '@/i18n/locales/en/homeModels'

const { fetchModels } = vi.hoisted(() => ({ fetchModels: vi.fn() }))
vi.mock('@/api/modelPlaza', () => ({ getModelPlaza: fetchModels }))
vi.mock('vue-i18n', async original => ({
  ...await original<typeof import('vue-i18n')>(),
  useI18n: () => ({ t: (key: string, values: Record<string, unknown> = {}) => {
    const message = key.split('.').reduce<unknown>((value, segment) => (value as Record<string, unknown>)?.[segment], { homeModels: zh })
    return typeof message === 'string' ? message.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name])) : key
  } }),
}))
const wrappers: ReturnType<typeof mount>[] = []
function render(enabled = true) {
  const wrapper = mount(HomeModelShowcase, { props: { enabled }, global: { stubs: { RouterLink: RouterLinkStub } } })
  wrappers.push(wrapper)
  return wrapper
}
function ids(wrapper: ReturnType<typeof render>) { return wrapper.findAll('.model-card').map(card => card.attributes('data-model-id')) }
afterEach(() => { wrappers.splice(0).forEach(wrapper => wrapper.unmount()); vi.clearAllMocks() })

describe('homepage model families', () => {
  it('opens on the curated GPT selection with a pending price for each card', () => {
    const wrapper = render()
    const gptIds = ids(wrapper)
    expect(gptIds).toEqual(expect.arrayContaining(['gpt-6.1-sol', 'gpt-6.1-terra']))
    expect(gptIds.every(id => id.startsWith('gpt-'))).toBe(true)
    expect(gptIds.length).toBeLessThan(15)
    for (const removed of ['gpt-5', 'gpt-5.3-codex', 'gpt-5.2-pro']) {
      expect(gptIds).not.toContain(removed)
    }
    expect(wrapper.findAll('.model-price-pending')).toHaveLength(gptIds.length)
    expect(wrapper.find('.model-prices').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('$')
    expect(fetchModels).not.toHaveBeenCalled()
  })

  it('offers exactly three series and displays the cards for each selected family', async () => {
    const wrapper = render()
    const initialIds = ids(wrapper)
    const filters = wrapper.findAll('.models-filters button')
    expect(filters.map(filter => filter.text())).toEqual(['GPT 系列', 'Claude 系列', 'Gemini 系列'])
    const [gpt, claude, gemini] = filters
    expect(gpt.attributes('aria-pressed')).toBe('true')
    await claude.trigger('click')
    expect(ids(wrapper)).toEqual(['claude-opus-5-5', 'claude-sonnet-5-5'])
    expect(claude.attributes('aria-pressed')).toBe('true')
    expect(gpt.attributes('aria-pressed')).toBe('false')
    await gemini.trigger('click')
    expect(ids(wrapper)).toEqual(['gemini-4-carbon'])
    expect(gemini.attributes('aria-pressed')).toBe('true')
    await gpt.trigger('click')
    expect(ids(wrapper)).toEqual(initialIds)
  })

  it('searches identifiers and the translated concrete capabilities, with a working empty state', async () => {
    const wrapper = render()
    const initialIds = ids(wrapper)
    const search = wrapper.get('input[type="search"]')
    await search.setValue('  GPT-6.1  ')
    expect(ids(wrapper)).toEqual(['gpt-6.1-sol', 'gpt-6.1-terra'])
    await search.setValue('技术图纸')
    expect(ids(wrapper)).toEqual(['gpt-6.1-terra'])
    await search.setValue('gemini')
    expect(wrapper.find('.model-card').exists()).toBe(false)
    expect(wrapper.get('.models-empty').text()).toContain(zh.noResults)
    await wrapper.get('.models-empty button').trigger('click')
    expect(ids(wrapper)).toEqual(initialIds)
  })

  it('keeps the current search until the visitor switches to a different family', async () => {
    const wrapper = render()
    const [gpt, claude] = wrapper.findAll('.models-filters button')
    const search = wrapper.get<HTMLInputElement>('input[type="search"]')
    await search.setValue('terra')
    await gpt.trigger('click')
    expect(search.element.value).toBe('terra')
    await claude.trigger('click')
    expect(search.element.value).toBe('')
    expect(ids(wrapper)).toContain('claude-sonnet-5-5')
  })

  it('offers only internal links and keeps introductions visible when the plaza is disabled', () => {
    const wrapper = render(false)
    expect(ids(wrapper)).toContain('gpt-6.1-sol')
    expect(wrapper.findAll('a[href^="http"], a[target="_blank"]')).toHaveLength(0)
    expect(wrapper.findAllComponents(RouterLinkStub).every(link => link.props('to') === '/docs/quickstart')).toBe(true)
  })

  it('has distinct translated descriptions and leaves every catalog price unconfigured', () => {
    expect(new Set(homeModelCatalog.map(card => card.id)).size).toBe(homeModelCatalog.length)
    for (const messages of [zh, en]) {
      const descriptions = homeModelCatalog.map(card => {
        const key = card.descriptionKey.split('.').at(-1)!
        const value = (messages.descriptions as Record<string, string>)[key]
        expect(value?.length).toBeGreaterThan(15)
        for (const tag of card.tagKeys) expect((messages.tags as Record<string, string>)[tag.split('.').at(-1)!]).toBeTruthy()
        return value
      })
      expect(new Set(descriptions).size).toBe(homeModelCatalog.length)
    }
    expect(homeModelCatalog.every(card => card.pricing === null)).toBe(true)
  })
})
