<template>
  <nav class="resource-guide" :class="dashboard ? 'resource-guide-dashboard' : 'resource-guide-home'" :aria-label="t('experience.resourcesTitle')">
    <div class="resource-guide-heading">
      <h2>{{ t(dashboard ? 'experience.resourcesDashboard' : 'experience.resourcesTitle') }}</h2>
      <p>{{ t('experience.resourcesDescription') }}</p>
    </div>
    <div class="resource-guide-links">
      <component
        :is="item.external ? 'a' : RouterLink"
        v-for="(item, index) in items"
        v-reveal="animated ? index * 90 : false"
        :key="item.id"
        v-bind="item.external ? { href: item.path, target: '_blank', rel: 'noopener noreferrer' } : { to: item.path }"
        class="resource-guide-link"
        :data-resource="item.id"
      >
        <span class="resource-guide-icon"><Icon :name="item.icon" size="md" /></span>
        <span class="resource-guide-copy"><strong>{{ t(item.title) }}</strong><small>{{ t(item.description) }}</small></span>
        <Icon :name="item.external ? 'arrowUpRight' : 'arrowRight'" size="sm" class="resource-guide-arrow" />
      </component>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { sanitizeUrl } from '@/utils/url'
import { vReveal } from '@/directives/reveal'

const props = withDefaults(defineProps<{
  showModelPlaza: boolean
  docUrl?: string
  dashboard?: boolean
  animated?: boolean
}>(), { docUrl: '', dashboard: false, animated: false })
const { t } = useI18n()
type ResourceItem = { id: string; title: string; description: string; icon: InstanceType<typeof Icon>['$props']['name']; path: string; external?: boolean }
const items = computed<ResourceItem[]>(() => {
  const docs = sanitizeUrl(props.docUrl)
  return [
    ...(props.showModelPlaza ? [{ id: 'models', title: 'nav.modelPlaza', description: 'experience.resourceModels', icon: 'grid' as const, path: '/model-plaza' }] : []),
    { id: 'docs', title: 'experience.apiDocs', description: 'experience.resourceDocs', icon: 'book', path: docs || '/docs/quickstart', external: !!docs },
    { id: 'keys', title: 'experience.apiKeys', description: 'experience.resourceKeys', icon: 'key', path: '/keys' },
    props.dashboard
      ? { id: 'usage', title: 'experience.usageRecords', description: 'experience.resourceUsage', icon: 'chart', path: '/usage' }
      : { id: 'start', title: 'experience.quickStart', description: 'experience.resourceStart', icon: 'terminal', path: '/docs/quickstart' },
  ]
})
</script>

<style scoped>
.resource-guide { color: var(--experience-ink); }
.resource-guide-heading { display: grid; grid-template-columns: 1fr auto; align-items: baseline; column-gap: 24px; margin-bottom: 20px; }
.resource-guide-heading h2 { font-size: 28px; font-weight: 600; letter-spacing: var(--experience-heading-tracking); line-height: 1.3; }
.resource-guide-heading p { color: var(--experience-muted); font-size: 14px; line-height: 1.6; }
.resource-guide-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.resource-guide-link { position: relative; overflow: hidden; display: flex; gap: 14px; align-items: center; padding: 22px 18px; border: 1px solid var(--experience-border); border-radius: 12px; background: var(--experience-surface); box-shadow: 0 2px 4px #0b152303; transition: opacity .7s var(--experience-ease) var(--reveal-delay, 0ms), transform .7s var(--experience-ease) var(--reveal-delay, 0ms), translate .4s var(--experience-ease), border-color .25s, background .25s, box-shadow .4s; }
.resource-guide-icon { width: 38px; height: 38px; border: 1px solid var(--experience-border); border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; color: var(--experience-accent); background: var(--surface-canvas); }
.resource-guide-copy { display: flex; flex: 1; flex-direction: column; gap: 5px; min-width: 0; }
.resource-guide-copy strong { font-family: var(--experience-ui-font); font-size: 17px; font-weight: 500; letter-spacing: 0; }
.resource-guide-copy small { font-size: 13px; line-height: 1.6; color: var(--experience-muted); }
.resource-guide-arrow { color: var(--experience-muted); flex-shrink: 0; transition: transform .25s var(--experience-ease), color .2s; }
.resource-guide-link:hover { border-color: var(--experience-accent); background: var(--experience-tint); translate: 0 -5px; box-shadow: 0 14px 28px -16px #6675c44a; }
.resource-guide-link:hover .resource-guide-arrow { transform: translateX(5px); color: var(--experience-accent); }
.resource-guide-link:focus-visible { outline: 2px solid var(--experience-accent); outline-offset: 3px; }
.resource-guide-home .resource-guide-heading { margin-bottom: 28px; }
.resource-guide-home .resource-guide-heading h2 { font-size: clamp(28px, 3vw, 40px); }
.resource-guide-home .resource-guide-link { flex-direction: column; align-items: flex-start; min-height: 208px; padding: 28px; border-radius: 20px; gap: 28px; }
.resource-guide-home .resource-guide-icon { width: 44px; height: 44px; border-radius: 14px; transition: background .35s, color .35s, transform .5s var(--experience-ease); }
.resource-guide-home .resource-guide-copy { flex: none; gap: 10px; }
.resource-guide-home .resource-guide-copy strong { font-size: 21px; font-weight: 600; }
.resource-guide-home .resource-guide-copy small { font-size: 14px; }
.resource-guide-home .resource-guide-arrow { position: absolute; top: 40px; right: 26px; }
.resource-guide-home .resource-guide-link:is(:hover, :focus-visible) .resource-guide-icon { background: var(--experience-accent); color: var(--experience-surface); transform: translateY(-3px) rotate(-5deg); }
.resource-guide-dashboard .resource-guide-heading h2 { font-size: 20px; }
.resource-guide-dashboard .resource-guide-copy strong { font-size: 15px; }
.resource-guide-dashboard .resource-guide-link { padding: 20px; }
@media (max-width: 640px) { .resource-guide-heading { display: block; } .resource-guide-heading h2 { font-size: 24px; } .resource-guide-heading p { margin-top: 7px; } .resource-guide-links { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } .resource-guide-link { position: relative; flex-direction: column; align-items: flex-start; padding: 17px 14px; gap: 12px; } .resource-guide-arrow { position: absolute; top: 27px; right: 15px; } .resource-guide-copy strong { font-size: 15px; } }
.resource-guide-home .resource-guide-link:active { translate: 0 -1px; }
@media (max-width: 640px) {
  .resource-guide-home .resource-guide-link { min-height: 186px; padding: 20px 16px; gap: 24px; border-radius: 16px; }
  .resource-guide-home .resource-guide-copy strong { font-size: 17px; }
  .resource-guide-home .resource-guide-copy small { font-size: 13px; }
  .resource-guide-home .resource-guide-arrow { top: 34px; right: 14px; }
  .resource-guide-dashboard .resource-guide-link { padding: 17px 14px; }
}
@media (hover: none) { .resource-guide-link:hover { translate: none; } }
@media (prefers-reduced-motion: reduce) { .resource-guide-link, .resource-guide-arrow, .resource-guide-icon { transition: none; } .resource-guide .resource-guide-link:is(:hover, :active) { translate: none; } .resource-guide .resource-guide-link:is(:hover, :focus-visible) :is(.resource-guide-arrow, .resource-guide-icon) { transform: none; } }
</style>
