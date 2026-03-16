'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  locationId: string
  action: 'approved' | 'rejected'
}

export default function ApproveButton({ locationId, action }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    try {
      setLoading(true)

      const res = await fetch('/api/admin/locations/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId,
          status: action,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        alert(json.error || 'Failed to update status')
        return
      }

      router.refresh()
    } catch {
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const isApprove = action === 'approved'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white ${
        isApprove
          ? 'bg-emerald-600 hover:bg-emerald-500'
          : 'bg-rose-600 hover:bg-rose-500'
      } disabled:opacity-60`}
    >
      {loading ? 'Working...' : isApprove ? 'Approve' : 'Reject'}
    </button>
  )
}