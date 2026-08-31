import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { Section, SectionHeading } from '@/components/ui/section'
import { PageHero } from '@/components/site/page-hero'
import { getContentOverrides, getSettings } from '@/lib/data/queries'
import { makeCopy } from '@/lib/content/editable'
import { diningPhoto, eventsPhoto, terracePhoto } from '@/lib/data/images'
import { getDictionary, isLocale, type Locale } from '@/lib/i18n/config'
import { routes } from '@/lib/routes'

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
    title: dict.events.title,
    description: dict.events.heroBody,
    alternates: {
      canonical: `/${lang}/events`,
      languages: { en: '/en/events', am: '/am/events' },
    },
  }
}

export default async function EventsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const [settings, overrides] = await Promise.all([getSettings(), getContentOverrides()])
  const copy = makeCopy(overrides, dict, locale)

  const spaces = [
    { image: eventsPhoto, ...dict.events.spaces.hall },
    { image: diningPhoto, ...dict.events.spaces.mesob },
    { image: terracePhoto, ...dict.events.spaces.terrace },
  ]

  return (
    <main id="main">
      <PageHero
        image={eventsPhoto}
        eyebrow={dict.events.eyebrow}
        title={dict.events.title}
        body={copy('events.heroBody')}
      />

      <Section tone="canvas">
        <div className="container-page">
          <ul className="grid gap-8 md:grid-cols-3">
            {spaces.map(({ image, title, body }, index) => (
              <li key={title}>
                <Reveal index={index} className="flex h-full flex-col">
                  <div className="relative aspect-4/3 overflow-hidden rounded-[var(--radius-card)]">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      sizes="(min-width: 768px) 33vw, 90vw"
                      placeholder="blur"
                      className="object-cover"
                    />
                  </div>
                  <h2 className="mt-5 font-display text-xl font-semibold text-brown-900">{title}</h2>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">{body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/*
        Events funnel into the catering enquiry rather than a separate form.
        Two near-identical forms would double the maintenance and split the
        owners' inbox for no benefit — the catering form already asks the date,
        the guest count and the occasion.
      */}
      <Section tone="espresso">
        <div className="container-page flex flex-col items-center text-center">
          <SectionHeading
            eyebrow={dict.events.eyebrow}
            title={dict.events.ctaTitle}
            body={dict.events.ctaBody}
            tone="light"
          />
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={routes.catering(locale)}>
                {dict.actions.inquire} <ArrowRight className="size-4" />
              </Link>
            </Button>
            {settings.phones[0] ? (
              <Button asChild size="lg" variant="onPhoto">
                <a href={`tel:${settings.phones[0]}`}>
                  {dict.actions.callUs} · {settings.phones[0]}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </Section>
    </main>
  )
}
