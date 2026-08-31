import type { MetadataRoute } from 'next'
import { locales } from '@/lib/i18n/config'
import { routes } from '@/lib/routes'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tamemkitfo.com'

/**
 * Both languages, with `alternates.languages` on every entry so search engines
 * treat /en/menu and /am/menu as one page in two languages rather than
 * duplicate content.
 *
 * /order and /order/[code] are excluded deliberately: a cart and an order
 * receipt are not pages anyone should arrive at from a search result.
 */
const PAGES = ['home', 'menu', 'catering', 'events', 'gallery', 'contact', 'book'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    PAGES.map((page) => ({
      url: `${SITE}${routes[page](locale)}`,
      changeFrequency: page === 'menu' ? ('weekly' as const) : ('monthly' as const),
      priority: page === 'home' ? 1 : page === 'menu' ? 0.9 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((alternate) => [alternate, `${SITE}${routes[page](alternate)}`]),
        ),
      },
    })),
  )
}
