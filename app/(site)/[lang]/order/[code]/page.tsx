import { permanentRedirect } from 'next/navigation'
import { notFound } from 'next/navigation'

import { routes } from '@/lib/routes'
import { isLocale, type Locale } from '@/lib/i18n/config'

/**
 * Superseded by /[lang]/status/[code], which handles catering enquiries and
 * table bookings as well as orders.
 *
 * Kept as a redirect rather than deleted: this URL is printed on success
 * panels customers have already screenshotted, and staff have read these codes
 * out over the phone. Breaking it would strand exactly the people who kept
 * their order code carefully.
 */
export default async function LegacyOrderStatusPage({
  params,
}: {
  params: Promise<{ lang: string; code: string }>
}) {
  const { lang, code } = await params
  if (!isLocale(lang)) notFound()
  permanentRedirect(routes.requestStatus(lang as Locale, encodeURIComponent(code)))
}
