'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

type NearbySpot = {
  id: string
  name: string
  city: string | null
}

export default function NearbySpots() {
  const [spots, setSpots] = useState<NearbySpot[]>([])
  const [loading, setLoading] = useState(false)

  async function findNearby() {
    if (!navigator.geolocation) return

    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude

        const { data } = await supabase.rpc('get_nearby_locations', {
          user_lat: lat,
          user_lng: lng,
          radius_meters: 1000,
        })

        setSpots(data || [])
        setLoading(false)
      },
      () => {
        setLoading(false)
      }
    )
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Nearby work spots</h2>
          <p className="mt-1 text-xs text-white/65">
            Find reliable places near your current location
          </p>
        </div>

        <button
          onClick={findNearby}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 sm:self-auto"
        >
          📍 {loading ? 'Searching...' : 'Find nearby'}
        </button>
      </div>

      {spots.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
          {spots.slice(0, 3).map((spot) => (
            <div key={spot.id} className="text-sm text-white/85">
              {spot.name}
              {spot.city ? ` (${spot.city})` : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}