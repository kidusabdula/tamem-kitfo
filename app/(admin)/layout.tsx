import type { Metadata, Viewport } from 'next'
import '@/app/globals.css'

import { fontVariables } from '@/lib/fonts'
import { htmlLang } from '@/lib/i18n/config'
import { getStaffDictionary } from '@/lib/admin/locale'

/**
 * The CMS is a second root layout, a sibling of the public site's. It shares
 * the design tokens and fonts but none of the site chrome — no cart, no
 * marketing header, no scroll-reveal script.
 */

export const metadata: Metadata = {
  title: 'Tamem Kitfo — Staff',
  // Never index the CMS, and never let a signed-in staff member's screen show
  // up in a search result.
  robots: { index: false, follow: false, nocache: true },
}

export const viewport: Viewport = {
  themeColor: '#3B2318',
  width: 'device-width',
  initialScale: 1,
}

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getStaffDictionary()

  return (
    <html lang={htmlLang[locale]} className={fontVariables} suppressHydrationWarning>
      <head>
        {/*
          Same opt-in mechanism the public site uses for scroll reveals: without
          this attribute, CSS never hides any content and the admin screens stay
          fully readable even when JavaScript fails.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.dataset.js='1'",
          }}
        />
      </head>
      <body className="min-h-dvh bg-canvas text-ink antialiased">{children}</body>
    </html>
  )
}
