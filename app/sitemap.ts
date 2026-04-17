import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const baseUrl = 'https://work-spots.com'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
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
    .not('station_slug', 'is', null)

  if (stationError) {
    console.error('Sitemap station query error:', stationError.message)
  }

  const uniqueStationSlugs = Array.from(
    new Set(
      (stationRows ?? [])
        .map((row) => row.station_slug)
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
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
    .not('hub_code', 'is', null)

  if (airportError) {
    console.error('Sitemap airport query error:', airportError.message)
  }

  const uniqueAirportCodes = Array.from(
    new Set(
      (airportRows ?? [])
        .map((row) => row.hub_code)
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .map((value) => value.toLowerCase())
    )
  )

  const airportPages: MetadataRoute.Sitemap = uniqueAirportCodes.map((code) => ({
    url: `${baseUrl}/airport/${code}`,
    lastModified: now,
  }))

  return [...staticPages, ...stationPages, ...airportPages]
}