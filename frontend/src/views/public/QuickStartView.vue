<template>
  <div class="quickstart-page">
    <header class="quickstart-header">
      <RouterLink to="/home" class="quickstart-brand"><img :src="siteLogo || '/logo.svg'" alt="" /><span>{{ siteName }}</span><small>DEVELOPERS</small></RouterLink>
      <div class="quickstart-controls"><LocaleSwitcher text-only /><button class="experience-theme-toggle" :aria-label="isDark ? t('home.switchToLight') : t('home.switchToDark')" @click="toggleTheme"><Icon :name="isDark ? 'sun' : 'moon'" size="md" /></button></div>
    </header>
    <main class="quickstart-content">
      <RouterLink to="/home" class="quickstart-back"><Icon name="arrowLeft" size="sm" />{{ t('experience.backHome') }}</RouterLink>
      <p class="quickstart-kicker">DOCUMENTATION / QUICK START</p>
      <h1>{{ t('experience.guideTitle') }}</h1>
      <p class="quickstart-intro">{{ t('experience.guideIntro') }}</p>
      <ol class="quickstart-steps">
        <li v-for="(step, index) in steps" :key="step.title"><span>0{{ index + 1 }}</span><h2>{{ t(step.title) }}</h2><p>{{ t(step.description) }}</p></li>
      </ol>
      <section class="quickstart-prepare">
        <h2>{{ t('experience.guidePrepare') }}</h2><p>{{ t('experience.guidePrepareDescription') }}</p>
        <dl><div v-for="field in fields" :key="field.name"><dt><code>{{ field.name }}</code></dt><dd>{{ t(field.description) }}</dd></div></dl>
        <RouterLink to="/keys" class="quickstart-link">{{ t('experience.apiKeys') }}<Icon name="arrowRight" size="sm" /></RouterLink>
      </section>
      <section class="quickstart-example"><h2>{{ t('experience.guideExamples') }}</h2><ApiRequestExample /></section>
      <section class="quickstart-next"><h2>{{ t('experience.guideNext') }}</h2><p>{{ t('experience.guideNextDescription') }}</p><div><RouterLink to="/usage" class="quickstart-link">{{ t('experience.usageRecords') }}<Icon name="arrowRight" size="sm" /></RouterLink><a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer" class="quickstart-link">{{ t('experience.guideFullDocs') }}<Icon name="arrowUpRight" size="sm" /></a></div></section>
    </main>
    <footer class="quickstart-footer">{{ siteName }} / {{ t('experience.interfaceLabel') }}</footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useTheme } from '@/composables/useTheme'
import { resolveSiteName } from '@/constants/branding'
import { sanitizeUrl } from '@/utils/url'
import ApiRequestExample from '@/components/brand/ApiRequestExample.vue'
import Icon from '@/components/icons/Icon.vue'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'

const { t } = useI18n()
const { isDark, toggleTheme } = useTheme()
const appStore = useAppStore()
const siteName = computed(() => resolveSiteName(appStore.siteName))
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const docUrl = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.doc_url || appStore.docUrl || ''))
const steps = [
  { title: 'experience.stepKey', description: 'experience.stepKeyDescription' },
  { title: 'experience.stepModel', description: 'experience.stepModelDescription' },
  { title: 'experience.stepRequest', description: 'experience.stepRequestDescription' },
]
const fields = [
  { name: 'BASE_URL', description: 'experience.guideBaseUrl' },
  { name: 'API_KEY', description: 'experience.guideApiKey' },
  { name: 'YOUR_MODEL', description: 'experience.guideModel' },
]
onMounted(() => { void appStore.fetchPublicSettings() })
</script>

<style scoped>
.quickstart-page { min-height: 100vh; font-family: var(--experience-font); color: var(--experience-ink); background: var(--surface-canvas); }
.quickstart-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; max-width: 1120px; margin: auto; padding: 24px 32px; border-bottom: 1px solid var(--experience-border); }
.quickstart-brand { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 600; letter-spacing: -.025em; }
.quickstart-brand img { width: 30px; height: 30px; }
.quickstart-brand small { border-left: 1px solid var(--experience-border); padding-left: 16px; margin-left: 8px; font-size: 9px; font-weight: 500; letter-spacing: .12em; color: var(--experience-muted); }
.quickstart-controls { display: flex; align-items: center; gap: 10px; }
.quickstart-content { max-width: 880px; margin: auto; padding: 36px 32px 60px; }
.quickstart-back { display: inline-flex; align-items: center; gap: 8px; color: var(--experience-muted); font-size: 12px; margin-bottom: 48px; }
.quickstart-kicker { color: var(--experience-accent); font-size: 12px; font-weight: 500; letter-spacing: .06em; }
.quickstart-content h1 { font-size: clamp(32px, 4.2vw, 48px); line-height: 1.25; font-weight: 600; letter-spacing: var(--experience-heading-tracking); margin: 16px 0; text-wrap: balance; }
.quickstart-intro { font-size: 19px; line-height: 1.6; color: var(--experience-muted); }
.quickstart-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin: 42px 0; }
.quickstart-steps li { border-top: 1px solid var(--experience-border); padding-top: 18px; }
.quickstart-steps li > span { color: var(--experience-accent); font-size: 12px; }
.quickstart-content h2 { font-size: 19px; font-weight: 600; margin-bottom: 12px; }
.quickstart-steps h2 { margin: 14px 0 8px; font-size: 17px; }
.quickstart-steps p, .quickstart-prepare > p, .quickstart-next > p { color: var(--experience-muted); font-size: 15px; line-height: 1.7; }
.quickstart-prepare { padding: 28px; background: var(--experience-surface); border: 1px solid var(--experience-border); border-radius: 12px; }
.quickstart-prepare dl { margin: 22px 0; }
.quickstart-prepare dl > div { display: grid; grid-template-columns: 120px 1fr; gap: 20px; padding: 14px 0; border-bottom: 1px solid var(--experience-border); }
.quickstart-prepare dt { font-size: 12px; color: var(--experience-accent); }
.quickstart-prepare dd { font-size: 15px; line-height: 1.7; color: var(--experience-muted); }
.quickstart-example { margin-top: 40px; }
.quickstart-example > h2 { margin-bottom: 18px; }
.quickstart-next { margin-top: 36px; }
.quickstart-next > div { display: flex; flex-wrap: wrap; gap: 24px; margin-top: 20px; }
.quickstart-link { display: inline-flex; gap: 10px; align-items: center; font-size: 13px; color: var(--experience-accent); }
.quickstart-footer { text-align: center; padding: 24px; border-top: 1px solid var(--experience-border); font-size: 11px; color: var(--experience-muted); }
@media (max-width: 640px) { .quickstart-header { padding: 18px 20px; } .quickstart-brand small { display: none; } .quickstart-content { padding: 24px 20px 48px; } .quickstart-steps { grid-template-columns: 1fr; gap: 20px; } .quickstart-prepare { padding: 20px; } .quickstart-prepare dl > div { grid-template-columns: 1fr; gap: 7px; } }
</style>
