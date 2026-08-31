import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { Section } from '@/components/ui/section'
import { DiamondRule } from '@/components/ui/tibeb'
import { PlainHero } from '@/components/site/page-hero'
import { OpenStatus } from '@/components/site/open-status'
import { ContactForm } from '@/components/site/forms/contact-form'
import { getSettings } from '@/lib/data/queries'
import { getDictionary, isLocale, pick, type Locale } from '@/lib/i18n/config'
import { DAY_LABELS, summariseHours, type DayKey } from '@/lib/hours'

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
    title: dict.contact.title,
    alternates: {
      canonical: `/${lang}/contact`,
      languages: { en: '/en/contact', am: '/am/contact' },
    },
  }
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const settings = await getSettings()
  const groups = summariseHours(settings.hours)

  return (
    <main id="main">
      <PlainHero eyebrow={dict.contact.eyebrow} title={dict.contact.title} />

      <Section tone="canvas" className="pt-12">
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-brown-900">
              {dict.contact.getInTouch}
            </h2>
            <DiamondRule className="mt-4" />

            <dl className="mt-7 space-y-6">
              <InfoRow icon={MapPin} label={dict.contact.address}>
                {pick(settings, 'address', locale)}
              </InfoRow>

              {settings.phones.length > 0 ? (
                <InfoRow icon={Phone} label={dict.contact.phone}>
                  <div className="flex flex-col gap-1">
                    {settings.phones.map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone}`}
                        className="transition-colors hover:text-accent-ink"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </InfoRow>
              ) : null}

              {settings.email ? (
                <InfoRow icon={Mail} label={dict.contact.email}>
                  <a
                    href={`mailto:${settings.email}`}
                    className="transition-colors hover:text-accent-ink"
                  >
                    {settings.email}
                  </a>
                </InfoRow>
              ) : null}

              <InfoRow icon={Clock} label={dict.contact.hours}>
                <div className="space-y-1">
                  {groups.map((group) => (
                    <p key={group.days.join()}>
                      {group.days.length === 7
                        ? dict.contact.everyDay
                        : `${DAY_LABELS[locale][group.days[0] as DayKey]}–${
                            DAY_LABELS[locale][group.days.at(-1) as DayKey]
                          }`}{' '}
                      <span className="tabular-nums">
                        {group.open} – {group.close}
                      </span>
                    </p>
                  ))}
                  <OpenStatus
                    hours={settings.hours}
                    labels={{ open: dict.contact.openNow, closed: dict.contact.closedNow }}
                    className="pt-1"
                  />
                </div>
              </InfoRow>
            </dl>

            {settings.map_url ? (
              <Button asChild variant="outline" className="mt-8">
                <a href={settings.map_url} target="_blank" rel="noreferrer noopener">
                  {dict.contact.mapCta}
                </a>
              </Button>
            ) : null}
          </Reveal>

          <Reveal index={1}>
            <ContactForm
              locale={locale}
              dict={dict}
              whatsappNumber={settings.whatsapp_number ?? settings.phones[0] ?? null}
            />
          </Reveal>
        </div>
      </Section>
    </main>
  )
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-ember-100 text-accent-ink">
        <Icon className="size-4" />
      </span>
      <div>
        <dt className="text-xs font-semibold tracking-[0.14em] text-ink-subtle uppercase">
          {label}
        </dt>
        <dd className="mt-1 text-[0.9375rem] leading-relaxed text-brown-800">{children}</dd>
      </div>
    </div>
  )
}
