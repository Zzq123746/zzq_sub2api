import { describe, expect, it } from 'vitest'
import { summarizeHomeModelPricing } from '../homeModelPricing'
import type { ModelPlazaGroup, PlazaModel } from '@/api/modelPlaza'
import type { UserPricingInterval } from '@/api/channels'

const group = (overrides: Partial<ModelPlazaGroup> = {}): ModelPlazaGroup => ({
  id: 1, name: 'Standard', description: '', platform: 'openai', subscription_type: 'standard',
  rate_multiplier: .5, peak_rate_enabled: false, peak_start: '', peak_end: '', peak_rate_multiplier: 1,
  is_exclusive: false, image_rate_independent: false, image_rate_multiplier: 1,
  video_rate_independent: false, video_rate_multiplier: 1, long_context_pricing_enabled: false,
  models: [], ...overrides,
})
const model = (overrides: Partial<PlazaModel> = {}): PlazaModel => ({
  name: 'test-model', platform: 'openai', official_pricing: null,
  pricing: {
    billing_mode: 'token', input_price: 2e-6, output_price: 8e-6,
    cache_write_price: .5e-6, cache_read_price: .2e-6,
    image_input_price: null, image_output_price: null, per_request_price: null, intervals: [],
  }, ...overrides,
})
const tier = (overrides: Partial<UserPricingInterval> = {}): UserPricingInterval => ({
  min_tokens: 0, max_tokens: null, input_price: null, output_price: null,
  cache_write_price: null, cache_read_price: null, per_request_price: null, ...overrides,
})
const row = (result: ReturnType<typeof summarizeHomeModelPricing>, key: string) => result.rows.find(item => item.key === key)?.price

describe('homepage model price summaries', () => {
  it('uses per-million units and the user override, including a zero multiplier', () => {
    const result = summarizeHomeModelPricing(model(), group({ user_rate_multiplier: .25 }))
    expect(result.unit).toBe('tokens')
    expect(row(result, 'input')).toBe('$0.50')
    expect(row(result, 'output')).toBe('$2.00')
    expect(row(result, 'cacheRead')).toBe('$0.05')
    expect(row(summarizeHomeModelPricing(model(), group({ user_rate_multiplier: 0 })), 'input')).toBe('$0.00')
  })

  it('resolves absolute and relative tiers and discloses extra billing conditions', () => {
    const result = summarizeHomeModelPricing(model({
      long_context_basis: 'marginal',
      time_pricing: { timezone: 'Asia/Shanghai', periods: [{ start_time: '09:00', end_time: '18:00', multiplier: 2 }] },
      pricing: { ...model().pricing!, reasoning_effort_multipliers: { high: 1.5 }, intervals: [
        tier({ max_tokens: 1000, input_price: 3e-6 }),
        tier({ min_tokens: 1001, input_multiplier: 2, output_multiplier: 2, cache_read_multiplier: 2 }),
      ] },
    }), group({ peak_rate_enabled: true, peak_rate_multiplier: 1.1 }))
    expect(row(result, 'input')).toBe('$1.50–$2.00')
    expect(row(result, 'output')).toBe('$4.00–$8.00')
    expect(row(result, 'cacheRead')).toBe('$0.10–$0.20')
    expect(result.notes).toEqual(['tiered', 'time', 'peak', 'reasoning'])
    expect(result.basis).toBe('marginal')
  })

  it('does not claim a known range when one tier has no resolvable input price', () => {
    const result = summarizeHomeModelPricing(model({ pricing: { ...model().pricing!, input_price: null, intervals: [tier({ input_price: 1e-6 }), tier()] } }), group())
    expect(row(result, 'input')).toBe('-')
    expect(row(result, 'output')).toBe('$4.00')
  })

  it('uses independent image and video rates without per-million scaling', () => {
    const image = model({ pricing: { ...model().pricing!, billing_mode: 'image', per_request_price: .04 } })
    const video = model({ pricing: { ...model().pricing!, billing_mode: 'video', per_request_price: 2 } })
    const imageResult = summarizeHomeModelPricing(image, group({ image_rate_independent: true, image_rate_multiplier: .25, user_rate_multiplier: .8 }))
    const videoResult = summarizeHomeModelPricing(video, group({ video_rate_independent: true, video_rate_multiplier: .1 }))
    expect(imageResult.unit).toBe('image')
    expect(row(imageResult, 'request')).toBe('$0.01')
    expect(videoResult.unit).toBe('request')
    expect(row(videoResult, 'request')).toBe('$0.20')
  })

  it('shows request-tier ranges before the base per-request price', () => {
    const result = summarizeHomeModelPricing(model({ pricing: { ...model().pricing!, billing_mode: 'per_request', per_request_price: 9, intervals: [tier({ per_request_price: .1 }), tier({ per_request_price: .3 })] } }), group())
    expect(result.unit).toBe('request')
    expect(row(result, 'request')).toBe('$0.05–$0.15')
    expect(result.notes).toContain('tiered')
  })

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('never emits invalid amounts or silently defaults invalid rate %s', invalid => {
    const badPrices = summarizeHomeModelPricing(model({ pricing: { ...model().pricing!, input_price: invalid, output_price: invalid } }), group())
    expect(row(badPrices, 'input')).toBe('-')
    expect(row(badPrices, 'output')).toBe('-')
    expect(row(summarizeHomeModelPricing(model(), group({ rate_multiplier: invalid })), 'input')).toBe('-')
  })

  it('keeps absent pricing unknown and does not invent cache prices', () => {
    expect(summarizeHomeModelPricing(model({ pricing: null }), group()).rows).toEqual([{ key: 'input', price: '-' }, { key: 'output', price: '-' }])
  })

  it('keeps explicitly free inputs at zero rather than treating them as missing', () => {
    expect(row(summarizeHomeModelPricing(model({ pricing: { ...model().pricing!, input_price: 0 } }), group()), 'input')).toBe('$0.00')
  })
})
