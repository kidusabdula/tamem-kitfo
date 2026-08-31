import Link from 'next/link'

import { AdminNav, LocaleSwitch } from '@/components/admin/shell'
import { Panel } from '@/components/admin/bits'
import { requireStaff } from '@/lib/admin/auth'
import { getStaffDictionary } from '@/lib/admin/locale'
import { setStaffLocaleAction, signOutAction } from '../actions'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { locale, dict } = await getStaffDictionary()
  const session = await requireStaff()

  // Supabase is not wired up. Say so plainly instead of rendering eight empty
  // screens that look broken.
  if (!session) {
    return (
      <main className="mx-auto max-w-md px-5 py-24">
        <Panel>
          <p className="text-sm text-ink-subtle">{dict.admin.notConfigured}</p>
        </Panel>
      </main>
    )
  }

  const { count } = await session.supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new')

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-brown-200/70 bg-cream-50">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-3">
          <Link href="/admin" className="font-display text-lg font-semibold text-brown-900">
            {dict.admin.title}
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="min-h-11 rounded-xl px-3 text-sm font-semibold text-brown-700 hover:bg-brown-100/70 max-sm:hidden"
            >
              {dict.admin.backToSite}
            </Link>
            <LocaleSwitch locale={locale} action={setStaffLocaleAction} />
            <form action={signOutAction}>
              <button
                type="submit"
                className="min-h-11 rounded-xl px-3 text-sm font-semibold text-brown-700 hover:bg-brown-100/70"
              >
                {dict.admin.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>

      <AdminNav dict={dict} newOrders={count ?? 0} />

      <main className="container-page flex-1 py-7">
        {/*
          Signed in, but no staff_profiles row. RLS will already be returning
          nothing; explaining why beats eight blank tables.
        */}
        {session.profile ? (
          children
        ) : (
          <Panel>
            <p className="text-sm text-ink-subtle">
              {session.email} — {dict.admin.notStaff}
            </p>
          </Panel>
        )}
      </main>
    </div>
  )
}
