export const DEFAULT_SITE_NAME = 'GanglAPI'

/** Preserve custom site names while displaying the new brand for legacy defaults. */
export function resolveSiteName(value?: string | null): string {
  const name = value?.trim()
  return !name || name.toLowerCase() === 'sub2api' ? DEFAULT_SITE_NAME : name
}
