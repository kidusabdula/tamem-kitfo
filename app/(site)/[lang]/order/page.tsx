import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Phone } from 'lucide-react'

import { Section } from '@/components/ui/section'
import { PlainHero } from '@/components/site/page-hero'
import { OrderFlow } from '@/components/site/order-flow'
import { getSettings } from '@/lib/data/queries'
import { getDictionary, isLocale, pick, type Locale } from '@/lib/i18n/config'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)
  // A checkout page has no business in search results.
  return { title: dict.order.title, robots: { index: false, follow: false } }
}

export default async function OrderPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const settings = await getSettings()

  return (
    <main id="main">
      <PlainHero eyebrow={dict.order.eyebrow} title={dict.order.title} />

      <Section tone="canvas" className="pt-12">
        <div className="container-page">
          {!settings.is_accepting_orders ? (
            <div className="mx-auto mb-10 max-w-2xl rounded-[var(--radius-card)] border border-brown-200 bg-surface p-6 text-center">
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

          <OrderFlow
            locale={locale}
            dict={dict}
            acceptingOrders={settings.is_accepting_orders}
            whatsappNumber={settings.whatsapp_number ?? settings.phones[0] ?? null}
            deliveryNote={pick(settings, 'delivery_note', locale) || null}
          />
        </div>
      </Section>
    </main>
  )
}
