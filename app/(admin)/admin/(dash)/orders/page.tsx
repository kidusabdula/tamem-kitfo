import Link from 'next/link'

import { EmptyState, PageHeader, Panel, StatusPill, StatusSelect } from '@/components/admin/bits'
import { requireStaff } from '@/lib/admin/auth'
import { getStaffDictionary } from '@/lib/admin/locale'
import { formatAddisTime } from '@/lib/hours'
import { formatETB } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/lib/supabase/database.types'
import { updateOrderStatusAction } from '../../actions'

const FILTERS: readonly (OrderStatus | 'all')[] = [
  'all',
  'new',
  'confirmed',
  'preparing',
  'completed',
  'cancelled',
]

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { locale, dict } = await getStaffDictionary()
  const session = await requireStaff()
  if (!session) return null

  const { status } = await searchParams
  const active = FILTERS.includes(status as OrderStatus) ? (status as OrderStatus) : 'all'

  let query = session.supabase
    .from('orders')
    .select('*, order_items(dish_name_snapshot, quantity, unit_price_snapshot)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (active !== 'all') query = query.eq('status', active)

  const { data: orders } = await query

  const typeLabel = dict.order.fulfilmentOptions

  return (
    <>
      <PageHeader title={dict.admin.orders.title} count={orders?.length ?? 0} />

      <div className="mb-5 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((filter) => (
          <Link
            key={filter}
            href={filter === 'all' ? '/admin/orders' : `/admin/orders?status=${filter}`}
            className={cn(
              'inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors',
              filter === active
                ? 'bg-brown-900 text-cream-50'
                : 'border border-brown-200 bg-surface text-brown-700 hover:border-brown-300',
            )}
          >
            {filter === 'all' ? dict.admin.orders.filterAll : dict.order.status[filter]}
          </Link>
        ))}
      </div>

      {orders && orders.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Panel>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-base font-bold tracking-[0.1em] text-brown-900">
                      {order.code}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-subtle">
                      {formatAddisTime(order.created_at, locale)} ·{' '}
                      {typeLabel[order.fulfilment_type]}
                    </p>
                  </div>
                  <StatusPill status={order.status} label={dict.order.status[order.status]} />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="text-sm">
                    <p className="font-semibold text-brown-900">{order.customer_name}</p>
                    {/* tel: link — staff call the customer to confirm every order. */}
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="mt-0.5 inline-block font-medium text-accent-ink underline"
                    >
                      {order.customer_phone}
                    </a>
                    {order.scheduled_for ? (
                      <p className="mt-1.5 text-ink-subtle">
                        {dict.admin.orders.scheduledFor}:{' '}
                        {formatAddisTime(order.scheduled_for, locale)}
                      </p>
                    ) : null}
                    {order.delivery_address ? (
                      <p className="mt-1.5 text-ink-subtle">
                        {dict.admin.orders.address}: {order.delivery_address}
                      </p>
                    ) : null}
                    {order.notes ? (
                      <p className="mt-1.5 text-ink-subtle">
                        {dict.admin.orders.notes}: {order.notes}
                      </p>
                    ) : null}
                  </div>

                  <ul className="divide-y divide-[var(--color-hairline)] text-sm">
                    {order.order_items.map((item, index) => (
                      <li key={index} className="flex justify-between gap-3 py-1.5">
                        <span className="text-brown-800">
                          {item.quantity} × {item.dish_name_snapshot}
                        </span>
                        <span className="shrink-0 text-ink-subtle">
                          {formatETB(item.quantity * Number(item.unit_price_snapshot), locale)}
                        </span>
                      </li>
                    ))}
                    <li className="flex justify-between gap-3 pt-2 font-semibold text-brown-900">
                      <span>{dict.cart.total}</span>
                      <span>{formatETB(Number(order.subtotal_etb), locale)}</span>
                    </li>
                  </ul>
                </div>

                <form
                  action={updateOrderStatusAction}
                  className="mt-4 border-t border-[var(--color-hairline)] pt-4"
                >
                  <input type="hidden" name="id" value={order.id} />
                  <StatusSelect
                    name="status"
                    value={order.status}
                    saveLabel={dict.admin.menu.save}
                    options={(['new', 'confirmed', 'preparing', 'completed', 'cancelled'] as const).map(
                      (value) => ({ value, label: dict.order.status[value] }),
                    )}
                  />
                </form>
              </Panel>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState message={dict.admin.orders.empty} />
      )}
    </>
  )
}
