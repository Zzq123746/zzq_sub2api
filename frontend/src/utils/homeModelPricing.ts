import { BILLING_MODE_IMAGE, BILLING_MODE_TOKEN, BILLING_MODE_VIDEO } from '@/constants/channel'
import type { ModelPlazaGroup, PlazaModel } from '@/api/modelPlaza'
import { formatScaled, resolveIntervalPrices } from '@/utils/pricing'

export type HomeModelPriceKey = 'input' | 'output' | 'cacheRead' | 'cacheWrite' | 'request'
export type HomeModelPriceNote = 'tiered' | 'time' | 'peak' | 'reasoning'
export interface HomeModelPriceSummary {
  rows: Array<{ key: HomeModelPriceKey; price: string }>
  unit: 'tokens' | 'image' | 'request'
  notes: HomeModelPriceNote[]
  basis?: 'whole_request' | 'marginal'
}

function isPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

/** Unknown prices/rates never become a free quote or an arbitrary default. */
function range(values: Array<number | null | undefined>, rate: number, scale: number): string {
  if (!isPrice(rate) || !values.length || values.some(value => !isPrice(value))) return '-'
  const scaled = values.map(value => (value as number) * rate * scale)
  if (scaled.some(value => !isPrice(value))) return '-'
  const low = Math.min(...scaled)
  const high = Math.max(...scaled)
  return low === high
    ? formatScaled(low, 1, 2)
    : `${formatScaled(low, 1, 2)}–${formatScaled(high, 1, 2)}`
}

/**
 * Standard-period prices, matching Model Plaza. Time/peak/reasoning factors are
 * disclosed as conditions rather than silently applied without request context.
 */
export function summarizeHomeModelPricing(model: PlazaModel, group: ModelPlazaGroup): HomeModelPriceSummary {
  const pricing = model.pricing
  const mode = pricing?.billing_mode || BILLING_MODE_TOKEN
  let rate = group.user_rate_multiplier ?? group.rate_multiplier
  if (mode === BILLING_MODE_IMAGE && group.image_rate_independent) rate = group.image_rate_multiplier ?? 1
  if (mode === BILLING_MODE_VIDEO && group.video_rate_independent) rate = group.video_rate_multiplier ?? 1
  const rows: HomeModelPriceSummary['rows'] = []
  const notes: HomeModelPriceNote[] = []
  const tiers = pricing?.intervals ?? []
  if (mode === BILLING_MODE_TOKEN) {
    const resolved = pricing ? tiers.map(tier => resolveIntervalPrices(tier, pricing)) : []
    const sources = resolved.length ? resolved : [pricing]
    rows.push({ key: 'input', price: range(sources.map(source => source?.input_price), rate, 1_000_000) })
    rows.push({ key: 'output', price: range(sources.map(source => source?.output_price), rate, 1_000_000) })
    if (sources.some(source => source?.cache_read_price != null)) {
      rows.push({ key: 'cacheRead', price: range(sources.map(source => source?.cache_read_price), rate, 1_000_000) })
    }
    if (sources.some(source => source?.cache_write_price != null)) {
      rows.push({ key: 'cacheWrite', price: range(sources.map(source => source?.cache_write_price), rate, 1_000_000) })
    }
    if (resolved.length) notes.push('tiered')
  } else {
    // Match the plaza's non-token mode: tiers with configured per-request prices
    // take precedence over the base per-request value.
    const requestTiers = tiers.filter(tier => tier.per_request_price != null)
    rows.push({ key: 'request', price: range(requestTiers.length ? requestTiers.map(tier => tier.per_request_price) : [pricing?.per_request_price], rate, 1) })
    if (requestTiers.length) notes.push('tiered')
  }
  if (model.time_pricing?.periods?.length) notes.push('time')
  if (group.peak_rate_enabled) notes.push('peak')
  if (Object.values(pricing?.reasoning_effort_multipliers ?? {}).some(value => isPrice(value) && value > 0 && value !== 1)) notes.push('reasoning')
  return {
    rows,
    unit: mode === BILLING_MODE_TOKEN ? 'tokens' : mode === BILLING_MODE_IMAGE ? 'image' : 'request',
    notes,
    ...(notes.includes('tiered') && model.long_context_basis ? { basis: model.long_context_basis } : {}),
  }
}
