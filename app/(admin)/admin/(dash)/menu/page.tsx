import Image from 'next/image'

import {
  AdminField,
  ConfirmSubmit,
  EmptyState,
  PageHeader,
  Panel,
  SubmitButton,
  Toggle,
  adminControl,
} from '@/components/admin/bits'
import { requireStaff } from '@/lib/admin/auth'
import { getStaffDictionary } from '@/lib/admin/locale'
import { pick, type Dictionary, type Locale } from '@/lib/i18n/config'
import { resolveDishImage } from '@/lib/data/images'
import { formatETB } from '@/lib/utils'
import type { Dish, MenuCategory } from '@/lib/supabase/database.types'
import { deleteDishAction, saveCategoryAction, saveDishAction } from '../../actions'

export default async function AdminMenuPage() {
  const { locale, dict } = await getStaffDictionary()
  const session = await requireStaff()
  if (!session) return null

  const [dishesResult, categoriesResult] = await Promise.all([
    session.supabase.from('dishes').select('*').order('sort_order').order('name_en'),
    session.supabase.from('menu_categories').select('*').order('sort_order'),
  ])

  const dishes = dishesResult.data ?? []
  const categories = categoriesResult.data ?? []

  return (
    <>
      <PageHeader title={dict.admin.menu.title} count={dishes.length} />

      {/*
        <details> rather than a modal: no client state, works without
        JavaScript, and the browser handles the open/close for free.
      */}
      <details className="mb-5 rounded-2xl border border-brown-200/70 bg-surface shadow-[var(--shadow-card)]">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-accent-ink">
          + {dict.admin.menu.addDish}
        </summary>
        <div className="border-t border-[var(--color-hairline)] p-5">
          <DishForm dict={dict} locale={locale} categories={categories} />
        </div>
      </details>

      {dishes.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {dishes.map((dish) => {
            const image = resolveDishImage(dish.slug, dish.image_path)
            return (
              <li key={dish.id}>
                <details className="rounded-2xl border border-brown-200/70 bg-surface shadow-[var(--shadow-card)]">
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                    {image ? (
                      <Image
                        src={image}
                        alt=""
                        width={56}
                        height={56}
                        className="size-14 shrink-0 rounded-xl object-cover"
                        // CMS uploads have no build-time blur placeholder.
                        unoptimized={typeof image === 'string'}
                      />
                    ) : (
                      <span className="size-14 shrink-0 rounded-xl bg-brown-100" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-brown-900">
                        {pick(dish, 'name', locale)}
                      </span>
                      <span className="block text-sm text-ink-subtle">
                        {formatETB(Number(dish.price_etb), locale)}
                        {!dish.is_available ? ` · ${dict.admin.menu.hidden}` : ''}
                      </span>
                    </span>
                  </summary>
                  <div className="border-t border-[var(--color-hairline)] p-5">
                    <DishForm
                      dict={dict}
                      locale={locale}
                      categories={categories}
                      dish={dish}
                    />
                  </div>
                </details>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState message={dict.admin.menu.empty} />
      )}

      <h2 className="mt-10 mb-3 font-display text-lg font-semibold text-brown-900">
        {dict.admin.menu.category}
      </h2>
      <Panel>
        <ul className="mb-4 flex flex-col gap-2">
          {categories.map((category) => (
            <li key={category.id}>
              <form action={saveCategoryAction} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={category.id} />
                <input
                  name="name_en"
                  defaultValue={category.name_en}
                  aria-label={dict.admin.menu.nameEn}
                  className={`${adminControl} flex-1 min-w-40`}
                />
                <input
                  name="name_am"
                  defaultValue={category.name_am ?? ''}
                  aria-label={dict.admin.menu.nameAm}
                  className={`${adminControl} flex-1 min-w-40`}
                />
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={category.sort_order}
                  aria-label="Sort"
                  className={`${adminControl} w-20`}
                />
                <SubmitButton variant="quiet" pendingLabel={dict.admin.menu.saving}>
                  {dict.admin.menu.save}
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>

        <form
          action={saveCategoryAction}
          className="flex flex-wrap items-end gap-2 border-t border-[var(--color-hairline)] pt-4"
        >
          <input
            name="name_en"
            placeholder={dict.admin.menu.nameEn}
            required
            className={`${adminControl} flex-1 min-w-40`}
          />
          <input
            name="name_am"
            placeholder={dict.admin.menu.nameAm}
            className={`${adminControl} flex-1 min-w-40`}
          />
          <SubmitButton pendingLabel={dict.admin.menu.saving}>+</SubmitButton>
        </form>
      </Panel>
    </>
  )
}

function DishForm({
  dict,
  locale,
  categories,
  dish,
}: {
  dict: Dictionary
  locale: Locale
  categories: MenuCategory[]
  dish?: Dish
}) {
  const id = dish?.id ?? 'new'

  return (
    <div className="flex flex-col gap-5">
      <form action={saveDishAction} className="flex flex-col gap-4">
        {dish ? <input type="hidden" name="id" value={dish.id} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label={dict.admin.menu.nameEn} htmlFor={`name_en-${id}`}>
            <input
              id={`name_en-${id}`}
              name="name_en"
              required
              defaultValue={dish?.name_en ?? ''}
              className={adminControl}
            />
          </AdminField>
          <AdminField label={dict.admin.menu.nameAm} htmlFor={`name_am-${id}`}>
            <input
              id={`name_am-${id}`}
              name="name_am"
              defaultValue={dish?.name_am ?? ''}
              lang="am"
              className={adminControl}
            />
          </AdminField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label={dict.admin.menu.descriptionEn} htmlFor={`desc_en-${id}`}>
            <textarea
              id={`desc_en-${id}`}
              name="description_en"
              rows={3}
              defaultValue={dish?.description_en ?? ''}
              className={`${adminControl} resize-y`}
            />
          </AdminField>
          <AdminField label={dict.admin.menu.descriptionAm} htmlFor={`desc_am-${id}`}>
            <textarea
              id={`desc_am-${id}`}
              name="description_am"
              rows={3}
              lang="am"
              defaultValue={dish?.description_am ?? ''}
              className={`${adminControl} resize-y`}
            />
          </AdminField>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <AdminField label={dict.admin.menu.price} htmlFor={`price-${id}`}>
            <input
              id={`price-${id}`}
              name="price_etb"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              required
              defaultValue={dish ? String(dish.price_etb) : ''}
              className={adminControl}
            />
          </AdminField>
          <AdminField label={dict.admin.menu.category} htmlFor={`category-${id}`}>
            <select
              id={`category-${id}`}
              name="category_id"
              defaultValue={dish?.category_id ?? ''}
              className={adminControl}
            >
              <option value="">—</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {pick(category, 'name', locale)}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label={dict.admin.menu.spice} htmlFor={`spice-${id}`}>
            <select
              id={`spice-${id}`}
              name="spice_level"
              defaultValue={String(dish?.spice_level ?? 0)}
              className={adminControl}
            >
              {[0, 1, 2, 3].map((level) => (
                <option key={level} value={level}>
                  {level === 0 ? '—' : '🌶'.repeat(level)}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="#" htmlFor={`sort-${id}`}>
            <input
              id={`sort-${id}`}
              name="sort_order"
              type="number"
              defaultValue={dish?.sort_order ?? 0}
              className={adminControl}
            />
          </AdminField>
        </div>

        <AdminField label={dict.admin.menu.image} htmlFor={`image-${id}`}>
          <input
            id={`image-${id}`}
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className={`${adminControl} file:mr-3 file:rounded-lg file:border-0 file:bg-brown-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brown-800`}
          />
        </AdminField>

        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle
            name="is_available"
            label={dict.admin.menu.available}
            defaultChecked={dish?.is_available ?? true}
          />
          <Toggle
            name="is_popular"
            label={dict.admin.menu.popular}
            defaultChecked={dish?.is_popular ?? false}
          />
        </div>

        <SubmitButton
          variant="accent"
          pendingLabel={dict.admin.menu.saving}
          className="self-start px-6"
        >
          {dict.admin.menu.save}
        </SubmitButton>
      </form>

      {/*
        Delete is its own form. Nesting it inside the save form would make one
        button submit the other's fields.
      */}
      {dish ? (
        <form action={deleteDishAction} className="border-t border-[var(--color-hairline)] pt-4">
          <input type="hidden" name="id" value={dish.id} />
          <ConfirmSubmit message={dict.admin.menu.confirmDelete}>
            {dict.admin.menu.delete}
          </ConfirmSubmit>
        </form>
      ) : null}
    </div>
  )
}
