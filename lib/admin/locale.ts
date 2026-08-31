import 'server-only'
import { cookies } from 'next/headers'
import { defaultLocale, getDictionary, isLocale, type Locale } from '@/lib/i18n/config'

/**
 * The public site puts the locale in the URL because search engines need to
 * see two distinct pages. The CMS has no such requirement — it is one private
 * app used by a handful of people — so the staff member's language lives in a
 * cookie instead.
 *
 * Read on the server, before render, so switching to Amharic never flashes
 * English first.
 */
export const STAFF_LOCALE_COOKIE = 'tk_admin_lang'

export async function getStaffLocale(): Promise<Locale> {
  const value = (await cookies()).get(STAFF_LOCALE_COOKIE)?.value
  return value && isLocale(value) ? value : defaultLocale
}

export async function getStaffDictionary() {
  const locale = await getStaffLocale()
  return { locale, dict: getDictionary(locale) }
}
