import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Laptop-Friendly Spots | Plug Map',
  description:
    'Find laptop-friendly places to work with power sockets, WiFi, and seating that actually works for studying, commuting, and remote work.',
}

export default function LaptopFriendlySpotsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Find Laptop-Friendly Spots with Power, WiFi and Seating
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-600">
          Not every cafe, airport, or station is truly laptop-friendly. Plug Map helps you find
          places where you can realistically sit down, charge up, connect to WiFi, and work
          comfortably.
        </p>

        <p className="mt-4 text-lg leading-8 text-slate-600">
          Whether you are studying, remote working, travelling, or commuting, Plug Map focuses
          on the practical details that matter when you need a reliable place to work.
        </p>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-semibold">What users look for</h2>
          <ul className="mt-4 space-y-3 text-slate-700">
            <li>• Power access nearby</li>
            <li>• Free or usable WiFi</li>
            <li>• Stable tables and seating</li>
            <li>• Good environment for laptop use</li>
            <li>• Real-world details from submitted locations</li>
          </ul>
        </div>

        <div className="mt-10">
          <Link
            href="/results"
            className="inline-flex rounded-xl bg-slate-900 px-5 py-3 text-white transition hover:opacity-90"
          >
            Browse laptop-friendly spots
          </Link>
        </div>

        <div className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold">Explore more</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/work-friendly-cafes" className="text-slate-700 underline underline-offset-4">
              Work-friendly cafes
            </Link>
            <Link href="/airports-with-power" className="text-slate-700 underline underline-offset-4">
              Airports with power
            </Link>
            <Link href="/results" className="text-slate-700 underline underline-offset-4">
              Browse all places
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}