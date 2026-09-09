import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Section } from '@/components/ui/section'
import { PlainHero } from '@/components/site/page-hero'
import { RequestLookup } from '@/components/site/request-lookup'
import { routes } from '@/lib/routes'
import { getDictionary, isLocale, type Locale } from '@/lib/i18n/config'

export const metadata: Metadata = {
  // The URL carries a live code. This one especially must not be indexed.
  robots: { index: false, follow: false },
}

export default async function RequestStatusPage({
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
      <PlainHero eyebrow={dict.requests.eyebrow} title={dict.requests.title} />

      <Section tone="canvas" className="pt-12">
        <div className="container-page max-w-lg">
          {/*
            RequestLookup fills the phone from this device's history and looks
            the code up on its own. A customer arriving from the success panel
            or their history sees live status without typing anything; anyone
            else gets the form, because the server still wants both halves.
          */}
          <RequestLookup
            initialCode={decodeURIComponent(code).toUpperCase()}
            locale={locale}
            dict={dict}
          />

          <Link
            href={routes.requests(locale)}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-ink"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {dict.requests.title}
          </Link>
        </div>
      </Section>
    </main>
  )
}
