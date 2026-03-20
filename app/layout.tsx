import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plug Map',
  description: 'Find power, Wi-Fi, mobile signal, and a proper place to work in transit.',
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