<template>
  <div class="gateway-lens" :style="{ '--lens-accent': protocol.color }">
    <div class="lens-stage" role="group" :aria-label="t('experience.architecture')">
      <div class="lens-stage-heading"><span>{{ t('experience.connectionDemo') }}</span><button class="lens-replay" @click="replay++"><Icon name="refresh" size="sm" />{{ t('experience.replayDemo') }}</button></div>
      <GatewayAperture :dark="isDark" :variant="selected" :pulse="replay" />
      <span class="lens-source"><Icon name="terminal" size="sm" />{{ t('experience.flowApp') }}</span>
      <span :key="protocol.name" class="lens-destination">{{ protocol.name }}</span>
      <span class="lens-stage-caption">{{ t('experience.lensCaption') }}</span>
    </div>
    <div class="lens-controls">
      <div class="lens-choices" role="group" :aria-label="t('experience.protocolPreview')">
        <button v-for="(item, index) in protocols" :key="item.name" :aria-pressed="selected === index" @click="select(index)"><span class="lens-choice-dot"></span>{{ item.name }}</button>
      </div>
      <div class="lens-readout" aria-live="polite" aria-atomic="true">
        <span>{{ t('experience.protocolPreview') }}</span><code :key="protocol.name">{{ protocol.path }}</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GatewayAperture from './GatewayAperture.vue'
import Icon from '@/components/icons/Icon.vue'
withDefaults(defineProps<{ isDark?: boolean }>(), { isDark: false })
const { t } = useI18n()
const selected = ref(0)
const replay = ref(0)
const protocols = [
  { name: 'OpenAI', path: '/v1/responses', color: '#619aff' },
  { name: 'Anthropic', path: '/v1/messages', color: '#ac83e8' },
  { name: 'Gemini', path: '/v1beta/models/{model}:generateContent', color: '#47b4c2' },
] as const
const protocol = computed(() => protocols[selected.value]!)
function select(index: number) { selected.value = index; replay.value++ }
</script>

<style scoped>
.gateway-lens { width: 100%; min-width: 0; }
.lens-stage { position: relative; }
.lens-stage-heading { position: absolute; z-index: 1; left: 20px; right: 20px; top: 5px; display: flex; align-items: center; justify-content: space-between; color: var(--landing-muted); font-size: 11px; }
.lens-replay { display: inline-flex; gap: 7px; align-items: center; padding: 9px 12px; border: 1px solid var(--landing-line); border-radius: 100px; background: var(--landing-bg); transition: color .2s, border-color .2s; }
.lens-replay:hover { border-color: var(--landing-muted); color: var(--landing-ink); }
.lens-replay svg { transition: rotate .4s; }
.lens-replay:hover svg { rotate: 90deg; }
.lens-source, .lens-destination { position: absolute; top: 50%; transform: translateY(-50%); background: var(--landing-bg); border: 1px solid var(--landing-line); border-radius: 100px; padding: 10px 14px; font-size: 12px; line-height: 1.4; }
.lens-source { left: 0; color: var(--landing-muted); display: flex; gap: 7px; align-items: center; }
.lens-destination { right: 0; color: var(--landing-ink); border-color: color-mix(in srgb, var(--lens-accent) 45%, var(--landing-line)); animation: lens-label .4s ease both; }
.lens-stage-caption { position: absolute; bottom: 0; width: 100%; text-align: center; color: var(--landing-muted); font-size: 11px; }
.lens-controls { margin: 24px auto 0; max-width: 440px; }
.lens-choices { display: flex; gap: 4px; padding: 5px; border: 1px solid var(--landing-line); border-radius: 100px; background: var(--landing-soft); }
.lens-choices button { display: flex; gap: 8px; align-items: center; justify-content: center; flex: 1; min-height: 39px; border-radius: 100px; font-size: 13px; color: var(--landing-muted); transition: background .25s, color .25s, box-shadow .25s; }
.lens-choices button[aria-pressed='true'] { background: var(--landing-surface); color: var(--landing-ink); box-shadow: 0 1px 4px #00000014; }
.lens-choice-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: .35; }
[aria-pressed='true'] .lens-choice-dot { background: var(--lens-accent); opacity: 1; box-shadow: 0 0 0 3px color-mix(in srgb, var(--lens-accent) 13%, transparent); }
.lens-choices button:hover { color: var(--landing-ink); }
.lens-readout { margin-top: 15px; min-height: 43px; text-align: center; display: flex; flex-direction: column; gap: 7px; }
.lens-readout > span { color: var(--landing-muted); font-size: 10px; }
.lens-readout code { color: var(--landing-ink); font-size: 11px; overflow-wrap: anywhere; animation: lens-label .35s ease both; }
@keyframes lens-label { from { opacity: 0; translate: 0 5px; } to { opacity: 1; translate: 0 0; } }
@media (max-width: 640px) { .lens-stage-heading { top: 0; left: 0; right: 0; font-size: 10px; } .lens-replay { padding: 7px 10px; } .lens-stage { padding-block: 35px 15px; } .lens-source, .lens-destination { top: calc(50% + 10px); padding: 7px 9px; font-size: 10px; } .lens-source svg { display: none; } .lens-controls { margin-top: 24px; } .lens-choices button { font-size: 12px; } }
@media (prefers-reduced-motion: reduce) { *, *::before { animation: none !important; transition: none !important; } .lens-replay:hover svg { rotate: none; } }
</style>
