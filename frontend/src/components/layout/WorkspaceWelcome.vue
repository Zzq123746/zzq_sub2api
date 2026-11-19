<template>
  <section class="workspace-welcome">
    <div class="workspace-welcome-copy">
      <p class="experience-kicker"><span></span>{{ t('experience.overview') }}</p>
      <h2>{{ admin ? t('experience.welcomeAdmin') : t('experience.welcome', { name: displayName }) }}</h2>
      <p>{{ admin ? t('experience.welcomeAdminDescription') : t('experience.welcomeDescription') }}</p>
    </div>
    <button class="workspace-welcome-action" aria-haspopup="dialog" @click="open"><Icon name="search" size="sm" />{{ t('experience.quickAccess') }}<kbd>⌘ / Ctrl K</kbd></button>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores'
import { useQuickNavigation } from '@/composables/useQuickNavigation'
import Icon from '@/components/icons/Icon.vue'
defineProps<{ admin?: boolean }>()
const { t } = useI18n()
const authStore = useAuthStore()
const { open } = useQuickNavigation()
const displayName = computed(() => authStore.user?.username || authStore.user?.email?.split('@')[0] || t('experience.welcomeFallback'))
</script>
