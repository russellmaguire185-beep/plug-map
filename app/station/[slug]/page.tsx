import { createSupabaseServerClient } from '@/lib/supabase-server'
import ResultCard from '@/components/results/result-card'
import ResultsMap from '@/components/results-map'

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

type StationPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: StationPageProps) {
  const { slug } = await params
  const stationName = slug.replaceAll('-', ' ')

  return {
    title: `Best places to work in ${stationName}`,
    description: `Find laptop-friendly places to work in ${stationName}. Power, Wi-Fi, seating and real user verification.`,
  }
}

export default async function StationPage({ params }: StationPageProps) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
  .from('locations')
  .select(`
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
    reliability_score,
    station_slug
  `)
  .eq('status', 'approved')
  .eq('station_slug', slug)
  .order('reliability_score', { ascending: false, nullsFirst: false })
  .order('confirmation_count', { ascending: false, nullsFirst: false })
  .order('last_confirmed_at', { ascending: false, nullsFirst: false })
  if (error) {
    return <div className="p-6 text-white">Error loading locations</div>
  }

  const locations: LocationItem[] = (data as LocationItem[]) ?? []

  const stationName =
    locations[0]?.name ||
    slug.replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Best places to work in {stationName}
          </h1>

          <p className="mt-2 text-white/75">
            Discover laptop-friendly spots in {stationName} with power, Wi-Fi,
            seating and real community verification.
          </p>
        </div>

        {locations.length > 0 && (
          <div className="mb-6">
            <ResultsMap locations={locations} />
          </div>
        )}

        {locations.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {locations.map((location) => (
              <ResultCard key={location.id} location={location} />
            ))}
          </section>
        ) : (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
            No work-friendly spots found for this station yet.
          </div>
        )}
      </div>
    </main>
  )
}