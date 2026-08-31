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
import { resolveImage } from '@/lib/data/images'
import type { GalleryCategory } from '@/lib/supabase/database.types'
import { deleteGalleryAction, updateGalleryAction, uploadGalleryAction } from '../../actions'

const CATEGORIES: readonly GalleryCategory[] = ['food', 'dining', 'events', 'drinks']

export default async function AdminGalleryPage() {
  const { dict } = await getStaffDictionary()
  const session = await requireStaff()
  if (!session) return null

  const { data: images } = await session.supabase
    .from('gallery_images')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false })

  const categoryLabel = dict.gallery.filters

  return (
    <>
      <PageHeader title={dict.admin.gallery.title} count={images?.length ?? 0} />

      <Panel className="mb-6">
        <form action={uploadGalleryAction} className="flex flex-col gap-4">
          <AdminField label={dict.admin.gallery.upload} htmlFor="images">
            {/*
              multiple: the owner uploads a batch from a phone gallery after an
              event, not one photo at a time.
            */}
            <input
              id="images"
              name="images"
              type="file"
              multiple
              required
              accept="image/jpeg,image/png,image/webp,image/avif"
              className={`${adminControl} file:mr-3 file:rounded-lg file:border-0 file:bg-brown-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brown-800`}
            />
          </AdminField>

          <div className="grid gap-4 sm:grid-cols-3">
            <AdminField label={dict.admin.gallery.category} htmlFor="upload-category">
              <select id="upload-category" name="category" className={adminControl}>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabel[category]}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label={dict.admin.gallery.altEn} htmlFor="upload-alt-en">
              <input id="upload-alt-en" name="alt_en" className={adminControl} />
            </AdminField>
            <AdminField label={dict.admin.gallery.altAm} htmlFor="upload-alt-am">
              <input id="upload-alt-am" name="alt_am" lang="am" className={adminControl} />
            </AdminField>
          </div>

          <SubmitButton
            variant="accent"
            pendingLabel={dict.admin.gallery.uploading}
            className="self-start px-6"
          >
            {dict.admin.gallery.upload}
          </SubmitButton>
        </form>
      </Panel>

      {images && images.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => {
            const src = resolveImage(image.storage_path, 'gallery')
            return (
              <li key={image.id}>
                <Panel className="flex h-full flex-col gap-3 p-4">
                  {src ? (
                    <Image
                      src={src}
                      alt={image.alt_en}
                      width={400}
                      height={300}
                      className="aspect-4/3 w-full rounded-xl object-cover"
                      unoptimized={typeof src === 'string'}
                    />
                  ) : (
                    <span className="aspect-4/3 w-full rounded-xl bg-brown-100" />
                  )}

                  <form action={updateGalleryAction} className="flex flex-1 flex-col gap-2.5">
                    <input type="hidden" name="id" value={image.id} />
                    <input
                      name="alt_en"
                      defaultValue={image.alt_en}
                      aria-label={dict.admin.gallery.altEn}
                      className={adminControl}
                    />
                    <input
                      name="alt_am"
                      defaultValue={image.alt_am ?? ''}
                      lang="am"
                      aria-label={dict.admin.gallery.altAm}
                      className={adminControl}
                    />
                    <div className="flex gap-2">
                      <select
                        name="category"
                        defaultValue={image.category}
                        aria-label={dict.admin.gallery.category}
                        className={`${adminControl} flex-1`}
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {categoryLabel[category]}
                          </option>
                        ))}
                      </select>
                      <input
                        name="sort_order"
                        type="number"
                        defaultValue={image.sort_order}
                        aria-label="Sort"
                        className={`${adminControl} w-20`}
                      />
                    </div>
                    <Toggle
                      name="is_published"
                      label={dict.admin.gallery.published}
                      defaultChecked={image.is_published}
                    />
                    <SubmitButton
                      variant="quiet"
                      pendingLabel={dict.admin.menu.saving}
                      className="mt-auto"
                    >
                      {dict.admin.menu.save}
                    </SubmitButton>
                  </form>

                  <form action={deleteGalleryAction}>
                    <input type="hidden" name="id" value={image.id} />
                    <input type="hidden" name="storage_path" value={image.storage_path} />
                    <ConfirmSubmit
                      message={dict.admin.gallery.confirmDelete}
                      className="w-full justify-center"
                    >
                      {dict.admin.menu.delete}
                    </ConfirmSubmit>
                  </form>
                </Panel>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState message={dict.admin.gallery.empty} />
      )}
    </>
  )
}
