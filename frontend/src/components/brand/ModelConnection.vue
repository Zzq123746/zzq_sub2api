<template>
  <div class="model-connection" :data-paused="visibility === 'hidden'" :aria-label="t('experience.architecture')" role="group">
    <div class="connection-map">
      <div class="network-halo" aria-hidden="true"></div>
      <svg class="connection-lines" viewBox="0 0 600 480" fill="none" aria-hidden="true">
        <defs>
          <radialGradient :id="`${id}-core`"><stop stop-color="var(--network-light)" stop-opacity=".22" /><stop offset="1" stop-color="var(--network-light)" stop-opacity="0" /></radialGradient>
        </defs>
        <circle cx="300" cy="240" r="160" :fill="`url(#${id}-core)`" />
        <ellipse class="network-orbit" cx="300" cy="240" rx="218" ry="150" transform="rotate(-24 300 240)" />
        <ellipse class="network-orbit orbit-inner" cx="300" cy="240" rx="182" ry="112" transform="rotate(24 300 240)" />
        <path class="network-inlet" d="M300 445 V300" />
        <g v-for="(path, index) in paths" :key="path">
          <path class="network-track" :d="path" :class="{ selected: selected === index }" />
          <path v-if="selected === index" :key="`${index}-${pulse}`" class="network-signal" :d="path" pathLength="100" />
        </g>
      </svg>
      <div class="connection-key"><span class="core-bracket">{</span><span class="core-name">API<small>Gateway</small></span><span class="core-bracket">}</span></div>
      <div class="connection-models">
        <button v-for="(model, index) in models" :key="model.name" :class="`node-${index}`" :aria-pressed="selected === index" @click="select(index)">
          <span class="node-icon"><ModelIcon :model="model.icon" size="32px" aria-hidden="true" /></span>
          <span class="node-label">{{ model.name }}<small>{{ model.protocol }}</small></span>
        </button>
      </div>
      <div class="connection-origin"><Icon name="terminal" size="sm" />{{ t('experience.flowApp') }}</div>
    </div>
    <div class="connection-caption" aria-live="polite" aria-atomic="true">
      <span>{{ t('experience.protocolPreview') }}</span>
      <code>{{ models[selected].path }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDocumentVisibility } from '@vueuse/core'
import Icon from '@/components/icons/Icon.vue'
import ModelIcon from '@/components/common/ModelIcon.vue'
const { t } = useI18n()
const id = useId()
const visibility = useDocumentVisibility()
const selected = ref(0)
const pulse = ref(0)
const select = (index: number) => { selected.value = index; pulse.value++ }
const paths = ['M300 240 Q265 145 174 110', 'M300 240 Q385 140 450 155', 'M300 240 Q360 320 438 350']
const models = [
  { name: 'OpenAI', icon: 'gpt', protocol: 'Responses API', path: '/v1/responses' },
  { name: 'Anthropic', icon: 'claude', protocol: 'Messages API', path: '/v1/messages' },
  { name: 'Gemini', icon: 'gemini', protocol: 'GenerateContent API', path: '/v1beta/models/{model}:generateContent' },
]
</script>

<style scoped>
.model-connection { --network-light: #3a84de; width: 100%; min-width: 0; }
.dark .model-connection { --network-light: #81c4ff; }
.connection-map { position: relative; aspect-ratio: 600 / 480; isolation: isolate; }
.network-halo { position: absolute; inset: 18% 16%; border-radius: 50%; background: radial-gradient(ellipse, color-mix(in srgb, var(--network-light) 14%, transparent), transparent 68%); }
.connection-lines { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.network-orbit { stroke: var(--network-light); stroke-opacity: .38; stroke-width: 1; }
.orbit-inner { stroke-dasharray: 2 9; stroke-opacity: .45; }
.network-inlet { stroke: var(--network-light); stroke-opacity: .35; stroke-dasharray: 3 6; }
.network-track { fill: none; stroke: var(--network-light); stroke-opacity: .2; stroke-width: 1.2; transition: stroke-opacity .3s; }
.network-track.selected { stroke-opacity: .75; }
.network-signal { fill: none; stroke: var(--network-light); stroke-width: 3; stroke-linecap: round; stroke-dasharray: 9 91; animation: network-transmit 3.8s linear infinite; filter: drop-shadow(0 0 8px var(--network-light)); }
.connection-key { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 24%; aspect-ratio: 1; display: flex; justify-content: center; align-items: center; gap: 7px; border: 1px solid color-mix(in srgb, var(--network-light) 50%, transparent); border-radius: 32%; background: linear-gradient(145deg, color-mix(in srgb, var(--landing-surface) 90%, var(--network-light)), var(--landing-surface)); box-shadow: inset 0 1px 0 #ffffff35, 0 0 0 8px color-mix(in srgb, var(--network-light) 4%, transparent), 0 0 55px color-mix(in srgb, var(--network-light) 16%, transparent); }
.core-bracket { font: 300 clamp(24px, 3vw, 44px)/1 ui-monospace, monospace; color: var(--network-light); }
.core-name { font-size: clamp(18px, 2.4vw, 30px); font-weight: 600; letter-spacing: -.04em; color: var(--landing-ink); }
.core-name small { display: block; font-size: 10px; font-weight: 450; letter-spacing: 0; color: var(--landing-muted); text-align: center; margin-top: 3px; }
.connection-models button { position: absolute; display: flex; flex-direction: column; align-items: center; gap: 10px; transform: translate(-50%, -50%); color: var(--landing-muted); width: 28%; padding: 8px 0; border-radius: 16px; }
.node-0 { left: 29%; top: 23%; }
.node-1 { left: 75%; top: 32%; }
.node-2 { left: 73%; top: 73%; }
.node-icon { width: 66px; height: 66px; display: grid; place-items: center; border-radius: 50%; border: 1px solid var(--landing-line); background: var(--landing-surface); box-shadow: inset 0 1px 0 #ffffff25; transition: border-color .25s, box-shadow .25s, color .25s; }
.node-icon :deep(path) { fill: currentColor; }
.node-label { font-size: 14px; color: var(--landing-ink); text-align: center; }
.node-label small { display: block; color: var(--landing-muted); font-size: 9px; margin-top: 3px; }
.connection-models button[aria-pressed='true'] .node-icon { color: var(--network-light); border-color: var(--network-light); box-shadow: 0 0 0 5px color-mix(in srgb, var(--network-light) 8%, transparent), 0 0 28px color-mix(in srgb, var(--network-light) 40%, transparent); }
.connection-models button:hover .node-icon { border-color: var(--network-light); color: var(--network-light); }
.connection-models button:focus-visible { outline: 2px solid var(--network-light); outline-offset: 4px; }
.connection-origin { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--landing-bg); color: var(--landing-muted); font-size: 11px; border-radius: 6px; }
.connection-caption { margin-top: 22px; display: grid; gap: 8px; min-height: 55px; text-align: center; }
.connection-caption > span { color: var(--landing-muted); font-size: 11px; }
.connection-caption code { color: var(--landing-accent); font-size: 11px; overflow-wrap: anywhere; }
@keyframes network-transmit { from { stroke-dashoffset: 9; } to { stroke-dashoffset: -91; } }
.model-connection[data-paused='true'] .network-signal { animation-play-state: paused; }
@media (max-width: 640px) {
  .node-icon { width: 48px; height: 48px; }
  .node-icon svg { width: 24px; height: 24px; }
  .node-label { font-size: 12px; }
  .node-label small { display: none; }
  .core-name small { font-size: 8px; }
  .connection-models button { gap: 6px; }
}
:global(html:not(.dark)) .node-icon { background: linear-gradient(145deg, #ffffffcf, #b6d7ff80); border-color: #ffffffd0; box-shadow: inset 0 1px #fff, 0 10px 25px -15px #235094; }
:global(html:not(.dark)) .connection-key { background: linear-gradient(145deg, #f9fdfff2, #a7cfffbd); box-shadow: inset 0 2px #fff, 0 0 0 8px #ffffff20, 0 20px 55px -25px #215ebc70; }
@media (prefers-reduced-motion: reduce) {
  .network-signal { animation: none; stroke-dasharray: none; opacity: .6; }
  .node-icon, .network-track { transition: none; }
}
</style>
