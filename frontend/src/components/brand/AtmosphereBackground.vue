<template>
  <div class="atmosphere-background" :data-paused="visibility === 'hidden'" aria-hidden="true">
    <div class="atmosphere-light"></div>
    <div class="atmosphere-light atmosphere-light-secondary"></div>
    <div class="atmosphere-stars">
      <span v-for="(star, index) in stars" :key="index" :style="{ left: `${star[0]}%`, top: `${star[1]}%`, '--star-delay': `${index % 7 * -1.7}s` }"></span>
    </div>
    <div class="atmosphere-ribbon ribbon-one"></div>
    <div class="atmosphere-ribbon ribbon-two"></div>
    <div class="atmosphere-ribbon ribbon-three"></div>
    <svg class="atmosphere-glass" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none" focusable="false">
      <defs>
        <linearGradient :id="`${id}-glass`" x1="820" y1="80" x2="1350" y2="730" gradientUnits="userSpaceOnUse">
          <stop stop-color="var(--glass-tint)" stop-opacity="0" />
          <stop offset=".35" stop-color="var(--glass-tint)" stop-opacity=".12" />
          <stop offset=".68" stop-color="var(--glass-tint)" stop-opacity=".035" />
          <stop offset="1" stop-color="var(--glass-tint)" stop-opacity="0" />
        </linearGradient>
        <linearGradient :id="`${id}-edge`" x1="800" y1="0" x2="1350" y2="800" gradientUnits="userSpaceOnUse">
          <stop stop-color="var(--glass-edge)" stop-opacity="0" />
          <stop offset=".26" stop-color="var(--glass-edge)" stop-opacity=".12" />
          <stop offset=".45" stop-color="var(--glass-edge)" stop-opacity=".48" />
          <stop offset=".66" stop-color="var(--glass-edge)" stop-opacity=".12" />
          <stop offset="1" stop-color="var(--glass-edge)" stop-opacity="0" />
        </linearGradient>
        <linearGradient :id="`${id}-reflection`" x1="820" y1="300" x2="1320" y2="700" gradientUnits="userSpaceOnUse">
          <stop stop-color="var(--glass-tint)" stop-opacity="0" />
          <stop offset=".5" stop-color="var(--glass-tint)" stop-opacity=".14" />
          <stop offset="1" stop-color="var(--glass-tint)" stop-opacity="0" />
        </linearGradient>
      </defs>
      <!-- Reuse the same material across the viewport, with independent slow movement. -->
      <g :id="`${id}-surface`">
      <path d="M930 -100 C715 128 715 350 945 468 C1100 547 1310 505 1540 764 L1640 -100 Z" :fill="`url(#${id}-glass)`" />
      <path d="M930 -100 C715 128 715 350 945 468 C1100 547 1310 505 1540 764" :stroke="`url(#${id}-reflection)`" stroke-width="28" class="glass-reflection" />
      <path d="M930 -100 C715 128 715 350 945 468 C1100 547 1310 505 1540 764" :stroke="`url(#${id}-edge)`" stroke-width="1" />
      <g opacity=".6">
        <path d="M1150 -100 C900 130 875 407 1105 555 C1260 655 1435 600 1600 850 L1700 -100 Z" :fill="`url(#${id}-glass)`" />
        <path d="M1150 -100 C900 130 875 407 1105 555 C1260 655 1435 600 1600 850" :stroke="`url(#${id}-edge)`" stroke-width="1" />
      </g>
      </g>
      <g class="glass-left" opacity=".8">
        <use :href="`#${id}-surface`" transform="translate(1440 900) scale(-1 -1)" />
      </g>
      <g class="glass-lower" opacity=".45">
        <use :href="`#${id}-surface`" transform="translate(-240 430) scale(1.1 .75)" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { useDocumentVisibility } from '@vueuse/core'
const id = useId()
const visibility = useDocumentVisibility()
// Fixed sparse positions keep the composition stable across renders.
const stars = [[7, 15], [18, 32], [34, 10], [58, 17], [78, 9], [93, 27], [88, 48], [66, 39], [47, 56], [12, 62], [29, 81], [6, 89], [56, 87], [74, 73], [94, 86], [40, 32], [83, 61], [22, 52], [3, 38], [13, 6], [25, 19], [43, 7], [51, 30], [69, 6], [97, 11], [91, 37], [76, 45], [60, 65], [36, 68], [17, 77], [3, 72], [43, 93], [64, 96], [82, 92], [97, 66], [32, 43], [54, 74], [71, 54]]
</script>

<style scoped>
.atmosphere-background {
  --glass-tint: #2269d1;
  --glass-edge: #f5fcff;
  --glass-light: #3e8def40;
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  contain: paint;
}
.dark .atmosphere-background {
  --glass-tint: #719bd3;
  --glass-edge: #d5e7ff;
  --glass-light: #3b70b52a;
}
.atmosphere-light {
  position: absolute;
  inset: -10%;
  background:
    radial-gradient(ellipse at 82% 24%, var(--glass-light), transparent 52%),
    radial-gradient(ellipse at 12% 76%, var(--glass-light), transparent 50%);
  animation: atmosphere-flow 18s ease-in-out infinite alternate;
}
.atmosphere-light-secondary {
  background: radial-gradient(ellipse at 46% 54%, var(--glass-light), transparent 60%);
  animation: atmosphere-glow 12s ease-in-out infinite alternate;
}
.atmosphere-glass {
  position: absolute;
  inset: -6%;
  width: 112%;
  height: 112%;
  animation: glass-drift 24s ease-in-out infinite alternate;
}
.glass-left { animation: glass-counter-drift 20s ease-in-out infinite alternate; }
.glass-lower { animation: glass-counter-drift 28s ease-in-out infinite alternate-reverse; }
.glass-reflection { filter: blur(14px); }
.atmosphere-stars { position: absolute; inset: 0; opacity: .65; }
.atmosphere-stars span { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: var(--glass-edge); box-shadow: 0 0 12px var(--glass-edge); animation: star-shimmer 7s var(--star-delay) ease-in-out infinite alternate; }
.atmosphere-stars span:nth-child(4n) { width: 4px; height: 4px; }
.dark .atmosphere-stars { opacity: .9; }
.atmosphere-ribbon { position: absolute; width: 105vw; height: 230px; border-radius: 50%; background: linear-gradient(175deg, transparent 35%, color-mix(in srgb, var(--glass-tint) 28%, transparent) 48%, color-mix(in srgb, var(--glass-edge) 42%, transparent) 50%, transparent 55%); filter: blur(9px); opacity: .8; }
.ribbon-one { left: -32%; top: 21%; rotate: -32deg; animation: ribbon-drift 18s ease-in-out infinite alternate; }
.ribbon-two { right: -36%; bottom: 13%; rotate: -32deg; animation: ribbon-drift 23s -10s ease-in-out infinite alternate-reverse; }
.ribbon-three { left: -16%; top: 54%; rotate: 24deg; opacity: .45; animation: ribbon-drift 27s -8s ease-in-out infinite alternate; }
.atmosphere-background[data-paused='true'] * { animation-play-state: paused; }
@keyframes star-shimmer { from { opacity: .2; transform: scale(.75); } to { opacity: 1; transform: scale(1.3); } }
@keyframes ribbon-drift { from { transform: translate(-7%, -32px) scaleX(.86); } to { transform: translate(9%, 44px) scaleX(1.12); } }
@keyframes atmosphere-flow {
  from { transform: translate(-2%, -1%) rotate(-3deg); }
  to { transform: translate(3%, 2%) rotate(3deg); }
}
@keyframes atmosphere-glow {
  from { opacity: .35; transform: scale(.94); }
  to { opacity: .85; transform: scale(1.06); }
}
@keyframes glass-drift {
  from { transform: translate(-1%, -1%) rotate(-1deg); }
  to { transform: translate(1.5%, 1%) rotate(1deg); }
}
@keyframes glass-counter-drift {
  from { transform: translate(-18px, 8px); }
  to { transform: translate(22px, -16px); }
}
@media (max-width: 640px) {
  .atmosphere-glass { opacity: .7; }
  .atmosphere-light { opacity: .65; }
  .ribbon-three { display: none; }
  .atmosphere-stars span:nth-child(even) { display: none; }
  .atmosphere-ribbon { opacity: .5; height: 140px; }
}
@media (prefers-reduced-motion: reduce) {
  .atmosphere-light, .atmosphere-glass, .glass-left, .glass-lower, .atmosphere-stars span, .atmosphere-ribbon { animation: none; }
  .atmosphere-stars span { opacity: .45; }
}
@media (prefers-contrast: more), (forced-colors: active) {
  .atmosphere-background { display: none; }
}
</style>
