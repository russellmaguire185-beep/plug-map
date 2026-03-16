'use client'

import 'leaflet/dist/leaflet.css'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

type MapPickerProps = {
  lat: string
  lng: string
  onChange: (lat: string, lng: string) => void
}

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function ClickHandler({
  onPick,
}: {
  onPick: (lat: string, lng: string) => void
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6))
    },
  })

  return null
}

function ResizeMap() {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 200)

    return () => clearTimeout(timer)
  }, [map])

  return null
}

function RecenterMap({
  lat,
  lng,
}: {
  lat: string
  lng: string
}) {
  const map = useMap()

  useEffect(() => {
    if (!lat || !lng) return
    map.setView([Number(lat), Number(lng)], 15)
  }, [lat, lng, map])

  return null
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const [mounted, setMounted] = useState(false)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const defaultCenter = useMemo<[number, number]>(() => [51.5074, -0.1278], [])
  const hasCoords = lat !== '' && lng !== ''
  const center = hasCoords
    ? ([Number(lat), Number(lng)] as [number, number])
    : defaultCenter

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLat = position.coords.latitude.toFixed(6)
        const nextLng = position.coords.longitude.toFixed(6)

        onChange(nextLat, nextLng)
        setLocating(false)
      },
      () => {
        alert('Unable to retrieve your location.')
        setLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }

  if (!mounted) {
    return (
      <div className="h-[320px] w-full rounded-2xl border border-slate-300 bg-slate-100" />
    )
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={useCurrentLocation}
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        {locating ? 'Finding location...' : 'Use my current location'}
      </button>

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
        <MapContainer
          center={center}
          zoom={hasCoords ? 15 : 5}
          scrollWheelZoom={true}
          style={{ height: '320px', width: '100%' }}
        >
          <ResizeMap />
          <RecenterMap lat={lat} lng={lng} />

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler onPick={onChange} />

          {hasCoords && (
            <Marker
              position={[Number(lat), Number(lng)]}
              icon={markerIcon}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-sm text-slate-600">
        Click the map or use your location to set the exact spot.
      </p>
    </div>
  )
}