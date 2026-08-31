import Link from 'next/link'

import { EmptyState, Panel, Stat, StatusPill } from '@/components/admin/bits'
import { requireStaff } from '@/lib/admin/auth'
import { getStaffDictionary } from '@/lib/admin/locale'
import { addisDayStart } from '@/lib/hours'
import { formatETB } from '@/lib/utils'

export default async function AdminDashboard() {
  const { locale, dict } = await getStaffDictionary()
  const session = await requireStaff()
  if (!session) return null

  const dayStart = addisDayStart().toISOString()
  const nowIso = new Date().toISOString()

  /*
   * Five independent counts. Run them together — sequentially this page would
   * cost five round trips to Frankfurt, which is roughly a second of staring
   * at a blank screen on Addis mobile data.
   */
  const [newOrders, todayOrders, inquiries, bookings, recent] = await Promise.all([
    session.supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new'),
    session.supabase
      .from('orders')
      .select('subtotal_etb')
      .gte('created_at', dayStart)
      .neq('status', 'cancelled'),
    session.supabase
      .from('catering_inquiries')
      .select('id', { count: 'exact', head: true })
      .in('status', ['new', 'contacted', 'quoted']),
    session.supabase
      .from('table_bookings')
      .select('id', { count: 'exact', head: true })
      .gte('booking_at', nowIso)
      .in('status', ['new', 'confirmed']),
    session.supabase
      .from('orders')
      .select('id, code, customer_name, subtotal_etb, status, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const todayRows = todayOrders.data ?? []
  // Cancelled orders are already filtered out above, so this is money the
  // kitchen actually expects to take today.
  const todayTotal = todayRows.reduce((sum, row) => sum + Number(row.subtotal_etb), 0)

  return (
    <>
      <h1 className="mb-6 font-display text-2xl font-semibold text-brown-900">
        {dict.admin.dashboard.title}
      </h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={dict.admin.dashboard.newOrders} value={String(newOrders.count ?? 0)} />
        <Stat label={dict.admin.dashboard.todayOrders} value={String(todayRows.length)} />
        <Stat
          label={dict.admin.dashboard.revenueToday}
          value={formatETB(todayTotal, locale)}
        />
        <Stat
          label={dict.admin.dashboard.openInquiries}
          value={String(inquiries.count ?? 0)}
          hint={`${bookings.count ?? 0} · ${dict.admin.dashboard.upcomingBookings}`}
        />
      </div>

      <Panel className="mt-4">
        <p className="text-sm leading-relaxed text-ink-subtle">
          {dict.admin.dashboard.telegramHint}
        </p>
      </Panel>

      <div className="mt-8 mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-brown-900">
          {dict.admin.dashboard.recentOrders}
        </h2>
        <Link href="/admin/orders" className="text-sm font-semibold text-accent-ink underline">
          {dict.admin.dashboard.viewAll}
        </Link>
      </div>

      {recent.data && recent.data.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {recent.data.map((order) => (
            <li key={order.id}>
              <Panel className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-mono text-sm font-bold tracking-[0.1em] text-brown-900">
                    {order.code}
                  </p>
                  <p className="text-sm text-ink-subtle">{order.customer_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-brown-900">
                    {formatETB(Number(order.subtotal_etb), locale)}
                  </span>
                  <StatusPill status={order.status} label={dict.order.status[order.status]} />
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState message={dict.admin.dashboard.nothingYet} />
      )}
    </>
  )
}
