'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart/context'
import { logoMark } from '@/lib/data/images'
import type { Dictionary, Locale } from '@/lib/i18n/config'
import { navItems, routes, swapLocale } from '@/lib/routes'
import { cn } from '@/lib/utils'

/**
 * The header sits transparent over the hero on the homepage and turns solid
 * once you scroll past it. On every other page it starts solid, because
 * there is no full-bleed photograph underneath to sit on.
 */
export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname()
  // Only the homepage has a full-bleed photograph for the header to sit on.
  const overlay = pathname === routes.home(locale)
  const { count, ready } = useCart()
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!overlay) return
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overlay])

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

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300',
        solid
          ? 'bg-canvas/92 shadow-[0_1px_0_var(--color-hairline)] backdrop-blur-md'
          : 'bg-transparent',
      )}
    >
      <div className="container-page flex h-18 items-center justify-between gap-4">
        <Link
          href={routes.home(locale)}
          className="flex shrink-0 items-center gap-2.5"
          aria-label={dict.brand.name}
        >
          {/*
            The logo file has a white background and no alpha channel.
            `mix-blend-multiply` drops the white against any lighter surface,
            which is why the header never goes darker than cream.
            Replace with an SVG when the owners supply one.
          */}
          <Image
            src={logoMark}
            alt=""
            width={44}
            height={44}
            priority
            className={cn(
              'size-11 object-contain mix-blend-multiply',
              !solid && 'rounded-full bg-cream-50/95 p-0.5 mix-blend-normal',
            )}
          />
          <span className="hidden sm:block">
            <span
              className={cn(
                'block font-display text-lg leading-none font-semibold tracking-tight',
                solid ? 'text-brown-900' : 'text-cream-50',
              )}
            >
              {dict.brand.name}
            </span>
            <span
              className={cn(
                'block text-[0.625rem] font-medium tracking-[0.16em] uppercase',
                solid ? 'text-ink-subtle' : 'text-cream-200/80',
              )}
            >
              {dict.brand.branch}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navItems.map(({ key, href }) => {
            const target = href(locale)
            const active = pathname === target
            return (
              <Link
                key={key}
                href={target}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  solid
                    ? active
                      ? 'text-accent-ink'
                      : 'text-brown-700 hover:text-brown-950'
                    : active
                      ? 'text-ember-300'
                      : 'text-cream-100/85 hover:text-cream-50',
                )}
              >
                {dict.nav[key]}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href={swapLocale(pathname, otherLocale)}
            hrefLang={otherLocale}
            aria-label={dict.nav.switchLanguage}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              solid
                ? 'border-brown-200 text-brown-700 hover:border-brown-800 hover:text-brown-950'
                : 'border-cream-100/35 text-cream-100 hover:bg-cream-50/10',
            )}
          >
            {dict.meta.switchTo}
          </Link>

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

          <Button asChild size="sm" className="hidden md:inline-flex">
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

      {/* Mobile sheet */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-espresso transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        {...(open ? {} : { inert: '' as unknown as boolean })}
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

        <nav className="container-page mt-6 flex flex-col" aria-label="Mobile">
          <Link
            href={routes.home(locale)}
            className="border-b border-cream-100/10 py-4 font-display text-2xl text-cream-50"
          >
            {dict.nav.home}
          </Link>
          {navItems.map(({ key, href }) => (
            <Link
              key={key}
              href={href(locale)}
              className="border-b border-cream-100/10 py-4 font-display text-2xl text-cream-50"
            >
              {dict.nav[key]}
            </Link>
          ))}
          <div className="mt-8 flex flex-col gap-3">
            <Button asChild size="lg">
              <Link href={routes.book(locale)}>{dict.nav.book}</Link>
            </Button>
            <Button asChild size="lg" variant="onPhoto">
              <Link href={routes.menu(locale)}>{dict.actions.viewMenu}</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
