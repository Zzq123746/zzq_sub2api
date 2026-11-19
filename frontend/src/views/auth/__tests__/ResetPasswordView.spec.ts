import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ResetPasswordView from '../ResetPasswordView.vue'

const { reset, query } = vi.hoisted(() => ({ reset: vi.fn(), query: { email: 'user@example.com', token: 'reset-token' } as Record<string, unknown> }))
vi.mock('vue-router', () => ({ useRoute: () => ({ query }) }))
vi.mock('vue-i18n', async original => ({ ...await original<typeof import('vue-i18n')>(), useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/api/auth', () => ({ resetPassword: reset }))
vi.mock('@/stores', () => ({ useAppStore: () => ({ showError: vi.fn(), showSuccess: vi.fn() }) }))
const render = () => mount(ResetPasswordView, { global: { stubs: { AuthLayout: { template: '<div><slot /><slot name="footer" /></div>' }, Icon: true, RouterLink: { template: '<a><slot /></a>' } } } })
async function submit(wrapper: ReturnType<typeof render>, confirm = 'new-password') {
  await wrapper.get('#password').setValue('new-password')
  await wrapper.get('#confirmPassword').setValue(confirm)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}
beforeEach(() => { reset.mockReset(); query.email = 'user@example.com'; query.token = 'reset-token' })

describe('Password reset completion', () => {
  it('rejects malformed link parameters', async () => {
    query.token = ['first', 'second']
    const wrapper = render()
    await flushPromises()
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain('auth.requestNewResetLink')
    wrapper.unmount()
  })
  it('does not submit mismatched passwords', async () => {
    const wrapper = render()
    await flushPromises()
    await submit(wrapper, 'different-password')
    expect(reset).not.toHaveBeenCalled()
    wrapper.unmount()
  })
  it('shows a new-link action for the normalized expired-token error', async () => {
    reset.mockRejectedValue({ reason: 'INVALID_RESET_TOKEN', message: 'expired' })
    const wrapper = render()
    await flushPromises()
    await submit(wrapper)
    expect(wrapper.get('[role="alert"]').text()).toBe('auth.invalidOrExpiredToken')
    expect(wrapper.text()).toContain('auth.requestNewResetLink')
    expect(wrapper.find('form').exists()).toBe(false)
    wrapper.unmount()
  })
  it('submits the emailed token and displays the sign-in action on success', async () => {
    reset.mockResolvedValue({ message: 'ok' })
    const wrapper = render()
    await flushPromises()
    await submit(wrapper)
    expect(reset).toHaveBeenCalledWith({ email: 'user@example.com', token: 'reset-token', new_password: 'new-password' })
    expect(wrapper.text()).toContain('auth.passwordResetSuccess')
    expect(wrapper.text()).not.toContain('auth.invalidResetLink')
    expect(wrapper.find('form').exists()).toBe(false)
    wrapper.unmount()
  })
})
