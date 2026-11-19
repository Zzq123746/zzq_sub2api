<template>
  <Teleport to="body">
    <dialog ref="dialog" class="quick-navigation" :aria-label="t('experience.navigation')" @cancel.prevent="close" @close="close" @click.self="onBackdropClick">
      <div class="quick-navigation-search">
        <Icon name="search" size="md" aria-hidden="true" />
        <input ref="searchInput" v-model="query" autofocus type="search" autocomplete="off" :placeholder="t('experience.searchHint')" :aria-label="t('experience.search')" role="combobox" aria-autocomplete="list" aria-controls="quick-navigation-results" :aria-expanded="isOpen" :aria-activedescendant="matches.length ? `quick-result-${activeIndex}` : undefined" @keydown="onSearchKeydown" />
        <button class="quick-navigation-escape" :aria-label="t('experience.close')" @click="close">Esc</button>
      </div>
      <div class="quick-navigation-meta"><span>{{ t('experience.navigation') }}</span><span aria-live="polite">{{ t('experience.resultCount', { count: matches.length }) }}</span></div>
      <ul id="quick-navigation-results" ref="resultsList" role="listbox" :aria-label="t('experience.navigation')" class="quick-navigation-results">
        <li v-for="(item, index) in matches" :id="`quick-result-${index}`" :key="item.path" role="option" :aria-selected="index === activeIndex" :class="{ active: index === activeIndex }" @mousemove="activeIndex = index" @mousedown.prevent @click="navigate(item)">
          <span class="quick-navigation-result-icon"><Icon name="grid" size="sm" /></span>
          <span class="quick-navigation-result-copy"><strong>{{ item.label }}</strong><small>{{ item.group }}</small></span>
          <span v-if="item.path === route.path" class="quick-navigation-current">{{ t('experience.currentPage') }}</span>
          <Icon v-else name="arrowRight" size="sm" />
        </li>
      </ul>
      <div v-if="!matches.length" class="quick-navigation-empty"><Icon name="search" size="lg" /><strong>{{ t('experience.noResults') }}</strong><p>{{ t('experience.noResultsHint') }}</p></div>
      <footer><span><kbd>↑</kbd><kbd>↓</kbd>{{ t('experience.navigate') }}</span><span><kbd>↵</kbd>{{ t('experience.open') }}</span><span><kbd>Esc</kbd>{{ t('experience.close') }}</span></footer>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { useQuickNavigation, type QuickNavigationItem } from '@/composables/useQuickNavigation'
const props = defineProps<{ items: QuickNavigationItem[] }>()
const emit = defineEmits<{ (e: 'navigate', path: string): void }>()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { isOpen, close } = useQuickNavigation()
const dialog = ref<HTMLDialogElement>()
const searchInput = ref<HTMLInputElement>()
const resultsList = ref<HTMLElement>()
const query = ref('')
const activeIndex = ref(0)
let previousOverflow: string | undefined
const matches = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()
  const unique = props.items.filter((item, index, items) => items.findIndex(other => other.path === item.path) === index)
  return unique.filter(item => `${item.label} ${item.group} ${item.path}`.toLocaleLowerCase().includes(search))
})
watch(matches, () => { activeIndex.value = 0 })
function restoreScroll() {
  if (previousOverflow !== undefined) {
    document.documentElement.style.overflow = previousOverflow
    previousOverflow = undefined
  }
}
watch(isOpen, async (open) => {
  if (open) {
    query.value = ''
    activeIndex.value = 0
    await nextTick()
    if (!isOpen.value || !dialog.value) return
    if (!dialog.value.open) dialog.value.showModal()
    if (previousOverflow === undefined) previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    searchInput.value?.focus()
  } else {
    dialog.value?.close()
    restoreScroll()
  }
}, { immediate: true })
function onBackdropClick(event: MouseEvent) {
  const rect = dialog.value?.getBoundingClientRect()
  if (rect && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) close()
}
function navigate(item: QuickNavigationItem) {
  close()
  emit('navigate', item.path)
  void router.push(item.path)
}
async function onSearchKeydown(event: KeyboardEvent) {
  if (event.isComposing) return
  if (event.key === 'Enter') {
    event.preventDefault()
    if (matches.value[activeIndex.value]) navigate(matches.value[activeIndex.value])
    return
  }
  if (!['ArrowDown', 'ArrowUp'].includes(event.key) || !matches.value.length) return
  event.preventDefault()
  activeIndex.value = (activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1) + matches.value.length) % matches.value.length
  await nextTick()
  resultsList.value?.children[activeIndex.value]?.scrollIntoView?.({ block: 'nearest' })
}
function onShortcut(event: KeyboardEvent) {
  if (event.isComposing || event.repeat || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return
  // Avoid covering an active business dialog or onboarding flow.
  if (!isOpen.value && document.querySelector('[role="dialog"], dialog[open], .driver-popover')) return
  event.preventDefault()
  isOpen.value = !isOpen.value
}
onMounted(() => document.addEventListener('keydown', onShortcut))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onShortcut)
  dialog.value?.close()
  close()
  restoreScroll()
})
</script>
