import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/admin/login-form'
import { getStaffDictionary } from '@/lib/admin/locale'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'
import { Panel } from '@/components/admin/bits'
import { DiamondRule } from '@/components/ui/tibeb'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { dict } = await getStaffDictionary()
  const { next } = await searchParams

  if (isSupabaseConfigured) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    // Already signed in — bouncing straight through is kinder than showing a
    // login form that will just redirect after they type.
    if (user) redirect('/admin')
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="eyebrow">{dict.brand.name}</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-brown-900">
            {dict.admin.title}
          </h1>
          <DiamondRule className="mt-4" />
        </div>

        <Panel>
          {isSupabaseConfigured ? (
            <LoginForm dict={dict} next={next ?? '/admin'} />
          ) : (
            <p className="text-sm text-ink-subtle">{dict.admin.notConfigured}</p>
          )}
        </Panel>
      </div>
    </main>
  )
}
