<template>
  <div class="auth-experience">
    <AtmosphereBackground />
    <aside class="auth-brand-panel">
      <RouterLink to="/" class="auth-brand-link"><img :src="siteLogo || '/logo.svg'" alt="" /><span>{{ siteName }}</span><span class="auth-brand-dot">.</span></RouterLink>
      <div class="auth-brand-copy"><p class="experience-kicker">{{ t('experience.eyebrow') }}</p><h2>{{ t('experience.authTitle') }}</h2><p>{{ t('experience.authDescription') }}</p></div>
      <GatewayOrbit />
      <div class="auth-brand-footer"><span>{{ t('experience.workspace') }}</span><span>{{ t('experience.homeProtocols') }}</span></div>
    </aside>
    <section class="auth-form-panel">
      <div class="auth-topbar"><RouterLink to="/" class="auth-back-link"><Icon name="arrowLeft" size="sm" />{{ t('experience.backHome') }}</RouterLink><div class="auth-theme-controls"><button class="experience-theme-toggle" :aria-label="isDark ? t('home.switchToLight') : t('home.switchToDark')" :aria-pressed="isDark" @click="toggleTheme"><Icon :name="isDark ? 'sun' : 'moon'" size="md" /></button><LocaleSwitcher text-only /></div></div>
      <div class="auth-form-content">
        <div v-if="settingsLoaded" class="auth-form-brand"><img :src="siteLogo || '/logo.svg'" alt="" /><span>{{ siteName }}</span></div>
        <nav v-if="showAccountTabs" class="auth-account-tabs" :aria-label="t('experience.accountAccess')">
          <RouterLink to="/login" :aria-current="route.path === '/login' ? 'page' : undefined">{{ t('auth.signIn') }}</RouterLink>
          <RouterLink to="/register" :aria-current="route.path === '/register' ? 'page' : undefined">{{ t('auth.createAccount') }}</RouterLink>
        </nav>
        <div class="auth-form-card"><slot /></div>
        <div class="mt-6 text-center text-sm"><slot name="footer" /></div>
        <p class="auth-form-copyright">&copy; {{ currentYear }} {{ siteName }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import AtmosphereBackground from '@/components/brand/AtmosphereBackground.vue'
import { useTheme } from '@/composables/useTheme'
import { resolveSiteName } from '@/constants/branding'
import GatewayOrbit from '@/components/brand/GatewayOrbit.vue'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import { useI18n } from 'vue-i18n'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'

const { t } = useI18n()
const { isDark, toggleTheme } = useTheme()
const appStore = useAppStore()
const route = useRoute()
const showAccountTabs = computed(() => !appStore.backendModeEnabled && ['/login', '/register'].includes(route.path))

const siteName = computed(() => resolveSiteName(appStore.siteName))
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const settingsLoaded = computed(() => appStore.publicSettingsLoaded)

const currentYear = computed(() => new Date().getFullYear())

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>
