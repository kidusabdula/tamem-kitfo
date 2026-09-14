import {
  HoursEditor,
  PageHeader,
  Panel,
  PanelSection,
  SubmitButton,
  TextAreaField,
  TextField,
  Toggle,
} from '@/components/admin/bits'
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

  const t = dict.admin.settings

  return (
    <>
      <PageHeader title={t.title} />

      <form action={saveSettingsAction} className="flex flex-col gap-5">
        {/*
          The kill switch sits at the top, on its own, because it is the one
          control someone reaches for in a hurry — the kitchen is swamped and
          online orders have to stop now.
        */}
        <Panel>
          <Toggle
            name="is_accepting_orders"
            label={t.acceptingOrders}
            hint={t.acceptingHint}
            defaultChecked={settings.is_accepting_orders}
          />
        </Panel>

        <Panel className="grid gap-4 sm:grid-cols-2">
          <TextAreaField
            name="phones"
            label={t.phones}
            hint={t.phonesHint}
            rows={3}
            mono
            defaultValue={settings.phones.join('\n')}
            className="sm:col-span-2"
          />

          <TextField
            name="whatsapp_number"
            label={t.whatsapp}
            type="tel"
            defaultValue={settings.whatsapp_number}
          />

          <TextField name="email" label={t.email} type="email" defaultValue={settings.email} />

          <TextAreaField name="address_en" label={t.addressEn} defaultValue={settings.address_en} />

          <TextAreaField
            name="address_am"
            label={t.addressAm}
            lang="am"
            defaultValue={settings.address_am}
          />

          <TextField
            name="map_url"
            label={t.mapUrl}
            type="url"
            inputMode="url"
            defaultValue={settings.map_url}
            className="sm:col-span-2"
          />
        </Panel>

        <PanelSection title={t.hours} hint={t.hoursHint}>
          <HoursEditor
            days={DAYS}
            dayLabel={DAY_LABELS[locale]}
            hours={settings.hours}
            opensLabel={t.opens}
            closesLabel={t.closes}
          />
        </PanelSection>

        <Panel className="grid gap-4 sm:grid-cols-2">
          <TextAreaField
            name="delivery_note_en"
            label={t.deliveryNoteEn}
            defaultValue={settings.delivery_note_en}
          />
          <TextAreaField
            name="delivery_note_am"
            label={t.deliveryNoteAm}
            lang="am"
            defaultValue={settings.delivery_note_am}
          />
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
