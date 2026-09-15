import Link from 'next/link'

import { AdminHeaderActions, AdminNav } from '@/components/admin/shell'
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
      <header className="border-b border-hairline bg-canvas">
        {/*
          min-h-16 rather than h-16. The row is allowed to wrap, and a fixed
          height cannot contain two rows: below about 380px the title and the
          buttons wrapped and then overflowed a 64px box, so the header read as
          cramped with no padding on exactly the phones staff use.
        */}
        <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2.5">
          <Link href="/admin" className="min-w-0">
            <span className="block truncate font-display text-lg leading-none font-semibold tracking-tight text-brown-900">
              {dict.admin.title}
            </span>
            <span className="mt-1 hidden text-[0.625rem] font-medium tracking-[0.16em] text-ink-subtle uppercase sm:block">
              {dict.admin.dashboard.title}
            </span>
          </Link>
          <AdminHeaderActions
            locale={locale}
            dict={dict}
            setStaffLocaleAction={setStaffLocaleAction}
            signOutAction={signOutAction}
          />
        </div>
      </header>

      <AdminNav dict={dict} newOrders={count ?? 0} />

      <main className="container-page flex-1 py-8">
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
