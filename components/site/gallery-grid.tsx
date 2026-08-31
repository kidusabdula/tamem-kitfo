'use client'

import * as React from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { resolveImage } from '@/lib/data/images'
import { pick, type Dictionary, type Locale } from '@/lib/i18n/config'
import type { GalleryImage, GalleryCategory } from '@/lib/supabase/database.types'
import { cn } from '@/lib/utils'

const FILTERS: (GalleryCategory | 'all')[] = ['all', 'food', 'dining', 'events', 'drinks']

export function GalleryGrid({
  images,
  locale,
  dict,
}: {
  images: GalleryImage[]
  locale: Locale
  dict: Dictionary
}) {
  const [filter, setFilter] = React.useState<GalleryCategory | 'all'>('all')
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  const visible = React.useMemo(
    () => (filter === 'all' ? images : images.filter((i) => i.category === filter)),
    [images, filter],
  )

  const available = FILTERS.filter(
    (f) => f === 'all' || images.some((i) => i.category === f),
  )

  const close = React.useCallback(() => setOpenIndex(null), [])
  const step = React.useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null ? null : (current + delta + visible.length) % visible.length,
      ),
    [visible.length],
  )

  // Full keyboard control: Escape closes, arrows move. A lightbox you can only
  // operate with a mouse is a lightbox half the audience cannot use.
  React.useEffect(() => {
    if (openIndex === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [openIndex, close, step])

  const current = openIndex === null ? null : visible[openIndex]
  const currentSrc = current ? resolveImage(current.storage_path) : null

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {available.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              'rounded-full px-5 py-2.5 text-sm font-semibold transition-colors',
              filter === f
                ? 'bg-brown-800 text-cream-100'
                : 'bg-surface text-brown-700 hover:bg-brown-100 hover:text-brown-900',
            )}
          >
            {dict.gallery.filters[f]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-16 text-center text-ink-muted">{dict.gallery.empty}</p>
      ) : (
        // CSS columns give a masonry flow that respects each photo's real
        // aspect ratio — cropping everything to squares would waste the
        // photography this site is built around.
        <div className="mt-12 columns-2 gap-3 md:columns-3 [&>*]:mb-3">
          {visible.map((item, index) => {
            const src = resolveImage(item.storage_path)
            if (!src) return null
            const alt = pick(item, 'alt', locale)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenIndex(index)}
                className="group block w-full break-inside-avoid overflow-hidden rounded-lg"
              >
                {typeof src === 'string' ? (
                  // CMS uploads have no intrinsic dimensions available at build
                  // time, so they get a fixed 4:3 frame. Bundled photography
                  // (below) keeps its true aspect ratio and drives the masonry.
                  <span className="relative block aspect-4/3">
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
                    />
                  </span>
                ) : (
                  <Image
                    src={src}
                    alt={alt}
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="h-auto w-full transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      {current && currentSrc ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={pick(current, 'alt', locale)}
          className="fixed inset-0 z-100 flex items-center justify-center bg-espresso/95 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label={dict.nav.closeMenu}
            className="absolute top-5 right-5 grid size-11 place-items-center rounded-full text-cream-100 hover:bg-cream-50/10"
          >
            <X className="size-6" />
          </button>

          {visible.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  step(-1)
                }}
                aria-label={dict.actions.back}
                className="absolute left-3 grid size-11 place-items-center rounded-full text-cream-100 hover:bg-cream-50/10 md:left-6"
              >
                <ChevronLeft className="size-7" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  step(1)
                }}
                aria-label={dict.actions.seeAll}
                className="absolute right-3 grid size-11 place-items-center rounded-full text-cream-100 hover:bg-cream-50/10 md:right-6"
              >
                <ChevronRight className="size-7" />
              </button>
            </>
          ) : null}

          <figure
            className="max-h-[86vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {typeof currentSrc === 'string' ? (
              <Image
                src={currentSrc}
                alt={pick(current, 'alt', locale)}
                width={1600}
                height={1200}
                className="max-h-[78vh] w-auto rounded-lg object-contain"
                sizes="90vw"
              />
            ) : (
              <Image
                src={currentSrc}
                alt={pick(current, 'alt', locale)}
                className="max-h-[78vh] w-auto rounded-lg object-contain"
                sizes="90vw"
              />
            )}
            <figcaption className="mt-3 text-center text-sm text-cream-200/70">
              {pick(current, 'alt', locale)}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </div>
  )
}
