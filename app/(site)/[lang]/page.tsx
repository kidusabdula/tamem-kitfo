import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ChevronDown, Flame, MapPin, Soup, Sparkles, UtensilsCrossed } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Reveal, KenBurns } from '@/components/ui/reveal'
import { Section, SectionHeading } from '@/components/ui/section'
import { DiamondRule, TibebBand } from '@/components/ui/tibeb'
import { DishCard } from '@/components/site/dish-card'
import { OpenStatus } from '@/components/site/open-status'
import { getDictionary, isLocale, pick, type Locale } from '@/lib/i18n/config'
import { getContentOverrides, getDishes, getGallery, getPopularDishes, getSettings } from '@/lib/data/queries'
import { RestaurantSchema } from '@/components/site/restaurant-schema'
import { makeCopy } from '@/lib/content/editable'
import {
  cateringPhoto,
  diningPhoto,
  eventsPhoto,
  heroPhoto,
  resolveSquareImage,
  storyPhoto,
} from '@/lib/data/images'
import { routes } from '@/lib/routes'

// Next requires segment config to be a static literal, so this cannot be
// imported from lib/data/queries. Keep the two in step: 5 minutes.
export const revalidate = 300

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const dict = getDictionary(locale)

  const [dishes, allDishes, settings, gallery, overrides] = await Promise.all([
    getPopularDishes(3),
    getDishes(),
    getSettings(),
    getGallery(),
    getContentOverrides(),
  ])

  // Owner-edited copy wins over the wording built into the dictionary.
  const copy = makeCopy(overrides, dict, locale)
  const t = dict.home
  const pillars = [
    { icon: UtensilsCrossed, ...t.pillars.kitfo },
    { icon: Soup, ...t.pillars.bulla },
    { icon: Sparkles, ...t.pillars.mesob },
    { icon: Flame, ...t.pillars.catering },
  ]
  const storyPoints = Object.values(t.storyPoints)
  const strip = gallery.slice(0, 6)

  return (
    <main id="main">
      <RestaurantSchema
        locale={locale}
        settings={settings}
        dishes={allDishes}
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tamemkitfo.com'}
      />

      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative flex min-h-dvh items-end overflow-hidden">
        <KenBurns className="absolute inset-0">
          <Image
            src={heroPhoto}
            alt=""
            fill
            priority
            // The one image guaranteed to be the LCP element. Quality is
            // raised because it fills the viewport on every first visit.
            quality={88}
            sizes="100vw"
            className="object-cover object-center"
            placeholder="blur"
          />
        </KenBurns>
        {/* Built for the hero and never wired up in iteration 1 — a faint
            multiply-blend noise keeps large photo areas from banding. */}
        <div className="grain-overlay" aria-hidden="true" />
        <div className="photo-scrim absolute inset-0" />
        <div className="photo-scrim-top absolute inset-x-0 top-0 h-44" />

        <div className="container-page relative w-full pt-32 pb-20 md:pb-28">
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-ember-300">{t.heroEyebrow}</p>
            <h1 className="display-xl mt-5 text-cream-50">
              {copy('home.heroTitleLine1')}
              <br />
              <span className="text-ember-300">{copy('home.heroTitleLine2')}</span>
            </h1>
            <DiamondRule className="mt-7" />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream-100/85">{copy('home.heroBody')}</p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={routes.menu(locale)}>
                  {dict.actions.viewMenu} <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="onPhoto">
                <Link href={routes.book(locale)}>{dict.actions.bookTable}</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-cream-200/70">
              <OpenStatus
                hours={settings.hours}
                labels={{ open: dict.contact.openNow, closed: dict.contact.closedNow }}
              />
              {settings.phones[0] ? (
                <a
                  href={`tel:${settings.phones[0]}`}
                  className="transition-colors hover:text-ember-300"
                >
                  {settings.phones[0]}
                </a>
              ) : null}
            </div>
          </Reveal>
        </div>

        {/* Scroll cue. `home.scrollHint` existed in both dictionaries but was
            never rendered — the design intended a cue and never shipped one.
            aria-hidden: it duplicates the page's natural scroll affordance. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-4 hidden justify-center md:flex"
        >
          <div
            className="flex flex-col items-center gap-2 text-ember-300"
            style={{ animation: 'drift-down 2.4s var(--ease-in-out-soft) infinite' }}
          >
            <span className="text-[0.625rem] font-semibold tracking-[0.22em] uppercase">
              {t.scrollHint}
            </span>
            <ChevronDown className="size-4" />
          </div>
        </div>
      </section>

      <TibebBand />

      {/* ------------------------------------------------------------- PILLARS */}
      <Section tone="canvas">
        <div className="container-page">
          <SectionHeading eyebrow={t.pillarsEyebrow} title={t.pillarsTitle} />
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map(({ icon: Icon, title, body }, index) => (
              <li key={title}>
                <Reveal
                  index={index}
                  className="flex h-full flex-col gap-4 rounded-[var(--radius-card)] bg-surface p-7 shadow-[var(--shadow-card)]"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-ember-100 text-accent-ink">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-xl font-semibold text-brown-900">{title}</h3>
                  <p className="text-[0.9375rem] leading-relaxed text-ink-muted">{body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* --------------------------------------------------------------- STORY */}
      <Section tone="surface">
        <div className="container-page grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative">
            <div className="relative aspect-4/5 overflow-hidden rounded-[var(--radius-card)]">
              <Image
                src={storyPhoto}
                alt=""
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
                placeholder="blur"
              />
            </div>
            {/* Offset accent block: gives the composition depth without a border. */}
            <div
              aria-hidden="true"
              className="absolute -bottom-5 -left-5 -z-10 hidden size-40 rounded-[var(--radius-card)] bg-ember-100 lg:block"
            />
          </Reveal>

          <div>
            <SectionHeading
              eyebrow={t.storyEyebrow}
              title={copy('home.storyTitle')}
              align="start"
              className="items-start"
            />
            <Reveal index={1} className="mt-6 space-y-5 text-[1.0625rem] leading-relaxed text-ink-muted">
              <p>{copy('home.storyBody1')}</p>
              <p>{copy('home.storyBody2')}</p>
            </Reveal>

            <Reveal index={2}>
              <ul className="mt-9 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {storyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <svg width="9" height="9" viewBox="0 0 9 9" className="mt-2 shrink-0" aria-hidden="true">
                      <path d="M4.5 0 L9 4.5 L4.5 9 L0 4.5 Z" className="fill-accent" />
                    </svg>
                    <span className="text-[0.9375rem] font-medium text-brown-800">{point}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- SIGNATURE */}
      <Section tone="canvas">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.signatureEyebrow}
            title={t.signatureTitle}
            body={t.signatureBody}
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dishes.map((dish, index) => (
              <Reveal key={dish.id} index={index}>
                <DishCard
                  dish={dish}
                  locale={locale}
                  dict={dict}
                  canOrder={settings.is_accepting_orders}
                />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 flex justify-center">
            <Button asChild variant="outline" size="lg">
              <Link href={routes.menu(locale)}>
                {dict.actions.viewMenu} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------- CATERING + EVENTS */}
      <Section tone="espresso" className="py-0 md:py-0">
        <div className="grid lg:grid-cols-2">
          <FeaturePanel
            image={cateringPhoto}
            eyebrow={t.cateringEyebrow}
            title={t.cateringTitle}
            body={copy('home.cateringBody')}
            href={routes.catering(locale)}
            cta={dict.actions.requestQuote}
          />
          <FeaturePanel
            image={eventsPhoto}
            eyebrow={t.eventsEyebrow}
            title={t.eventsTitle}
            body={copy('home.eventsBody')}
            href={routes.events(locale)}
            cta={dict.actions.inquire}
          />
        </div>
      </Section>

      {/* ------------------------------------------------------------- GALLERY */}
      <Section tone="canvas">
        <div className="container-page">
          <SectionHeading eyebrow={t.galleryEyebrow} title={t.galleryTitle} />
        </div>
        <div className="mt-12 grid grid-cols-2 gap-2 px-2 sm:gap-3 sm:px-3 md:grid-cols-3">
          {strip.map((item, index) => {
            const src = resolveSquareImage(item.storage_path)
            if (!src) return null
            return (
              <Reveal
                key={item.id}
                index={index % 3}
                className="relative aspect-square overflow-hidden rounded-lg"
              >
                <Image
                  src={src}
                  alt={pick(item, 'alt', locale)}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] hover:scale-105"
                />
              </Reveal>
            )
          })}
        </div>
        <div className="container-page mt-10 flex justify-center">
          <Button asChild variant="outline">
            <Link href={routes.gallery(locale)}>
              {dict.actions.seeAll} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* --------------------------------------------------------------- VISIT */}
      <Section tone="sunk">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow={t.visitEyebrow}
              title={t.visitTitle}
              align="start"
              className="items-start"
            />
            <Reveal index={1} className="mt-7 space-y-4">
              <p className="flex items-start gap-3 text-[1.0625rem] leading-relaxed text-brown-800">
                <MapPin className="mt-1 size-5 shrink-0 text-accent-ink" aria-hidden="true" />
                {pick(settings, 'address', locale)}
              </p>
              <OpenStatus
                hours={settings.hours}
                labels={{ open: dict.contact.openNow, closed: dict.contact.closedNow }}
              />
              <div className="flex flex-wrap gap-3 pt-3">
                <Button asChild>
                  <Link href={routes.book(locale)}>{dict.actions.bookTable}</Link>
                </Button>
                {settings.map_url ? (
                  <Button asChild variant="outline">
                    <a href={settings.map_url} target="_blank" rel="noreferrer noopener">
                      {dict.actions.directions}
                    </a>
                  </Button>
                ) : null}
              </div>
            </Reveal>
          </div>

          {/* diningPhoto, not eventsPhoto — the hall shot already fronts the
              events panel above; repeating it two sections later read as a
              mistake, not a motif. */}
          <Reveal index={2} className="relative aspect-16/11 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]">
            <Image
              src={diningPhoto}
              alt={dict.events.spaces.mesob.title}
              fill
              sizes="(min-width: 1024px) 50vw, 90vw"
              className="object-cover"
              placeholder="blur"
            />
          </Reveal>
        </div>
      </Section>
    </main>
  )
}

/** Half-width photo panel with copy over a scrim. Used for catering + events. */
function FeaturePanel({
  image,
  eyebrow,
  title,
  body,
  href,
  cta,
}: {
  image: Parameters<typeof Image>[0]['src']
  eyebrow: string
  title: string
  body: string
  href: string
  cta: string
}) {
  return (
    <div className="group relative min-h-[26rem] overflow-hidden lg:min-h-[32rem]">
      <Image
        src={image}
        alt=""
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-soft)] group-hover:scale-105"
        placeholder="blur"
      />
      <div className="photo-scrim absolute inset-0" />
      <Reveal className="relative flex h-full flex-col justify-end p-8 md:p-12">
        <p className="eyebrow text-ember-300">{eyebrow}</p>
        <h2 className="display-md mt-4 max-w-md text-cream-50">{title}</h2>
        <p className="mt-4 max-w-md leading-relaxed text-cream-100/80">{body}</p>
        <div className="mt-7">
          <Button asChild variant="onPhoto">
            <Link href={href}>
              {cta} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </div>
  )
}
