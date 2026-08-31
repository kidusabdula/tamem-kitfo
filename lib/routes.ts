import type { Locale } from '@/lib/i18n/config'

/**
 * Every public URL is locale-prefixed (/en/menu, /am/menu). Building them
 * through this helper rather than by hand means a renamed route breaks in one
 * place instead of thirty, and no link can accidentally drop the locale and
 * bounce the visitor back to English.
 */
export const routes = {
  home: (l: Locale) => `/${l}`,
  menu: (l: Locale) => `/${l}/menu`,
  catering: (l: Locale) => `/${l}/catering`,
  events: (l: Locale) => `/${l}/events`,
  gallery: (l: Locale) => `/${l}/gallery`,
  contact: (l: Locale) => `/${l}/contact`,
  order: (l: Locale) => `/${l}/order`,
  orderStatus: (l: Locale, code: string) => `/${l}/order/${code}`,
  book: (l: Locale) => `/${l}/book`,
} as const

/** Primary navigation, in the order it appears in the header. */
export const navItems = [
  { key: 'menu', href: routes.menu },
  { key: 'catering', href: routes.catering },
  { key: 'events', href: routes.events },
  { key: 'gallery', href: routes.gallery },
  { key: 'contact', href: routes.contact },
] as const

export type NavKey = (typeof navItems)[number]['key']

/**
 * Swaps the locale segment of the current path so the language toggle keeps
 * the visitor on the page they were reading instead of dumping them home.
 */
export function swapLocale(pathname: string, next: Locale): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return `/${next}`
  segments[0] = next
  return `/${segments.join('/')}`
}
