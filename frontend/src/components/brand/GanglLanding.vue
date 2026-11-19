<template>
  <div ref="landing" class="gangl-landing">
    <AtmosphereBackground class="landing-atmosphere" />
    <a href="#home-main" class="landing-skip-link">{{ t('experience.skipContent') }}</a>
    <header class="landing-nav-wrap">
      <nav class="landing-nav" :aria-label="t('experience.navigation')">
        <RouterLink to="/" class="landing-brand"><img :src="siteLogo || '/logo.svg'" alt="" /><span>{{ siteName }}<i>.</i></span></RouterLink>
        <div ref="navigation" class="landing-nav-links" @pointerover="moveNavigationHighlight" @pointerleave="releaseNavigationHighlight" @focusin="moveNavigationHighlight" @focusout="releaseNavigationHighlight">
          <span class="landing-nav-highlight" aria-hidden="true" :style="navigationHighlight"></span>
          <RouterLink v-if="showModelPlazaEntry" to="/model-plaza">{{ t('nav.modelPlaza') }}</RouterLink>
          <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer">{{ t('experience.apiDocs') }}<Icon name="arrowUpRight" size="xs" /></a>
          <RouterLink v-else to="/docs/quickstart">{{ t('experience.apiDocs') }}</RouterLink>
          <a href="#models">{{ t('experience.modelsNav') }}</a>
          <a href="#request-example">{{ t('experience.requestExample') }}</a>
          <a href="#faq">{{ t('experience.faqTitle') }}</a>
        </div>
        <div class="landing-nav-actions">
          <LocaleSwitcher text-only />
          <button class="landing-icon-button" :aria-label="isDark ? t('home.switchToLight') : t('home.switchToDark')" @click="$emit('toggleTheme')"><Icon :name="isDark ? 'sun' : 'moon'" size="md" /></button>
          <RouterLink :to="dashboardPathOrLogin" class="landing-nav-cta">{{ isAuthenticated ? t('home.dashboard') : t('home.login') }}<Icon name="arrowRight" size="sm" /></RouterLink>
        </div>
      </nav>
    </header>

    <main id="home-main" tabindex="-1">
      <section class="landing-hero">
        <div class="landing-hero-stage">
        <div class="landing-hero-copy">
          <p class="landing-intro">{{ t('experience.homeIntro') }}</p>
          <h1><span>{{ t('experience.homeTitleOne') }}</span><span>{{ t('experience.homeTitleTwo') }}</span></h1>
          <p class="landing-hero-description">{{ t('experience.homeDescription', { name: siteName }) }}</p>
          <div class="landing-hero-actions">
            <RouterLink :to="dashboardPathOrLogin" class="landing-primary">{{ isAuthenticated ? t('home.goToDashboard') : t('experience.startConnecting') }}<span><Icon name="arrowUpRight" size="md" /></span></RouterLink>
            <RouterLink v-if="showModelPlazaEntry" to="/model-plaza" class="landing-secondary">{{ t('experience.exploreModels') }}<Icon name="arrowRight" size="sm" /></RouterLink>
            <a v-else-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer" class="landing-secondary">{{ t('home.viewDocs') }}<Icon name="arrowRight" size="sm" /></a>
            <RouterLink v-else to="/docs/quickstart" class="landing-secondary">{{ t('experience.quickStart') }}<Icon name="arrowRight" size="sm" /></RouterLink>
          </div>
          <ul class="landing-hero-benefits"><li><Icon name="terminal" size="sm" />{{ t('experience.homeProtocols') }}</li><li><Icon name="key" size="sm" />{{ t('experience.apiKeys') }}</li><li><Icon name="chart" size="sm" />{{ t('experience.usageRecords') }}</li></ul>
        </div>
        <ModelConnection class="landing-hero-visual" />
        </div>
        <a href="#connection" class="landing-scroll-cue"><span>{{ t('experience.scrollExplore') }}</span><Icon name="chevronDown" size="sm" /></a>
      </section>

      <section class="landing-ecosystem" data-scroll-scene :aria-label="t('experience.homeProtocols')">
        <div class="landing-ecosystem-copy"><p>{{ t('experience.ecosystemTitle') }}</p><span>{{ siteSubtitle }}</span></div>
        <div class="landing-provider"><ModelIcon model="gpt" size="30px" class="provider-symbol provider-symbol-openai" aria-hidden="true" /><div><strong>OpenAI</strong><small>Responses API</small></div></div>
        <div class="landing-provider"><ModelIcon model="claude" size="30px" class="provider-symbol provider-symbol-anthropic" aria-hidden="true" /><div><strong>Anthropic</strong><small>Messages API</small></div></div>
        <div class="landing-provider"><ModelIcon model="gemini" size="30px" class="provider-symbol provider-symbol-gemini" aria-hidden="true" /><div><strong>Gemini</strong><small>GenerateContent API</small></div></div>
      </section>
      <p class="landing-protocol-note">{{ t('experience.protocolNote') }}</p>


      <HomeModelShowcase :enabled="showModelPlazaEntry" />

      <section class="landing-story-heading" data-scroll-scene>
        <div class="story-aperture" aria-hidden="true"><span></span><span></span><span></span></div>
        <h2>{{ t('experience.storyTitle') }}</h2>
        <p>{{ t('experience.storyDescription') }}</p>
      </section>
      <section id="connection" class="landing-connection" :data-active-step="activeStep">
        <div class="landing-section-copy">
          <div class="landing-connection-heading" data-scroll-scene>
            <h2>{{ t('experience.connectTitle') }}</h2>
            <p>{{ t('experience.connectDescription') }}</p>
          </div>
          <ol class="landing-steps">
            <li v-for="(step, index) in steps" :key="step.title" data-scroll-scene :class="{ 'step-active': activeStep === index }">
              <span>0{{ index + 1 }}</span>
              <div><h3>{{ t(step.title) }}</h3><p>{{ t(step.description) }}</p></div>
            </li>
          </ol>
          <RouterLink v-if="showModelPlazaEntry" to="/model-plaza" class="landing-text-link">{{ t('nav.modelPlaza') }}<Icon name="arrowUpRight" size="md" /></RouterLink>
        </div>
        <div class="landing-request-stage">
          <div class="landing-request-heading">
            <span>{{ t('experience.requestExample') }}</span>
            <span class="landing-step-track" aria-hidden="true"><i v-for="index in 3" :key="index" :class="{ complete: activeStep >= index - 1 }"></i></span>
          </div>
          <div class="landing-code-frame" data-scroll-scene>
            <ApiRequestExample id="request-example" class="landing-request-example" />
          </div>
          <p class="landing-stage-caption">{{ t(steps[activeStep].title) }}</p>
        </div>
      </section>

      <section class="landing-feature-grid">
        <article v-for="(feature, index) in features" :key="feature.title" class="landing-feature" data-scroll-scene :style="{ '--feature-direction': index % 2 === 0 ? -1 : 1 }">
          <div class="landing-feature-copy"><Icon :name="feature.icon" size="lg" class="landing-feature-icon" />
          <h3>{{ t(feature.title) }}</h3><p>{{ t(feature.description) }}</p></div>
          <FeatureScene :kind="index" />
        </article>
      </section>
      <section id="faq" class="landing-faq" data-scroll-scene>
        <div><h2>{{ t('experience.faqTitle') }}</h2><p>{{ t('experience.faqDescription') }}</p></div>
        <div class="landing-faq-list"><details v-for="item in faqs" :key="item.question"><summary>{{ t(item.question) }}<Icon name="plus" size="sm" /></summary><p>{{ t(item.answer) }}</p></details></div>
      </section>
      <section class="landing-closing" data-scroll-scene><div><h2>{{ t('experience.finalTitle') }}</h2><p>{{ t('experience.finalDescription') }}</p></div><RouterLink :to="dashboardPathOrLogin" class="landing-primary">{{ isAuthenticated ? t('home.goToDashboard') : t('home.getStarted') }}<span><Icon name="arrowUpRight" size="md" /></span></RouterLink></section>
    </main>
    <footer class="landing-footer"><span>© {{ new Date().getFullYear() }} {{ siteName }}</span><span>{{ t('experience.interfaceLabel') }}</span><a href="https://github.com/Wei-Shaw/sub2api" target="_blank" rel="noopener noreferrer">GitHub ↗</a></footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ApiRequestExample from './ApiRequestExample.vue'
import AtmosphereBackground from './AtmosphereBackground.vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import ModelIcon from '@/components/common/ModelIcon.vue'
import ModelConnection from './ModelConnection.vue'
import FeatureScene from './FeatureScene.vue'
import HomeModelShowcase from './HomeModelShowcase.vue'
import { useLandingScroll } from '@/composables/useLandingScroll'

const props = defineProps<{
  siteName: string; siteLogo: string; siteSubtitle: string; docUrl: string
  isAuthenticated: boolean; dashboardPath: string; isDark: boolean; showModelPlazaEntry: boolean
}>()
defineEmits<{ (e: 'toggleTheme'): void }>()
const { t } = useI18n()
const landing = ref<HTMLElement>()
const { activeStep } = useLandingScroll(landing)
const dashboardPathOrLogin = computed(() => props.isAuthenticated ? props.dashboardPath : '/login')
const navigation = ref<HTMLElement>()
const navigationHighlight = ref({ width: '0px', transform: 'translateX(0px)', opacity: 0 })
let highlightedLink: HTMLAnchorElement | null = null
let navigationObserver: ResizeObserver | undefined
function updateNavigationHighlight() {
  const rail = navigation.value
  if (!rail || !highlightedLink || !rail.contains(highlightedLink)) return
  const bounds = rail.getBoundingClientRect()
  const link = highlightedLink.getBoundingClientRect()
  navigationHighlight.value = { width: `${link.width}px`, transform: `translateX(${link.left - bounds.left + rail.scrollLeft}px)`, opacity: 1 }
}
function moveNavigationHighlight(event: Event) {
  if ('pointerType' in event && event.pointerType === 'touch') return
  const link = event.target instanceof Element ? event.target.closest('a') : null
  if (!link || !navigation.value?.contains(link)) return
  highlightedLink = link
  updateNavigationHighlight()
}
function releaseNavigationHighlight(event: Event) {
  const target = event instanceof FocusEvent ? event.relatedTarget : document.activeElement
  const link = target instanceof Element ? target.closest('a') : null
  if (link && navigation.value?.contains(link)) {
    highlightedLink = link
    updateNavigationHighlight()
  } else {
    highlightedLink = null
    navigationHighlight.value = { ...navigationHighlight.value, opacity: 0 }
  }
}
onMounted(() => {
  if (navigation.value && typeof ResizeObserver !== 'undefined') {
    navigationObserver = new ResizeObserver(updateNavigationHighlight)
    navigationObserver.observe(navigation.value)
  }
})
onBeforeUnmount(() => navigationObserver?.disconnect())
const steps = [
  { title: 'experience.stepKey', description: 'experience.stepKeyDescription' },
  { title: 'experience.stepModel', description: 'experience.stepModelDescription' },
  { title: 'experience.stepRequest', description: 'experience.stepRequestDescription' },
]
const faqs = [
  { question: 'experience.faqOne', answer: 'experience.faqOneAnswer' },
  { question: 'experience.faqTwo', answer: 'experience.faqTwoAnswer' },
  { question: 'experience.faqThree', answer: 'experience.faqThreeAnswer' },
]
const features = [
  { title: 'experience.featureOne', description: 'experience.featureOneDescription', icon: 'terminal' },
  { title: 'experience.featureTwo', description: 'experience.featureTwoDescription', icon: 'chart' },
  { title: 'experience.featureThree', description: 'experience.featureThreeDescription', icon: 'key' },
] as const

</script>

<style scoped>
.gangl-landing {
  --landing-bg: #dceaff; --landing-ink: #10264b; --landing-muted: #3e577b; --landing-line: #aac6ed;
  --landing-surface: #eff7ffb8; --landing-soft: #c5ddfb; --landing-accent: #1456bf;
  --code-bg: var(--landing-surface); --code-ink: var(--landing-ink); --code-muted: var(--landing-muted); --code-border: var(--landing-line); --code-accent: var(--landing-accent); --code-string: #436184;
  --experience-ink: var(--landing-ink); --experience-muted: var(--landing-muted); --experience-border: var(--landing-line);
  --experience-surface: var(--landing-surface); --experience-accent: var(--landing-accent);
  --landing-font: 'MiSans', 'Gangl Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative; min-height: 100vh; background: var(--landing-bg); color: var(--landing-ink); overflow: clip;
  font-family: var(--landing-font); font-weight: 450; font-synthesis: none; isolation: isolate;
}
.landing-atmosphere { z-index: -1; }
.dark .gangl-landing { --landing-bg: #0b0f19; --landing-ink: #f4f7ff; --landing-muted: #b5c0d8; --landing-line: #2c3950; --landing-surface: #151e30; --landing-soft: #1d2a42; --landing-accent: #b7d1ff; --code-string: #c8e0ff; }
.landing-skip-link { position: fixed; left: 20px; top: -100px; z-index: 50; padding: 12px 20px; border-radius: 8px; background: var(--landing-ink); color: var(--landing-bg); }
.landing-skip-link:focus { top: 12px; }
.landing-nav-wrap { position: sticky; top: 0; z-index: 30; padding: 16px 32px; border-bottom: 1px solid color-mix(in srgb, var(--landing-line) 30%, transparent); background: color-mix(in srgb, var(--landing-bg) 22%, transparent); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
.landing-nav { max-width: 1200px; margin: auto; display: flex; align-items: center; gap: 20px; justify-content: space-between; }
.landing-brand { display: flex; align-items: center; gap: 10px; min-width: 0; font-size: 25px; letter-spacing: -.04em; }
.landing-brand img { width: 28px; height: 28px; object-fit: contain; }
.landing-brand > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.landing-brand i { color: var(--landing-accent); font-style: normal; }
.landing-brand { font-family: Georgia, 'Times New Roman', serif; font-weight: 600; letter-spacing: -.025em; color: var(--landing-accent); }
.landing-nav-links { position: relative; isolation: isolate; display: flex; gap: 4px; align-items: center; margin-left: auto; }
.landing-nav-links a { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 4px; padding: 9px 12px; font: 450 15px/1.5 var(--landing-font); color: var(--landing-ink); white-space: nowrap; transition: color .2s; }
.landing-nav-links a:hover { color: var(--landing-accent); }
.landing-nav-highlight { position: absolute; top: 3px; bottom: 3px; left: 0; z-index: 0; border-radius: 7px; background: var(--landing-soft); pointer-events: none; transition: width .18s ease-out, transform .18s ease-out, opacity .16s; }
.landing-nav-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.landing-icon-button { display: grid; place-items: center; height: 36px; width: 36px; border-radius: 50%; color: var(--landing-ink); transition: color .2s, background .2s; }
.landing-icon-button:hover { color: var(--landing-ink); background: var(--landing-soft); }
.landing-nav-cta { display: flex; align-items: center; gap: 14px; background: var(--landing-accent); color: var(--landing-bg); border-radius: 8px; padding: 11px 20px; font-size: 15px; }
.gangl-landing main { max-width: 1264px; margin: auto; padding: 0 32px; }
.landing-hero { position: relative; }
.landing-hero-stage { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); align-items: center; gap: 56px; padding: 64px 0 52px; min-height: 540px; }
.landing-hero-copy { position: relative; z-index: 1; min-width: 0; }
.landing-intro { display: inline-flex; padding: 7px 12px; border-radius: 6px; background: var(--landing-soft); font-size: 12px; color: var(--landing-accent); margin-bottom: 28px; }
.landing-hero h1 { font-family: var(--landing-font); font-size: clamp(42px, 4.3vw, 60px); font-weight: 600; line-height: 1.28; letter-spacing: -.025em; }
.landing-hero h1 > span { display: block; }
.landing-hero h1:lang(zh) { letter-spacing: 0; }
.landing-hero h1:lang(en) { font-size: clamp(38px, 4.1vw, 56px); letter-spacing: -.045em; line-height: 1.15; }
.landing-hero-description { max-width: 460px; margin-top: 22px; font-size: 16px; line-height: 1.8; color: var(--landing-muted); text-wrap: pretty; }
.landing-hero-actions { display: flex; align-items: center; gap: 26px; flex-wrap: wrap; margin-top: 28px; }
.landing-primary { display: inline-flex; align-items: center; justify-content: center; gap: 18px; border-radius: 9px; padding: 13px 22px; min-height: 48px; background: var(--landing-accent); color: #fff; font-size: 14px; font-weight: 550; white-space: nowrap; transition: background .16s, box-shadow .16s; }
.landing-primary > span { display: grid; place-items: center; }
.dark .landing-primary { color: #10121b; }
.landing-primary:hover { background: color-mix(in srgb, var(--landing-accent) 88%, var(--landing-ink)); box-shadow: 0 4px 14px #284b8322; }
.landing-primary:active { box-shadow: none; }
.landing-secondary { display: inline-flex; align-items: center; min-height: 48px; padding: 12px 18px; border: 1px solid var(--landing-line); border-radius: 9px; background: var(--landing-surface); gap: 10px; font-size: 14px; color: var(--landing-muted); transition: color .2s; }
.landing-secondary:hover { color: var(--landing-ink); }
.landing-hero-visual { min-width: 0; }
.landing-request-example { min-width: 0; scroll-margin-top: 150px; }

.landing-hero-benefits { display: flex; flex-wrap: wrap; gap: 12px 22px; margin-top: 28px; font-size: 12px; color: var(--landing-muted); }
.landing-hero-benefits li { display: inline-flex; align-items: center; gap: 7px; }
.landing-hero-benefits svg { width: 14px; height: 14px; opacity: .8; }
.landing-ecosystem { display: grid; grid-template-columns: 1.15fr 1fr 1fr 1fr; align-items: center; gap: 24px; padding: 24px 0; border-block: 1px solid var(--landing-line); background: transparent; }
.landing-ecosystem-copy p { font-size: 17px; line-height: 1.6; white-space: pre-line; }
.landing-ecosystem-copy > span { display: block; margin-top: 8px; font-size: 10px; color: var(--landing-muted); }
.landing-provider { display: flex; align-items: center; justify-content: center; gap: 16px; }
.landing-provider strong { display: block; font-size: clamp(18px, 2vw, 26px); letter-spacing: -.045em; font-weight: 450; line-height: 1.4; }
.landing-provider small { display: block; margin-top: 5px; color: var(--landing-muted); font-size: 10px; }
.provider-symbol { flex-shrink: 0; }
.provider-symbol-openai :deep(path) { fill: var(--landing-ink); }
.provider-symbol-anthropic { color: #ad7863; }
.provider-symbol-gemini { color: #708be0; }
.dark .provider-symbol-anthropic { color: #d09c84; }
.landing-protocol-note { color: var(--landing-muted); font-size: 10px; margin-top: 14px; text-align: right; line-height: 1.6; }

.landing-connection { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); align-items: center; gap: 48px; padding: 72px 0 64px; scroll-margin-top: 100px; }
.landing-section-copy { min-width: 0; }
.landing-section-copy h2, .landing-faq h2 { font: 450 clamp(28px, 3vw, 40px)/1.4 var(--landing-font); letter-spacing: -.035em; text-wrap: balance; }
.landing-connection-heading > p { margin-top: 20px; font-size: 15px; line-height: 1.85; color: var(--landing-muted); }
.landing-steps { display: flex; flex-direction: column; gap: 24px; }
.landing-steps li { display: flex; gap: 18px; }
.landing-steps li > span { display: grid; place-items: center; width: 30px; height: 30px; flex-shrink: 0; font-size: 12px; color: var(--landing-accent); background: var(--landing-soft); border-radius: 8px; font-variant-numeric: tabular-nums; }
.landing-steps h3 { font-size: 15px; font-weight: 450; }
.landing-steps p { margin-top: 5px; font-size: 12px; line-height: 1.8; color: var(--landing-muted); }
.landing-text-link { display: inline-flex; align-items: center; gap: 10px; margin-top: 28px; color: var(--landing-accent); font-size: 13px; }
.landing-feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 48px; padding: 20px 0 80px; }
.landing-feature { min-width: 0; }
.landing-feature-icon { color: var(--landing-muted); }
.landing-feature h3 { font-size: 17px; font-weight: 450; line-height: 1.5; margin: 18px 0 10px; letter-spacing: -.02em; }
.landing-feature p { font-size: 13px; line-height: 1.9; color: var(--landing-muted); }
.landing-faq { display: grid; grid-template-columns: .85fr 1.15fr; gap: 48px; border-top: 1px solid var(--landing-line); padding: 56px 0 64px; scroll-margin-top: 100px; }
.landing-faq > div > p { margin-top: 16px; font-size: 14px; line-height: 1.7; color: var(--landing-muted); }
.landing-faq details { border-bottom: 1px solid var(--landing-line); }
.landing-faq summary { list-style: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 22px 0; font-size: 15px; }
.landing-faq summary::-webkit-details-marker { display: none; }
.landing-faq summary svg { flex-shrink: 0; color: var(--landing-muted); transition: transform .25s; }
.landing-faq details[open] summary svg { transform: rotate(45deg); }
.landing-faq details > p { padding: 0 32px 22px 0; color: var(--landing-muted); font-size: 13px; line-height: 1.9; }
.landing-faq details[open] > p { animation: landing-arrive .16s ease-out both; }
.landing-closing { display: flex; align-items: center; justify-content: space-between; gap: 40px; padding: 48px; margin-bottom: 32px; border: 1px solid var(--landing-line); border-radius: 18px; background: var(--landing-soft); }
.landing-closing h2 { font-size: clamp(26px, 2.8vw, 36px); font-weight: 450; letter-spacing: -.045em; line-height: 1.4; }
.landing-closing p { margin-top: 16px; font-size: 14px; line-height: 1.8; color: var(--landing-muted); }
.landing-footer { max-width: 1264px; margin: auto; padding: 28px 32px; display: flex; justify-content: space-between; gap: 16px; font-size: 11px; color: var(--landing-muted); }
@keyframes landing-arrive { from { opacity: 0; } to { opacity: 1; } }
@media (max-width: 1050px) {
  .landing-nav { flex-wrap: wrap; gap: 10px; }
  .landing-nav-actions { margin-left: auto; }
  .landing-nav-links { order: 3; width: 100%; justify-content: center; }
  .landing-hero-stage { gap: 32px; }
  
}
@media (min-width: 641px) and (max-width: 850px) { .landing-connection { grid-template-columns: 1fr; gap: 32px; } .landing-hero-stage { grid-template-columns: 1fr; gap: 20px; padding-block: 56px; } .landing-hero-visual { max-width: 500px; margin: auto; } .landing-hero-copy { max-width: 560px; } .landing-hero h1 { font-size: 48px; } .landing-hero h1:lang(en) { font-size: 38px; } .landing-hero-description { font-size: 15px; } .landing-hero-actions { gap: 18px; } }
@media (max-width: 640px) {
  .landing-nav-wrap { padding: 12px 20px 8px; }
  .landing-brand { font-size: 21px; }
  .landing-brand img { width: 25px; height: 25px; }
  .landing-nav-actions { gap: 3px; }
  .landing-nav-cta { padding: 9px 14px; }
  .landing-nav-cta svg { display: none; }
  .landing-nav-links { overflow-x: auto; justify-content: flex-start; scrollbar-width: none; }
  .landing-nav-links a { padding: 9px 10px; font-size: 13px; }
  .gangl-landing main { padding: 0 22px; }
  .landing-hero-stage { grid-template-columns: 1fr; gap: 20px; padding: 40px 0 28px; min-height: auto; }
  .landing-intro { font-size: 12px; margin-bottom: 22px; }
  .landing-hero h1 { font-size: clamp(32px, 8.5vw, 48px); line-height: 1.35; }
  .landing-hero h1:lang(en) { font-size: clamp(36px, 10vw, 54px); }
  .landing-hero-description { font-size: 15px; margin-top: 20px; max-width: 320px; }
  .landing-hero-actions { margin-top: 26px; gap: 22px; }
  .landing-primary { font-size: 13px; padding-inline: 20px; }
  .landing-secondary { font-size: 13px; }
  .landing-hero-benefits { gap: 12px; font-size: 10px; margin-top: 22px; }
  .landing-ecosystem { grid-template-columns: 1fr 1fr; gap: 24px 16px; padding: 24px 18px; }
  .landing-ecosystem-copy p { font-size: 14px; }
  .landing-provider { justify-content: flex-start; gap: 10px; }
  .landing-provider strong { font-size: 20px; }
  .provider-symbol { font-size: 28px; }
  .landing-protocol-note { text-align: left; }
  .landing-request-example { grid-column: 1; grid-row: auto; }
  .landing-connection { grid-template-columns: 1fr; gap: 32px; padding: 64px 0 48px; scroll-margin-top: 140px; }
  .landing-feature-grid { grid-template-columns: 1fr; gap: 30px; padding: 0 0 56px; }
  .landing-feature { display: grid; grid-template-columns: 24px 1fr; column-gap: 18px; }
  .landing-feature-icon { grid-row: span 2; margin-top: 3px; }
  .landing-feature h3 { margin: 0 0 6px; }
  .landing-faq { grid-template-columns: 1fr; gap: 20px; padding: 48px 0; scroll-margin-top: 140px; }
  .landing-faq summary { font-size: 14px; }
  .landing-closing { flex-direction: column; align-items: flex-start; padding: 28px; gap: 24px; }
  .landing-footer { padding: 24px 22px; flex-wrap: wrap; }
  .landing-footer > span:nth-child(2) { display: none; }
}

/* Scroll scenes: readable without JS, reversible when scroll enhancement is available. */
.landing-scroll-cue { display: flex; justify-content: center; align-items: center; gap: 10px; padding: 0 0 28px; color: var(--landing-muted); font-size: 12px; }
.landing-scroll-cue svg { animation: scroll-invite 2.4s ease-in-out 3; }
.landing-story-heading { position: relative; isolation: isolate; max-width: 880px; margin: 0 auto; padding: 190px 0 120px; text-align: center; }
.landing-story-heading h2 { font-size: clamp(34px, 5vw, 66px); font-weight: 550; line-height: 1.3; text-wrap: balance; letter-spacing: -.025em; }
.landing-story-heading p { max-width: 560px; margin: 24px auto 0; font-size: 17px; line-height: 1.8; color: var(--landing-muted); }
.landing-connection { align-items: start; padding-top: 30px; }
.landing-steps { margin-top: 32px; }
.landing-steps li { border-left: 1px solid var(--landing-line); padding: 24px 0 24px 20px; align-items: baseline; }
.landing-steps h3 { font-size: 24px; line-height: 1.4; }
.landing-steps p { font-size: 14px; }
.landing-request-stage { min-width: 0; }
.landing-request-heading { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 18px; font-size: 13px; color: var(--landing-muted); }
.landing-step-track { display: flex; gap: 6px; }
.landing-step-track i { width: 26px; height: 3px; background: var(--landing-line); border-radius: 3px; transition: background .25s; }
.landing-step-track .complete { background: var(--landing-accent); }
.landing-stage-caption { margin-top: 20px; color: var(--landing-accent); font-size: 13px; text-align: center; }
.landing-code-frame { transform-origin: center; }
.landing-feature-grid { grid-template-columns: 1fr; gap: 0; padding: 48px 0 100px; }
.landing-feature { position: relative; display: grid; grid-template-columns: 72px minmax(0, 1fr) minmax(0, .85fr); gap: 32px; align-items: center; padding: 64px 24px; border-top: 1px solid var(--landing-line); }
.landing-feature-icon { width: 44px; height: 44px; color: var(--landing-accent); }
.landing-feature h3 { font-size: clamp(24px, 3vw, 36px); line-height: 1.4; margin: 0; }
.landing-feature p { font-size: 15px; margin: 0; }
.landing-story-heading::before { content: ''; position: absolute; z-index: -1; inset: 18% -10%; pointer-events: none; background: radial-gradient(ellipse, color-mix(in srgb, var(--landing-accent) 16%, transparent), transparent 65%); }
.landing-story-heading::after { content: ''; position: absolute; bottom: 48px; left: 15%; right: 15%; height: 1px; background: linear-gradient(90deg, transparent, var(--landing-accent), transparent); box-shadow: 0 0 18px color-mix(in srgb, var(--landing-accent) 55%, transparent); transform: scaleX(var(--scroll-enter, 1)); }
.landing-feature { isolation: isolate; }
.landing-feature::before { content: ''; position: absolute; z-index: -1; inset: 8% 0; pointer-events: none; opacity: calc(var(--scroll-enter, 1) * .7); background: radial-gradient(ellipse at 12% 50%, color-mix(in srgb, var(--landing-accent) 12%, transparent), transparent 64%); }
.landing-feature:nth-child(even)::before { transform: scaleX(-1); }
.landing-feature-icon { filter: drop-shadow(0 0 12px color-mix(in srgb, var(--landing-accent) 35%, transparent)); }
.landing-code-frame { border-radius: 16px; box-shadow: 0 0 0 1px color-mix(in srgb, var(--landing-accent) 18%, transparent), 0 24px 80px -40px color-mix(in srgb, var(--landing-accent) 35%, transparent); }
.dark .landing-primary { background: #b7d1ff; box-shadow: 0 0 24px #60a5fa24; }
.scroll-enhanced .landing-steps li.step-active > span { background: var(--landing-accent); color: var(--landing-bg); box-shadow: 0 0 22px color-mix(in srgb, var(--landing-accent) 30%, transparent); }
.scroll-enhanced [data-scroll-scene] { --scroll-enter: 1; }
.scroll-enhanced .landing-story-heading { opacity: calc(.08 + var(--scroll-enter) * .92); transform: translateY(calc((1 - var(--scroll-enter)) * 110px)) scale(calc(.84 + var(--scroll-enter) * .16)); filter: blur(calc((1 - var(--scroll-enter)) * 4px)); }
.scroll-enhanced .landing-ecosystem { opacity: calc(.15 + var(--scroll-enter) * .85); transform: translateY(calc((1 - var(--scroll-enter)) * 60px)) scale(calc(.96 + var(--scroll-enter) * .04)); }
.scroll-enhanced .landing-ecosystem .landing-provider { transform: translateX(calc((1 - var(--scroll-enter)) * 32px)); }
.scroll-enhanced .landing-ecosystem .landing-provider:nth-child(3) { transform: translateX(calc((1 - var(--scroll-enter)) * 64px)); }
.scroll-enhanced .landing-ecosystem .landing-provider:nth-child(4) { transform: translateX(calc((1 - var(--scroll-enter)) * 96px)); }
.scroll-enhanced .landing-connection-heading { opacity: calc(.15 + var(--scroll-enter) * .85); transform: translateY(calc((1 - var(--scroll-enter)) * 70px)); }
.scroll-enhanced .landing-steps li { opacity: calc(.2 + var(--scroll-enter) * .8); transform: translateY(calc((1 - var(--scroll-enter)) * 75px)) scale(calc(.94 + var(--scroll-enter) * .06)); transition: border-color .25s; }
.scroll-enhanced .landing-steps li.step-active { border-left-color: var(--landing-accent); }
.scroll-enhanced .landing-code-frame { transform: perspective(1200px) rotateX(calc((1 - var(--scroll-enter)) * 14deg)) rotateY(calc((1 - var(--scroll-enter)) * -4deg)) scale(calc(.86 + var(--scroll-enter) * .14)); filter: brightness(calc(.72 + var(--scroll-enter) * .28)); }
.scroll-enhanced .landing-feature { opacity: calc(.12 + var(--scroll-enter) * .88); transform: translateX(calc((1 - var(--scroll-enter)) * var(--feature-direction) * 120px)) scale(calc(.92 + var(--scroll-enter) * .08)); }
.scroll-enhanced .landing-feature-icon { transform: scale(calc(.55 + var(--scroll-enter) * .45)) rotate(calc((1 - var(--scroll-enter)) * -22deg)); }
.scroll-enhanced .landing-faq { opacity: calc(.2 + var(--scroll-enter) * .8); transform: translateY(calc((1 - var(--scroll-enter)) * 60px)) scale(calc(.96 + var(--scroll-enter) * .04)); }
.scroll-enhanced .landing-closing { transform: translateY(calc((1 - var(--scroll-enter)) * 80px)) scale(calc(.9 + var(--scroll-enter) * .1)); }
.scroll-enhanced [data-scroll-scene]:has(:focus-visible) { opacity: 1; transform: none; }
@keyframes scroll-invite { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
@media (min-width: 851px) and (min-height: 681px) {
  .scroll-enhanced .landing-hero { min-height: 180svh; }
  .scroll-enhanced .landing-hero-stage { position: sticky; top: 112px; min-height: calc(100svh - 140px); padding-block: 32px 64px; }
  .scroll-enhanced .landing-hero-copy { transform: translateY(calc(var(--hero-progress, 0) * -44px)) scale(calc(1 - var(--hero-progress, 0) * .08)); transform-origin: left center; opacity: calc(1 - var(--hero-progress, 0) * .5); }
  .scroll-enhanced .landing-hero-copy:focus-within { opacity: 1; }
  .scroll-enhanced .landing-hero-visual { transform: translateX(calc(var(--hero-progress, 0) * -48px)) scale(calc(1 + var(--hero-progress, 0) * .24)); filter: brightness(calc(1 + var(--hero-progress, 0) * .25)); }
  .scroll-enhanced .landing-hero-visual :deep(.network-orbit) { transform-origin: center; transform-box: fill-box; rotate: calc(var(--hero-progress, 0) * 32deg); }
  .scroll-enhanced .landing-hero-visual :deep(.connection-key) { box-shadow: inset 0 1px 0 #ffffff55, 0 0 0 10px color-mix(in srgb, var(--network-light) 7%, transparent), 0 0 calc(55px + var(--hero-progress, 0) * 35px) color-mix(in srgb, var(--network-light) 32%, transparent); }
  .scroll-enhanced .landing-scroll-cue { position: absolute; bottom: 16px; left: 0; right: 0; }
  .scroll-enhanced .landing-request-stage { position: sticky; top: 112px; }
  .scroll-enhanced .landing-steps li { min-height: 38svh; align-items: center; }
  .scroll-enhanced .landing-steps h3 { font-size: 28px; }
}
@media (max-width: 850px), (max-height: 680px) {
  .landing-story-heading { padding: 72px 0 48px; }
  .landing-story-heading p { font-size: 15px; }
  .landing-feature { grid-template-columns: 44px 1fr; gap: 12px 20px; padding: 40px 0; }
  .landing-feature-icon { grid-row: span 2; width: 32px; height: 32px; }
  .landing-feature p { grid-column: 2; font-size: 14px; }
  .landing-feature h3 { font-size: 24px; }
  .landing-feature-grid { padding-bottom: 48px; }
  .scroll-enhanced .landing-feature { transform: translateX(calc((1 - var(--scroll-enter)) * var(--feature-direction) * 24px)); }
  .landing-scroll-cue { padding-bottom: 20px; }
}

/* Full-page visual chapters: each capability gets its own scroll-driven scene. */
.landing-hero h1 { font-size: clamp(44px, 5.1vw, 74px); line-height: 1.18; letter-spacing: -.035em; }
.landing-hero-description { font-size: 17px; margin-top: 30px; }
.landing-intro { background: transparent; padding: 0; display: flex; align-items: center; gap: 10px; }
.landing-intro::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--landing-accent); box-shadow: 0 0 16px var(--landing-accent); }
.landing-primary { border: 1px solid color-mix(in srgb, var(--landing-accent) 60%, white); box-shadow: 0 6px 24px color-mix(in srgb, var(--landing-accent) 16%, transparent); }
.landing-story-heading { max-width: 100%; padding-top: 260px; padding-bottom: 130px; }
.landing-story-heading h2 { position: relative; font-size: clamp(38px, 5.8vw, 78px); }
.landing-story-heading p { position: relative; }
.story-aperture { position: absolute; top: 18px; left: 50%; width: min(600px, 90%); height: 300px; transform: translateX(-50%); pointer-events: none; }
.story-aperture span { position: absolute; inset: 15% 0; border: 1px solid color-mix(in srgb, var(--landing-accent) 40%, transparent); border-radius: 50%; transform: perspective(700px) rotateX(68deg) rotateZ(calc(var(--scroll-enter, 1) * 24deg)); box-shadow: 0 0 20px color-mix(in srgb, var(--landing-accent) 8%, transparent), inset 0 0 20px color-mix(in srgb, var(--landing-accent) 8%, transparent); }
.story-aperture span:nth-child(2) { inset: 5% 12%; transform: perspective(700px) rotateX(48deg) rotateZ(calc(var(--scroll-enter, 1) * -24deg)); opacity: .65; }
.story-aperture span:nth-child(3) { inset: 28% 23%; background: radial-gradient(ellipse, color-mix(in srgb, var(--landing-accent) 15%, transparent), transparent); }
.landing-feature-grid { gap: 48px; padding-top: 100px; }
.landing-feature { grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 64px; padding: 56px 0; min-height: 470px; }
.landing-feature-copy { min-width: 0; }
.landing-feature:nth-child(even) .landing-feature-copy { order: 2; }
.landing-feature-icon { width: 32px; height: 32px; margin-bottom: 24px; }
.landing-feature h3 { font-size: clamp(28px, 3.5vw, 46px); text-wrap: balance; }
.landing-feature p { max-width: 390px; margin-top: 22px; font-size: 16px; line-height: 1.9; }
.landing-closing { position: relative; isolation: isolate; overflow: hidden; padding: 88px 48px; border-radius: 24px; background: linear-gradient(120deg, var(--landing-surface), var(--landing-soft)); border-color: color-mix(in srgb, var(--landing-accent) 32%, var(--landing-line)); }
.landing-closing::before { content: ''; position: absolute; z-index: -1; width: 620px; height: 620px; right: -240px; top: -290px; border: 1px solid color-mix(in srgb, var(--landing-accent) 35%, transparent); border-radius: 50%; box-shadow: 0 0 0 38px color-mix(in srgb, var(--landing-accent) 3%, transparent), 0 0 0 76px color-mix(in srgb, var(--landing-accent) 2%, transparent); }
.landing-closing h2 { font-size: clamp(30px, 3.5vw, 46px); max-width: 700px; }
@media (max-width: 850px) {
  .landing-hero h1 { font-size: clamp(38px, 7vw, 58px); }
  .landing-feature { grid-template-columns: 1fr; gap: 20px; padding: 40px 0; min-height: auto; }
  .landing-feature:nth-child(even) .landing-feature-copy { order: initial; }
  .landing-feature p { max-width: 100%; }
  .landing-feature-grid { padding-top: 48px; gap: 24px; }
  .landing-story-heading { padding-top: 200px; padding-bottom: 70px; }
  .story-aperture { height: 240px; }
  .landing-closing { padding: 44px 28px; }
}
@media (max-width: 640px) {
  .landing-hero h1 { font-size: clamp(32px, 8.5vw, 48px); }
  .landing-hero-description { font-size: 15px; }
  .landing-feature h3 { font-size: 28px; }
  .landing-feature p { font-size: 14px; }
  .landing-feature-icon { margin-bottom: 16px; }
}

/* Daylight material: translucent ice surfaces with a dark terminal focal point. */
:global(html:not(.dark)) .landing-primary,
:global(html:not(.dark)) .landing-nav-cta { background: linear-gradient(135deg, #246de0, #123f9a); color: #fff; box-shadow: inset 0 1px #ffffff50, 0 8px 22px #245bbb30; }
:global(html:not(.dark)) .landing-secondary { background: #f5fbff94; border-color: #ffffffb0; box-shadow: inset 0 1px #fff, 0 8px 25px -16px #2350a4; }
:global(html:not(.dark)) .landing-request-example { --code-bg: #10203c; --code-ink: #eff7ff; --code-muted: #b4c8e8; --code-border: #30496a; --code-accent: #9bd9ff; --code-string: #c4e1ff; }
:global(html:not(.dark)) .landing-closing { background: linear-gradient(120deg, #f1f9ffac, #9fc9f980); border-color: #ffffffa0; box-shadow: inset 0 1px #fff, 0 24px 65px -45px #194a91; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } .landing-primary:active, .landing-primary:hover > span { transform: none; } .landing-icon-button:hover svg { rotate: none; } }
</style>
