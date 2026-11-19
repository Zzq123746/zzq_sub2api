<template>
  <div class="gateway-orbit" role="img" :aria-label="t('experience.architecture')">
    <svg class="gateway-paths" viewBox="0 0 800 340" fill="none" aria-hidden="true">
      <g>
        <path d="M135 87 H225 Q255 87 275 117 L310 155 Q320 170 345 170 H400" />
        <path d="M135 170 H400" />
        <path d="M135 253 H225 Q255 253 275 223 L310 185 Q320 170 345 170 H400" />
        <path d="M400 170 H455 Q480 170 490 155 L525 117 Q545 87 575 87 H665" />
        <path d="M400 170 H665" />
        <path d="M400 170 H455 Q480 170 490 185 L525 223 Q545 253 575 253 H665" />
      </g>
    </svg>
    <div class="gateway-key" aria-hidden="true"><Icon name="key" size="lg" /><span>API Key</span></div>
    <div class="gateway-endpoint gateway-endpoint-left gateway-endpoint-top"><Icon name="terminal" size="sm" /><span>{{ t('experience.flowApp') }}</span></div>
    <div class="gateway-endpoint gateway-endpoint-left gateway-endpoint-middle"><Icon name="terminal" size="sm" /><span>{{ t('experience.flowTools') }}</span></div>
    <div class="gateway-endpoint gateway-endpoint-left gateway-endpoint-bottom"><Icon name="grid" size="sm" /><span>{{ t('experience.flowProject') }}</span></div>
    <div class="gateway-endpoint gateway-endpoint-right gateway-endpoint-top"><ModelIcon model="gpt" size="16px" aria-hidden="true" /><span>OpenAI</span></div>
    <div class="gateway-endpoint gateway-endpoint-right gateway-endpoint-middle"><ModelIcon model="claude" size="16px" aria-hidden="true" /><span>Anthropic</span></div>
    <div class="gateway-endpoint gateway-endpoint-right gateway-endpoint-bottom"><ModelIcon model="gemini" size="16px" aria-hidden="true" /><span>Gemini</span></div>
    <span class="gateway-caption">{{ t('experience.flowLabel') }}</span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import ModelIcon from '@/components/common/ModelIcon.vue'

const { t } = useI18n()
</script>

<style scoped>
.gateway-orbit { position: relative; width: 100%; aspect-ratio: 800 / 340; color: #d5dced; container-type: inline-size; }
.gateway-paths { position: absolute; inset: 0; width: 100%; height: 100%; stroke: #677394; stroke-width: 1; }
.gateway-key { position: absolute; left: 50%; top: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; width: 17%; aspect-ratio: 1; transform: translate(-50%, -50%); border: 1px solid #7f8bb4; border-radius: 14px; background: #2b3451; color: #d0d8ff; }
.gateway-key > span { font-size: clamp(9px, 1.7cqw, 12px); }
.gateway-endpoint { position: absolute; display: flex; align-items: center; gap: 9px; width: 23%; padding: 12px; border: 1px solid #495370; border-radius: 8px; background: #252c43; font-size: clamp(9px, 1.7cqw, 13px); white-space: nowrap; transform: translate(-50%, -50%); }
.gateway-endpoint svg { flex-shrink: 0; color: #b2bddc; }
.gateway-endpoint :deep(.model-icon path) { fill: currentColor; }
.gateway-endpoint-left { left: 16%; }
.gateway-endpoint-right { left: 84%; }
.gateway-endpoint-top { top: 25.6%; }
.gateway-endpoint-middle { top: 50%; }
.gateway-endpoint-bottom { top: 74.4%; }
.gateway-caption { position: absolute; bottom: 0; width: 100%; text-align: center; color: #a4afc9; font-size: 11px; }
@container (max-width: 480px) {
  .gateway-endpoint { padding: 8px; gap: 6px; }
  .gateway-endpoint svg { width: 13px; height: 13px; }
  .gateway-key { gap: 5px; border-radius: 10px; }
  .gateway-key > svg { width: 20px; height: 20px; }
  .gateway-caption { font-size: 10px; }
}
</style>
