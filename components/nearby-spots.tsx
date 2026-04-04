'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import ResultCard from './results/result-card'

type NearbySpot = {
  id: string
  name: string
  city: string | null
  country_code?: string | null
  category?: string | null
  hub_code?: string | null
  terminal?: string | null
  near_gate?: string | null
  train_platform?: string | null
  distance_meters?: number | null
  power?: string | null
  usb?: string | null
  table_type?: string | null
  directions?: string | null
  lat?: number | null
  lng?: number | null
  photo_url?: string | null
  wifi_available?: boolean | null
  mobile_signal?: string | null
  confirmation_count?: number | null
  last_confirmed_at?: string | null
  reliability_score?: number | string | null
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

function sortSpots(spots: NearbySpot[]) {
  return [...spots].sort((a, b) => {
    const distanceA =
      typeof a.distance_meters === 'number'
        ? a.distance_meters
        : Number.MAX_SAFE_INTEGER

    const distanceB =
      typeof b.distance_meters === 'number'
        ? b.distance_meters
        : Number.MAX_SAFE_INTEGER

    if (distanceA !== distanceB) return distanceA - distanceB

    const reliabilityA =
      typeof a.reliability_score === 'number' ? a.reliability_score : 0

    const reliabilityB =
      typeof b.reliability_score === 'number' ? b.reliability_score : 0

    return reliabilityB - reliabilityA
  })
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

        setSpots(sortSpots((data || []) as NearbySpot[]))
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
      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                Nearby
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Nearby work spots
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Find reliable places near your current location with better odds
                of power, Wi-Fi and proper seating.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="w-full rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-medium text-white outline-none transition hover:bg-white/20 sm:w-[130px]"
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
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
              >
                📍 {loading ? 'Searching...' : 'Find nearby'}
              </button>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && spots.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-300/25 bg-emerald-400/12 px-4 py-3 text-sm text-white/90 backdrop-blur-xl">
              <span className="font-semibold">Closest to you right now.</span>{' '}
              Tap a spot to get directions or confirm if it still works.
            </div>

            <section className="space-y-5">
              {spots.slice(0, 3).map((spot) => (
                <div key={spot.id} className="space-y-2">
                  {typeof spot.distance_meters === 'number' && (
                    <div className="inline-flex rounded-full border border-emerald-300/25 bg-emerald-400/12 px-3 py-1 text-xs font-semibold text-emerald-100">
                      {formatDistance(spot.distance_meters)}
                    </div>
                  )}

                  <ResultCard location={spot} />
                </div>
              ))}
            </section>
          </div>
        )}

        {!loading && !errorMessage && spots.length === 0 && (
          <div className="rounded-2xl border border-white/15 bg-slate-950/45 px-4 py-5 text-sm text-white/75 backdrop-blur-xl">
            Choose a distance and tap{' '}
            <span className="font-medium text-white">&quot;Find nearby&quot;</span>{' '}
            to search around you.
          </div>
        )}
      </div>
    </div>
  )
}