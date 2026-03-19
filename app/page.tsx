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
      <div className="mx-auto flex max-w-[1100px] flex-col gap-4">
        <section className="rounded-[2rem] border border-white/15 bg-slate-950/55 px-5 py-6 shadow-2xl backdrop-blur-xl sm:px-8 sm:py-8">
          <div className="mx-auto max-w-[920px] text-center">
            <div className="mb-1 flex justify-center">
              <img
                src="/assets/plug-map-logo-horizontal.svg"
                alt="plug-map"
                className="h-auto w-[360px] sm:w-[500px] md:w-[620px]"
              />
            </div>

            <h1 className="mx-auto max-w-[1000px] text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Find your next place to work — anywhere.
            </h1>

            <p className="mx-auto mt-3 max-w-[680px] text-base font-medium text-white/85">
              Discover laptop-friendly spots with power, seating, signal, and
              Wi-Fi.
            </p>

            <p className="mx-auto mt-2 max-w-[620px] text-sm leading-6 text-white/55 sm:text-base">
              Built for digital nomads, remote workers, students, and
              travellers.
            </p>

            <div className="mt-6 flex justify-center">
              <AuthButton />
            </div>

            <div className="mx-auto mt-8 max-w-[860px]">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_140px]">
                <input
                  type="text"
                  placeholder="Search city, airport, station or hub code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') window.location.href = searchHref
                  }}
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

                <a
                  href={searchHref}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Search
                </a>
              </div>

              <div className="mt-4 flex justify-center">
                <a
                  href="/submit"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  + Submit location
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[760px] rounded-[1.5rem] border border-white/10 bg-white/8 px-5 py-4 shadow-xl backdrop-blur-md sm:px-6">
          <NearbySpots />
        </section>
      </div>
    </main>
  )
}