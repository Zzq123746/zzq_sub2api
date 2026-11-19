import { ref } from 'vue'

const isOpen = ref(false)

export interface QuickNavigationItem {
  path: string
  label: string
  group: string
}

export interface NavigationBranch {
  path: string
  label: string
  expandOnly?: boolean
  children?: NavigationBranch[]
}

// Call only with the already-filtered sidebar menus, so all existing access and feature rules apply.
export function flattenNavigation(items: NavigationBranch[], group: string): QuickNavigationItem[] {
  return items.flatMap(item => [
    ...(!item.expandOnly ? [{ path: item.path, label: item.label, group }] : []),
    ...flattenNavigation(item.children || [], item.label),
  ])
}

export function useQuickNavigation() {
  return {
    isOpen,
    open: () => { isOpen.value = true },
    close: () => { isOpen.value = false },
  }
}
