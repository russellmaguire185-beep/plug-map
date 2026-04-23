'use client'

import 'leaflet/dist/leaflet.css'

import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'

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
  directions: string | null
  lat: number | null
  lng: number | null
  photo_url: string | null
}

type ResultsMapLeafletProps = {
  locations: LocationItem[]
}

function ResizeMap() {
  const map = useMap()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize()
    }, 200)

    return () => window.clearTimeout(timer)
  }, [map])

  return null
}

function FitBounds({ locations }: { locations: LocationItem[] }) {
  const map = useMap()

  useEffect(() => {
    const validPoints = locations
      .filter((location) => location.lat !== null && location.lng !== null)
      .map(
        (location) => [location.lat as number, location.lng as number] as [number, number]
      )

    if (validPoints.length === 0) return

    if (validPoints.length === 1) {
      map.setView(validPoints[0], 14)
      return
    }

    const bounds = L.latLngBounds(validPoints)
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [locations, map])

  return null
}

function labelValue(value: string | null) {
  if (!value) return 'Unknown'

  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function ResultsMapLeaflet({
  locations,
}: ResultsMapLeafletProps) {
  const defaultCenter = useMemo<[number, number]>(() => [51.5074, -0.1278], [])

  const markerIcon = useMemo(
    () =>
      L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    []
  )

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 backdrop-blur-xl">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '520px', width: '100%' }}
      >
        <ResizeMap />
        <FitBounds locations={locations} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat as number, location.lng as number]}
            icon={markerIcon}
          >
            <Popup>
              <div className="max-w-[260px] space-y-2 text-sm text-slate-900">
                {location.photo_url && (
                  <img
                    src={location.photo_url}
                    alt={location.name}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                )}

                <div>
                  <div className="font-semibold">{location.name}</div>
                  <div className="text-xs text-slate-600">
                    {[location.city, location.country_code].filter(Boolean).join(', ')}
                  </div>
                </div>

                <div className="text-xs text-slate-700">
                  <div>Category: {labelValue(location.category)}</div>
                  <div>Power: {labelValue(location.power)}</div>
                  <div>USB: {labelValue(location.usb)}</div>
                  <div>Work style: {labelValue(location.table_type)}</div>
                </div>

                {(location.hub_code ||
                  location.terminal ||
                  location.near_gate ||
                  location.train_platform) && (
                  <div className="text-xs text-slate-700">
                    {location.hub_code && <div>Hub code: {location.hub_code}</div>}
                    {location.terminal && <div>Terminal: {location.terminal}</div>}
                    {location.near_gate && <div>Near gate: {location.near_gate}</div>}
                    {location.train_platform && (
                      <div>Platform: {location.train_platform}</div>
                    )}
                  </div>
                )}

                {location.directions && (
                  <div className="text-xs text-slate-700">{location.directions}</div>
                )}

                <a
                  href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                >
                  Open in Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}