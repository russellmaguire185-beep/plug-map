import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Work-Friendly Cafes | Plug Map',
  description:
    'Find work-friendly cafes with power sockets, WiFi, and laptop-friendly seating. Discover better places to work remotely with Plug Map.',
}

export default function WorkFriendlyCafesPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Find Work-Friendly Cafes with Power and WiFi
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-600">
          Plug Map helps you discover work-friendly cafes where you can open your laptop,
          stay charged, and get things done. Whether you are a remote worker, digital nomad,
          student, or commuter, finding cafes with plug sockets, WiFi, and comfortable seating
          can make all the difference.
        </p>

        <p className="mt-4 text-lg leading-8 text-slate-600">
          Instead of guessing which coffee shops are actually laptop-friendly, Plug Map helps
          you find places that are better suited for remote work, studying, and productivity.
        </p>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-semibold">What makes a cafe work-friendly?</h2>
          <ul className="mt-4 space-y-3 text-slate-700">
            <li>• Power sockets for charging laptops and phones</li>
            <li>• WiFi availability</li>
            <li>• Stable seating and table space</li>
            <li>• Comfortable setup for longer work sessions</li>
            <li>• Useful details added by real users</li>
          </ul>
        </div>

        <div className="mt-10">
          <Link
            href="/results?category=cafe"
            className="inline-flex rounded-xl bg-slate-900 px-5 py-3 text-white transition hover:opacity-90"
          >
            Explore work-friendly cafes
          </Link>
        </div>

        <div className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold">Who is Plug Map for?</h2>
          <p className="mt-4 text-slate-600 leading-8">
            Plug Map is built for digital nomads, remote workers, students, travellers, and
            commuters who need better places to work on the go. We focus on practical details
            like power, WiFi, seating, and setup quality — not just venue names.
          </p>
        </div>

        <div className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold">Explore more</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/airports-with-power" className="text-slate-700 underline underline-offset-4">
              Airports with power
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