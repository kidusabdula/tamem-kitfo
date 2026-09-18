import Link from 'next/link'
import { Megaphone } from 'lucide-react'

import { EmptyState, Panel, Stat, StatusPill } from '@/components/admin/bits'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { requireStaff } from '@/lib/admin/auth'
import { getStaffDictionary } from '@/lib/admin/locale'
import { addisDayStart, formatAddisTime } from '@/lib/hours'
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
  const newCount = newOrders.count ?? 0
  const recentOrders = recent.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <Reveal index={0}>
        <Panel className="overflow-hidden border-cream-100/20 bg-linear-to-br from-brown-900 via-brown-800 to-brown-950 p-6 text-cream-50 shadow-[var(--shadow-lift)] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-ember-300 uppercase">
                {dict.admin.dashboard.title}
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-cream-50">
                {dict.admin.title}
              </h1>
              <p className="mt-2 text-sm text-cream-100/70">
                {formatAddisTime(nowIso, locale)}
              </p>
            </div>
            <Button asChild variant="accent" size="sm" className="self-start sm:self-auto">
              <Link href={newCount > 0 ? '/admin/orders?status=new' : '/admin/orders'}>
                {newCount > 0
                  ? `${newCount} ${dict.admin.dashboard.newOrders}`
                  : dict.admin.dashboard.viewAll}
              </Link>
            </Button>
          </div>
        </Panel>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Reveal index={1}>
          <Stat label={dict.admin.dashboard.newOrders} value={String(newCount)} />
        </Reveal>
        <Reveal index={2}>
          <Stat label={dict.admin.dashboard.todayOrders} value={String(todayRows.length)} />
        </Reveal>
        <Reveal index={3}>
          <Stat label={dict.admin.dashboard.revenueToday} value={formatETB(todayTotal, locale)} />
        </Reveal>
        <Reveal index={4}>
          <Stat
            label={dict.admin.dashboard.openInquiries}
            value={String(inquiries.count ?? 0)}
            hint={`${bookings.count ?? 0} · ${dict.admin.dashboard.upcomingBookings}`}
          />
        </Reveal>
      </div>

      <Reveal index={5}>
        <Panel className="border-tej/25 bg-tej/10">
          <div className="flex gap-3">
            <Megaphone className="mt-0.5 size-4 shrink-0 text-accent-ink" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-brown-800">
              {dict.admin.dashboard.telegramHint}
            </p>
          </div>
        </Panel>
      </Reveal>

      <Reveal index={6}>
        <section aria-labelledby="recent-orders-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2
              id="recent-orders-heading"
              className="font-display text-lg font-semibold text-brown-900"
            >
              {dict.admin.dashboard.recentOrders}
            </h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders">{dict.admin.dashboard.viewAll}</Link>
            </Button>
          </div>

          {recentOrders.length > 0 ? (
            <Panel className="overflow-hidden p-0">
              <ul className="divide-y divide-[var(--color-hairline)]">
                {recentOrders.map((order) => (
                  <li
                    key={order.id}
                    className="grid gap-3 p-4 transition-colors hover:bg-brown-100/35 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-bold tracking-[0.1em] text-brown-900">
                        {order.code}
                      </p>
                      <p className="mt-1 truncate text-sm text-ink-subtle">{order.customer_name}</p>
                      <p className="mt-1 text-xs text-ink-subtle">
                        {formatAddisTime(order.created_at, locale)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span className="font-display text-base font-semibold text-brown-900 tabular-nums">
                        {formatETB(Number(order.subtotal_etb), locale)}
                      </span>
                      <StatusPill status={order.status} label={dict.order.status[order.status]} />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : (
            <EmptyState message={dict.admin.dashboard.nothingYet} />
          )}
        </section>
      </Reveal>
    </div>
  )
}
