<template>
  <div class="feature-scene" :class="`scene-${kind}`" aria-hidden="true">
    <div class="scene-aura"></div>
    <template v-if="kind === 0">
      <div class="protocol-plane plane-back"><span>Messages API</span><code>/v1/messages</code></div>
      <div class="protocol-plane plane-middle"><span>GenerateContent API</span><code>/v1beta/models</code></div>
      <div class="protocol-plane plane-front"><Icon name="terminal" size="lg" /><span>Responses API</span><code>/v1/responses</code><div class="code-bars"><i></i><i></i><i></i></div></div>
    </template>
    <template v-else-if="kind === 1">
      <svg class="usage-scene" viewBox="0 0 480 320" fill="none">
        <path class="chart-grid" d="M30 90H450M30 155H450M30 220H450M90 45V275M190 45V275M290 45V275M390 45V275" />
        <g class="chart-bars"><rect v-for="(height, index) in bars" :key="index" :x="45 + index * 48" :y="275 - height" width="22" :height="height" rx="4" :style="{ '--bar-index': index }" /></g>
        <path class="chart-line" pathLength="1" d="M35 236C95 236 90 170 148 180S213 210 254 128S314 180 354 100S416 100 450 54" />
        <circle cx="450" cy="54" r="5" class="chart-point" />
      </svg>
    </template>
    <template v-else>
      <div class="key-orbit orbit-a"></div><div class="key-orbit orbit-b"></div>
      <div class="key-center"><Icon name="key" size="lg" /></div>
      <div class="key-token token-a"><Icon name="lock" size="sm" /><code>sk-••••••••</code></div>
      <div class="key-token token-b"><Icon name="check" size="sm" /><code>sk-••••••••</code></div>
      <div class="key-token token-c"><Icon name="lock" size="sm" /><code>sk-••••••••</code></div>
    </template>
  </div>
</template>
<script setup lang="ts">
import Icon from '@/components/icons/Icon.vue'
defineProps<{ kind: number }>()
const bars = [44, 70, 56, 110, 100, 154, 138, 196]
</script>
<style scoped>
.feature-scene { --scene-progress: 1; position: relative; min-width: 0; height: 360px; perspective: 1000px; isolation: isolate; color: var(--landing-accent); }
:global(.scroll-enhanced) .feature-scene { --scene-progress: var(--scroll-enter, 1); }
.scene-aura { position: absolute; inset: 0; background: radial-gradient(ellipse, color-mix(in srgb, var(--landing-accent) 17%, transparent), transparent 65%); transform: scale(calc(.7 + var(--scene-progress) * .3)); }
.protocol-plane { position: absolute; width: 68%; height: 190px; left: 16%; top: 80px; padding: 24px; border: 1px solid color-mix(in srgb, var(--landing-accent) 35%, var(--landing-line)); border-radius: 14px; background: var(--landing-surface); box-shadow: 0 25px 70px -35px #0008, inset 0 1px #ffffff20; display: flex; flex-direction: column; gap: 12px; }
.protocol-plane span { font-size: 15px; color: var(--landing-ink); }
.protocol-plane code { font-size: 12px; }
.plane-back { transform: translate(calc(var(--scene-progress) * 32px), calc(var(--scene-progress) * -60px)) rotateY(-18deg) rotateX(10deg); opacity: .5; }
.plane-middle { transform: translate(calc(var(--scene-progress) * 16px), calc(var(--scene-progress) * -26px)) rotateY(-18deg) rotateX(10deg); opacity: .75; }
.plane-front { transform: translateY(calc(var(--scene-progress) * 30px)) rotateY(calc((1 - var(--scene-progress)) * -18deg)); }
.code-bars { position: absolute; right: 22px; bottom: 22px; display: grid; gap: 6px; width: 36%; }
.code-bars i { height: 3px; background: currentColor; opacity: .25; }
.code-bars i:nth-child(2) { width: 60%; }
.code-bars i:nth-child(3) { width: 80%; }
.usage-scene { width: 100%; height: 100%; overflow: visible; }
.chart-grid { stroke: var(--landing-line); stroke-width: .7; }
.chart-bars rect { fill: var(--landing-accent); opacity: .16; transform-box: fill-box; transform-origin: bottom; transform: scaleY(calc(.08 + var(--scene-progress) * .92)); }
.chart-line { stroke: var(--landing-accent); stroke-width: 3; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: calc(1 - var(--scene-progress)); filter: drop-shadow(0 0 8px color-mix(in srgb, var(--landing-accent) 60%, transparent)); }
.chart-point { fill: var(--landing-accent); opacity: var(--scene-progress); }
.key-center { position: absolute; left: 50%; top: 50%; translate: -50% -50%; width: 100px; height: 100px; border-radius: 28px; display: grid; place-items: center; background: var(--landing-surface); border: 1px solid var(--landing-accent); box-shadow: 0 0 50px color-mix(in srgb, var(--landing-accent) 20%, transparent); }
.key-center svg { width: 40px; height: 40px; }
.key-orbit { position: absolute; inset: 20% 18%; border: 1px solid color-mix(in srgb, var(--landing-accent) 25%, transparent); border-radius: 50%; transform: rotate(calc(var(--scene-progress) * 30deg)); }
.orbit-b { inset: 8% 28%; transform: rotate(calc(var(--scene-progress) * -45deg)); }
.key-token { position: absolute; display: flex; gap: 10px; align-items: center; padding: 14px 18px; border: 1px solid var(--landing-line); border-radius: 9px; background: var(--landing-surface); font-size: 12px; box-shadow: 0 12px 28px -20px #0008; }
.token-a { left: 6%; top: 15%; transform: translateY(calc((1 - var(--scene-progress)) * 65px)); }
.token-b { right: 0; top: 40%; transform: translateX(calc((1 - var(--scene-progress)) * -70px)); }
.token-c { left: 14%; bottom: 8%; transform: translateY(calc((1 - var(--scene-progress)) * -65px)); }
@media (max-width: 640px) { .feature-scene { height: 290px; } .protocol-plane { width: 76%; left: 8%; padding: 18px; height: 164px; } .key-token { padding: 10px; font-size: 10px; } .key-center { width: 76px; height: 76px; } }
@media (prefers-reduced-motion: reduce) { .feature-scene { --scene-progress: 1 !important; } }
</style>
