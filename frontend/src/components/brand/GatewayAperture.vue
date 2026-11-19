<template>
  <div ref="stage" class="gateway-aperture" @pointermove="move" @pointerleave="leave">
    <canvas ref="canvas" aria-hidden="true"></canvas>
    <svg v-if="fallback" viewBox="0 0 620 500" class="aperture-fallback" aria-hidden="true">
      <ellipse cx="320" cy="250" rx="140" ry="180" fill="none" stroke="currentColor" stroke-width="42" />
      <path d="M10 250H610" stroke="currentColor" fill="none" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ dark: boolean; variant: number; pulse: number }>()
const stage = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const fallback = ref(false)
type Point = { x: number; y: number; z: number }
type Face = { points: Point[]; normalLow: Point; normalHigh: Point }
const faces: Face[] = []
const colors = [[97, 154, 255], [172, 131, 232], [71, 180, 194]]
// A small, precomputed mesh: no WebGL dependency, textures or ongoing idle loop.
function vertex(u: number, v: number): Point {
  const radius = 1 + .16 * Math.cos(v)
  return { x: radius * Math.cos(u), y: radius * Math.sin(u), z: .16 * Math.sin(v) }
}
for (let u = 0; u < 112; u++) {
  for (let v = 0; v < 36; v++) {
    const a = u / 112 * Math.PI * 2
    const b = v / 36 * Math.PI * 2
    const da = Math.PI * 2 / 112
    const db = Math.PI * 2 / 36
    faces.push({ points: [vertex(a, b), vertex(a + da, b), vertex(a + da, b + db), vertex(a, b + db)],
      normalLow: { x: Math.cos(a + da / 2) * Math.cos(b), y: Math.sin(a + da / 2) * Math.cos(b), z: Math.sin(b) },
      normalHigh: { x: Math.cos(a + da / 2) * Math.cos(b + db), y: Math.sin(a + da / 2) * Math.cos(b + db), z: Math.sin(b + db) } })
  }
}
let context: CanvasRenderingContext2D | null = null
let frame = 0
let start = 0
let visible = true
let width = 620
let height = 500
let currentX = 0
let currentY = 0
let targetX = 0
let targetY = 0
let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined
let reduced: MediaQueryList | undefined
let fine: MediaQueryList | undefined

function rotate(p: Point, yaw: number, tilt: number): Point {
  const x = p.x * Math.cos(yaw) + p.z * Math.sin(yaw)
  const z = -p.x * Math.sin(yaw) + p.z * Math.cos(yaw)
  return { x: x * Math.cos(tilt) - p.y * Math.sin(tilt), y: x * Math.sin(tilt) + p.y * Math.cos(tilt), z }
}
function draw(time: number) {
  if (!context || !canvas.value) return
  const ctx = context
  const scale = width / 620
  ctx.setTransform(canvas.value.width / width, 0, 0, canvas.value.height / height, 0, 0)
  ctx.clearRect(0, 0, width, height)
  ctx.save()
  ctx.scale(scale, height / 500)
  const rgb = colors[props.variant] ?? colors[0]!
  const accent = rgb.join(',')
  const progress = reduced?.matches ? 1 : Math.min(1, (time - start) / 2000)
  const reveal = 1 - Math.pow(1 - progress, 3)
  const yaw = -.55 + currentX * .2 + props.variant * .12 + (1 - reveal) * .5
  const tilt = -.22 + currentY * .12
  const light = ctx.createRadialGradient(325, 252, 15, 325, 252, 235)
  light.addColorStop(0, `rgba(${accent},${props.dark ? .19 : .1})`)
  light.addColorStop(.65, `rgba(${accent},.04)`)
  light.addColorStop(1, `rgba(${accent},0)`)
  ctx.fillStyle = light
  ctx.fillRect(0, 0, 620, 500)

  // Request traces converge through the aperture, with a single travelling pulse.
  for (let line = -3; line <= 3; line++) {
    ctx.beginPath()
    ctx.moveTo(0, 250 + line * 27)
    ctx.bezierCurveTo(155, 250 + line * 27, 200, 250 + line * 2, 325, 250 + line * 2)
    ctx.bezierCurveTo(435, 250 + line * 2, 470, 250 + line * 22, 620, 250 + line * 22)
    ctx.strokeStyle = `rgba(${accent},${line === 0 ? .8 : .16})`
    ctx.lineWidth = line === 0 ? 1.5 : .65
    ctx.stroke()
  }
  const projected = faces.map(face => {
    const normalLow = rotate(face.normalLow, yaw, tilt)
    const normalHigh = rotate(face.normalHigh, yaw, tilt)
    const points = face.points.map(point => rotate(point, yaw, tilt))
    return { normalLow, normalHigh, points, depth: points.reduce((sum, p) => sum + p.z, 0) / 4 }
  }).sort((a, b) => a.depth - b.depth)
  function metal(n: Point) {
    const diffuse = Math.max(0, -n.x * .35 - n.y * .58 + n.z * .72)
    const specular = Math.pow(Math.max(0, -n.x * .28 - n.y * .45 + n.z * .85), 24)
    const reflection = Math.pow(Math.abs(n.y * .7 + n.z * .6), 9)
    const shade = 28 + diffuse * 145 + specular * 110 + reflection * 72
    return `rgb(${Math.min(255, shade + 9)},${Math.min(255, shade + 16)},${Math.min(255, shade + 29)})`
  }
  for (const face of projected) {
    const points = face.points.map(p => {
      const perspective = 4.8 / (4.8 - p.z)
      return { x: 325 + p.x * 176 * perspective, y: 250 + p.y * 176 * perspective }
    })
    const first = points[0]!
    const last = points[3]!
    // Interpolated light across the tube prevents a faceted/wireframe finish.
    const finish = ctx.createLinearGradient(first.x, first.y, last.x, last.y)
    finish.addColorStop(0, metal(face.normalLow))
    finish.addColorStop(1, metal(face.normalHigh))
    ctx.beginPath()
    points.forEach((p, index) => {
      if (index === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    })
    ctx.closePath()
    ctx.fillStyle = finish
    ctx.fill()
    ctx.strokeStyle = finish
    ctx.lineWidth = .65
    ctx.stroke()
  }
  // Only the front half of the central light crosses the visible surface.
  const beam = ctx.createLinearGradient(325, 0, 620, 0)
  beam.addColorStop(0, `rgba(${accent},0)`)
  beam.addColorStop(.3, `rgba(${accent},.9)`)
  beam.addColorStop(1, `rgba(${accent},0)`)
  ctx.fillStyle = beam
  ctx.fillRect(325, 249.5, 295, 1)
  if (progress < 1 && !reduced?.matches) {
    const x = progress * 650 - 15
    const glow = ctx.createRadialGradient(x, 250, 0, x, 250, 24)
    glow.addColorStop(0, '#ffffff')
    glow.addColorStop(.16, `rgba(${accent},.95)`)
    glow.addColorStop(1, `rgba(${accent},0)`)
    ctx.fillStyle = glow
    ctx.fillRect(x - 24, 226, 48, 48)
  }
  ctx.restore()
}
function tick(time: number) {
  frame = 0
  if (!visible || document.hidden) return
  currentX += (targetX - currentX) * .12
  currentY += (targetY - currentY) * .12
  draw(time)
  if (!reduced?.matches && (time - start < 2000 || Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .002)) schedule()
}
function schedule() {
  if (!frame && context && visible && !document.hidden) frame = requestAnimationFrame(tick)
}
function replay() { start = performance.now(); schedule() }
function resize() {
  if (!stage.value || !canvas.value) return
  const rect = stage.value.getBoundingClientRect()
  width = Math.max(1, rect.width)
  height = Math.max(1, rect.height)
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  canvas.value.width = Math.round(width * dpr)
  canvas.value.height = Math.round(height * dpr)
  schedule()
}
function move(event: PointerEvent) {
  if (reduced?.matches || !fine?.matches || event.pointerType === 'touch' || !stage.value) return
  const rect = stage.value.getBoundingClientRect()
  targetX = (event.clientX - rect.left) / rect.width - .5
  targetY = (event.clientY - rect.top) / rect.height - .5
  schedule()
}
function leave() { targetX = 0; targetY = 0; schedule() }
function preferenceChanged() { currentX = currentY = targetX = targetY = 0; schedule() }
function visibilityChanged() {
  if (document.hidden) { cancelAnimationFrame(frame); frame = 0 }
  else schedule()
}
watch(() => [props.variant, props.pulse], replay)
watch(() => props.dark, schedule)
onMounted(() => {
  context = canvas.value?.getContext('2d') ?? null
  if (!context) { fallback.value = true; return }
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  fine = window.matchMedia('(hover: hover) and (pointer: fine)')
  reduced.addEventListener('change', preferenceChanged)
  document.addEventListener('visibilitychange', visibilityChanged)
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(stage.value!)
  if (typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting)
      if (visible) schedule()
      else { cancelAnimationFrame(frame); frame = 0 }
    })
    intersectionObserver.observe(stage.value!)
  }
  resize()
  replay()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  reduced?.removeEventListener('change', preferenceChanged)
  document.removeEventListener('visibilitychange', visibilityChanged)
})
</script>

<style scoped>
.gateway-aperture { width: 100%; aspect-ratio: 620 / 500; position: relative; }
canvas { display: block; width: 100%; height: 100%; }
.aperture-fallback { position: absolute; inset: 0; width: 100%; height: 100%; color: #a8b9d6; }
</style>
