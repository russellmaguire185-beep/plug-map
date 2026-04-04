'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import NearbySpots from '../../components/nearby-spots'
import ResultCard from '../../components/results/result-card'

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
  mobile_signal: string | null
  wifi_available: boolean | null
  directions: string | null
  lat: number | null
  lng: number | null
  photo_url: string | null
  confirmation_count: number | null
  last_confirmed_at: string | null
  reliability_score: number | string | null
}

function labelValue(value: string | null) {
  if (!value) return 'Unknown'

  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function ContributionPrompt({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <section className="rounded-[2rem] border border-sky-300/45 bg-sky-500/18 p-5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(56,189,248,0.18),0_10px_30px_rgba(56,189,248,0.16)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold text-white/95">{title}</p>
          <p className="mt-1 text-sm text-white/85">{description}</p>
        </div>

        <Link
          href="/submit"
          className="inline-flex items-center justify-center rounded-2xl bg-sky-100 px-5 py-3 text-sm font-semibold text-sky-900 transition hover:bg-sky-200"
        >
          Add a spot
        </Link>
      </div>
    </section>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading...</div>}>
      <ResultsPageContent />
    </Suspense>
  )
}

function ResultsPageContent() {
  const searchParams = useSearchParams()

  const [locations, setLocations] = useState<LocationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState<'list' | 'map'>('list')

  const filters = useMemo(() => {
    return {
      q: searchParams.get('q')?.trim() || '',
      category: searchParams.get('category')?.trim() || 'all',
    }
  }, [searchParams])

  const pageTitle = useMemo(() => {
    if (filters.category === 'cafe') return 'Work-friendly cafes'
    if (filters.category === 'airport') return 'Airports with power'
    if (filters.category === 'rail_station') return 'Train stations with seating'
    if (filters.category === 'hotel_lobby') return 'Work-friendly hotels'
    if (filters.category === 'bus_station') return 'Bus stations with power'
    if (filters.category === 'service_station') return 'Service stations with power'
    if (filters.category === 'restaurant_bar') return 'Work-friendly restaurants and bars'
    if (filters.category === 'public_building') return 'Work-friendly public buildings'
    if (filters.category === 'outdoor') return 'Outdoor work-friendly spots'
    if (filters.category === 'other') return 'Other work-friendly spots'
    return 'All work-friendly locations'
  }, [filters.category])

  const subtitle = useMemo(() => {
    if (filters.q && filters.category !== 'all') {
      return `Showing approved ${labelValue(filters.category).toLowerCase()} results for “${filters.q}”.`
    }

    if (filters.q) {
      return `Showing approved results for “${filters.q}”.`
    }

    if (filters.category !== 'all') {
      return `Browse approved ${labelValue(filters.category).toLowerCase()} locations with laptop-friendly potential.`
    }

    return 'Browse approved work-friendly spots with power, seating, Wi-Fi, signal and community verification.'
  }, [filters.category, filters.q])

  useEffect(() => {
    async function loadLocations() {
      setLoading(true)
      setError('')

      let query = supabase
        .from('locations')
        .select(
          `
          id,
          name,
          category,
          city,
          country_code,
          hub_code,
          terminal,
          near_gate,
          train_platform,
          power,
          usb,
          table_type,
          mobile_signal,
          wifi_available,
          directions,
          lat,
          lng,
          photo_url,
          confirmation_count,
          last_confirmed_at,
          reliability_score
        `
        )
        .eq('status', 'approved')
        .order('reliability_score', { ascending: false, nullsFirst: false })
        .order('confirmation_count', { ascending: false, nullsFirst: false })
        .order('last_confirmed_at', { ascending: false, nullsFirst: false })
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
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <Link
              href="/"
              className="inline-flex text-sm font-medium text-white/80 hover:text-white"
            >
              ← Back to Plug Map
            </Link>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {pageTitle}
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/75 sm:text-base">
              {subtitle}
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

        <section className="mb-6 rounded-[2rem] border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-3 text-sm text-white/85 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <div>
              <span className="font-semibold text-white">Search:</span>{' '}
              {filters.q || 'None'}
            </div>

            <div>
              <span className="font-semibold text-white">Category:</span>{' '}
              {filters.category === 'all'
                ? 'All categories'
                : labelValue(filters.category)}
            </div>

            <div>
              <span className="font-semibold text-white">Results:</span>{' '}
              {loading ? 'Loading...' : locations.length}
            </div>

            <div>
              <span className="font-semibold text-white">Sorted by:</span>{' '}
              Reliability, confirmations, freshness
            </div>
          </div>
        </section>

        {!loading && !error && (
          <div className="mb-6">
            <ContributionPrompt
              title="Know a better spot?"
              description="Help others work anywhere by adding a place with power, Wi-Fi or better seating."
            />
          </div>
        )}

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
            <p className="font-medium text-white">No approved locations found yet.</p>
            <p className="mt-2">
              Try another search or category, or be the first to submit a better spot.
            </p>

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

        {!loading && !error && locations.length > 0 && view === 'map' && (
          <ResultsMap locations={locations} />
        )}

        {!loading && !error && locations.length > 0 && view === 'list' && (
          <>
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {locations.map((location) => (
                <ResultCard key={location.id} location={location} />
              ))}
            </section>

            <div className="mt-8">
              <ContributionPrompt
                title="Seen a better place nearby?"
                description="Add it in 30 seconds and help make Plug Map more useful for the next traveller."
              />
            </div>
          </>
        )}
      </div>
    </main>
  )
}