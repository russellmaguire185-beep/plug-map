import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ResultCard from '../../../../components/results/result-card'
import ResultsMap from '../../../../components/results-map-client'
import {
  getLocationsByCityAndCategory,
  isSupportedSeoCategory,
} from '../../../../lib/queries/getLocationsByCityAndCategory'

type PageProps = {
  params: Promise<{
    city: string
    category: string
  }>
}

const CATEGORY_LABELS: Record<string, string> = {
  cafes: 'cafes',
  airports: 'airports',
  'train-stations': 'train stations',
  'service-stops': 'service stops',
  hotels: 'hotels',
}

const CATEGORY_INTROS: Record<string, string> = {
  cafes:
    'Find laptop-friendly cafes with power sockets, strong Wi-Fi, and comfortable seating for remote work, study, or a productive stop between journeys.',
  airports:
    'Discover airport work spots with power, seating, and better conditions for getting work done before takeoff or between connections.',
  'train-stations':
    'Browse train stations with seating, charging options, and practical places to work while travelling.',
  'service-stops':
    'Explore service stops where you can take a break, charge up, and get some laptop time in on the move.',
  hotels:
    'Find hotel lobby and hotel-adjacent work spots with better seating, power access, and a calmer setup for remote work.',
}

const POPULAR_CITIES = ['london', 'new-york', 'berlin', 'dubai', 'singapore']

function formatCityName(citySlug: string) {
  return decodeURIComponent(citySlug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getCategoryLabel(categorySlug: string) {
  return CATEGORY_LABELS[categorySlug] ?? categorySlug.replace(/-/g, ' ')
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city, category } = await params

  if (!isSupportedSeoCategory(category)) {
    return {
      title: 'Not found | Work Spots',
      description: 'This page could not be found.',
    }
  }

  const cityName = formatCityName(city)
  const categoryLabel = getCategoryLabel(category)

  return {
    title: `Best work-friendly ${categoryLabel} in ${cityName} | Work Spots`,
    description: `Discover laptop-friendly ${categoryLabel} in ${cityName} with Wi-Fi, power, and comfortable seating.`,
    openGraph: {
      title: `Best work-friendly ${categoryLabel} in ${cityName} | Work Spots`,
      description: `Discover laptop-friendly ${categoryLabel} in ${cityName} with Wi-Fi, power, and comfortable seating.`,
      url: `/c/${city}/${category}`,
      siteName: 'Work Spots',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best work-friendly ${categoryLabel} in ${cityName} | Work Spots`,
      description: `Discover laptop-friendly ${categoryLabel} in ${cityName} with Wi-Fi, power, and comfortable seating.`,
    },
  }
}

export default async function CityCategoryPage({ params }: PageProps) {
  const { city, category } = await params

  if (!isSupportedSeoCategory(category)) {
    notFound()
  }

  const citySlug = city
  const categorySlug = category
  const cityName = formatCityName(citySlug)
  const categoryLabel = getCategoryLabel(categorySlug)
  const intro =
    CATEGORY_INTROS[categorySlug] ??
    'Find work-friendly places with power, Wi-Fi, and seating.'

  const locations = await getLocationsByCityAndCategory(citySlug, categorySlug)

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex text-sm font-medium text-white/80 hover:text-white"
          >
            ← Back to Work Spots
          </Link>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Best work-friendly {categoryLabel} in {cityName}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75 sm:text-base">
            Looking for the best work-friendly {categoryLabel} in {cityName}?{' '}
            {intro}
          </p>
        </div>

        {locations.length === 0 ? (
          <section className="rounded-[2rem] border border-white/20 bg-white/10 p-6 text-white/80 backdrop-blur-xl">
            <p className="font-medium text-white">
              No work spots found yet in {cityName}.
            </p>
            <p className="mt-2">
              Be the first to add one and help the next traveller find a better
              place to work.
            </p>

            <div className="mt-4">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Submit a location
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="mb-8">
              <ResultsMap locations={locations} />
            </section>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {locations.map((location) => (
                <ResultCard key={location.id} location={location} />
              ))}
            </section>
          </>
        )}

        <section className="mt-10 rounded-[2rem] border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-white">
            Explore more in {cityName}
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/c/${citySlug}/cafes`}
              className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Cafes
            </Link>
            <Link
              href={`/c/${citySlug}/airports`}
              className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Airports
            </Link>
            <Link
              href={`/c/${citySlug}/train-stations`}
              className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Train stations
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-white">
            Explore other cities
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            {POPULAR_CITIES.filter((cityNameSlug) => cityNameSlug !== citySlug).map(
              (cityNameSlug) => (
                <Link
                  key={cityNameSlug}
                  href={`/c/${cityNameSlug}/${categorySlug}`}
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  {formatCityName(cityNameSlug)}
                </Link>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  )
}