<template>
  <section id="models" class="home-models" :aria-labelledby="`${id}-heading`">
    <header class="models-heading">
      <div>
        <h2 :id="`${id}-heading`">{{ t('homeModels.title') }}</h2>
        <p>{{ t('homeModels.intro') }}</p>
      </div>
      <RouterLink v-if="enabled" to="/model-plaza" class="models-link">
        {{ t('nav.modelPlaza') }}<Icon name="arrowRight" size="sm" />
      </RouterLink>
    </header>

    <div class="models-toolbar">
      <div class="models-filters" role="group" :aria-label="t('homeModels.filterLabel')">
        <button
          v-for="family in homeModelFamilies"
          :key="family"
          type="button"
          :aria-pressed="selectedFamily === family"
          @click="selectFamily(family)"
        >{{ t(`homeModels.families.${family}`) }}</button>
      </div>
      <label class="models-search" :for="`${id}-search`">
        <Icon name="search" size="sm" aria-hidden="true" />
        <input
          :id="`${id}-search`"
          v-model="query"
          type="search"
          :aria-label="t('homeModels.searchLabel')"
          :placeholder="t('homeModels.searchPlaceholder')"
        />
      </label>
    </div>
    <p class="models-count" role="status">{{ t('homeModels.count', { count: cards.length }, cards.length) }}</p>

    <div v-if="cards.length" class="models-grid">
      <article v-for="card in cards" :key="card.id" class="model-card" :data-model-id="card.id">
        <div class="model-card-heading">
          <span class="model-mark"><ModelIcon :model="card.id" size="28px" aria-hidden="true" /></span>
          <div><h3>{{ card.id }}</h3><p>{{ card.provider }}</p></div>
        </div>
        <p class="model-description">{{ t(card.descriptionKey) }}</p>
        <ul class="model-tags"><li v-for="tag in card.tagKeys" :key="tag">{{ t(tag) }}</li></ul>
        <footer>
          <template v-if="hasPrice(card)">
            <div class="model-prices">
              <div><span>{{ t('homeModels.input') }}</span><strong>{{ formatScaled(card.pricing!.input, 1, 2) }}</strong></div>
              <div><span>{{ t('homeModels.output') }}</span><strong>{{ formatScaled(card.pricing!.output, 1, 2) }}</strong></div>
            </div>
            <small>{{ t('homeModels.unit') }}</small>
          </template>
          <div v-else class="model-price-pending"><span>{{ t('homeModels.priceLabel') }}</span><strong>{{ t('homeModels.pendingPrice') }}</strong></div>
          <RouterLink to="/docs/quickstart" class="models-link">{{ t('homeModels.integration') }}<Icon name="arrowRight" size="sm" /></RouterLink>
        </footer>
      </article>
    </div>
    <div v-else class="models-empty">
      <Icon name="search" size="lg" aria-hidden="true" />
      <p>{{ t('homeModels.noResults') }}</p>
      <button v-if="query" type="button" @click="query = ''">{{ t('homeModels.clearSearch') }}</button>
    </div>
    <p class="models-footnote">{{ t('homeModels.availability') }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import ModelIcon from '@/components/common/ModelIcon.vue'
import Icon from '@/components/icons/Icon.vue'
import { formatScaled } from '@/utils/pricing'
import { homeModelCatalog, homeModelFamilies, type HomeModelCard, type HomeModelFamily } from '@/constants/homeModelCatalog'

defineProps<{ enabled: boolean }>()
const { t } = useI18n()
const id = useId()
const query = ref('')
const selectedFamily = ref<HomeModelFamily>('gpt')

function selectFamily(family: HomeModelFamily) {
  if (selectedFamily.value === family) return
  selectedFamily.value = family
  query.value = ''
}

const cards = computed(() => {
  const terms = query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return homeModelCatalog.filter(card => {
    if (card.family !== selectedFamily.value) return false
    const text = [card.id, card.provider, t(card.descriptionKey), ...card.tagKeys.map(key => t(key))].join(' ').toLocaleLowerCase()
    return terms.every(term => text.includes(term))
  })
})
function hasPrice(card: HomeModelCard): boolean {
  const price = card.pricing
  return !!price && [price.input, price.output].every(value => typeof value === 'number' && Number.isFinite(value) && value >= 0)
}
</script>

<style scoped>
.home-models { padding: 88px 0 24px; scroll-margin-top: 140px; }
.models-heading { display: flex; justify-content: space-between; align-items: end; gap: 24px; margin-bottom: 28px; }
.models-heading h2 { font-size: clamp(28px, 3.5vw, 44px); line-height: 1.3; text-wrap: balance; }
.models-heading p { color: var(--landing-muted); font-size: 14px; margin-top: 14px; max-width: 620px; line-height: 1.8; }
.models-link { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--landing-accent); }
.models-heading > a { flex-shrink: 0; }
.models-toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 20px; margin-bottom: 16px; }
.models-filters { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.models-filters button { min-height: 44px; padding: 8px 14px; border-radius: 8px; font-size: 13px; color: var(--landing-muted); border: 1px solid transparent; transition: color .18s, background .18s; }
.models-filters button[aria-pressed='true'] { color: var(--landing-accent); background: var(--landing-soft); border-color: var(--landing-line); }
.models-filters button:hover { color: var(--landing-ink); background: var(--landing-soft); }
.models-search { display: flex; align-items: center; gap: 9px; min-width: 0; width: 280px; max-width: 100%; margin-left: auto; padding: 9px 12px; border-radius: 8px; border: 1px solid var(--landing-line); background: var(--landing-surface); color: var(--landing-muted); }
.models-search svg { flex-shrink: 0; }
.models-search input { background: transparent; color: var(--landing-ink); font-size: 13px; min-width: 0; width: 100%; border: 0; padding: 0; }
.models-search input::placeholder { color: var(--landing-muted); opacity: .8; }
.models-count { text-align: end; margin-bottom: 18px; color: var(--landing-muted); font-size: 12px; line-height: 1.75; }
.models-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.model-card { min-width: 0; display: flex; flex-direction: column; padding: 22px; border: 1px solid var(--landing-line); border-radius: 16px; background: var(--landing-surface); box-shadow: inset 0 1px #ffffff12; transition: border-color .2s; }
.model-card:hover { border-color: var(--landing-accent); }
.model-card-heading { display: flex; align-items: start; gap: 12px; }
.model-mark { display: grid; place-items: center; width: 42px; height: 42px; flex-shrink: 0; border-radius: 12px; color: var(--landing-ink); background: var(--landing-soft); }
.model-mark :deep(path) { fill: currentColor; }
.model-card-heading > div { min-width: 0; flex: 1; }
.model-card h3 { font-size: 18px; line-height: 1.45; overflow-wrap: anywhere; }
.model-card-heading p { color: var(--landing-muted); font-size: 12px; margin-top: 4px; }
.model-description { font-size: 13px; line-height: 1.8; color: var(--landing-muted); margin: 18px 0 16px; overflow-wrap: anywhere; }
.model-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: auto; padding-bottom: 16px; }
.model-tags li { font-size: 11px; padding: 4px 7px; border: 1px solid var(--landing-line); border-radius: 6px; color: var(--landing-muted); }
.model-card footer { border-top: 1px solid var(--landing-line); padding-top: 14px; }
.model-prices { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; font-size: 12px; }
.model-prices > div { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.model-prices strong { font-size: 20px; color: var(--landing-accent); font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.model-card small { color: var(--landing-muted); font-size: 10px; display: block; margin-top: 8px; }
.model-price-pending { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 12px; color: var(--landing-muted); }
.model-price-pending strong { color: var(--landing-accent); font-size: 14px; font-weight: 500; }
.model-card footer > a { margin-top: 12px; font-size: 12px; }
.models-empty { display: grid; justify-items: center; gap: 16px; padding: 64px 24px; border: 1px dashed var(--landing-line); border-radius: 16px; color: var(--landing-muted); font-size: 14px; }
.models-empty button { color: var(--landing-accent); padding: 8px 16px; text-decoration: underline; text-underline-offset: 4px; }
.models-footnote { font-size: 11px; margin-top: 18px; color: var(--landing-muted); line-height: 1.8; }
.home-models :focus-visible { outline: 2px solid var(--landing-accent); outline-offset: 3px; }
@media (max-width: 1000px) { .models-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .home-models { padding-top: 56px; } .models-heading { align-items: start; flex-direction: column; gap: 16px; } .models-grid { grid-template-columns: 1fr; gap: 14px; } .models-filters { width: 100%; gap: 4px; } .models-filters button { padding-inline: 4px; } .models-search { width: 100%; } .models-search input { font-size: 16px; } }
@media (prefers-reduced-motion: reduce) { .model-card, .models-filters button { transition: none; } }
</style>
