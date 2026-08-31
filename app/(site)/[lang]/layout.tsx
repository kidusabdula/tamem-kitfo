import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import '@/app/globals.css'

import { fontVariables } from '@/lib/fonts'
import { getDictionary, htmlLang, isLocale, locales, pick, type Locale } from '@/lib/i18n/config'
import { getSettings } from '@/lib/data/queries'
import { CartProvider } from '@/lib/cart/context'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export const viewport: Viewport = {
  themeColor: '#3B2318',
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)
  const settings = await getSettings()

  const title = `${dict.brand.name} — ${dict.brand.tagline}`
  const description =
    lang === 'am'
      ? 'በቦሌ የሚገኘው ታዋቂው የጉራጌ ክትፎ ቤት። ክትፎ፣ ቡላ ገንፎ፣ ዱለትና ባህላዊ የቡና ሥነ-ሥርዓት። ኬተሪንግና የዝግጅት አዳራሽ።'
      : 'The famous Gurage kitfo house in Bole, Addis Ababa. Hand-minced kitfo, bulla genfo, dulet and a full coffee ceremony. Catering and event hall available.'

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tamemkitfo.com'),
    title: { default: title, template: `%s · ${dict.brand.name}` },
    description,
    // hreflang pairs tell search engines these are the same page in two
    // languages rather than duplicate content.
    alternates: {
      canonical: `/${lang}`,
      languages: { en: '/en', am: '/am', 'x-default': '/en' },
    },
    openGraph: {
      type: 'website',
      siteName: dict.brand.name,
      title,
      description,
      locale: lang === 'am' ? 'am_ET' : 'en_ET',
      /*
       * Referenced from /public rather than an `opengraph-image.jpg` file
       * convention: the convention file would have to live inside the [lang]
       * segment, and Next cannot fill a dynamic param into a metadata image
       * URL — it emits "/-/opengraph-image….jpg", which 404s when Telegram or
       * WhatsApp fetches the preview.
       */
      images: [{ url: '/og-cover.jpg', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-cover.jpg'],
    },
    other: { 'geo.region': 'ET-AA', 'geo.placename': pick(settings, 'address', lang) },
  }
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const locale = lang as Locale
  const dict = getDictionary(locale)
  const settings = await getSettings()

  return (
    <html lang={htmlLang[locale]} className={fontVariables}>
      <head>
        {/*
          Runs before first paint. Its only job is to tell CSS that JavaScript
          is alive, which is what licenses the scroll-reveal styles to hide
          content. Without it the page renders fully visible — the correct
          fallback. Kept inline and tiny so it never blocks rendering.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.dataset.js='1'",
          }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only rounded-full bg-accent px-4 py-2 font-medium text-accent-foreground focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100"
        >
          {dict.a11y.skipToContent}
        </a>

        <CartProvider>
          <SiteHeader locale={locale} dict={dict} />
          {children}
          <SiteFooter locale={locale} dict={dict} settings={settings} />
        </CartProvider>
      </body>
    </html>
  )
}
