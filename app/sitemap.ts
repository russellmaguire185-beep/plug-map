import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

type StationRow = {
  station_slug: string | null
}

type AirportRow = {
  hub_code: string | null
}

function isCleanSlug(value: string) {
  return /^[a-z0-9-]+$/.test(value)
}

function isLikelyStationSlug(value: string) {
  return isCleanSlug(value) && value.includes('-')
}

function isLikelyAirportCode(value: string) {
  return /^[a-z0-9]{3,5}$/.test(value)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const baseUrl = 'https://work-spots.com'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/results`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/work-friendly-cafes`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/airports-with-power`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/laptop-friendly-spots`,
      lastModified: now,
    },
  ]

  const { data: stationRows, error: stationError } = await supabase
    .from('locations')
    .select('station_slug')
    .eq('status', 'approved')
    .eq('category', 'rail_station')
    .not('station_slug', 'is', null)

  if (stationError) {
    console.error('Sitemap station query error:', stationError.message)
  }

  const uniqueStationSlugs = Array.from(
    new Set(
      ((stationRows ?? []) as StationRow[])
        .map((row) => row.station_slug?.trim().toLowerCase() ?? '')
        .filter((slug) => slug.length > 0)
        .filter(isLikelyStationSlug)
    )
  )

  const stationPages: MetadataRoute.Sitemap = uniqueStationSlugs.map((slug) => ({
    url: `${baseUrl}/station/${slug}`,
    lastModified: now,
  }))

  const { data: airportRows, error: airportError } = await supabase
    .from('locations')
    .select('hub_code')
    .eq('status', 'approved')
    .eq('location_context', 'airport')
    .not('hub_code', 'is', null)

  if (airportError) {
    console.error('Sitemap airport query error:', airportError.message)
  }

  const uniqueAirportCodes = Array.from(
    new Set(
      ((airportRows ?? []) as AirportRow[])
        .map((row) => row.hub_code?.trim().toLowerCase() ?? '')
        .filter((code) => code.length > 0)
        .filter(isLikelyAirportCode)
    )
  )

  const airportPages: MetadataRoute.Sitemap = uniqueAirportCodes.map((code) => ({
    url: `${baseUrl}/airport/${code}`,
    lastModified: now,
  }))

  return [...staticPages, ...stationPages, ...airportPages]
}