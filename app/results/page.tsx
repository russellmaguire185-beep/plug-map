'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import ConfirmationButtons from '../../components/confirmation-buttons'

const ResultsMap = dynamic(() => import('../../components/results-map'), {
  ssr: false,
})

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
  directions: string | null
  lat: number | null
  lng: number | null
  photo_url: string | null
}

function labelValue(value: string | null) {
  if (!value) return 'Unknown'

  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function ResultsPage() {
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState<'list' | 'map'>('list')

  const filters = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        q: '',
        category: 'all',
      }
    }

    const params = new URLSearchParams(window.location.search)

    return {
      q: params.get('q')?.trim() || '',
      category: params.get('category')?.trim() || 'all',
    }
  }, [])

  useEffect(() => {
    async function loadLocations() {
      setLoading(true)
      setError('')

      let query = supabase
      .from('locations')
      .select(
        'id, name, category, city, country_code, hub_code, terminal, near_gate, train_platform, power, usb, table_type, directions, lat, lng, photo_url'
      )
      .eq('status', 'approved')
      .order('reliability_score', { ascending: false })
      .order('confirmation_count', { ascending: false })
      .order('created_at', { ascending: false })

      if (filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      if (filters.q) {
        query = query.or(
          [
            `name.ilike.%${filters.q}%`,
            `city.ilike.%${filters.q}%`,
            `hub_code.ilike.%${filters.q}%`,
            `terminal.ilike.%${filters.q}%`,
            `near_gate.ilike.%${filters.q}%`,
            `train_platform.ilike.%${filters.q}%`,
            `directions.ilike.%${filters.q}%`,
          ].join(',')
        )
      }

      const { data, error } = await query

      if (error) {
        setError(error.message)
        setLocations([])
        setLoading(false)
        return
      }

      setLocations((data as LocationItem[]) ?? [])
      setLoading(false)
    }

    loadLocations()
  }, [filters.category, filters.q])

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/"
              className="inline-flex text-sm font-medium text-white/80 hover:text-white"
            >
              ← Back to Plug Map
            </Link>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Approved locations
            </h1>

            <p className="mt-2 text-sm text-white/75">
              Browse submitted work-friendly spots with power, seating and directions.
            </p>
          </div>

          <div className="inline-flex rounded-2xl border border-white/20 bg-white/10 p-1 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setView('list')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                view === 'list'
                  ? 'bg-white text-slate-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              List view
            </button>
            <button
              type="button"
              onClick={() => setView('map')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                view === 'map'
                  ? 'bg-white text-slate-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Map view
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-[2rem] border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
          <div className="flex flex-wrap gap-3 text-sm text-white/85">
            <div>
              <span className="font-semibold">Search:</span>{' '}
              {filters.q || 'None'}
            </div>
            <div>
              <span className="font-semibold">Category:</span>{' '}
              {filters.category === 'all' ? 'All categories' : labelValue(filters.category)}
            </div>
            <div>
              <span className="font-semibold">Results:</span> {locations.length}
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6 text-white/80 backdrop-blur-xl">
            Loading approved locations...
          </div>
        )}

        {error && (
          <div className="rounded-[2rem] border border-red-300/40 bg-red-500/10 p-6 text-red-100 backdrop-blur-xl">
            {error}
          </div>
        )}

        {!loading && !error && locations.length === 0 && (
          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6 text-white/80 backdrop-blur-xl">
            No approved locations found for these filters yet.
          </div>
        )}

        {!loading && !error && locations.length > 0 && view === 'map' && (
          <ResultsMap locations={locations} />
        )}

        {!loading && !error && locations.length > 0 && view === 'list' && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {locations.map((location) => (
              <div
                key={location.id}
                className="overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 backdrop-blur-xl"
              >
                {location.photo_url && (
                  <img
                    src={location.photo_url}
                    alt={location.name}
                    className="h-48 w-full object-cover"
                  />
                )}

                <div className="space-y-4 p-5">
                  <div>
                    <h2 className="text-xl font-semibold">{location.name}</h2>
                    <p className="mt-1 text-sm text-white/75">
                      {[location.city, location.country_code].filter(Boolean).join(', ')}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                      {labelValue(location.category)}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                      Power: {labelValue(location.power)}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                      USB: {labelValue(location.usb)}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                      {labelValue(location.table_type)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-white/80">
                    {location.hub_code && <div>Hub code: {location.hub_code}</div>}
                    {location.terminal && <div>Terminal: {location.terminal}</div>}
                    {location.near_gate && <div>Near gate: {location.near_gate}</div>}
                    {location.train_platform && <div>Platform: {location.train_platform}</div>}
                  </div>

                  {location.directions && (
                    <p className="text-sm text-white/85">{location.directions}</p>
                  )}

                  <ConfirmationButtons locationId={location.id} />

                  {location.lat !== null && location.lng !== null && (
                    <a
                      href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                    >
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}