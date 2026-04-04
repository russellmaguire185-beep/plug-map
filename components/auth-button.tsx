'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthButton() {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function refreshUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        setEmail(session?.user?.email ?? null)
      } catch (error) {
        console.error('Auth refreshUser error:', error)
        if (!mounted) return
        setEmail(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    refreshUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setEmail(session?.user?.email ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return <div className="text-sm text-white/70">Loading...</div>
  }

  if (!email) {
    return (
      <button
        onClick={signIn}
        className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
      >
        Sign in with Google
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white/80">{email}</span>
      <button
        onClick={signOut}
        className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
      >
        Sign out
      </button>
    </div>
  )
}