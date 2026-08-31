import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { defaultLocale, isLocale } from '@/lib/i18n/config'

/**
 * Two jobs:
 *
 * 1. Send un-prefixed public URLs to a locale. "/" and "/menu" become
 *    "/en/menu", honouring the browser's Accept-Language when it asks for
 *    Amharic. Everything the visitor sees afterwards is a statically
 *    prerendered page.
 *
 * 2. Refresh the Supabase auth session on /admin requests. Server Components
 *    cannot write cookies, so without this a staff member's session would
 *    silently expire mid-shift.
 */

const PUBLIC_FILE = /\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|json|webmanifest)$/i

function preferredLocale(request: NextRequest) {
  const header = request.headers.get('accept-language') ?? ''
  // Amharic only needs an explicit signal; English is the safe default.
  return /\bam\b/i.test(header) ? 'am' : defaultLocale
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return updateSession(request)
  }

  const first = pathname.split('/').filter(Boolean)[0]
  if (first && isLocale(first)) return NextResponse.next()

  const locale = preferredLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // Without credentials there is no session to refresh. The admin pages
  // themselves render a clear "not configured" state.
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // getUser() revalidates against Supabase. getSession() would only decode the
  // cookie, which a client can forge — never gate access on it.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith('/admin/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
