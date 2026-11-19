import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import QuickNavigation from '../QuickNavigation.vue'
import { flattenNavigation, useQuickNavigation } from '@/composables/useQuickNavigation'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/dashboard' }), useRouter: () => ({ push }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
const items = [
  { path: '/dashboard', label: 'Dashboard', group: 'Workspace' },
  { path: '/keys', label: 'API Keys', group: 'Workspace' },
  { path: '/usage', label: 'API Usage', group: 'Workspace' },
]
let wrapper: ReturnType<typeof mount>
beforeEach(() => {
  useQuickNavigation().close()
  push.mockReset()
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false } })
  wrapper = mount(QuickNavigation, { props: { items }, attachTo: document.body, global: { stubs: { Icon: true } } })
})
afterEach(() => {
  wrapper.unmount()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})
function shortcut() { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true })) }

describe('QuickNavigation', () => {
  it('opens with Ctrl+K, filters, and navigates to the keyboard-selected result', async () => {
    shortcut()
    await flushPromises()
    expect(document.querySelector('dialog')?.open).toBe(true)
    const input = document.querySelector('input')!
    expect(document.activeElement).toBe(input)
    input.value = 'API'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(2)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await flushPromises()
    expect(push).toHaveBeenCalledWith('/usage')
    expect(document.querySelector('dialog')?.open).toBe(false)
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('handles empty results, cancellation, and restores the previous scroll style', async () => {
    document.documentElement.style.overflow = 'auto'
    useQuickNavigation().open()
    await flushPromises()
    const input = document.querySelector('input')!
    input.value = 'no-such-page'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(push).not.toHaveBeenCalled()
    expect(document.querySelector('.quick-navigation-empty')).not.toBeNull()
    document.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true }))
    await nextTick()
    expect(useQuickNavigation().isOpen.value).toBe(false)
    expect(document.documentElement.style.overflow).toBe('auto')
    document.documentElement.style.overflow = ''
  })

  it('does not intercept the shortcut while a business dialog is open', async () => {
    const dialog = document.createElement('div')
    dialog.setAttribute('role', 'dialog')
    document.body.append(dialog)
    shortcut()
    await nextTick()
    expect(useQuickNavigation().isOpen.value).toBe(false)
  })

  it('removes a destination when the visible menu changes', async () => {
    useQuickNavigation().open()
    await flushPromises()
    await wrapper.setProps({ items: [items[0]] })
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(1)
    expect(document.querySelector('[role="option"]')?.textContent).toContain('Dashboard')
  })
})

describe('flattenNavigation', () => {
  it('includes only supplied visible destinations and skips expansion-only group routes', () => {
    expect(flattenNavigation([{ path: '/group', label: 'Group', expandOnly: true, children: [{ path: '/allowed', label: 'Allowed' }] }], 'Workspace'))
      .toEqual([{ path: '/allowed', label: 'Allowed', group: 'Group' }])
    expect(flattenNavigation([], 'Workspace')).toEqual([])
  })
})
