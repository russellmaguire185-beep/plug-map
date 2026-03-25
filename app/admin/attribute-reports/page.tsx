import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/is-admin'

export const dynamic = 'force-dynamic'

type AttributeReport = {
  id: string
  location_id: string
  power: string | null
  usb: string | null
  table_type: string | null
  wifi_available: boolean | null
  mobile_signal: string | null
  notes: string | null
  created_at: string
  updated_at: string
  user_id: string | null
  locations: {
    id: string
    name: string
    city: string
    country_code: string
    category: string
    power: string | null
    usb: string | null
    table_type: string | null
    wifi_available: boolean | null
    mobile_signal: string | null
  } | null
}

function formatLabel(value: string | null | undefined) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatWifi(value: boolean | null | undefined) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return 'Unknown'
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

export default async function AdminAttributeReportsPage() {
  const adminCheck = await requireAdmin()

  if (!adminCheck.ok) {
    redirect('/')
  }

  const { supabase } = adminCheck

  const { data, error } = await supabase
    .from('location_attribute_reports')
    .select(`
      id,
      location_id,
      power,
      usb,
      table_type,
      wifi_available,
      mobile_signal,
      notes,
      created_at,
      updated_at,
      user_id,
      locations (
        id,
        name,
        city,
        country_code,
        category,
        power,
        usb,
        table_type,
        wifi_available,
        mobile_signal
      )
    `)
    .order('created_at', { ascending: false })

  const reports: AttributeReport[] = (data ?? []).map((item: any) => ({
  ...item,
  locations: Array.isArray(item.locations)
    ? item.locations[0] ?? null
    : item.locations ?? null,
}))

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-[2rem] bg-white p-6 shadow-lg ring-1 ring-slate-200">
          <a
            href="/admin"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to admin
          </a>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Attribute report review
          </h1>
          <p className="mt-2 text-slate-600">
            Review suggested detail updates before applying them to live locations.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-700 shadow-sm">
            Error loading attribute reports: {error.message}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm ring-1 ring-slate-200">
            No suggested detail updates yet.
          </div>
        ) : (
          <div className="grid gap-5">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-[2rem] bg-white p-6 shadow-lg ring-1 ring-slate-200"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryBadgeColor(
                          report.locations?.category
                        )}`}
                      >
                        {categoryIcon(report.locations?.category)}{' '}
                        {formatLabel(report.locations?.category)}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        Suggested update
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight">
                      {report.locations?.name || 'Unknown location'}
                    </h2>

                    {report.locations ? (
                      <p className="mt-2 text-slate-600">
                        {report.locations.city}, {report.locations.country_code}
                      </p>
                    ) : (
                      <p className="mt-2 text-slate-600">
                        Linked location not found.
                      </p>
                    )}

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="mb-3 text-sm font-semibold text-slate-900">
                          Current live values
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <InfoCard
                            label="Power"
                            value={formatLabel(report.locations?.power)}
                          />
                          <InfoCard
                            label="USB"
                            value={formatLabel(report.locations?.usb)}
                          />
                          <InfoCard
                            label="Work style"
                            value={formatLabel(report.locations?.table_type)}
                          />
                          <InfoCard
                            label="Wi-Fi"
                            value={formatWifi(report.locations?.wifi_available)}
                          />
                          <InfoCard
                            label="Mobile signal"
                            value={formatLabel(report.locations?.mobile_signal)}
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                        <div className="mb-3 text-sm font-semibold text-slate-900">
                          Suggested values
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <InfoCard
                            label="Power"
                            value={formatLabel(report.power)}
                          />
                          <InfoCard
                            label="USB"
                            value={formatLabel(report.usb)}
                          />
                          <InfoCard
                            label="Work style"
                            value={formatLabel(report.table_type)}
                          />
                          <InfoCard
                            label="Wi-Fi"
                            value={formatWifi(report.wifi_available)}
                          />
                          <InfoCard
                            label="Mobile signal"
                            value={formatLabel(report.mobile_signal)}
                          />
                        </div>
                      </div>
                    </div>

                    {report.notes && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">
                          Contributor notes:
                        </span>{' '}
                        {report.notes}
                      </div>
                    )}

                    <div className="mt-4 text-xs text-slate-500">
                      Submitted {formatDate(report.created_at)}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-3">
                  <form
                    action="/api/admin/apply-attribute-report"
                    method="POST"
                  >
                    <input
                      type="hidden"
                      name="reportId"
                      value={report.id}
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Apply to location
                    </button>
                  </form>

                  <form
                    action="/api/admin/delete-attribute-report"
                    method="POST"
                  >
                    <input
                      type="hidden"
                      name="reportId"
                      value={report.id}
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-400"
                    >
                      Reject
                    </button>
                  </form>
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

function InfoCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900">
        {value}
      </div>
    </div>
  )
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'recently'

  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}