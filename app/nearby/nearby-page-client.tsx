'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import ResultCard from '../../components/results/result-card'
import ResultsMap from '../../components/results-map-client'
import { supabase } from '../../lib/supabase'

type LocationItem = {
  id: string
  name: string
  category: string | null
  city: string | null
  country_code: string | null
  hub_code: string | null
  terminal: string | null
  near_gate: string | null
  train_platform: string | null
  power: string | null
  usb: string | null
  table_type: string | null
  mobile_signal: string | null
  wifi_available: boolean | null
  directions: string | null
  lat: number | null
  lng: number | null
  photo_url: string | null
  confirmation_count: number | null
  last_confirmed_at: string | null
  reliability_score: number | string | null
  distance_meters?: number | null
}

function normaliseCategory(category: string | null) {
  if (!category) return null
  if (category === 'train_station') return 'rail_station'
  return category
}

export default function NearbyPageClient() {
  const searchParams = useSearchParams()
  const selectedCategory = normaliseCategory(searchParams.get('category'))

  const [locations, setLocations] = useState<LocationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const categoryLabel = useMemo(() => {
    if (selectedCategory === 'cafe') return 'cafes'
    if (selectedCategory === 'airport') return 'airports'
    if (selectedCategory === 'rail_station') return 'train stations'
    return 'places'
  }, [selectedCategory])

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        setError('Location access denied.')
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    )
  }, [])

 useEffect(() => {
  if (!coords) return

  const currentCoords = coords

  async function fetchNearby() {
    setLoading(true)
    setError('')

    let data: LocationItem[] | null = null
    let rpcError: { message: string } | null = null

    const firstAttempt = await supabase.rpc('get_nearby_locations', {
      p_lat: currentCoords.lat,
      p_lng: currentCoords.lng,
      p_radius_meters: 1000,
    })

    if (firstAttempt.error) {
      const secondAttempt = await supabase.rpc('get_nearby_locations', {
        user_lat: currentCoords.lat,
        user_lng: currentCoords.lng,
        radius_meters: 1000,
      })

      data = (secondAttempt.data as LocationItem[] | null) ?? null
      rpcError = secondAttempt.error
    } else {
      data = (firstAttempt.data as LocationItem[] | null) ?? null
    }

    if (rpcError) {
      setError(rpcError.message)
      setLocations([])
      setLoading(false)
      return
    }

    let results = data ?? []

    if (selectedCategory) {
      results = results.filter((location) => location.category === selectedCategory)
    }

    setLocations(results)
    setLoading(false)
  }

  fetchNearby()
}, [coords, selectedCategory])

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-white/80 hover:text-white"
        >
          ← Back to Work Spots
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Work-friendly {categoryLabel} near you
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75 sm:text-base">
          Showing approved spots within roughly 1 km of your current location.
        </p>

        {loading && (
          <div className="mt-6 rounded-[2rem] border border-white/20 bg-white/10 p-6 text-white/80 backdrop-blur-xl">
            Finding nearby spots...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-[2rem] border border-red-300/40 bg-red-500/10 p-6 text-red-100 backdrop-blur-xl">
            {error}
          </div>
        )}

        {!loading && !error && locations.length === 0 && (
          <div className="mt-6 rounded-[2rem] border border-white/20 bg-white/10 p-6 text-white/80 backdrop-blur-xl">
            <p className="font-medium text-white">No nearby locations found yet.</p>
            <p className="mt-2">Try another area later, or submit a spot you know.</p>

            <div className="mt-4">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Submit a location
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && locations.length > 0 && (
          <>
            <section className="mt-6">
              <ResultsMap locations={locations} />
            </section>

            <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {locations.map((location) => (
                <ResultCard key={location.id} location={location} />
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  )
}