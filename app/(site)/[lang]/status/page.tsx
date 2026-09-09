import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Section, SectionHeading } from '@/components/ui/section'
import { PlainHero } from '@/components/site/page-hero'
import { MyRequests } from '@/components/site/my-requests'
import { RequestLookup } from '@/components/site/request-lookup'
import { getDictionary, isLocale, type Locale } from '@/lib/i18n/config'

export const metadata: Metadata = {
  // Someone else's order history has no business in a search result.
  robots: { index: false, follow: false },
}

export default async function RequestsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const dict = getDictionary(locale)

  return (
    <main id="main">
      <PlainHero eyebrow={dict.requests.eyebrow} title={dict.requests.title} />

      <Section tone="canvas" className="pt-12">
        <div className="container-page max-w-2xl">
          <p className="text-[0.9375rem] leading-relaxed text-ink-muted">{dict.requests.intro}</p>
          <div className="mt-8">
            <MyRequests locale={locale} dict={dict} />
          </div>
        </div>
      </Section>

      {/*
        The manual form is not a fallback for a bug — it is the path for a
        customer who ordered on their partner's phone, or cleared their browser.
        The history above is a convenience; the code and phone are the truth.
      */}
      <Section tone="sunk">
        <div className="container-page max-w-2xl">
          <SectionHeading
            align="start"
            title={dict.requests.lookupTitle}
            body={dict.requests.lookupHint}
          />
          <div className="mt-8">
            <RequestLookup locale={locale} dict={dict} />
          </div>
        </div>
      </Section>
    </main>
  )
}
