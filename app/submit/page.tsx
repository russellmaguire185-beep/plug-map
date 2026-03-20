'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const MapPicker = dynamic(() => import('../../components/map-picker'), {
  ssr: false,
})

type FormState = {
  category: string
  city: string
  country_code: string
  name: string
  hub_code: string
  terminal: string
  near_gate: string
  train_platform: string
  power: string
  usb: string
  table_type: string
  mobile_signal: string
  wifi_available: string
  directions: string
  lat: string
  lng: string
  photo_url: string
}

const initialForm: FormState = {
  category: '',
  city: '',
  country_code: '',
  name: '',
  hub_code: '',
  terminal: '',
  near_gate: '',
  train_platform: '',
  power: '',
  usb: '',
  table_type: '',
  mobile_signal: '',
  wifi_available: '',
  directions: '',
  lat: '',
  lng: '',
  photo_url: '',
}

export default function SubmitPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUserId(session?.user?.id ?? null)
      setLoadingUser(false)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
      setLoadingUser(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function signInWithGoogle() {
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })

    if (error) {
      setError(error.message)
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (!file) return

    if (!userId) {
      setError('Please sign in before uploading a photo.')
      return
    }

    setError('')
    setUploadingPhoto(true)

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filePath = `${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('location-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      setError(uploadError.message)
      setUploadingPhoto(false)
      return
    }

    const { data } = supabase.storage.from('location-photos').getPublicUrl(filePath)

    updateField('photo_url', data.publicUrl)
    setUploadingPhoto(false)

    e.target.value = ''
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!userId) {
      setError('You need to sign in first.')
      return
    }

    if (!form.category || !form.city || !form.country_code || !form.name) {
      setError('Please complete the required fields.')
      return
    }

    setSubmitting(true)

    const payload = {
      category: form.category,
      city: form.city.trim(),
      country_code: form.country_code.trim(),
      name: form.name.trim(),
      hub_code: form.hub_code.trim() || null,
      terminal: form.terminal.trim() || null,
      near_gate: form.near_gate.trim() || null,
      train_platform: form.train_platform.trim() || null,
      power: form.power || null,
      usb: form.usb || null,
      table_type: form.table_type || null,
      mobile_signal: form.mobile_signal || null,
      wifi_available:
        form.wifi_available === ''
          ? null
          : form.wifi_available === 'yes',
      directions: form.directions.trim() || null,
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      photo_url: form.photo_url.trim() || null,
      submitted_by: userId,
      status: 'pending',
    }

    const { error: insertError } = await supabase.from('locations').insert([payload])

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    setMessage('Thanks — your submission has been sent for review.')
    setForm(initialForm)
    setSubmitting(false)
  }

  const showAirportFields = form.category === 'airport'
  const showRailFields = form.category === 'rail_station'
  const showBusFields = form.category === 'bus_station'
  const showHubCode = showAirportFields || showRailFields || showBusFields

  return (
    <main className="min-h-screen px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/30 bg-white/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <Link
          href="/"
          className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:underline"
        >
          ← Back to Plug Map
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Submit a location</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add a new airport, station, cafe or other pass-through workspace.
        </p>

        {!loadingUser && !userId && (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              You need to sign in with Google before you can submit a location.
            </p>

            <button
              type="button"
              onClick={signInWithGoogle}
              className="mt-3 inline-flex items-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Sign in with Google
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold">Place details</h2>
            <p className="mt-1 text-sm text-slate-600">
              Start with what the place is and where it is.
            </p>

            <div className="mt-4 space-y-4">
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                required
              >
                <option value="">What is the location?</option>
                <option value="airport">Airport</option>
                <option value="rail_station">Train station</option>
                <option value="bus_station">Bus station</option>
                <option value="service_station">Service station</option>
                <option value="cafe">Cafe</option>
                <option value="restaurant_bar">Restaurant / Bar</option>
                <option value="hotel_lobby">Hotel lobby</option>
                <option value="public_building">Public building</option>
                <option value="outdoor">Outdoor</option>
                <option value="other">Other</option>
              </select>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Town or city"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                  required
                />

                <input
                  type="text"
                  placeholder="Country (e.g. United Kingdom)"
                  value={form.country_code}
                  onChange={(e) => updateField('country_code', e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                  required
                />
              </div>

              <input
                type="text"
                placeholder="Place name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                required
              />

              {showHubCode && (
                <input
                  type="text"
                  placeholder={
                    showAirportFields
                      ? 'Airport code (optional, e.g. LHR)'
                      : 'Station code (optional)'
                  }
                  value={form.hub_code}
                  onChange={(e) => updateField('hub_code', e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                />
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Exact location</h2>
            <p className="mt-1 text-sm text-slate-600">
              Add more detail so people can actually find it.
            </p>

            <div className="mt-4 space-y-4">
              {showAirportFields && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Terminal"
                    value={form.terminal}
                    onChange={(e) => updateField('terminal', e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Near gate"
                    value={form.near_gate}
                    onChange={(e) => updateField('near_gate', e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                  />
                </div>
              )}

              {showRailFields && (
                <input
                  type="text"
                  placeholder="Train platform"
                  value={form.train_platform}
                  onChange={(e) => updateField('train_platform', e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                />
              )}

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-900">
                  Pin the exact location
                </label>

                <MapPicker
                  lat={form.lat}
                  lng={form.lng}
                  onChange={(lat, lng) => {
                    setForm((prev) => ({
                      ...prev,
                      lat,
                      lng,
                    }))
                  }}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    value={form.lat}
                    readOnly
                    placeholder="Latitude"
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none"
                  />
                  <input
                    type="text"
                    value={form.lng}
                    readOnly
                    placeholder="Longitude"
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Facilities</h2>
            <p className="mt-1 text-sm text-slate-600">
              Tell people what&apos;s actually useful there.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <select
                value={form.power}
                onChange={(e) => updateField('power', e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
              >
                <option value="">Power available</option>
                <option value="yes">Yes</option>
                <option value="limited">Limited</option>
                <option value="no">No</option>
              </select>

              <select
                value={form.usb}
                onChange={(e) => updateField('usb', e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
              >
                <option value="">USB available</option>
                <option value="yes">Yes</option>
                <option value="limited">Limited</option>
                <option value="no">No</option>
              </select>

              <select
                value={form.table_type}
                onChange={(e) => updateField('table_type', e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
              >
                <option value="">Work style</option>
                <option value="full_table">Full table</option>
                <option value="counter">Counter</option>
                <option value="small_table">Small table</option>
                <option value="laptop_knee">Laptop knee</option>
                <option value="standing_ledge">Standing ledge</option>
                <option value="soft_seating">Soft seating</option>
              </select>

              <select
                value={form.mobile_signal}
                onChange={(e) => updateField('mobile_signal', e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
              >
                <option value="">Mobile signal</option>
                <option value="fast">Fast</option>
                <option value="medium">Medium</option>
                <option value="slow">Slow</option>
                <option value="none">None</option>
              </select>

              <select
                value={form.wifi_available}
                onChange={(e) => updateField('wifi_available', e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
              >
                <option value="">Wi-Fi available</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Photo</h2>
            <p className="mt-1 text-sm text-slate-600">
              Upload a photo to help people recognise the spot.
            </p>

            <div className="mt-4 space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                disabled={!userId || uploadingPhoto}
              />

              {uploadingPhoto && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  Uploading photo...
                </div>
              )}

              {form.photo_url && (
                <div className="space-y-3">
                  <img
                    src={form.photo_url}
                    alt="Uploaded preview"
                    className="h-56 w-full rounded-2xl border border-slate-300 object-cover"
                  />
                  <input
                    type="text"
                    value={form.photo_url}
                    readOnly
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
                  />
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Directions / notes</h2>
            <p className="mt-1 text-sm text-slate-600">
              Add anything helpful, like where the sockets are or how to find the spot.
            </p>

            <div className="mt-4">
              <textarea
                placeholder="Example: Upstairs near Gate A8, quiet corner, sockets under the window seats."
                value={form.directions}
                onChange={(e) => updateField('directions', e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
              />
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={!userId || submitting || uploadingPhoto}
            className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? 'Submitting...' : 'Submit for review'}
          </button>
        </form>
      </div>
    </main>
  )
}