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

const countryOptions = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'CD', name: 'Democratic Republic of the Congo' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KP', name: 'North Korea' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PS', name: 'Palestine' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
]

type SelectFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}

function SelectField({ label, value, onChange, children }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-900">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pm-field"
      >
        {children}
      </select>
    </label>
  )
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
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
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
      country_code: form.country_code,
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

    setMessage(
      'Thanks for contributing to the Plug Map community 🚀 Your submission will be reviewed before being published. You’re helping others work anywhere.'
    )
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
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-900">
                  Category
                </span>
                <select
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="pm-field"
                  required
                >
                  <option value="">Select a category</option>
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
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-900">
                    Town or city
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. London"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="pm-field"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-900">
                    Country
                  </span>
                  <select
                    value={form.country_code}
                    onChange={(e) => updateField('country_code', e.target.value)}
                    className="pm-field"
                    required
                  >
                    <option value="">Select a country</option>
                    {countryOptions.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-900">
                  Place name
                </span>
                <input
                  type="text"
                  placeholder="e.g. Costa Coffee Terminal 5"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="pm-field"
                  required
                />
              </label>

              {showHubCode && (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-900">
                    {showAirportFields ? 'Airport code' : 'Station code'}
                  </span>
                  <input
                    type="text"
                    placeholder={
                      showAirportFields
                        ? 'Optional, e.g. LHR'
                        : 'Optional station code'
                    }
                    value={form.hub_code}
                    onChange={(e) => updateField('hub_code', e.target.value.toUpperCase())}
                    className="pm-field"
                  />
                </label>
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
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-900">
                      Terminal
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Terminal 2"
                      value={form.terminal}
                      onChange={(e) => updateField('terminal', e.target.value)}
                      className="pm-field"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-900">
                      Near gate
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Gate A8"
                      value={form.near_gate}
                      onChange={(e) => updateField('near_gate', e.target.value)}
                      className="pm-field"
                    />
                  </label>
                </div>
              )}

              {showRailFields && (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-900">
                    Train platform
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Platform 4"
                    value={form.train_platform}
                    onChange={(e) => updateField('train_platform', e.target.value)}
                    className="pm-field"
                  />
                </label>
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
                    className="pm-field-soft"
                  />
                  <input
                    type="text"
                    value={form.lng}
                    readOnly
                    placeholder="Longitude"
                    className="pm-field-soft"
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
              <SelectField
                label="Power"
                value={form.power}
                onChange={(value) => updateField('power', value)}
              >
                <option value="">Select power availability</option>
                <option value="yes">Yes</option>
                <option value="limited">Limited</option>
                <option value="no">No</option>
              </SelectField>

              <SelectField
                label="USB"
                value={form.usb}
                onChange={(value) => updateField('usb', value)}
              >
                <option value="">Select USB availability</option>
                <option value="yes">Yes</option>
                <option value="limited">Limited</option>
                <option value="no">No</option>
              </SelectField>

              <SelectField
                label="Work style"
                value={form.table_type}
                onChange={(value) => updateField('table_type', value)}
              >
                <option value="">Select work style</option>
                <option value="full_table">Full table</option>
                <option value="counter">Counter</option>
                <option value="small_table">Small table</option>
                <option value="laptop_knee">Laptop knee</option>
                <option value="standing_ledge">Standing ledge</option>
                <option value="soft_seating">Soft seating</option>
              </SelectField>

              <SelectField
                label="Mobile signal"
                value={form.mobile_signal}
                onChange={(value) => updateField('mobile_signal', value)}
              >
                <option value="">Select signal strength</option>
                <option value="fast">Fast</option>
                <option value="medium">Medium</option>
                <option value="slow">Slow</option>
                <option value="none">None</option>
              </SelectField>

              <SelectField
                label="Wi-Fi"
                value={form.wifi_available}
                onChange={(value) => updateField('wifi_available', value)}
              >
                <option value="">Select Wi-Fi availability</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </SelectField>
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
                className="pm-field"
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
                    className="pm-field-soft"
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
                className="pm-field"
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