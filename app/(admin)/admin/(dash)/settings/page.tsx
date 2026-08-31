import { AdminField, PageHeader, Panel, SubmitButton, Toggle, adminControl } from '@/components/admin/bits'
import { requireStaff } from '@/lib/admin/auth'
import { getStaffDictionary } from '@/lib/admin/locale'
import { getSettings } from '@/lib/data/queries'
import { DAY_LABELS, type DayKey } from '@/lib/hours'
import { saveSettingsAction } from '../../actions'

const DAYS: readonly DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export default async function AdminSettingsPage() {
  const { locale, dict } = await getStaffDictionary()
  const session = await requireStaff()
  if (!session) return null

  // getSettings falls back to fixtures, so the form is never empty even before
  // the singleton row has been filled in.
  const settings = await getSettings()

  const dayLabel = DAY_LABELS[locale]

  return (
    <>
      <PageHeader title={dict.admin.settings.title} />

      <form action={saveSettingsAction} className="flex flex-col gap-5">
        {/*
          The kill switch sits at the top, on its own, because it is the one
          control someone reaches for in a hurry — the kitchen is swamped and
          online orders have to stop now.
        */}
        <Panel>
          <Toggle
            name="is_accepting_orders"
            label={dict.admin.settings.acceptingOrders}
            hint={dict.admin.settings.acceptingHint}
            defaultChecked={settings.is_accepting_orders}
          />
        </Panel>

        <Panel className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label={dict.admin.settings.phones}
            htmlFor="phones"
            hint={dict.admin.settings.phonesHint}
            className="sm:col-span-2"
          >
            <textarea
              id="phones"
              name="phones"
              rows={3}
              defaultValue={settings.phones.join('\n')}
              className={`${adminControl} resize-y font-mono`}
            />
          </AdminField>

          <AdminField label={dict.admin.settings.whatsapp} htmlFor="whatsapp_number">
            <input
              id="whatsapp_number"
              name="whatsapp_number"
              type="tel"
              defaultValue={settings.whatsapp_number ?? ''}
              className={adminControl}
            />
          </AdminField>

          <AdminField label={dict.admin.settings.email} htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={settings.email ?? ''}
              className={adminControl}
            />
          </AdminField>

          <AdminField label={dict.admin.settings.addressEn} htmlFor="address_en">
            <textarea
              id="address_en"
              name="address_en"
              rows={2}
              defaultValue={settings.address_en ?? ''}
              className={`${adminControl} resize-y`}
            />
          </AdminField>

          <AdminField label={dict.admin.settings.addressAm} htmlFor="address_am">
            <textarea
              id="address_am"
              name="address_am"
              rows={2}
              lang="am"
              defaultValue={settings.address_am ?? ''}
              className={`${adminControl} resize-y`}
            />
          </AdminField>

          <AdminField
            label={dict.admin.settings.mapUrl}
            htmlFor="map_url"
            className="sm:col-span-2"
          >
            <input
              id="map_url"
              name="map_url"
              type="url"
              inputMode="url"
              defaultValue={settings.map_url ?? ''}
              className={adminControl}
            />
          </AdminField>
        </Panel>

        <Panel>
          <p className="text-sm font-semibold text-brown-900">{dict.admin.settings.hours}</p>
          <p className="mt-1 mb-4 text-xs text-ink-subtle">{dict.admin.settings.hoursHint}</p>

          <ul className="flex flex-col gap-2">
            {DAYS.map((day) => {
              const window = settings.hours[day] ?? null
              return (
                <li key={day} className="flex flex-wrap items-center gap-2">
                  <span className="w-24 shrink-0 text-sm font-medium text-brown-800">
                    {dayLabel[day]}
                  </span>
                  <input
                    type="time"
                    name={`hours_${day}_open`}
                    defaultValue={window?.[0] ?? ''}
                    aria-label={`${dayLabel[day]} — ${dict.admin.settings.opens}`}
                    className={`${adminControl} w-32`}
                  />
                  <span className="text-ink-subtle">–</span>
                  <input
                    type="time"
                    name={`hours_${day}_close`}
                    defaultValue={window?.[1] ?? ''}
                    aria-label={`${dayLabel[day]} — ${dict.admin.settings.closes}`}
                    className={`${adminControl} w-32`}
                  />
                </li>
              )
            })}
          </ul>
        </Panel>

        <Panel className="grid gap-4 sm:grid-cols-2">
          <AdminField label={dict.admin.settings.deliveryNoteEn} htmlFor="delivery_note_en">
            <textarea
              id="delivery_note_en"
              name="delivery_note_en"
              rows={2}
              defaultValue={settings.delivery_note_en ?? ''}
              className={`${adminControl} resize-y`}
            />
          </AdminField>
          <AdminField label={dict.admin.settings.deliveryNoteAm} htmlFor="delivery_note_am">
            <textarea
              id="delivery_note_am"
              name="delivery_note_am"
              rows={2}
              lang="am"
              defaultValue={settings.delivery_note_am ?? ''}
              className={`${adminControl} resize-y`}
            />
          </AdminField>
        </Panel>

        <SubmitButton
          variant="accent"
          pendingLabel={dict.admin.menu.saving}
          className="self-start px-8"
        >
          {dict.admin.menu.save}
        </SubmitButton>
      </form>
    </>
  )
}
