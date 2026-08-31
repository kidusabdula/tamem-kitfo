import { AdminField, PageHeader, Panel, SubmitButton, adminControl } from '@/components/admin/bits'
import { requireStaff } from '@/lib/admin/auth'
import { getStaffDictionary } from '@/lib/admin/locale'
import { editableSlots } from '@/lib/content/editable'
import { getDictionary } from '@/lib/i18n/config'
import { resetContentAction, saveContentAction } from '../../actions'

export default async function AdminContentPage() {
  const { locale, dict } = await getStaffDictionary()
  const session = await requireStaff()
  if (!session) return null

  const { data: rows } = await session.supabase.from('site_content').select('*')
  const overrides = new Map((rows ?? []).map((row) => [row.key, row]))

  /*
   * Each slot shows the built-in wording as the placeholder, in both
   * languages, so the owner can see what they are replacing rather than
   * editing a blank box and guessing.
   */
  const enDict = getDictionary('en')
  const amDict = getDictionary('am')

  return (
    <>
      <PageHeader title={dict.admin.content.title} />

      <Panel className="mb-5">
        <p className="text-sm leading-relaxed text-ink-subtle">{dict.admin.content.intro}</p>
      </Panel>

      <ul className="flex flex-col gap-3">
        {editableSlots.map((slot) => {
          const current = overrides.get(slot.key)

          return (
            <li key={slot.key}>
              <Panel>
                <p className="mb-3 text-sm font-semibold text-brown-900">{slot.label[locale]}</p>

                <form action={saveContentAction} className="flex flex-col gap-3">
                  <input type="hidden" name="key" value={slot.key} />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <AdminField
                      label={dict.admin.content.valueEn}
                      htmlFor={`${slot.key}-en`}
                    >
                      <CopyInput
                        id={`${slot.key}-en`}
                        name="value_en"
                        multiline={slot.multiline}
                        defaultValue={current?.value_en ?? ''}
                        placeholder={slot.fallback(enDict)}
                      />
                    </AdminField>

                    <AdminField
                      label={dict.admin.content.valueAm}
                      htmlFor={`${slot.key}-am`}
                    >
                      <CopyInput
                        id={`${slot.key}-am`}
                        name="value_am"
                        lang="am"
                        multiline={slot.multiline}
                        defaultValue={current?.value_am ?? ''}
                        placeholder={slot.fallback(amDict)}
                      />
                    </AdminField>
                  </div>

                  <SubmitButton
                    variant="quiet"
                    pendingLabel={dict.admin.menu.saving}
                    className="self-start"
                  >
                    {dict.admin.menu.save}
                  </SubmitButton>
                </form>

                {current ? (
                  <form action={resetContentAction} className="mt-2">
                    <input type="hidden" name="key" value={slot.key} />
                    <SubmitButton variant="quiet" className="text-ink-subtle">
                      {dict.admin.content.reset}
                    </SubmitButton>
                  </form>
                ) : null}
              </Panel>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function CopyInput({
  id,
  name,
  lang,
  multiline,
  defaultValue,
  placeholder,
}: {
  id: string
  name: string
  lang?: string
  multiline?: boolean
  defaultValue: string
  placeholder: string
}) {
  if (multiline) {
    return (
      <textarea
        id={id}
        name={name}
        lang={lang}
        rows={3}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`${adminControl} resize-y`}
      />
    )
  }
  return (
    <input
      id={id}
      name={name}
      lang={lang}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={adminControl}
    />
  )
}
