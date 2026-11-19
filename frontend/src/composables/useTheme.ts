import { readonly, ref } from 'vue'

type Theme = 'light' | 'dark'
const isDark = ref(false)
let preference: Theme | null = null
let stopSync: (() => void) | undefined
let transitionTimer: ReturnType<typeof setTimeout> | undefined

function readPreference(): Theme | null {
  try {
    const value = localStorage.getItem('theme')
    return value === 'light' || value === 'dark' ? value : null
  } catch { return null }
}

function applyTheme(dark: boolean) {
  isDark.value = dark
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

/** One theme owner for the entire app; route mounts never reapply stale preferences. */
export function initializeTheme(): () => void {
  if (stopSync) return stopSync
  if (typeof window === 'undefined') return () => undefined
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
  preference = readPreference()
  const sync = () => applyTheme(preference ? preference === 'dark' : systemTheme.matches)
  sync()
  const onSystemChange = () => { if (!preference) sync() }
  const onStorage = (event: StorageEvent) => {
    if (event.key !== 'theme' && event.key !== null) return
    preference = readPreference()
    sync()
  }
  systemTheme.addEventListener?.('change', onSystemChange)
  window.addEventListener('storage', onStorage)
  stopSync = () => {
    systemTheme.removeEventListener?.('change', onSystemChange)
    window.removeEventListener('storage', onStorage)
    clearTimeout(transitionTimer)
    document.documentElement.classList.remove('theme-switching')
    stopSync = undefined
  }
  return stopSync
}

function setTheme(theme: Theme) {
  initializeTheme()
  preference = theme
  try { localStorage.setItem('theme', theme) } catch { /* Keep in-memory choice when storage is unavailable. */ }
  clearTimeout(transitionTimer)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('theme-switching')
    transitionTimer = setTimeout(() => document.documentElement.classList.remove('theme-switching'), 500)
  }
  applyTheme(theme === 'dark')
}

export function useTheme() {
  initializeTheme()
  return { isDark: readonly(isDark), setTheme, toggleTheme: () => setTheme(isDark.value ? 'light' : 'dark') }
}

if (import.meta.hot) import.meta.hot.dispose(() => stopSync?.())
