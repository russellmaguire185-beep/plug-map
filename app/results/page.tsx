'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import ResultCard from '../../components/results/result-card'

const ResultsMap = dynamic(() => import('../../components/results-map'), {
  ssr: false,
})

type LocationItem = {
  id: string
  name: string
  category: string | null
  location_context: string | null
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
  created_at?: string | null
  distance_meters?: number | null
}

type SortOption =
  | 'best'
  | 'reliable'
  | 'confirmed'
  | 'recent'
  | 'nearest'

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

function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const earthRadius = 6371000

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

function ResultsFilterBar({
  initialQuery,
  initialCategory,
  initialSort,
}: {
  initialQuery: string
  initialCategory: string
  initialSort: SortOption
}) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState<SortOption>(initialSort)

  function applyFilters() {
    const params = new URLSearchParams()

    if (query.trim()) params.set('q', query.trim())
    if (category !== 'all') params.set('category', category)
    if (sort !== 'best') params.set('sort', sort)

    const nextUrl = params.toString() ? `/results?${params.toString()}` : '/results'
    router.push(nextUrl)
  }

  function clearFilters() {
    setQuery('')
    setCategory('all')
    setSort('best')
    router.push('/results')
  }

  return (
    <section className="mb-6 rounded-[2rem] border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px_140px_120px]">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applyFilters()
          }}
          placeholder="Search airport, city, station or location..."
          className="w-full rounded-2xl border border-white/15 bg-white/92 px-5 py-4 text-base text-slate-900 outline-none placeholder:text-slate-500"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-2xl border border-white/15 bg-white/92 px-4 py-4 text-sm text-slate-900 outline-none"
        >
          <option value="all">All categories</option>
          <option value="airport">Airport</option>
          <option value="rail_station">Train station</option>
          <option value="bus_station">Bus station</option>
          <option value="service_station">Service station</option>
          <option value="cafe">Cafe</option>
          <option value="restaurant_bar">Restaurant / Bar</option>
          <option value="hotel_lobby">Hotel lobby</option>
          <option value="public_building">Public building</option>
          <option value="outdoor">Outdoor</option>
          <option value="other">Other</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="w-full rounded-2xl border border-white/15 bg-white/92 px-4 py-4 text-sm text-slate-900 outline-none"
        >
          <option value="best">Best match</option>
          <option value="nearest">Nearest</option>
          <option value="reliable">Most reliable</option>
          <option value="confirmed">Most confirmed</option>
          <option value="recent">Recently confirmed</option>
        </select>

        <button
          type="button"
          onClick={applyFilters}
          className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          Apply
        </button>

        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          Clear
        </button>
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
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [geoError, setGeoError] = useState('')

  const filters = useMemo(() => {
    const sortParam = (searchParams.get('sort')?.trim() || 'best') as SortOption

    return {
      q: searchParams.get('q')?.trim() || '',
      category: searchParams.get('category')?.trim() || 'all',
      sort: ['best', 'reliable', 'confirmed', 'recent', 'nearest'].includes(sortParam)
        ? sortParam
        : 'best',
    }
  }, [searchParams])

  const normalizedQuery = useMemo(() => filters.q.trim().toLowerCase(), [filters.q])

  const isAirportSearch = useMemo(() => {
    return ['airport', 'airports'].includes(normalizedQuery)
  }, [normalizedQuery])

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

  const sortLabel = useMemo(() => {
    if (filters.sort === 'nearest') return 'Nearest'
    if (filters.sort === 'reliable') return 'Most reliable'
    if (filters.sort === 'confirmed') return 'Most confirmed'
    if (filters.sort === 'recent') return 'Recently confirmed'
    return 'Best match'
  }, [filters.sort])

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
    if (filters.sort !== 'nearest') {
      setGeoError('')
      return
    }

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser, so nearest sorting is unavailable.')
      setUserCoords(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setGeoError('')
      },
      () => {
        setGeoError('Location access was denied, so results could not be sorted by nearest.')
        setUserCoords(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    )
  }, [filters.sort])

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
          location_context,
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
          reliability_score,
          created_at
        `
        )
        .eq('status', 'approved')

      if (filters.category !== 'all') {
        if (filters.category === 'airport') {
          query = query.eq('location_context', 'airport')
        } else {
          query = query.eq('category', filters.category)
        }
      }

      if (filters.q) {
  const escapedQuery = filters.q.replaceAll(',', ' ').trim()

  const baseSearchFilters = [
    `name.ilike.%${escapedQuery}%`,
    `category.ilike.%${escapedQuery}%`,
    `city.ilike.%${escapedQuery}%`,
    `country_code.ilike.%${escapedQuery}%`,
    `hub_code.ilike.%${escapedQuery}%`,
    `terminal.ilike.%${escapedQuery}%`,
    `near_gate.ilike.%${escapedQuery}%`,
    `train_platform.ilike.%${escapedQuery}%`,
    `directions.ilike.%${escapedQuery}%`,
  ]

  // Only broaden to airport context when the user literally searches
  // "airport" / "airports" and has NOT already selected Airport category.
  if (filters.category === 'all' && isAirportSearch) {
    baseSearchFilters.push('location_context.eq.airport')
  }

  query = query.or(baseSearchFilters.join(','))
}

      if (filters.sort === 'reliable') {
        query = query
          .order('reliability_score', { ascending: false, nullsFirst: false })
          .order('confirmation_count', { ascending: false, nullsFirst: false })
          .order('last_confirmed_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
      } else if (filters.sort === 'confirmed') {
        query = query
          .order('confirmation_count', { ascending: false, nullsFirst: false })
          .order('reliability_score', { ascending: false, nullsFirst: false })
          .order('last_confirmed_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
      } else if (filters.sort === 'recent') {
        query = query
          .order('last_confirmed_at', { ascending: false, nullsFirst: false })
          .order('confirmation_count', { ascending: false, nullsFirst: false })
          .order('reliability_score', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
      } else {
        query = query
          .order('reliability_score', { ascending: false, nullsFirst: false })
          .order('confirmation_count', { ascending: false, nullsFirst: false })
          .order('last_confirmed_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        setError(error.message)
        setLocations([])
        setLoading(false)
        return
      }

      let nextLocations: LocationItem[] = ((data as LocationItem[]) ?? []).map((item) => ({
        ...item,
        distance_meters: null as number | null,
      }))

      if (filters.sort === 'nearest' && userCoords) {
        nextLocations = nextLocations
          .map((item) => {
            if (typeof item.lat === 'number' && typeof item.lng === 'number') {
              return {
                ...item,
                distance_meters: haversineDistanceMeters(
                  userCoords.lat,
                  userCoords.lng,
                  item.lat,
                  item.lng
                ),
              }
            }

            return item
          })
          .sort((a, b) => {
            const aDistance =
              typeof a.distance_meters === 'number'
                ? a.distance_meters
                : Number.MAX_SAFE_INTEGER
            const bDistance =
              typeof b.distance_meters === 'number'
                ? b.distance_meters
                : Number.MAX_SAFE_INTEGER

            if (aDistance !== bDistance) return aDistance - bDistance

            const aReliability =
              a.reliability_score === null || a.reliability_score === undefined
                ? 0
                : Number(a.reliability_score)
            const bReliability =
              b.reliability_score === null || b.reliability_score === undefined
                ? 0
                : Number(b.reliability_score)

            return bReliability - aReliability
          })
      }

      setLocations(nextLocations)
      setLoading(false)
    }

    loadLocations()
  }, [filters.category, filters.q, filters.sort, isAirportSearch, userCoords])

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

        <ResultsFilterBar
          initialQuery={filters.q}
          initialCategory={filters.category}
          initialSort={filters.sort}
        />

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
              {sortLabel}
            </div>
          </div>

          {filters.sort === 'nearest' && geoError && (
            <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {geoError}
            </div>
          )}
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