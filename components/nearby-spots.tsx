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

const distanceOptions = [
  { label: '10m', value: 10 },
  { label: '100m', value: 100 },
  { label: '1km', value: 1000 },
  { label: '10km', value: 10000 },
  { label: '20km', value: 20000 },
]

function formatDistance(distanceMeters?: number | null) {
  if (typeof distanceMeters !== 'number') return null

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)}m away`
  }

  const km = distanceMeters / 1000
  return `${km.toFixed(km >= 10 ? 0 : 1)}km away`
}

export default function NearbySpots() {
  const [spots, setSpots] = useState<NearbySpot[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [radiusMeters, setRadiusMeters] = useState(1000)

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
          p_radius_meters: radiusMeters,
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
    <div>
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Nearby work spots</h2>
            <p className="mt-1 text-sm text-white/65">
              Find reliable places near your current location
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(Number(e.target.value))}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white outline-none transition hover:bg-white/15 sm:w-[130px]"
            >
              {distanceOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="text-slate-900"
                >
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={findNearby}
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
            >
              📍 {loading ? 'Searching...' : 'Find nearby'}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="border-t border-white/10 pt-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && spots.length > 0 && (
          <div className="space-y-3 border-t border-white/10 pt-4">
            {spots.slice(0, 5).map((spot) => (
              <div
                key={spot.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85"
              >
                <div className="font-medium text-white">{spot.name}</div>

                <div className="mt-1 text-white/65">
                  {[spot.city, spot.hub_code, spot.terminal ? `Terminal ${spot.terminal}` : null]
                    .filter(Boolean)
                    .join(' • ')}
                </div>

                {typeof spot.distance_meters === 'number' && (
                  <div className="mt-2 text-xs font-medium text-cyan-200">
                    {formatDistance(spot.distance_meters)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && !errorMessage && spots.length === 0 && (
          <div className="border-t border-white/10 pt-3 text-sm text-white/65">
            Choose a distance and tap &quot;Find nearby&quot; to search around you.
          </div>
        )}
      </div>
    </div>
  )
}