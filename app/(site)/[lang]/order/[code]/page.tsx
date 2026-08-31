import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Section } from '@/components/ui/section'
import { PlainHero } from '@/components/site/page-hero'
import { OrderLookup } from '@/components/site/order-lookup'
import { getDictionary, isLocale, type Locale } from '@/lib/i18n/config'

export const metadata: Metadata = {
  // Order pages must never be indexed, and the code in the URL means this one
  // especially must not be.
  robots: { index: false, follow: false },
}

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ lang: string; code: string }>
}) {
  const { lang, code } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const dict = getDictionary(locale)

  return (
    <main id="main">
      <PlainHero eyebrow={dict.order.eyebrow} title={dict.order.lookupTitle} />
      <Section tone="canvas" className="pt-12">
        <div className="container-page max-w-lg">
          <OrderLookup
            initialCode={decodeURIComponent(code).toUpperCase()}
            locale={locale}
            dict={dict}
          />
        </div>
      </Section>
    </main>
  )
}
