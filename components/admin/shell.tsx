'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
      className="sticky top-0 z-40 border-b border-brown-200/70 bg-cream-50/95 backdrop-blur"
    >
      <ul className="container-page flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV.map((item) => {
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold whitespace-nowrap transition-colors',
                  active
                    ? 'bg-brown-900 text-cream-50'
                    : 'text-brown-700 hover:bg-brown-100/70 hover:text-brown-900',
                )}
              >
                {dict.admin.nav[item.key]}
                {item.key === 'orders' && newOrders > 0 ? (
                  <span
                    className={cn(
                      'inline-flex min-w-5 justify-center rounded-full px-1.5 py-0.5 text-xs font-bold',
                      active ? 'bg-accent text-accent-foreground' : 'bg-accent text-accent-foreground',
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

export function LocaleSwitch({
  locale,
  action,
}: {
  locale: Locale
  action: (formData: FormData) => void
}) {
  const next: Locale = locale === 'en' ? 'am' : 'en'
  return (
    <form action={action}>
      <input type="hidden" name="locale" value={next} />
      <button
        type="submit"
        className="min-h-11 rounded-xl px-3 text-sm font-semibold text-brown-700 hover:bg-brown-100/70"
      >
        {next === 'am' ? 'አማርኛ' : 'English'}
      </button>
    </form>
  )
}
