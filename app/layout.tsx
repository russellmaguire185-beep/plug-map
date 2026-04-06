import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://work-spots.com'),
  title: 'Work Spots – Find places to work with power, Wi-Fi and seating',
  description:
    'Find laptop-friendly places to work in airports, train stations, cafes and service stops. Discover locations with power sockets, Wi-Fi and mobile signal.',
  keywords: [
    'airport workspace',
    'train station workspace',
    'places to work with wifi',
    'places to work with power sockets',
    'laptop friendly cafes',
    'work while travelling',
    'digital nomad workspace',
    'remote work locations',
    'airport seating with power',
    'work spots',
  ],
  openGraph: {
    title: 'Work Spots – Find places to work anywhere',
    description:
      'Discover laptop-friendly spots with power, Wi-Fi, mobile signal and proper seating.',
    url: 'https://work-spots.com',
    siteName: 'Work Spots',
    images: [
      {
        url: '/plugmap-bg.png',
        width: 1200,
        height: 630,
        alt: 'Work Spots',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work Spots – Find places to work anywhere',
    description:
      'Discover laptop-friendly spots with power, Wi-Fi, mobile signal and proper seating.',
    images: ['/plugmap-bg.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="en">
      <head>
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
      </head>

      <body className="min-h-screen text-slate-900">
        <div className="fixed inset-0 -z-10">
          <img
            src="/plugmap-bg.png"
            alt="Background"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="fixed inset-0 -z-10 bg-black/40" />

        {children}

        <Analytics />
      </body>
    </html>
  )
}