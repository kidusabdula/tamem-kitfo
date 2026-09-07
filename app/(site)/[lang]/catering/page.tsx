import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChefHat, Coffee, Package } from 'lucide-react'

import { Section, SectionHeading } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { PageHero } from '@/components/site/page-hero'
import { CateringForm } from '@/components/site/forms/catering-form'
import { getContentOverrides, getSettings } from '@/lib/data/queries'
import { makeCopy } from '@/lib/content/editable'
import { cateringPhoto } from '@/lib/data/images'
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
    title: dict.catering.title,
    description: dict.catering.heroBody,
    alternates: {
      canonical: `/${lang}/catering`,
      languages: { en: '/en/catering', am: '/am/catering' },
    },
  }
}

export default async function CateringPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const [settings, overrides] = await Promise.all([getSettings(), getContentOverrides()])
  const copy = makeCopy(overrides, dict, locale)

  const features = [
    { icon: ChefHat, ...dict.catering.features.live },
    { icon: Package, ...dict.catering.features.ware },
    { icon: Coffee, ...dict.catering.features.coffee },
  ]

  const { steps } = dict.catering.process
  const process = [steps.ask, steps.menu, steps.setup, steps.serve]

  const { items } = dict.catering.occasions
  // Same five occasions the enquiry form offers, in the same order. A visitor
  // reads them here and then meets them again as radio options below, which is
  // the point — the page answers "do they do my kind of event?" before asking.
  const occasions = [
    items.wedding,
    items.mahiber,
    items.corporate,
    items.birthday,
    items.memorial,
  ]

  return (
    <main id="main">
      <PageHero
        image={cateringPhoto}
        eyebrow={dict.catering.eyebrow}
        title={dict.catering.title}
        body={copy('catering.heroBody')}
      />

      <Section tone="canvas">
        <div className="container-page">
          <ul className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, body }, index) => (
              <li key={title}>
                <Reveal
                  index={index}
                  className="flex h-full flex-col gap-4 rounded-[var(--radius-card)] bg-surface p-7 shadow-[var(--shadow-card)]"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-ember-100 text-accent-ink">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h2 className="font-display text-xl font-semibold text-brown-900">{title}</h2>
                  <p className="text-[0.9375rem] leading-relaxed text-ink-muted">{body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/*
        An <ol>, not a <ul>: the steps are a sequence, and a screen reader
        should announce them as one. The visible numerals are decorative
        duplicates of that, so they carry aria-hidden.
      */}
      <Section tone="surface">
        <div className="container-page">
          <SectionHeading
            eyebrow={dict.catering.process.eyebrow}
            title={dict.catering.process.title}
            body={dict.catering.process.body}
          />
          <ol className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {process.map(({ title, body }, index) => (
              <li key={title}>
                <Reveal index={index} className="flex h-full flex-col gap-4">
                  <span
                    aria-hidden="true"
                    className="grid size-10 place-items-center rounded-full bg-brown-900 font-display text-sm font-semibold text-cream-50 tabular-nums"
                  >
                    {index + 1}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-brown-900">{title}</h3>
                  <p className="text-[0.9375rem] leading-relaxed text-ink-muted">{body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/*
        Rows rather than a third card grid. The page already spends cards on
        the features; repeating the shape twice more would read as a template
        filling itself in rather than a page someone wrote.
      */}
      <Section tone="canvas">
        <div className="container-page">
          <SectionHeading
            eyebrow={dict.catering.occasions.eyebrow}
            title={dict.catering.occasions.title}
            body={dict.catering.occasions.body}
          />
          <ul className="mt-12 border-y border-brown-200/60">
            {occasions.map(({ title, body }, index) => (
              <li key={title} className="border-b border-brown-200/60 last:border-b-0">
                <Reveal
                  index={index}
                  className="grid gap-2 py-7 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-10"
                >
                  <h3 className="font-display text-xl font-semibold text-brown-900">{title}</h3>
                  <p className="text-[0.9375rem] leading-relaxed text-ink-muted">{body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="sunk">
        <div className="container-page max-w-3xl">
          <CateringForm
            locale={locale}
            dict={dict}
            whatsappNumber={settings.whatsapp_number ?? settings.phones[0] ?? null}
          />
        </div>
      </Section>
    </main>
  )
}
