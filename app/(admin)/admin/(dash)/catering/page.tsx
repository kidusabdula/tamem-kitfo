import { EmptyState, PageHeader, Panel, StatusPill, StatusSelect } from '@/components/admin/bits'
import { requireStaff } from '@/lib/admin/auth'
import { getStaffDictionary } from '@/lib/admin/locale'
import { formatAddisTime } from '@/lib/hours'
import type { InquiryStatus } from '@/lib/supabase/database.types'
import { updateInquiryStatusAction } from '../../actions'

const STATUSES: readonly InquiryStatus[] = ['new', 'contacted', 'quoted', 'won', 'lost']

export default async function AdminCateringPage() {
  const { locale, dict } = await getStaffDictionary()
  const session = await requireStaff()
  if (!session) return null

  const { data: inquiries } = await session.supabase
    .from('catering_inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <>
      <PageHeader title={dict.admin.catering.title} count={inquiries?.length ?? 0} />

      {inquiries && inquiries.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id}>
              <Panel>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brown-900">{inquiry.name}</p>
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="text-sm font-medium text-accent-ink underline"
                    >
                      {inquiry.phone}
                    </a>
                    {inquiry.email ? (
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="ml-3 text-sm text-ink-subtle underline"
                      >
                        {inquiry.email}
                      </a>
                    ) : null}
                  </div>
                  <StatusPill
                    status={inquiry.status}
                    label={dict.admin.catering.statuses[inquiry.status]}
                  />
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                  <Row
                    label={dict.admin.catering.event}
                    value={dict.catering.eventTypes[inquiry.event_type]}
                  />
                  <Row
                    label={dict.admin.catering.date}
                    value={inquiry.event_date ? formatAddisTime(inquiry.event_date, locale) : '—'}
                  />
                  <Row
                    label={dict.admin.catering.guests}
                    value={inquiry.guest_count ? String(inquiry.guest_count) : '—'}
                  />
                  <Row label={dict.admin.catering.location} value={inquiry.location ?? '—'} />
                </dl>

                {inquiry.message ? (
                  <p className="mt-3 rounded-xl bg-cream-100/60 p-3 text-sm leading-relaxed text-brown-800">
                    {inquiry.message}
                  </p>
                ) : null}

                <form
                  action={updateInquiryStatusAction}
                  className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-hairline)] pt-4"
                >
                  <input type="hidden" name="id" value={inquiry.id} />
                  <StatusSelect
                    name="status"
                    value={inquiry.status}
                    saveLabel={dict.admin.menu.save}
                    options={STATUSES.map((value) => ({
                      value,
                      label: dict.admin.catering.statuses[value],
                    }))}
                  />
                  <span className="text-xs text-ink-subtle">
                    {formatAddisTime(inquiry.created_at, locale)}
                  </span>
                </form>
              </Panel>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState message={dict.admin.catering.empty} />
      )}
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-ink-subtle">{label}:</dt>
      <dd className="font-medium text-brown-800">{value}</dd>
    </div>
  )
}
