'use client'

import { useMemo, useState } from 'react'
import AuthButton from '../components/auth-button'
import NearbySpots from '../components/nearby-spots'

export default function Home() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const searchHref = useMemo(() => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    if (category !== 'all') params.set('category', category)
    const query = params.toString()
    return query ? `/results?${query}` : '/results'
  }, [search, category])

  return (
    <main className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[620px] rounded-[2rem] border border-white/20 bg-slate-950/60 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
        <div className="text-center">
          <div className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-white/70">
            Plug Map
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find power and a proper place to work in transit
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Search airports, stations, cafes and service stops with workspace potential.
          </p>

          <div className="mt-6 flex justify-center">
            <AuthButton />
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-[500px]">
          <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-[minmax(0,1fr)_230px_150px]">
            <input
              type="text"
              placeholder="Search city, airport, station or hub code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') window.location.href = searchHref
              }}
              className="w-full rounded-2xl border border-white/20 bg-white/90 px-5 py-4 text-base text-slate-900 outline-none"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-4 text-sm text-slate-900 outline-none"
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

            <a
              href={searchHref}
              className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Search
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-2 max-w-[400px]">
        <NearbySpots />
      </div>

      <div className="mt-3 text-center">
        <a
          href="/submit"
          className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          + Submit location
        </a>
      </div>
    </main>
  )
}