import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: stations } = await supabase
    .from('locations')
    .select('station_slug')
    .eq('category', 'rail_station')
    .eq('status', 'approved')
    .not('station_slug', 'is', null)

  const stationPages =
    stations?.map((item) => ({
      url: `https://www.work-spots.com/stations/${item.station_slug}`,
      lastModified: new Date(),
    })) || []

  return [
    {
      url: 'https://www.work-spots.com',
      lastModified: new Date(),
    },
    {
      url: 'https://www.work-spots.com/results',
      lastModified: new Date(),
    },
    {
      url: 'https://www.work-spots.com/submit',
      lastModified: new Date(),
    },
    {
      url: 'https://www.work-spots.com/work-friendly-cafes',
      lastModified: new Date(),
    },
    {
      url: 'https://www.work-spots.com/airports-with-power',
      lastModified: new Date(),
    },
    {
      url: 'https://www.work-spots.com/laptop-friendly-spots',
      lastModified: new Date(),
    },

    ...stationPages,
  ]
}