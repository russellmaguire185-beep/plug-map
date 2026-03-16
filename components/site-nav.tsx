'use client'

import Link from 'next/link'
import AuthButton from './auth-button'

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-white font-semibold">
          Plug Map
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/" className="text-white/85 hover:text-white">
            Search
          </Link>
          <Link href="/submit" className="text-white/85 hover:text-white">
            Submit
          </Link>
          <Link href="/admin" className="text-white/85 hover:text-white">
            Admin
          </Link>
        </nav>

        <AuthButton />
      </div>
    </header>
  )
}