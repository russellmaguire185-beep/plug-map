'use client'

import Link from 'next/link'
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
        <section className="rounded-[2rem] border border-white/15 bg-slate-950/60 px-5 py-7 shadow-2xl backdrop-blur-xl sm:px-8 sm:py-10 md:px-10 md:py-12">
          <div className="mx-auto max-w-[920px] text-center">
            <div className="-mb-10 flex justify-center">
              <img
                src="/assets/logo.svg"
                alt="Work Spots"
                className="h-auto w-[360px] sm:w-[500px] md:w-[620px]"
              />
            </div>

            <h1 className="mx-auto mt-2 max-w-[1000px] text-3xl font-bold leading-snug tracking-tight sm:text-5xl">
              Find work-friendly places in airports, stations and cafes.
            </h1>

            <p className="mx-auto mt-2 max-w-[720px] text-base font-medium text-white/70">
              Discover places with power, Wi-Fi, mobile signal and proper laptop-friendly seating.
            </p>

            <p className="mx-auto mt-1 max-w-[680px] text-xs text-white/50">
              Built for digital nomads, commuters, students, remote workers and travellers.
            </p>

            <div className="mx-auto mt-8 max-w-[860px]">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_140px]">
                <input
                  type="text"
                  placeholder="Search airport, city, station or location..."
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

              <p className="mt-3 text-xs text-white/50">
                Example: Heathrow T5, Berlin Airport, Paddington Station
              </p>

              <div className="mt-6 text-center">
                <p className="text-sm text-white/70">
                  Found a place with power, WiFi or good seating?
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="/submit"
                    className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Add it in 30 seconds ⚡
                  </a>

                  <div className="inline-flex">
                    <AuthButton />
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                  Explore
                </p>

                <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
                  <Link
                    href="/results?category=cafe"
                    className="text-sm font-medium text-white/85 underline underline-offset-4 transition hover:text-white"
                  >
                    Work-friendly cafes
                  </Link>

                  <Link
                    href="/results?category=airport"
                    className="text-sm font-medium text-white/85 underline underline-offset-4 transition hover:text-white"
                  >
                    Work friendly Airports
                  </Link>

                  <Link
                    href="/results?category=hotel_lobby"
                    className="text-sm font-medium text-white/85 underline underline-offset-4 transition hover:text-white"
                  >
                    Work-friendly hotels
                  </Link>

                  <Link
                    href="/results?category=rail_station"
                    className="text-sm font-medium text-white/85 underline underline-offset-4 transition hover:text-white"
                  >
                    Work-friendly Train Stations
                  </Link>
                </div>
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