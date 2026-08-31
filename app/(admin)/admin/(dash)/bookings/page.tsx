import { EmptyState, PageHeader, Panel, StatusPill, StatusSelect } from '@/components/admin/bits'
import { requireStaff } from '@/lib/admin/auth'
import { getStaffDictionary } from '@/lib/admin/locale'
import { formatAddisTime } from '@/lib/hours'
import type { BookingStatus } from '@/lib/supabase/database.types'
import { updateBookingStatusAction } from '../../actions'

const STATUSES: readonly BookingStatus[] = [
  'new',
  'confirmed',
  'seated',
  'completed',
  'cancelled',
]

export default async function AdminBookingsPage() {
  const { locale, dict } = await getStaffDictionary()
  const session = await requireStaff()
  if (!session) return null

  /*
   * Ordered by the *booking* time, ascending — the useful question here is
   * "who is coming next", not "who filled in the form most recently".
   */
  const { data: bookings } = await session.supabase
    .from('table_bookings')
    .select('*')
    .order('booking_at', { ascending: true })
    .gte('booking_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
    .limit(100)

  return (
    <>
      <PageHeader title={dict.admin.bookings.title} count={bookings?.length ?? 0} />

      {bookings && bookings.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <Panel>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brown-900">
                      {booking.name}
                      <span className="ml-2 font-normal text-ink-subtle">
                        · {booking.party_size} {dict.admin.bookings.party}
                      </span>
                    </p>
                    <a
                      href={`tel:${booking.phone}`}
                      className="text-sm font-medium text-accent-ink underline"
                    >
                      {booking.phone}
                    </a>
                  </div>
                  <StatusPill
                    status={booking.status}
                    label={dict.admin.bookings.statuses[booking.status]}
                  />
                </div>

                <p className="mt-3 text-sm font-medium text-brown-800">
                  {dict.admin.bookings.when}: {formatAddisTime(booking.booking_at, locale)}
                </p>

                {booking.notes ? (
                  <p className="mt-2 rounded-xl bg-cream-100/60 p-3 text-sm leading-relaxed text-brown-800">
                    {booking.notes}
                  </p>
                ) : null}

                <form
                  action={updateBookingStatusAction}
                  className="mt-4 border-t border-[var(--color-hairline)] pt-4"
                >
                  <input type="hidden" name="id" value={booking.id} />
                  <StatusSelect
                    name="status"
                    value={booking.status}
                    saveLabel={dict.admin.menu.save}
                    options={STATUSES.map((value) => ({
                      value,
                      label: dict.admin.bookings.statuses[value],
                    }))}
                  />
                </form>
              </Panel>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState message={dict.admin.bookings.empty} />
      )}
    </>
  )
}
