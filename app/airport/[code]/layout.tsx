import type { Metadata } from 'next'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{
    code: string
  }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { code } = await params
  const airportCode = code.toUpperCase()

  return {
    title: `Best places to work in ${airportCode} airport | Work Spots`,
    description: `Discover the best places to work in ${airportCode} airport, including lounges, cafes, restaurants, and seating areas with power, Wi-Fi, mobile signal, and laptop-friendly seating.`,
  }
}

export default function AirportLayout({ children }: LayoutProps) {
  return children
}