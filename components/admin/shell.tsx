'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, Globe, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Dictionary, Locale } from '@/lib/i18n/config'

const NAV = [
  { href: '/admin', key: 'dashboard' },
  { href: '/admin/orders', key: 'orders' },
  { href: '/admin/catering', key: 'catering' },
  { href: '/admin/bookings', key: 'bookings' },
  { href: '/admin/menu', key: 'menu' },
  { href: '/admin/gallery', key: 'gallery' },
  { href: '/admin/content', key: 'content' },
  { href: '/admin/settings', key: 'settings' },
] as const

const headerButton =
  'h-9 gap-1.5 rounded-full border border-hairline bg-surface/80 px-2.5 text-xs font-semibold shadow-none ' +
  'hover:bg-surface-sunk hover:text-brown-900 sm:px-3 sm:text-sm'

export function AdminNav({ dict, newOrders }: { dict: Dictionary; newOrders: number }) {
  const pathname = usePathname()

  return (
    /*
     * One horizontal scrolling strip rather than a sidebar. Staff open this on
     * a phone far more often than on a desktop, and a scroll strip keeps all
     * eight destinations one tap away without a menu button.
     */
    <nav
      aria-label={dict.admin.title}
      className="sticky top-0 z-40 border-b border-hairline bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/80"
    >
      <ul className="container-page flex gap-1.5 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV.map((item) => {
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition-colors',
                  active
                    ? 'bg-brown-900 text-cream-50 shadow-[var(--shadow-card)]'
                    : 'text-brown-700 hover:bg-brown-100/80 hover:text-brown-950',
                )}
              >
                {dict.admin.nav[item.key]}
                {item.key === 'orders' && newOrders > 0 ? (
                  <span
                    className={cn(
                      'inline-flex min-w-5 justify-center rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums',
                      active
                        ? 'bg-cream-50 text-brown-900'
                        : 'bg-accent text-accent-foreground',
                    )}
                  >
                    {newOrders}
                  </span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function AdminHeaderActions({
  locale,
  dict,
  setStaffLocaleAction,
  signOutAction,
}: {
  locale: Locale
  dict: Dictionary
  setStaffLocaleAction: (formData: FormData) => void | Promise<void>
  signOutAction: (formData: FormData) => void | Promise<void>
}) {
  const next: Locale = locale === 'en' ? 'am' : 'en'
  const languageLabel = next === 'am' ? 'አማርኛ' : 'English'

  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <Button asChild variant="ghost" size="sm" className={headerButton}>
        <Link href="/" title={dict.admin.backToSite}>
          <ExternalLink aria-hidden="true" />
          <span className="hidden lg:inline">{dict.admin.backToSite}</span>
          <span className="sr-only lg:hidden">{dict.admin.backToSite}</span>
        </Link>
      </Button>

      <form action={setStaffLocaleAction}>
        <input type="hidden" name="locale" value={next} />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          aria-label={dict.admin.languageLabel}
          title={dict.admin.languageLabel}
          className={cn(headerButton, 'font-ethiopic-body')}
        >
          <Globe aria-hidden="true" />
          <span lang={next}>{languageLabel}</span>
        </Button>
      </form>

      <form action={signOutAction}>
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          title={dict.admin.signOut}
          className={cn(
            headerButton,
            'border-berbere/20 text-berbere hover:border-berbere/35 hover:bg-berbere/8 hover:text-berbere',
          )}
        >
          <LogOut aria-hidden="true" />
          <span className="hidden sm:inline">{dict.admin.signOut}</span>
          <span className="sr-only sm:hidden">{dict.admin.signOut}</span>
        </Button>
      </form>
    </div>
  )
}
