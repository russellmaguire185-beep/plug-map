import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/is-admin'
import ApproveButton from '@/components/approve-button'

export const dynamic = 'force-dynamic'

type PendingLocation = {
  id: string
  name: string
  category: string
  city: string
  country_code: string
  power: string | null
  usb: string | null
  table_type: string | null
  hub_code: string | null
  train_platform: string | null
  terminal: string | null
  near_gate: string | null
  directions: string | null
  map_url: string | null
  photo_url: string | null
  status: string | null
}

function formatLabel(value: string | null | undefined) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function categoryBadgeColor(category: string | null | undefined) {
  switch (category) {
    case 'airport':
      return 'bg-sky-100 text-sky-700'
    case 'rail_station':
      return 'bg-emerald-100 text-emerald-700'
    case 'bus_station':
      return 'bg-violet-100 text-violet-700'
    case 'service_station':
      return 'bg-amber-100 text-amber-700'
    case 'cafe':
      return 'bg-orange-100 text-orange-700'
    case 'restaurant_bar':
      return 'bg-rose-100 text-rose-700'
    case 'hotel_lobby':
      return 'bg-indigo-100 text-indigo-700'
    case 'public_building':
      return 'bg-slate-200 text-slate-700'
    case 'outdoor':
      return 'bg-lime-100 text-lime-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

function categoryIcon(category: string | null | undefined) {
  switch (category) {
    case 'airport':
      return '✈️'
    case 'rail_station':
      return '🚆'
    case 'bus_station':
      return '🚌'
    case 'service_station':
      return '⛽'
    case 'cafe':
      return '☕'
    case 'restaurant_bar':
      return '🍽️'
    case 'hotel_lobby':
      return '🏨'
    case 'public_building':
      return '🏛️'
    case 'outdoor':
      return '🌿'
    default:
      return '📍'
  }
}

export default async function AdminPage() {
  const adminCheck = await requireAdmin()

  if (!adminCheck.ok) {
    redirect('/')
  }

  const { supabase } = adminCheck

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('status', 'pending')
    .order('city', { ascending: true })
    .order('name', { ascending: true })

  const locations: PendingLocation[] = data ?? []

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-[2rem] bg-white p-6 shadow-lg ring-1 ring-slate-200">
          <a
            href="/"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to home
          </a>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Admin moderation
          </h1>
          <p className="mt-2 text-slate-600">
            Review pending Plug Map submissions before they go live.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-700 shadow-sm">
            Error loading pending submissions: {error.message}
          </div>
        ) : locations.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm ring-1 ring-slate-200">
            No pending submissions.
          </div>
        ) : (
          <div className="grid gap-5">
            {locations.map((location) => (
              <article
                key={location.id}
                className="rounded-[2rem] bg-white p-6 shadow-lg ring-1 ring-slate-200"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryBadgeColor(
                          location.category
                        )}`}
                      >
                        {categoryIcon(location.category)}{' '}
                        {formatLabel(location.category)}
                      </span>

                      {location.hub_code && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {location.hub_code}
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight">
                      {location.name}
                    </h2>
                    <p className="mt-2 text-slate-600">
                      {location.city}, {location.country_code}
                    </p>

                    {location.photo_url && (
                      <div className="mt-4 overflow-hidden rounded-2xl">
                        <img
                          src={location.photo_url}
                          alt={location.name}
                          className="h-48 w-full max-w-xl object-cover"
                        />
                      </div>
                    )}

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Power
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {formatLabel(location.power)}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          USB
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {formatLabel(location.usb)}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Work style
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {formatLabel(location.table_type)}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Hub code
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {location.hub_code || '—'}
                        </div>
                      </div>
                    </div>

                    {(location.terminal ||
                      location.near_gate ||
                      location.train_platform) && (
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                        {location.terminal && (
                          <span>Terminal: {location.terminal}</span>
                        )}
                        {location.near_gate && (
                          <span>Gate: {location.near_gate}</span>
                        )}
                        {location.train_platform && (
                          <span>Platform: {location.train_platform}</span>
                        )}
                      </div>
                    )}

                    {location.directions && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">
                          Directions:
                        </span>{' '}
                        {location.directions}
                      </div>
                    )}

                    {location.map_url && (
                      <div className="mt-3">
                        <a
                          href={location.map_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          📍 Open submitted map link →
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <ApproveButton locationId={location.id} action="approved" />
                    <ApproveButton locationId={location.id} action="rejected" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}