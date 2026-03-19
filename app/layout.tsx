import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plug Map',
  description: 'Find power and a proper place to work in transit.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900">
        
        {/* Background image */}
        <div className="fixed inset-0 -z-10">
          <img
            src="/plugmap-bg.png"
            alt="Background"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Optional dark overlay for readability */}
        <div className="fixed inset-0 -z-10 bg-black/40" />

        {children}
        <Analytics />
      </body>
    </html>
  )
}