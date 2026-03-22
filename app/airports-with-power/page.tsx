import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Airports with Power and WiFi | Plug Map',
  description:
    'Find airport work spots with plug sockets, WiFi, and better laptop-friendly seating. Perfect for travellers, commuters, and remote workers.',
}

export default function AirportsWithPowerPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Find Airports with Power, WiFi and Better Work Spots
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-600">
          Airports are full of dead zones for remote work. Plug Map helps you find airport
          seating areas, cafes, lounges, and waiting zones where power sockets, WiFi, and
          practical workspace details actually matter.
        </p>

        <p className="mt-4 text-lg leading-8 text-slate-600">
          Whether you are between flights, working while travelling, or trying to stay charged
          before boarding, Plug Map helps surface more useful airport work spots.
        </p>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-semibold">Useful airport work details</h2>
          <ul className="mt-4 space-y-3 text-slate-700">
            <li>• Plug socket access</li>
            <li>• USB charging options</li>
            <li>• WiFi availability</li>
            <li>• Terminal or gate area directions</li>
            <li>• Laptop-friendly seating notes</li>
          </ul>
        </div>

        <div className="mt-10">
          <Link
            href="/results?category=airport"
            className="inline-flex rounded-xl bg-slate-900 px-5 py-3 text-white transition hover:opacity-90"
          >
            Explore airport work spots
          </Link>
        </div>

        <div className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold">Explore more</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/work-friendly-cafes" className="text-slate-700 underline underline-offset-4">
              Work-friendly cafes
            </Link>
            <Link href="/laptop-friendly-spots" className="text-slate-700 underline underline-offset-4">
              Laptop-friendly spots
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