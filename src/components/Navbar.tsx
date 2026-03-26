'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, MapPin } from 'lucide-react'
import SearchAutocomplete from './SearchAutocomplete'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white sticky top-0 z-40 w-full shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="SI Inmobiliaria"
              style={{ height: '44px', width: 'auto' }}
              className="h-[32px] md:h-[44px] w-auto"
            />
          </Link>

          {/* Center search — desktop */}
          <div className="hidden md:block flex-1 mx-8 max-w-lg">
            <SearchAutocomplete variant="navbar" />
          </div>

          {/* Right links — desktop */}
          <div className="hidden md:flex items-center gap-5 flex-shrink-0">
            <Link href="/propiedades" className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Propiedades
            </Link>
            <Link href="/emprendimientos" className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors">
              Emprendimientos
            </Link>
            <Link href="/nosotros" className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors">
              Nosotros
            </Link>
            <Link href="/tasaciones" className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors">
              Tasaciones
            </Link>
            <Link href="/blog" className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors">
              Blog
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-brand-600 focus:outline-none p-2"
            aria-label="Menú"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute w-full bg-white shadow-xl border-t border-gray-100 z-50">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile search with autocomplete */}
            <SearchAutocomplete variant="navbar" onSelect={() => setIsOpen(false)} />

            <div className="space-y-1 pt-1">
              <Link
                href="/propiedades"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:text-brand-600 font-medium transition-colors rounded-lg hover:bg-gray-50"
              >
                <MapPin className="w-4 h-4" />
                Propiedades
              </Link>
              <Link
                href="/emprendimientos"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 text-sm text-gray-700 hover:text-brand-600 font-medium transition-colors rounded-lg hover:bg-gray-50"
              >
                Emprendimientos
              </Link>
              <Link
                href="/nosotros"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 text-sm text-gray-700 hover:text-brand-600 font-medium transition-colors rounded-lg hover:bg-gray-50"
              >
                Nosotros
              </Link>
              <Link
                href="/tasaciones"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 text-sm text-gray-700 hover:text-brand-600 font-medium transition-colors rounded-lg hover:bg-gray-50"
              >
                Tasaciones
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 text-sm text-gray-700 hover:text-brand-600 font-medium transition-colors rounded-lg hover:bg-gray-50"
              >
                Blog
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
