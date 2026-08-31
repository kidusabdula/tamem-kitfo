import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Section } from '@/components/ui/section'
import { PlainHero } from '@/components/site/page-hero'
import { GalleryGrid } from '@/components/site/gallery-grid'
import { getGallery } from '@/lib/data/queries'
import { getDictionary, isLocale, type Locale } from '@/lib/i18n/config'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)
  return {
    title: dict.gallery.title,
    alternates: {
      canonical: `/${lang}/gallery`,
      languages: { en: '/en/gallery', am: '/am/gallery' },
    },
  }
}

export default async function GalleryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const images = await getGallery()

  return (
    <main id="main">
      <PlainHero eyebrow={dict.gallery.eyebrow} title={dict.gallery.title} />
      <Section tone="canvas" className="pt-12">
        <div className="container-page">
          <GalleryGrid images={images} locale={locale} dict={dict} />
        </div>
      </Section>
    </main>
  )
}
