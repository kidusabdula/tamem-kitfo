import Link from 'next/link'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { TibebBand } from '@/components/ui/tibeb'
import { OpenStatus } from './open-status'
import type { Dictionary, Locale } from '@/lib/i18n/config'
import { pick } from '@/lib/i18n/config'
import { navItems, routes } from '@/lib/routes'
import { DAY_LABELS, summariseHours, type DayKey } from '@/lib/hours'
import type { SiteSettings } from '@/lib/supabase/database.types'

export function SiteFooter({
  locale,
  dict,
  settings,
}: {
  locale: Locale
  dict: Dictionary
  settings: SiteSettings
}) {
  const groups = summariseHours(settings.hours)
  const phone = settings.phones[0]
  const address = pick(settings, 'address', locale)

  return (
    <footer className="bg-espresso text-cream-200">
      <TibebBand />

      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1.2fr] md:py-20">
        <div>
          {/*
            The logo asset is dark-on-white with no transparency, so it cannot
            sit on the espresso footer. A typographic lockup is the right call
            here anyway — and it stays crisp at any size.
          */}
          <p className="font-display text-2xl font-semibold text-cream-50">{dict.brand.name}</p>
          <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-ember-300 uppercase">
            {dict.brand.tagline}
          </p>
          <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-cream-200/70">
            {dict.footer.blurb}
          </p>
          <OpenStatus
            hours={settings.hours}
            labels={{ open: dict.contact.openNow, closed: dict.contact.closedNow }}
            className="mt-5"
          />
        </div>

        <nav aria-label={dict.footer.explore}>
          <h2 className="text-xs font-semibold tracking-[0.18em] text-cream-50 uppercase">
            {dict.footer.explore}
          </h2>
          <ul className="mt-5 space-y-3">
            {navItems.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href(locale)}
                  className="text-[0.9375rem] text-cream-200/75 transition-colors hover:text-ember-300"
                >
                  {dict.nav[key]}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={routes.book(locale)}
                className="text-[0.9375rem] text-cream-200/75 transition-colors hover:text-ember-300"
              >
                {dict.nav.book}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.18em] text-cream-50 uppercase">
            {dict.footer.visit}
          </h2>
          <ul className="mt-5 space-y-4 text-[0.9375rem] text-cream-200/75">
            {address ? (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-ember-300" aria-hidden="true" />
                <span>{address}</span>
              </li>
            ) : null}
            {phone ? (
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-ember-300" aria-hidden="true" />
                <a href={`tel:${phone}`} className="transition-colors hover:text-ember-300">
                  {phone}
                </a>
              </li>
            ) : null}
            {settings.email ? (
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-ember-300" aria-hidden="true" />
                <a href={`mailto:${settings.email}`} className="transition-colors hover:text-ember-300">
                  {settings.email}
                </a>
              </li>
            ) : null}
            {groups.map((group) => (
              <li key={group.days.join()} className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-ember-300" aria-hidden="true" />
                <span>
                  {group.days.length === 7
                    ? dict.contact.everyDay
                    : `${DAY_LABELS[locale][group.days[0] as DayKey]}–${
                        DAY_LABELS[locale][group.days.at(-1) as DayKey]
                      }`}{' '}
                  <span className="tabular-nums">
                    {group.open} – {group.close}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-100/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-cream-200/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {dict.brand.name}. {dict.footer.rights}
          </p>
          <Link href="/admin" className="transition-colors hover:text-ember-300">
            {dict.footer.staffLogin}
          </Link>
        </div>
      </div>
    </footer>
  )
}
