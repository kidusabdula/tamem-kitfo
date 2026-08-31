import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Phone } from 'lucide-react'

import { Section } from '@/components/ui/section'
import { PageHero } from '@/components/site/page-hero'
import { MenuBrowser } from '@/components/site/menu-browser'
import { getCategories, getContentOverrides, getDishes, getSettings } from '@/lib/data/queries'
import { makeCopy } from '@/lib/content/editable'
import { photos } from '@/lib/data/images'
import { getDictionary, isLocale, type Locale } from '@/lib/i18n/config'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)
  return {
    title: dict.menu.title,
    description: dict.menu.intro,
    alternates: { canonical: `/${lang}/menu`, languages: { en: '/en/menu', am: '/am/menu' } },
  }
}

export default async function MenuPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const dict = getDictionary(locale)

  const [dishes, categories, settings, overrides] = await Promise.all([
    getDishes(),
    getCategories(),
    getSettings(),
    getContentOverrides(),
  ])
  const copy = makeCopy(overrides, dict, locale)

  return (
    <main id="main">
      <PageHero
        image={photos['kitfo-2']}
        eyebrow={dict.menu.eyebrow}
        title={dict.menu.title}
        body={copy('menu.intro')}
      />

      <Section tone="canvas">
        <div className="container-page">
          {/*
            The kill switch. When the owners pause online ordering from the
            CMS the menu still reads perfectly — only the Add buttons go away,
            replaced by the phone number. A restaurant that cannot take a web
            order can always take a call.
          */}
          {!settings.is_accepting_orders ? (
            <div className="mx-auto mb-12 max-w-2xl rounded-[var(--radius-card)] border border-brown-200 bg-surface p-6 text-center">
              <h2 className="font-display text-lg font-semibold text-brown-900">
                {dict.menu.ordersClosedTitle}
              </h2>
              <p className="mt-2 text-[0.9375rem] text-ink-muted">{dict.menu.ordersClosedBody}</p>
              {settings.phones[0] ? (
                <a
                  href={`tel:${settings.phones[0]}`}
                  className="mt-4 inline-flex items-center gap-2 font-semibold text-accent-ink"
                >
                  <Phone className="size-4" /> {settings.phones[0]}
                </a>
              ) : null}
            </div>
          ) : null}

          <MenuBrowser
            dishes={dishes}
            categories={categories}
            locale={locale}
            dict={dict}
            canOrder={settings.is_accepting_orders}
          />
        </div>
      </Section>
    </main>
  )
}
