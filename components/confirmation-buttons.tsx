'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

type ConfirmationType = 'still_works' | 'no_power' | 'crowded' | 'unusable'

type Props = {
  locationId: string
}

const BUTTONS: {
  type: ConfirmationType
  label: string
  className: string
}[] = [
  {
    type: 'still_works',
    label: '✅ Still works',
    className:
      'bg-emerald-500/20 text-emerald-100 border-emerald-300/30 hover:bg-emerald-500/30',
  },
  {
    type: 'no_power',
    label: '❌ No power',
    className:
      'bg-rose-500/20 text-rose-100 border-rose-300/30 hover:bg-rose-500/30',
  },
  {
    type: 'crowded',
    label: '⚠️ Crowded',
    className:
      'bg-amber-500/20 text-amber-100 border-amber-300/30 hover:bg-amber-500/30',
  },
  {
    type: 'unusable',
    label: '🚫 Unusable',
    className:
      'bg-slate-500/20 text-slate-100 border-slate-300/30 hover:bg-slate-500/30',
  },
]

export default function ConfirmationButtons({ locationId }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState<ConfirmationType | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submitConfirmation(type: ConfirmationType) {
    try {
      setSubmitting(type)
      setMessage('')
      setError('')

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Please sign in to confirm a location.')
        return
      }

      const res = await fetch('/api/locations/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          locationId,
          confirmationType: type,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit confirmation.')
        return
      }

      setMessage(data.updated
        ? 'Thanks — your confirmation was updated.'
        : 'Thanks — confirmation submitted.')

      router.refresh()
    } catch {
      setError('Something went wrong while submitting.')
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-2 text-sm font-semibold text-white/90">
          Confirm current status
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {BUTTONS.map((button) => (
            <button
              key={button.type}
              type="button"
              disabled={submitting !== null}
              onClick={() => submitConfirmation(button.type)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${button.className}`}
            >
              {submitting === button.type ? 'Submitting...' : button.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {error}
        </div>
      )}
    </div>
  )
}