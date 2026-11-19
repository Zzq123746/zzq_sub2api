<template>
  <div class="landing-code-panel">
    <div class="landing-code-heading">
      <span><Icon name="terminal" size="sm" />{{ t('experience.requestExample') }}</span>
      <span class="landing-code-language">cURL</span>
    </div>
    <div class="landing-code-toolbar">
      <div class="landing-protocol-tabs" role="tablist" :aria-label="t('experience.protocolPreview')">
        <button
          v-for="(item, index) in protocols"
          :id="`${id}-tab-${item.name}`"
          :key="item.name"
          :ref="el => { if (el) tabButtons[index] = el as HTMLButtonElement }"
          :aria-selected="protocol === item.name"
          :aria-controls="`${id}-code-${item.name}`"
          :tabindex="protocol === item.name ? 0 : -1"
          role="tab"
          :class="{ selected: protocol === item.name }"
          @click="protocol = item.name"
          @keydown="onTabKeydown($event, index)"
        >
          <ModelIcon :model="item.icon" size="15px" aria-hidden="true" />{{ item.name }}
        </button>
      </div>
      <button class="landing-copy-button" :aria-label="copied ? t('experience.copied') : t('experience.copy')" @click="copyExample">
        <Icon :name="copied ? 'check' : 'copy'" size="sm" /><span>{{ copied ? t('experience.copied') : t('experience.copy') }}</span>
      </button>
    </div>
    <div
      :id="`${id}-code-${protocol}`"
      :key="protocol"
      :aria-labelledby="`${id}-tab-${protocol}`"
      role="tabpanel"
      tabindex="0"
      class="landing-code-content"
    >
      <div class="landing-code-endpoint"><span>POST</span><span>{{ selectedProtocol.path }}</span></div>
      <pre><code><span v-for="(token, index) in tokens" :key="index" :class="token.kind">{{ token.text }}</span></code></pre>
    </div>
    <div class="landing-code-note">
      <span>{{ t('experience.example') }}</span>
      <span class="landing-copy-status" aria-live="polite" aria-atomic="true">{{ copyError ? t('experience.copyFailed') : copied ? t('experience.copied') : '' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import ModelIcon from '@/components/common/ModelIcon.vue'

const { t } = useI18n()
const id = useId()
const protocols = [
  { name: 'OpenAI', icon: 'gpt', path: '/v1/responses' },
  { name: 'Anthropic', icon: 'claude', path: '/v1/messages' },
  { name: 'Gemini', icon: 'gemini', path: '/v1beta/models/{model}:generateContent' },
] as const
const protocol = ref<(typeof protocols)[number]['name']>('OpenAI')
const selectedProtocol = computed(() => protocols.find(item => item.name === protocol.value)!)
const tabButtons = ref<HTMLButtonElement[]>([])
const copied = ref(false)
const copyError = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined
let copyVersion = 0
watch(protocol, () => {
  copyVersion++
  clearTimeout(copyTimer)
  copied.value = false
  copyError.value = false
})
const examples = {
  OpenAI: `curl "$BASE_URL/v1/responses" \\\n  -H "Authorization: Bearer $API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "YOUR_MODEL",\n    "input": "Hello, world."\n  }'`,
  Anthropic: `curl "$BASE_URL/v1/messages" \\\n  -H "x-api-key: $API_KEY" \\\n  -H "anthropic-version: 2023-06-01" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "YOUR_MODEL",\n    "max_tokens": 256,\n    "messages": [{"role": "user", "content": "Hello!"}]\n  }'`,
  Gemini: `curl "$BASE_URL/v1beta/models/YOUR_MODEL:generateContent" \\\n  -H "x-goog-api-key: $API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "contents": [{\n      "parts": [{"text": "Hello, world."}]\n    }]\n  }'`,
}
const example = computed(() => examples[protocol.value])
// Render text nodes rather than injecting HTML; copied code remains byte-for-byte identical.
const tokens = computed(() => example.value.split(/("[^"\n]*"|\bcurl\b|\b256\b)/g).filter(Boolean).map(text => ({
  text,
  kind: text === 'curl' ? 'code-command' : text.startsWith('"') ? 'code-string' : text === '256' ? 'code-number' : '',
})))
async function onTabKeydown(event: KeyboardEvent, index: number) {
  let target = index
  if (event.key === 'ArrowRight') target = (index + 1) % protocols.length
  else if (event.key === 'ArrowLeft') target = (index + protocols.length - 1) % protocols.length
  else if (event.key === 'Home') target = 0
  else if (event.key === 'End') target = protocols.length - 1
  else return
  event.preventDefault()
  protocol.value = protocols[target].name
  await nextTick()
  tabButtons.value[target]?.focus()
}
async function copyExample() {
  const version = ++copyVersion
  copied.value = false
  copyError.value = false
  clearTimeout(copyTimer)
  try {
    await navigator.clipboard.writeText(example.value)
    if (version !== copyVersion) return
    copied.value = true
    copyTimer = setTimeout(() => { copied.value = false }, 2000)
  } catch {
    if (version === copyVersion) copyError.value = true
  }
}
onBeforeUnmount(() => { copyVersion++; clearTimeout(copyTimer) })
</script>

<style scoped>
.landing-code-panel { min-width: 0; color: var(--code-ink, #dce2f3); background: var(--code-bg, #1b2033); border: 1px solid var(--code-border, #30374d); border-radius: 16px; overflow: hidden; }
.landing-code-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 22px; color: var(--code-ink, #e4e8f5); border-bottom: 1px solid var(--code-border, #ffffff0e); font-size: 13px; }
.landing-code-heading > span:first-child { display: inline-flex; align-items: center; gap: 9px; }
.landing-code-heading svg { color: var(--code-muted, #9faad0); }
.landing-code-language { color: var(--code-muted, #9ca7c3); font-size: 12px; }
.landing-code-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid var(--code-border, #ffffff0e); gap: 8px; }
.landing-protocol-tabs { display: flex; min-width: 0; gap: 8px; }
.landing-protocol-tabs button { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 52px; padding: 0 8px; font-size: 12px; color: var(--code-muted, #a6afc6); transition: color .16s; }
.landing-protocol-tabs button::after { content: ''; position: absolute; bottom: -1px; left: 8px; right: 8px; height: 2px; background: var(--code-accent, #a9b3ff); opacity: 0; transition: opacity .16s; }
.landing-protocol-tabs button:hover { color: var(--code-ink, #fff); }
.landing-protocol-tabs .selected { color: var(--code-ink, #fff); }
.landing-protocol-tabs .selected::after { opacity: 1; }
.landing-protocol-tabs :deep(path) { fill: currentColor; }
.landing-copy-button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 36px; flex-shrink: 0; font-size: 11px; color: var(--code-muted, #b4bdd3); padding: 6px 8px; border-radius: 6px; transition: color .16s, background .16s; }
.landing-copy-button:hover { color: var(--code-ink, #fff); background: #ffffff0d; }
.landing-code-content { padding: 22px; animation: code-change .18s ease-out; }
.landing-code-endpoint { display: flex; min-height: 38px; align-items: flex-start; gap: 10px; color: var(--code-muted, #b6c0db); font: 11px/1.7 ui-monospace, SFMono-Regular, Consolas, monospace; }
.landing-code-endpoint > span:first-child { flex-shrink: 0; color: var(--code-accent, #9cd4c4); }
.landing-code-endpoint > span:last-child { overflow-wrap: anywhere; min-width: 0; }
.landing-code-content pre { overflow-x: auto; font: 12px/1.9 ui-monospace, SFMono-Regular, Consolas, monospace; padding-top: 22px; height: 230px; tab-size: 2; scrollbar-width: thin; scrollbar-color: #505c7b transparent; }
.landing-code-content code { font: inherit; }
.code-command { color: var(--code-accent, #b8bfff); }
.code-string { color: var(--code-string, #b4d2ef); }
.code-number { color: var(--code-accent, #dfc4a3); }
.landing-code-note { border-top: 1px solid var(--code-border, #ffffff0e); padding: 14px 22px; color: var(--code-muted, #a6afc6); font-size: 11px; line-height: 1.7; }
.landing-copy-status { display: block; min-height: 1.7em; color: var(--code-ink, #d0d8f0); }
.landing-code-panel :focus-visible { outline: 2px solid var(--code-accent, #b4bdff); outline-offset: -3px; border-radius: 4px; }
@keyframes code-change { from { opacity: .45; } to { opacity: 1; } }
@media (max-width: 640px) {
  .landing-code-heading { padding: 15px 16px; }
  .landing-code-toolbar { padding-inline: 10px; gap: 2px; }
  .landing-protocol-tabs { gap: 0; }
  .landing-protocol-tabs button { gap: 5px; padding-inline: 7px; font-size: 11px; min-height: 46px; }
  .landing-protocol-tabs svg { width: 13px; height: 13px; }
  .landing-code-content { padding: 18px 16px; }
  .landing-code-content pre { font-size: 11px; height: 214px; }
  .landing-copy-button { width: 32px; padding-inline: 4px; }
  .landing-copy-button > span { display: none; }
  .landing-code-note { padding: 12px 16px; font-size: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .landing-code-content { animation: none; }
  .landing-protocol-tabs button, .landing-protocol-tabs button::after, .landing-copy-button { transition: none; }
}
</style>
