'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, Phone, ShoppingBag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart/context'
import { logoMark } from '@/lib/data/images'
import type { Dictionary, Locale } from '@/lib/i18n/config'
import type { SiteSettings } from '@/lib/supabase/database.types'
import { navItems, routes, swapLocale } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { OpenStatus } from './open-status'

/**
 * Two bands.
 *
 * The top one is the utility strip: whether we are open right now, and the
 * phone number as a `tel:` link. For a restaurant that strip is the highest
 * value real estate on the page — a large share of visitors want to call, not
 * to read — and until now that information only existed in the footer. It
 * collapses the moment you scroll, so it costs nothing once a visitor has
 * committed to reading.
 *
 * The bottom one is the navigation proper. It sits transparent over the hero
 * on the homepage and turns solid once you scroll past it; on every other page
 * it starts solid, because there is no full-bleed photograph underneath.
 */
export function SiteHeader({
  locale,
  dict,
  settings,
}: {
  locale: Locale
  dict: Dictionary
  settings: SiteSettings
}) {
  const pathname = usePathname()
  // Only the homepage has a full-bleed photograph for the header to sit on.
  const overlay = pathname === routes.home(locale)
  const { count, ready } = useCart()
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  /*
   * Listens on every page now, not just the homepage. The homepage uses it to
   * swap transparent for solid; everywhere else it drives the utility strip
   * collapsing away.
   */
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile sheet on navigation, and lock body scroll while it is open.
  React.useEffect(() => setOpen(false), [pathname])
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const solid = !overlay || scrolled
  const otherLocale: Locale = locale === 'en' ? 'am' : 'en'
  const phone = settings.phones[0]

  return (
    <header
      className={cn(
        // No backdrop-filter anywhere in here: a blurred fixed bar is the
        // single most paint-fragile pattern on mobile browsers (Chromium and
        // WebKit both have shipped bugs where the bar computes solid but
        // never paints — the invisible-navbar report). A fully opaque token
        // background + border + warm shadow paints unconditionally, and the
        // border carries the same "frosted edge" read.
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300',
        solid
          ? 'border-b border-brown-200 bg-canvas shadow-[var(--shadow-card)]'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      {/*
        Collapsed with a 0fr/1fr grid row rather than max-height. A max-height
        animation has to guess a number larger than the content and then eases
        through empty space, which reads as a stall; 1fr resolves to the real
        height, so the motion lasts exactly as long as the strip is tall.

        Desktop only. On a phone the same two pieces live in the sheet, where
        they get full-width targets instead of 13px type.
      */}
      <div
        className={cn(
          'hidden overflow-hidden transition-[grid-template-rows] duration-300 ease-[var(--ease-out-soft)] lg:grid',
          scrolled ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
          solid ? 'bg-espresso' : 'bg-espresso/70',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="container-page flex h-9 items-center justify-between gap-6">
            {/*
              Wrapped, because OpenStatus deliberately renders nothing until it
              has mounted and can read the real clock. Unwrapped it is not an
              empty box but no box at all, and justify-between with a single
              child aligns that child to the start — so before hydration the
              phone number sat on the left, then jumped to the right. The
              wrapper keeps the slot whether or not the badge is in it.
            */}
            <span>
              <OpenStatus
                hours={settings.hours}
                labels={{ open: dict.contact.openNow, closed: dict.contact.closedNow }}
                className="text-[0.8125rem]"
              />
            </span>
            <div className="flex items-center gap-5 text-[0.8125rem]">
              <span className="text-cream-200/60">{dict.home.heroEyebrow}</span>
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-1.5 font-medium text-cream-100 transition-colors hover:text-ember-300"
                >
                  <Phone className="size-3.5" aria-hidden="true" />
                  <span className="tabular-nums">{phone}</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page flex h-18 items-center justify-between gap-4">
        <Link
          href={routes.home(locale)}
          className="flex shrink-0 items-center gap-2.5"
          aria-label={dict.brand.name}
        >
          {/*
            The logo file has a white background and no alpha channel. The
            mix-blend-multiply trick is gone: blend modes on a child of a
            fixed + backdrop-filter header are a known paint-bug cocktail on
            mobile Chromium (header computes solid but never paints — invisible
            navbar). The white box is harmless at 44px; the solid band is what
            carries legibility. Replace with an SVG when the owners supply one.
          */}
          <Image
            src={logoMark}
            alt=""
            width={44}
            height={44}
            priority
            className={cn(
              'size-11 object-contain',
              // The asset is a white rectangle, so on the cream bar it used to
              // read as a bare white patch with four hard corners. Rounding it
              // and adding a hairline turns that into a deliberate badge
              // without touching the artwork.
              solid ? 'rounded-xl ring-1 ring-brown-200' : 'rounded-full bg-cream-50/95 p-0.5',
            )}
          />
          {/*
            Visible at every width now. Hidden below 640px the bar was a lone
            logo tile with two icons floating a long way off to the right, which
            looked unfinished on exactly the phone most visitors arrive on. The
            name is the cheapest thing that can fill it.
          */}
          <span className="block">
            <span
              className={cn(
                'block font-display text-base leading-none font-semibold tracking-tight sm:text-lg',
                solid ? 'text-brown-900' : 'text-cream-50',
              )}
            >
              {dict.brand.name}
            </span>
            <span
              className={cn(
                'mt-1 block text-[0.625rem] font-medium tracking-[0.16em] uppercase',
                solid ? 'text-accent-ink' : 'text-ember-300',
              )}
            >
              {dict.brand.branch}
            </span>
          </span>
        </Link>

        {/*
          The active item carries a filled pill, not a colour change alone.
          Colour was doing two jobs at once: it marked the active page and it
          was also the hover affordance, so on the photo overlay the difference
          between "this is where you are" and "this is where the cursor is"
          came down to two neighbouring creams. The pill separates the signals.
        */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {navItems.map(({ key, href }) => {
            const target = href(locale)
            const active = pathname === target
            return (
              <Link
                key={key}
                href={target}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200',
                  solid
                    ? active
                      ? 'bg-ember-100 text-accent-ink'
                      : 'text-brown-700 hover:bg-brown-100 hover:text-brown-950'
                    : active
                      ? 'bg-cream-50/15 text-cream-50'
                      : 'text-cream-100/85 hover:bg-cream-50/10 hover:text-cream-50',
                )}
              >
                {dict.nav[key]}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          {/*
            A plain anchor, not <Link>: client-side navigation between /am/*
            and /en/* shares the [lang] layout, so the header, footer and
            <html lang> would keep the old language while only the page body
            flips. A full document load updates everything, costs one request
            against a statically prerendered page, and the cart survives it in
            localStorage.

            Hidden below sm: four controls plus the logo did not fit at 360px
            without crowding, so on phones this lives in the sheet instead.
          */}
          <a
            href={swapLocale(pathname, otherLocale)}
            hrefLang={otherLocale}
            aria-label={dict.nav.switchLanguage}
            className={cn(
              'hidden rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:inline-flex',
              solid
                ? 'border-brown-200 text-brown-700 hover:border-brown-800 hover:text-brown-950'
                : 'border-cream-100/35 text-cream-100 hover:bg-cream-50/10',
            )}
          >
            {dict.meta.switchTo}
          </a>

          <Link
            href={routes.order(locale)}
            aria-label={dict.actions.viewCart}
            className={cn(
              'relative grid size-10 place-items-center rounded-full transition-colors',
              solid ? 'text-brown-700 hover:bg-brown-100' : 'text-cream-100 hover:bg-cream-50/10',
            )}
          >
            <ShoppingBag className="size-5" />
            {ready && count > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[0.6875rem] font-bold text-accent-foreground tabular-nums">
                {count}
              </span>
            ) : null}
          </Link>

          <Button asChild size="sm" className="ml-1 hidden md:inline-flex">
            <Link href={routes.book(locale)}>{dict.nav.book}</Link>
          </Button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={dict.nav.openMenu}
            aria-expanded={open}
            className={cn(
              'grid size-10 place-items-center rounded-full transition-colors lg:hidden',
              solid ? 'text-brown-800 hover:bg-brown-100' : 'text-cream-50 hover:bg-cream-50/10',
            )}
          >
            <Menu className="size-6" />
          </button>
        </div>
      </div>

      {/*
        Mobile sheet.

        It slides in now rather than cross-fading. A fade leaves every link at
        its final position for the whole transition, so on a slow phone the
        panel reads as a flicker; translating gives the eye a direction to
        follow, and the staggered links make the panel feel assembled rather
        than dumped.

        `inert` — not pointer-events alone — keeps the closed panel out of the
        tab order and away from screen readers.
      */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-espresso transition-[opacity,transform] duration-300 ease-[var(--ease-out-soft)] lg:hidden',
          open ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-4 opacity-0',
        )}
        inert={!open}
      >
        <div className="container-page flex h-18 items-center justify-between">
          <span className="font-display text-lg font-semibold text-cream-50">
            {dict.brand.name}
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={dict.nav.closeMenu}
            className="grid size-10 place-items-center rounded-full text-cream-100 hover:bg-cream-50/10"
          >
            <X className="size-6" />
          </button>
        </div>

        {/*
          The panel is taller than a small phone once the call and booking CTAs
          are in it, so it scrolls, and the bottom padding clears the iOS home
          indicator.
        */}
        <div className="h-[calc(100dvh-4.5rem)] overflow-y-auto pb-[max(2rem,env(safe-area-inset-bottom))]">
          <div className="container-page">
            <OpenStatus
              hours={settings.hours}
              labels={{ open: dict.contact.openNow, closed: dict.contact.closedNow }}
              className="mt-2"
            />
          </div>

          <nav className="container-page mt-5 flex flex-col" aria-label="Mobile">
            {[{ key: 'home' as const, href: routes.home }, ...navItems].map(({ key, href }, i) => (
              <Link
                key={key}
                href={href(locale)}
                style={{ transitionDelay: open ? `${80 + i * 35}ms` : '0ms' }}
                className={cn(
                  'border-b border-cream-100/10 py-4 font-display text-2xl text-cream-50',
                  'transition-[opacity,transform] duration-300 ease-[var(--ease-out-soft)]',
                  open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
                )}
              >
                {dict.nav[key]}
              </Link>
            ))}

            <div className="mt-8 flex flex-col gap-3">
              <Button asChild size="lg">
                <Link href={routes.book(locale)}>{dict.nav.book}</Link>
              </Button>
              {phone ? (
                <Button asChild size="lg" variant="onPhoto">
                  <a href={`tel:${phone}`}>
                    <Phone aria-hidden="true" />
                    {dict.actions.callUs}
                  </a>
                </Button>
              ) : null}
            </div>

            <a
              href={swapLocale(pathname, otherLocale)}
              hrefLang={otherLocale}
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-cream-100/25 px-4 text-sm font-semibold text-cream-100 transition-colors hover:bg-cream-50/10"
            >
              {dict.nav.switchLanguage} · {dict.meta.switchTo}
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
