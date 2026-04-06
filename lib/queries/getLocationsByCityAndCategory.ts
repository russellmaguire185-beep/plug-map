import { supabase } from '../supabase'

export type CityCategoryLocation = {
  id: string
  name: string
  category: string | null
  location_context: string | null
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
  created_at?: string | null
}

const CATEGORY_MAP: Record<string, string[]> = {
  cafes: ['cafe'],
  'train-stations': ['rail_station', 'train_station', 'station'],
  'service-stops': ['service_station', 'service_stop'],
  hotels: ['hotel_lobby'],
}

function normaliseCity(citySlug: string) {
  return decodeURIComponent(citySlug)
    .replace(/-/g, ' ')
    .trim()
}

export function isSupportedSeoCategory(category: string) {
  return ['cafes', 'airports', 'train-stations', 'service-stops', 'hotels'].includes(category)
}

export async function getLocationsByCityAndCategory(
  citySlug: string,
  categorySlug: string
): Promise<CityCategoryLocation[]> {
  const city = normaliseCity(citySlug)

  if (!city) return []

  let query = supabase
    .from('locations')
    .select(`
      id,
      name,
      category,
      location_context,
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
      created_at
    `)
    .eq('status', 'approved')
    .ilike('city', city)

  if (categorySlug === 'airports') {
    query = query.eq('location_context', 'airport')
  } else {
    const categoryValues = CATEGORY_MAP[categorySlug] ?? []

    if (categoryValues.length === 0) return []

    query = query.in('category', categoryValues)
  }

  const { data, error } = await query
    .order('reliability_score', { ascending: false, nullsFirst: false })
    .order('confirmation_count', { ascending: false, nullsFirst: false })
    .order('last_confirmed_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('City/category query error:', error)
    return []
  }

  return (data ?? []) as CityCategoryLocation[]
}