import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse, compileStyle } from 'vue/compiler-sfc'

describe('landing dark theme CSS scope', () => {
  it('compiles dark styles onto their intended elements rather than the HTML root', () => {
    const file = resolve(dirname(fileURLToPath(import.meta.url)), '../GanglLanding.vue')
    const { descriptor } = parse(readFileSync(file, 'utf8'))
    const result = compileStyle({ source: descriptor.styles[0].content, filename: file, id: 'data-v-theme', scoped: true })
    expect(result.errors).toEqual([])
    expect(result.code).not.toMatch(/(?:^|\n)\.dark\s*\{/)
    expect(result.code).toContain('.dark .gangl-landing[data-v-theme]')
    expect(result.code).toContain('.dark .landing-primary[data-v-theme]')
  })
})
