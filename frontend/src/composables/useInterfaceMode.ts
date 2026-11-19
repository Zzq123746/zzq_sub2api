import { computed } from 'vue'
import { useRoute } from 'vue-router'

/** Separate the interface by page, so an administrator can still visit user-facing pages. */
export function useInterfaceMode() {
  const route = useRoute()
  const isAdminInterface = computed(() => route.meta?.requiresAdmin === true || /^\/admin(?:\/|$)/.test(route.path))
  return { isAdminInterface }
}
