import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import { initializeTheme, useTheme } from '../useTheme'

let systemTheme: MediaQueryList
beforeEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
  systemTheme = Object.assign(new EventTarget(), { matches: false, media: '(prefers-color-scheme: dark)' }) as MediaQueryList
  vi.spyOn(window, 'matchMedia').mockImplementation(query => query.includes('color-scheme')
    ? systemTheme
    : Object.assign(new EventTarget(), { matches: true, media: query }) as MediaQueryList)
})
afterEach(() => {
  initializeTheme()()
  vi.restoreAllMocks()
  localStorage.clear()
  document.documentElement.className = ''
  delete document.documentElement.dataset.theme
})

describe('shared theme across routes', () => {
  it('honors an explicitly saved light theme even when the operating system is dark', () => {
    Object.assign(systemTheme, { matches: true })
    localStorage.setItem('theme', 'light')
    const theme = useTheme()
    expect(theme.isDark.value).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('keeps a toggled theme for new page consumers and refreshes reactive chart colors', () => {
    const home = useTheme()
    const chartColor = computed(() => home.isDark.value ? 'white' : 'black')
    home.toggleTheme()
    const login = useTheme()
    expect(login.isDark.value).toBe(true)
    expect(chartColor.value).toBe('white')
    expect(localStorage.getItem('theme')).toBe('dark')
    login.toggleTheme()
    const dashboard = useTheme()
    expect(home.isDark.value).toBe(false)
    expect(dashboard.isDark.value).toBe(false)
    expect(chartColor.value).toBe('black')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('restores the chosen theme after the application starts again', () => {
    useTheme().setTheme('dark')
    initializeTheme()()
    document.documentElement.classList.remove('dark')
    initializeTheme()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(useTheme().isDark.value).toBe(true)
  })

  it('follows system changes only until a manual choice is made', () => {
    const theme = useTheme()
    Object.assign(systemTheme, { matches: true })
    systemTheme.dispatchEvent(new Event('change'))
    expect(theme.isDark.value).toBe(true)
    theme.setTheme('light')
    systemTheme.dispatchEvent(new Event('change'))
    expect(theme.isDark.value).toBe(false)
  })

  it('syncs other tabs and returns to system mode when the preference is removed', () => {
    const theme = useTheme()
    localStorage.setItem('theme', 'dark')
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: 'dark' }))
    expect(theme.isDark.value).toBe(true)
    localStorage.removeItem('theme')
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: null }))
    expect(theme.isDark.value).toBe(false)
  })

  it('keeps an in-memory choice across pages when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    useTheme().toggleTheme()
    expect(useTheme().isDark.value).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
