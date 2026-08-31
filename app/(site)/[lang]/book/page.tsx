import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Section } from '@/components/ui/section'
import { PlainHero } from '@/components/site/page-hero'
import { BookingForm } from '@/components/site/forms/booking-form'
import { getSettings } from '@/lib/data/queries'
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
    title: dict.book.title,
    description: dict.book.intro,
    alternates: { canonical: `/${lang}/book`, languages: { en: '/en/book', am: '/am/book' } },
  }
}

export default async function BookPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const settings = await getSettings()

  return (
    <main id="main">
      <PlainHero eyebrow={dict.book.eyebrow} title={dict.book.title} body={dict.book.intro} />
      <Section tone="canvas" className="pt-12">
        <div className="container-page max-w-2xl">
          <BookingForm
            locale={locale}
            dict={dict}
            whatsappNumber={settings.whatsapp_number ?? settings.phones[0] ?? null}
          />
        </div>
      </Section>
    </main>
  )
}
