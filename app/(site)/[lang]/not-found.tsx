import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DiamondRule } from '@/components/ui/tibeb'
import { getDictionary, defaultLocale } from '@/lib/i18n/config'
import { routes } from '@/lib/routes'

/**
 * A not-found rendered inside the [lang] segment cannot read `params`, so it
 * falls back to English. Someone who has landed on a URL that does not exist
 * has bigger problems than the language of the apology.
 */
export default function NotFound() {
  const dict = getDictionary(defaultLocale)

  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-canvas px-6 pt-18">
      <div className="flex max-w-md flex-col items-center text-center">
        <p className="font-display text-7xl font-semibold text-brown-200">404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-brown-900">
          {dict.notFound.title}
        </h1>
        <DiamondRule className="mt-5" />
        <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-muted">{dict.notFound.body}</p>
        <Button asChild className="mt-8">
          <Link href={routes.home(defaultLocale)}>{dict.notFound.cta}</Link>
        </Button>
      </div>
    </main>
  )
}
