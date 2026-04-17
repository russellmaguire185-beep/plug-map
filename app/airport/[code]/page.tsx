'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import ResultCard from '../../../components/results/result-card'

const ResultsMap = dynamic(() => import('../../../components/results-map'), {
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

export default function AirportPage() {
  const params = useParams<{ code: string }>()
  const airportCode = typeof params?.code === 'string' ? params.code.toUpperCase() : ''

  const [locations, setLocations] = useState<LocationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadLocations() {
      if (!airportCode) {
        setLocations([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      const { data, error } = await supabase
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
        .eq('hub_code', airportCode)
        .order('reliability_score', { ascending: false, nullsFirst: false })
        .order('confirmation_count', { ascending: false, nullsFirst: false })
        .order('last_confirmed_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

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
  }, [airportCode])

  const airportLabel = useMemo(() => {
    if (!airportCode) return 'this airport'

    const city = locations.find((location) => location.city)?.city

    if (city) {
      return `${city} (${airportCode})`
    }

    return `${airportCode} airport`
  }, [airportCode, locations])

  const subtitle = useMemo(() => {
    if (!airportCode) {
      return 'Browse approved work-friendly spots inside this airport.'
    }

    return `Browse approved lounges, cafes, restaurants and seating areas tagged to ${airportCode}, with power, Wi-Fi, signal and laptop-friendly seating.`
  }, [airportCode])

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 max-w-3xl">
          <Link
            href="/"
            className="inline-flex text-sm font-medium text-white/80 hover:text-white"
          >
            ← Back to Plug Map
          </Link>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Best places to work in {airportLabel}
          </h1>

          <p className="mt-2 text-sm leading-6 text-white/75 sm:text-base">
            {subtitle}
          </p>
        </div>

        {!loading && !error && locations.length > 0 && (
          <div className="mb-6">
            <ContributionPrompt
              title="Know a better spot in this airport?"
              description="Help other travellers by adding a lounge, cafe or seating area with better power, Wi-Fi or laptop-friendly seating."
            />
          </div>
        )}

        {loading && (
          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6 text-white/80 backdrop-blur-xl">
            Loading airport locations...
          </div>
        )}

        {error && (
          <div className="rounded-[2rem] border border-red-300/40 bg-red-500/10 p-6 text-red-100 backdrop-blur-xl">
            {error}
          </div>
        )}

        {!loading && !error && locations.length === 0 && (
          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6 text-white/80 backdrop-blur-xl">
            <p className="font-medium text-white">
              No approved locations found yet for {airportCode}.
            </p>
            <p className="mt-2">
              Be the first to add a better work spot in this airport.
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

        {!loading && !error && locations.length > 0 && (
          <>
            <div className="mb-8">
              <ResultsMap locations={locations} />
            </div>

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