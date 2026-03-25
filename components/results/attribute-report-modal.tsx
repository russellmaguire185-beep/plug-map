'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type Props = {
  locationId: string
  locationName: string
  onClose: () => void
}

export default function AttributeReportModal({
  locationId,
  locationName,
  onClose,
}: Props) {
  const router = useRouter()

  const [power, setPower] = useState('')
  const [usb, setUsb] = useState('')
  const [tableType, setTableType] = useState('')
  const [wifiAvailable, setWifiAvailable] = useState('')
  const [mobileSignal, setMobileSignal] = useState('')
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setSubmitting(true)
      setMessage('')
      setError('')

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Please sign in to suggest details.')
        return
      }

      const res = await fetch('/api/locations/attribute-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          locationId,
          power,
          usb,
          table_type: tableType,
          wifi_available: wifiAvailable,
          mobile_signal: mobileSignal,
          notes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit suggested details.')
        return
      }

      setMessage(
        data.updated
          ? 'Thanks — your suggested details were updated.'
          : 'Thanks — your suggested details were submitted.'
      )

      router.refresh()
    } catch {
      setError('Something went wrong while submitting.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Suggest details for ${locationName}`}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-950 p-5 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">Suggest details</h3>
            <p className="mt-1 text-sm text-white/70">{locationName}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Power">
              <select
                value={power}
                onChange={(e) => setPower(e.target.value)}
                className={inputClassName}
              >
                <option value="">Leave unchanged</option>
                <option value="yes">Yes</option>
                <option value="limited">Limited</option>
                <option value="no">No</option>
                <option value="unknown">Unknown</option>
              </select>
            </Field>

            <Field label="USB">
              <select
                value={usb}
                onChange={(e) => setUsb(e.target.value)}
                className={inputClassName}
              >
                <option value="">Leave unchanged</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="unknown">Unknown</option>
              </select>
            </Field>

            <Field label="Work style">
              <select
                value={tableType}
                onChange={(e) => setTableType(e.target.value)}
                className={inputClassName}
              >
                <option value="">Leave unchanged</option>
                <option value="full_table">Full table</option>
                <option value="small_table">Small table</option>
                <option value="lap_only">Lap only</option>
                <option value="unknown">Unknown</option>
              </select>
            </Field>

            <Field label="Wi-Fi">
              <select
                value={wifiAvailable}
                onChange={(e) => setWifiAvailable(e.target.value)}
                className={inputClassName}
              >
                <option value="">Leave unchanged</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </Field>

            <Field label="Mobile signal">
              <select
                value={mobileSignal}
                onChange={(e) => setMobileSignal(e.target.value)}
                className={inputClassName}
              >
                <option value="">Leave unchanged</option>
                <option value="fast">Fast</option>
                <option value="medium">Medium</option>
                <option value="slow">Slow</option>
                <option value="nothing">Nothing</option>
                <option value="unknown">Unknown</option>
              </select>
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Optional context, e.g. sockets under window seats, Wi-Fi was stable, small standing shelf only..."
              className={inputClassName}
            />
          </Field>

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

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit suggested details'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-white/90">{label}</div>
      {children}
    </label>
  )
}

const inputClassName =
  'w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30'