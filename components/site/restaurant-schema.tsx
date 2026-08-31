import { DAY_LABELS } from '@/lib/hours'
import { pick, type Locale } from '@/lib/i18n/config'
import type { Dish, SiteSettings } from '@/lib/supabase/database.types'
import { formatETB } from '@/lib/utils'

/**
 * Structured data for the homepage.
 *
 * This is what puts opening hours, the phone number and the price range into
 * a Google local result — for a restaurant that is a more valuable surface
 * than the site itself, because most people search the name and never click
 * through.
 *
 * Everything here is generated from the same settings row the page renders, so
 * the markup cannot drift from what a visitor sees. Google penalises exactly
 * that kind of mismatch.
 */

const SCHEMA_DAY: Record<keyof typeof DAY_LABELS.en, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

export function RestaurantSchema({
  locale,
  settings,
  dishes,
  siteUrl,
}: {
  locale: Locale
  settings: SiteSettings
  dishes: Dish[]
  siteUrl: string
}) {
  const prices = dishes.map((dish) => Number(dish.price_etb)).filter((price) => price > 0)

  const openingHours = Object.entries(settings.hours)
    .filter((entry): entry is [string, [string, string]] => Array.isArray(entry[1]))
    .map(([day, [opens, closes]]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: SCHEMA_DAY[day as keyof typeof SCHEMA_DAY],
      opens,
      closes,
    }))

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Tamem Kitfo',
    alternateName: 'ተመም ክትፎ',
    description:
      locale === 'am'
        ? 'በቦሌ የሚገኘው ታዋቂው የጉራጌ ክትፎ ቤት።'
        : 'The famous Gurage kitfo house in Bole, Addis Ababa.',
    servesCuisine: ['Ethiopian', 'Gurage'],
    url: siteUrl,
    telephone: settings.phones[0],
    email: settings.email ?? undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: pick(settings, 'address', locale),
      addressLocality: 'Addis Ababa',
      addressRegion: 'Addis Ababa',
      addressCountry: 'ET',
    },
    hasMap: settings.map_url ?? undefined,
    openingHoursSpecification: openingHours.length > 0 ? openingHours : undefined,
    // priceRange is a plain string in schema.org, not a number.
    priceRange:
      prices.length > 0
        ? `${formatETB(Math.min(...prices), 'en')}–${formatETB(Math.max(...prices), 'en')}`
        : undefined,
    acceptsReservations: `${siteUrl}/${locale}/book`,
    hasMenu: `${siteUrl}/${locale}/menu`,
  }

  return (
    <script
      type="application/ld+json"
      // The object is built entirely from our own data — no user input reaches
      // it — and JSON.stringify escapes the rest.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
