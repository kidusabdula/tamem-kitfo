import { en } from './dictionaries/en'
import { am } from './dictionaries/am'
import type { Dictionary } from './dictionaries/en'

export const locales = ['en', 'am'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export type { Dictionary }

const dictionaries: Record<Locale, Dictionary> = { en, am }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale]
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** The `lang` attribute and BCP-47 tag for each locale. */
export const htmlLang: Record<Locale, string> = { en: 'en', am: 'am-ET' }

/**
 * Rows in Supabase carry parallel `_en` / `_am` columns. `pick` reads the
 * right one and falls back to English when the Amharic field is still empty,
 * which it will be until the owners finish translating. A half-translated
 * menu should degrade to English, never to a blank line.
 */
type Localized<K extends string> = {
  [P in `${K}_en` | `${K}_am`]: string | null
}

export function pick<K extends string>(
  row: Localized<K>,
  field: K,
  locale: Locale,
): string {
  const localized = row[`${field}_${locale}` as keyof Localized<K>]
  if (typeof localized === 'string' && localized.trim().length > 0) return localized
  const fallback = row[`${field}_en` as keyof Localized<K>]
  return typeof fallback === 'string' ? fallback : ''
}
