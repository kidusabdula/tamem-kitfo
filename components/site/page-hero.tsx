import Image, { type StaticImageData } from 'next/image'
import { Reveal } from '@/components/ui/reveal'
import { DiamondRule, TibebBand } from '@/components/ui/tibeb'

/**
 * Inner-page hero. Shorter than the homepage's full-viewport treatment —
 * these pages exist to be read, not to be admired, so the photograph is a
 * band rather than the whole screen.
 */
export function PageHero({
  image,
  eyebrow,
  title,
  body,
}: {
  image: StaticImageData
  eyebrow: string
  title: string
  body?: string
}) {
  return (
    <>
      <section className="relative flex min-h-[52vh] items-end overflow-hidden pt-18">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          className="object-cover"
        />
        <div className="photo-scrim absolute inset-0" />
        <div className="photo-scrim-top absolute inset-x-0 top-0 h-44" />

        <div className="container-page relative w-full pb-14 md:pb-16">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-ember-300">{eyebrow}</p>
            <h1 className="display-lg mt-4 text-cream-50">{title}</h1>
            <DiamondRule className="mt-6" />
            {body ? (
              <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-cream-100/85">
                {body}
              </p>
            ) : null}
          </Reveal>
        </div>
      </section>
      <TibebBand />
    </>
  )
}

/** Title-only header for pages with no photograph to spare (order, status). */
export function PlainHero({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body?: string
}) {
  return (
    <section className="bg-surface-sunk pt-32 pb-14">
      <div className="container-page">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display-lg mt-4 text-brown-900">{title}</h1>
          <DiamondRule className="mt-6" />
          {body ? (
            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-ink-muted">{body}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  )
}
