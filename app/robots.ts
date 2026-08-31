import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tamemkitfo.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The CMS, the API and anything carrying an order code. The order pages
      // also send `noindex` themselves — robots.txt is a request, not a
      // guarantee, and an order receipt must not be indexed either way.
      disallow: ['/admin', '/api', '/en/order', '/am/order'],
    },
    sitemap: `${SITE}/sitemap.xml`,
  }
}
