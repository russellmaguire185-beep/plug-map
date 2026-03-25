'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import ConfirmationButtons from '../confirmation-buttons'

type Location = {
  id: string
  name: string
  city?: string | null
  country_code?: string | null
  category?: string | null
  hub_code?: string | null
  terminal?: string | null
  near_gate?: string | null
  train_platform?: string | null
  power?: string | null
  usb?: string | null
  table_type?: string | null
  directions?: string | null
  lat?: number | null
  lng?: number | null
  photo_url?: string | null
  wifi_available?: boolean | null
  mobile_signal?: string | null
  confirmation_count?: number | null
  last_confirmed_at?: string | null
  reliability_score?: number | string | null
}

type ResultCardProps = {
  location: Location
}

export default function ResultCard({ location }: ResultCardProps) {
  const [isImageOpen, setIsImageOpen] = useState(false)

  const placeLine = useMemo(() => {
    const bits: string[] = []

    if (location.hub_code) bits.push(location.hub_code)

    if (location.terminal) {
      const terminalText = /^t/i.test(location.terminal.trim())
        ? location.terminal.trim()
        : `T${location.terminal.trim()}`
      bits.push(terminalText)
    }

    if (location.near_gate) bits.push(`Gate ${location.near_gate}`)
    if (location.train_platform) bits.push(`Platform ${location.train_platform}`)

    if (!bits.length) {
      if (location.city && location.country_code) {
        return `${location.city}, ${location.country_code}`
      }
      return location.city || location.country_code || 'Location details pending'
    }

    return bits.join(' • ')
  }, [location])

  const googleMapsUrl = useMemo(() => {
    if (
      typeof location.lat === 'number' &&
      typeof location.lng === 'number'
    ) {
      return `https://www.google.com/maps?q=${location.lat},${location.lng}`
    }

    const fallbackQuery = [
      location.name,
      location.hub_code,
      location.city,
      location.country_code,
    ]
      .filter(Boolean)
      .join(' ')

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      fallbackQuery
    )}`
  }, [location])

  const confirmationCount = location.confirmation_count ?? 0
      const reliabilityScore =
      location.reliability_score === null || location.reliability_score === undefined
        ? null
        : Number(location.reliability_score)

  const trustLabel = getTrustLabel(reliabilityScore, confirmationCount)

  return (
    <>
      <article className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md shadow-xl">
        <div className="p-5">
          {/* Header */}
          <div className="mb-4">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold leading-tight text-white">
                  {location.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-white/75">
                  {location.city}
                  {location.city && location.country_code ? ', ' : ''}
                  {location.country_code}
                </p>
              </div>

              {location.category ? (
                <span className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                  {formatCategory(location.category)}
                </span>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/15 px-3 py-2 text-sm font-semibold text-white/90">
              📍 {placeLine}
            </div>
          </div>

          {/* Workability */}
          <section className="mb-4">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
              Workability
            </h4>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              <SignalPill
                label="Power"
                value={formatPower(location.power)}
                tone={getPowerTone(location.power)}
              />
              <SignalPill
                label="Work style"
                value={formatTableType(location.table_type)}
                tone={getTableTone(location.table_type)}
              />
              <SignalPill
                label="USB"
                value={formatUsb(location.usb)}
                tone={getUsbTone(location.usb)}
              />
              <SignalPill
                label="Wi-Fi"
                value={formatWifi(location.wifi_available)}
                tone={getWifiTone(location.wifi_available)}
              />
              <SignalPill
                label="Mobile signal"
                value={formatSignal(location.mobile_signal)}
                tone={getSignalTone(location.mobile_signal)}
              />
            </div>
          </section>

          {/* Trust / community */}
          <section className="mb-4 rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">
                Community confidence
              </h4>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${trustLabel.className}`}
              >
                {trustLabel.label}
              </span>
            </div>

            {confirmationCount > 0 ? (
              <div className="space-y-1 text-sm text-white/85">
                <p>
                  {reliabilityScore !== null
                    ? `Reliability score: ${reliabilityScore.toFixed(1)}/10`
                    : 'Reliability score building...'}
                </p>
                <p>
                  {confirmationCount} confirmation
                  {confirmationCount === 1 ? '' : 's'}
                </p>
                <p>
                  {location.last_confirmed_at
                    ? `Last checked ${formatRelativeDate(location.last_confirmed_at)}`
                    : 'Last checked date pending'}
                </p>
              </div>
            ) : (
              <div className="space-y-1 text-sm text-white/85">
                <p className="font-medium text-amber-300">
                  This location still needs verification.
                </p>
                <p>Be the first to confirm whether it is good for laptop work.</p>
              </div>
            )}
          </section>

          {/* Notes / directions */}
          {location.directions ? (
            <section className="mb-4">
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/70">
                Notes
              </h4>
              <p className="text-sm leading-6 text-white/85">{location.directions}</p>
            </section>
          ) : null}

          {/* Image */}
          {location.photo_url ? (
            <section className="mb-4">
              <button
                type="button"
                onClick={() => setIsImageOpen(true)}
                className="group relative block h-52 w-full overflow-hidden rounded-2xl border border-white/10"
                aria-label={`Open image for ${location.name}`}
              >
                <Image
                  src={location.photo_url}
                  alt={location.name}
                  fill
                  className="object-cover transition duration-200 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 text-left">
                  <span className="text-sm font-medium text-white">
                    Tap to enlarge
                  </span>
                </div>
              </button>
            </section>
          ) : null}

          {/* Actions */}
          <section className="space-y-3">
            <ConfirmationButtons locationId={location.id} />

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
            >
              Open in Google Maps
            </a>
          </section>
        </div>
      </article>

      {isImageOpen && location.photo_url ? (
        <ImageModal
          src={location.photo_url}
          alt={location.name}
          onClose={() => setIsImageOpen(false)}
        />
      ) : null}
    </>
  )
}

function SignalPill({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'good' | 'warn' | 'bad' | 'neutral'
}) {
  const toneClasses = {
    good: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100',
    warn: 'border-amber-400/40 bg-amber-500/20 text-amber-100',
    bad: 'border-rose-400/40 bg-rose-500/20 text-rose-100',
    neutral: 'border-white/15 bg-white/10 text-white/85',
  }

  return (
    <div
      className={`rounded-2xl border px-3 py-3 ${toneClasses[tone]}`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  )
}

function ImageModal({
  src,
  alt,
  onClose,
}: {
  src: string
  alt: string
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/70 px-3 py-2 text-sm font-semibold text-white"
        >
          Close
        </button>

        <div className="relative h-[70vh] w-full overflow-hidden rounded-2xl">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain bg-black"
            sizes="100vw"
            priority
          />
        </div>
      </div>
    </div>
  )
}

function formatCategory(category?: string | null) {
  if (!category) return 'Location'

  const normalized = category.toLowerCase()

  if (normalized === 'airport') return 'Airport'
  if (normalized === 'train_station') return 'Rail station'
  if (normalized === 'station') return 'Rail station'
  if (normalized === 'cafe') return 'Cafe'
  if (normalized === 'service_stop') return 'Service stop'

  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatPower(power?: string | null) {
  if (!power) return 'Unknown'

  const normalized = power.toLowerCase()

  if (normalized.includes('socket')) return 'Sockets'
  if (normalized.includes('visible') && normalized.includes('no')) return 'No visible sockets'
  if (normalized === 'yes') return 'Yes'
  if (normalized === 'no') return 'No'

  return power
}

function formatUsb(usb?: string | null) {
  if (!usb) return 'Unknown'

  const normalized = usb.toLowerCase()
  if (normalized === 'yes') return 'Yes'
  if (normalized === 'no') return 'No'
  if (normalized === 'unknown') return 'Unknown'

  return usb
}

function formatTableType(tableType?: string | null) {
  if (!tableType) return 'Unknown'

  const normalized = tableType.toLowerCase()

  if (normalized.includes('full')) return 'Full table'
  if (normalized.includes('small')) return 'Small table'
  if (normalized.includes('lap')) return 'Lap only'

  return tableType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatWifi(wifi?: boolean | null) {
  if (wifi === true) return 'Yes'
  if (wifi === false) return 'No'
  return 'Unknown'
}

function formatSignal(signal?: string | null) {
  if (!signal) return 'Unknown'

  return signal
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getPowerTone(power?: string | null): 'good' | 'warn' | 'bad' | 'neutral' {
  if (!power) return 'warn'

  const normalized = power.toLowerCase()
  if (normalized.includes('no')) return 'bad'
  if (normalized.includes('socket') || normalized === 'yes') return 'good'
  return 'warn'
}

function getUsbTone(usb?: string | null): 'good' | 'warn' | 'bad' | 'neutral' {
  if (!usb) return 'warn'

  const normalized = usb.toLowerCase()
  if (normalized === 'yes') return 'good'
  if (normalized === 'no') return 'bad'
  return 'warn'
}

function getTableTone(tableType?: string | null): 'good' | 'warn' | 'bad' | 'neutral' {
  if (!tableType) return 'warn'

  const normalized = tableType.toLowerCase()
  if (normalized.includes('full')) return 'good'
  if (normalized.includes('small')) return 'warn'
  if (normalized.includes('lap')) return 'bad'
  return 'neutral'
}

function getWifiTone(wifi?: boolean | null): 'good' | 'warn' | 'bad' | 'neutral' {
  if (wifi === true) return 'good'
  if (wifi === false) return 'bad'
  return 'warn'
}

function getSignalTone(signal?: string | null): 'good' | 'warn' | 'bad' | 'neutral' {
  if (!signal) return 'warn'

  const normalized = signal.toLowerCase()
  if (normalized === 'fast') return 'good'
  if (normalized === 'medium') return 'good'
  if (normalized === 'slow') return 'warn'
  if (normalized === 'nothing' || normalized === 'none' || normalized === 'no') {
    return 'bad'
  }

  return 'warn'
}

function getTrustLabel(
  reliabilityScore: number | null,
  confirmationCount: number
): { label: string; className: string } {

  if (confirmationCount === 0) {
    return {
      label: 'Needs verification',
      className: 'bg-amber-500/20 text-amber-100 border border-amber-400/30',
    }
  }

  if (confirmationCount < 3) {
    return {
      label: 'Early data',
      className: 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30',
    }
  }

  if (reliabilityScore !== null && reliabilityScore >= 7.5) {
    return {
      label: 'Highly reliable',
      className: 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30',
    }
  }

  if (reliabilityScore !== null && reliabilityScore >= 5) {
    return {
      label: 'Generally reliable',
      className: 'bg-sky-500/20 text-sky-100 border border-sky-400/30',
    }
  }

  return {
    label: 'Mixed feedback',
    className: 'bg-orange-500/20 text-orange-100 border border-orange-400/30',
  }
}

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  if (Number.isNaN(diffMs)) return 'recently'

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 30) return `${diffDays} days ago`

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return '1 month ago'
  if (diffMonths < 12) return `${diffMonths} months ago`

  const diffYears = Math.floor(diffMonths / 12)
  if (diffYears === 1) return '1 year ago'
  return `${diffYears} years ago`
}