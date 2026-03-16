import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false as const, reason: 'unauthenticated' }
  }

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (adminError || !adminRow) {
    return { ok: false as const, reason: 'unauthorized', user }
  }

  return { ok: true as const, user, supabase }
}