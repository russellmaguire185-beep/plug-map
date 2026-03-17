'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

type NearbySpot = {
  id: string
  name: string
  city: string | null
  hub_code?: string | null
  terminal?: string | null
  distance_meters?: number | null
}

export default function NearbySpots() {
  const [spots, setSpots] = useState<NearbySpot[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function findNearby() {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported in this browser.')
      return
    }

    setLoading(true)
    setErrorMessage(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude

        const { data, error } = await supabase.rpc('get_nearby_locations', {
          p_lat: lat,
          p_lng: lng,
          p_radius_meters: 500000,
        })

        if (error) {
          console.error('Nearby RPC error:', error)
          setErrorMessage(error.message)
          setSpots([])
          setLoading(false)
          return
        }

        setSpots(data || [])
        setLoading(false)
      },
      (geoError) => {
        console.error('Geolocation error:', geoError)
        setErrorMessage('Unable to access your location.')
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }

  return (
    <div className="rounded-[2rem] border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Nearby work spots</h2>
          <p className="mt-1 text-xs text-white/65">
            Find reliable places near your current location
          </p>
        </div>

        <button
          onClick={findNearby}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-60 sm:self-auto"
        >
          📍 {loading ? 'Searching...' : 'Find nearby'}
        </button>
      </div>

      {errorMessage && (
        <div className="mt-3 border-t border-white/10 pt-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && spots.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
          {spots.slice(0, 5).map((spot) => (
            <div
              key={spot.id}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85"
            >
              <div className="font-medium text-white">{spot.name}</div>
              <div className="text-white/65">
                {[spot.city, spot.hub_code, spot.terminal ? `Terminal ${spot.terminal}` : null]
                  .filter(Boolean)
                  .join(' • ')}
              </div>
              {typeof spot.distance_meters === 'number' && (
                <div className="mt-1 text-xs text-cyan-200">
                  {Math.round(spot.distance_meters)}m away
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !errorMessage && spots.length === 0 && (
        <div className="mt-3 border-t border-white/10 pt-3 text-sm text-white/65">
          Tap &quot;Find nearby&quot; to look for approved spots around you.
        </div>
      )}
    </div>
  )
}