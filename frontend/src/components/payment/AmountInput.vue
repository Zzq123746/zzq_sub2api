<template>
  <div class="amount-picker space-y-6">
    <!-- Quick Amount Buttons -->
    <div>
      <p class="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ t('payment.quickAmounts') }}
      </p>
      <div class="amount-presets grid grid-cols-3 gap-3">
        <button
          v-for="amt in filteredAmounts"
          :key="amt"
          type="button"
          class="amount-option"
          :class="{ 'is-selected': modelValue === amt, 'has-bonus': quoteFor(amt).percent > 0 }"
          :aria-pressed="modelValue === amt"
          :data-testid="`quick-amount-${amt}`"
          @click="selectAmount(amt)"
        >
          <!-- Keep the offer inside the tile so it cannot overlap adjacent amounts. -->
          <span
            v-if="quoteFor(amt).percent > 0"
            class="amount-bonus-badge"
            data-testid="quick-amount-bonus-badge"
          >
            {{ badgeText(amt) }}
          </span>
          <span class="amount-value"><small>{{ currencySymbol(currency) }}</small>{{ amt }}</span>
          <svg v-if="modelValue === amt" class="amount-check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m4 8 2.5 2.5L12 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <!-- 配置了优惠阶梯时，所有按钮都显示第二行，保持高度一致：赠金显示到账 USD，折扣显示折后实付 -->
          <span
            v-if="showSecondLine"
            :class="[
              'mt-0.5 block text-[11px] font-normal leading-tight',
              quoteFor(amt).percent > 0 ? 'text-red-600 dark:text-red-300' : 'text-gray-400 dark:text-gray-500',
            ]"
            data-testid="quick-amount-credited"
          >{{ secondLine(amt) }}</span>
        </button>
      </div>
    </div>

    <!-- Custom Amount Input -->
    <div>
      <label :for="inputId" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ t('payment.customAmount') }}
      </label>
      <div class="relative">
        <span class="amount-input-currency">
          {{ currencySymbol(currency) }}
        </span>
        <input
          :id="inputId"
          type="text"
          inputmode="decimal"
          :value="customText"
          :placeholder="placeholderText"
          class="input amount-custom-input w-full py-3"
          :style="{ paddingLeft: `${Math.max(2.5, currencySymbol(currency).length * 0.65 + 1.5)}rem` }"
          @input="handleInput"
        />
        <span class="amount-input-code">{{ normalizePaymentCurrency(currency) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RechargeBonusTier } from '@/types/payment'
import { formatRechargeBonusNumber, quoteRechargeBonus, type RechargeBonusMode } from '@/utils/rechargeBonus'
import { currencySymbol, formatPaymentAmount, normalizePaymentCurrency } from './currency'

const props = withDefaults(defineProps<{
  amounts?: number[]
  modelValue: number | null
  min?: number
  max?: number
  /** 充值优惠阶梯（按 min_amount 升序）；为空时不显示价签与第二行 */
  bonusTiers?: RechargeBonusTier[]
  /** 阶梯模式：bonus 赠金 / discount 折扣 */
  bonusMode?: RechargeBonusMode
  /** 充值倍率（1 支付币种 = multiplier USD），用于计算到账金额 */
  multiplier?: number
  /** 支付币种（折扣模式第二行实付金额的币种与精度） */
  currency?: string
}>(), {
  amounts: () => [10, 20, 50, 100, 200, 500, 1000, 2000, 5000],
  min: 0,
  max: 0,
  bonusTiers: () => [],
  bonusMode: 'bonus',
  multiplier: 1,
  currency: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const { t } = useI18n()
const inputId = useId()

const customText = ref('')

// 0 = no limit
const filteredAmounts = computed(() =>
  props.amounts.filter((a) => (props.min <= 0 || a >= props.min) && (props.max <= 0 || a <= props.max))
)

const showSecondLine = computed(() => props.bonusTiers.length > 0)

function currencyDigits(): number {
  if (!props.currency) return 2
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: props.currency }).resolvedOptions().maximumFractionDigits ?? 2
  } catch {
    return 2
  }
}

function quoteFor(amt: number) {
  return quoteRechargeBonus(props.bonusTiers, amt, {
    multiplier: props.multiplier,
    mode: props.bonusMode,
    currencyDigits: currencyDigits(),
  })
}

// 价签文案：赠金「+20%」，折扣「20% OFF」
function badgeText(amt: number): string {
  const percent = formatRechargeBonusNumber(quoteFor(amt).percent)
  return props.bonusMode === 'discount' ? `${percent}% OFF` : `+${percent}%`
}

function secondLine(amt: number): string {
  const quote = quoteFor(amt)
  if (props.bonusMode === 'discount') {
    return t('payment.rechargeBonus.payShort', { amount: formatPaymentAmount(quote.payBase, props.currency) })
  }
  return t('payment.rechargeBonus.creditedShort', { amount: '$' + quote.credited.toFixed(2) })
}

const placeholderText = computed(() => {
  if (props.min > 0 && props.max > 0) return `${props.min} - ${props.max}`
  if (props.min > 0) return `≥ ${props.min}`
  if (props.max > 0) return `≤ ${props.max}`
  return t('payment.enterAmount')
})

const AMOUNT_PATTERN = /^\d*(\.\d{0,2})?$/

function selectAmount(amt: number) {
  customText.value = String(amt)
  emit('update:modelValue', amt)
}

function handleInput(e: Event) {
  const input = e.target as HTMLInputElement
  const val = input.value
  if (!AMOUNT_PATTERN.test(val)) {
    input.value = customText.value
    return
  }
  customText.value = val
  if (val === '') {
    emit('update:modelValue', null)
    return
  }
  const num = parseFloat(val)
  if (!isNaN(num) && num > 0) {
    emit('update:modelValue', num)
  } else {
    emit('update:modelValue', null)
  }
}

watch(() => props.modelValue, (v) => {
  if (v !== null && String(v) !== customText.value) {
    customText.value = String(v)
  }
}, { immediate: true })
</script>

<style scoped>
.amount-option { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 0; min-height: 78px; padding: 18px 8px; border: 1px solid var(--experience-border, #e5e7ec); border-radius: 11px; color: var(--experience-ink, #191b21); background: var(--surface-canvas, #f7f8fa); transition: border-color .15s, background .15s; }
.amount-option:hover { border-color: var(--billing-accent, var(--experience-accent)); }
.amount-option.is-selected { border-color: var(--billing-accent, var(--experience-accent)); background: var(--billing-tint, var(--experience-tint)); color: var(--billing-accent, var(--experience-accent)); box-shadow: inset 0 0 0 1px var(--billing-accent, var(--experience-accent)); }
.amount-value { display: flex; align-items: baseline; gap: 4px; font-size: 23px; font-weight: 600; line-height: 1.4; font-variant-numeric: tabular-nums; }
.amount-value small { font-size: 12px; font-weight: 400; opacity: .65; }
.amount-check { position: absolute; bottom: 5px; right: 5px; width: 15px; height: 15px; }
.amount-option.has-bonus { padding-top: 30px; }
.amount-bonus-badge { position: absolute; top: 0; right: 0; max-width: 100%; padding: 2px 7px; border-radius: 0 10px 0 7px; background: #fce8dd; color: #a64019; font-size: 10px; font-weight: 600; overflow-wrap: anywhere; }
.dark .amount-bonus-badge { background: #482b24; color: #ffc4a6; }
.amount-custom-input { min-height: 52px; padding-right: 3.5rem; font-size: 16px; font-variant-numeric: tabular-nums; }
.amount-input-currency, .amount-input-code { position: absolute; top: 50%; transform: translateY(-50%); color: var(--experience-muted); pointer-events: none; }
.amount-input-currency { left: 16px; font-size: 16px; }
.amount-input-code { right: 16px; font-size: 11px; }
.amount-option:focus-visible { outline: 2px solid var(--billing-accent, var(--experience-accent)); outline-offset: 3px; }
@media (max-width: 420px) {
  .amount-presets { gap: 10px; }
  .amount-value { font-size: 20px; gap: 3px; }
  .amount-value small { font-size: 10px; }
  .amount-option { min-height: 72px; padding-inline: 4px; }
}
@media (prefers-reduced-motion: reduce) {
  .amount-option { transition: none; }
}
</style>
