import { Suspense } from 'react'
import NearbyPageClient from './nearby-page-client'

export default function NearbyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6 text-white/80 backdrop-blur-xl">
              Loading nearby spots...
            </div>
          </div>
        </main>
      }
    >
      <NearbyPageClient />
    </Suspense>
  )
}