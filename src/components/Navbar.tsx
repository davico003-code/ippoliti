'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, MapPin } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 480)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      {/* ── Desktop nav (unchanged) ── */}
      <nav className="hidden md:block bg-white sticky top-0 z-40 w-full shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="SI Inmobiliaria"
                style={{ height: '44px', width: 'auto' }}
                className="h-[44px] w-auto"
              />
            </Link>
            <div className="flex items-center gap-5 flex-shrink-0">
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
              <Link href="/informes" className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors">
                Informes
              </Link>
              <a href="/agentes/login" className="bg-[#1A5C38] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#0f3d25] transition-colors">
                Acceder
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile nav — transparent / scrolled compact ── */}
      <nav
        className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-white shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center justify-between h-14 px-4 relative">
          {/* Hamburger — left */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-11 h-11 flex items-center justify-center focus:outline-none"
            aria-label="Menú"
            aria-expanded={isOpen}
          >
            {isOpen
              ? <X className="w-7 h-7" style={{ color: scrolled ? '#1A5C38' : '#fff' }} />
              : <Menu className="w-7 h-7" style={{ color: scrolled ? '#1A5C38' : '#fff' }} />}
          </button>

          {/* Logo — center */}
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {scrolled ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/logo.png" alt="SI Inmobiliaria" style={{ height: 40, width: 'auto' }} />
            ) : (
              <Image src="/logo-blanco.png" alt="SI Inmobiliaria" width={160} height={44}
                style={{ height: 40, width: 'auto' }} priority />
            )}
          </Link>

          {/* Agentes button — right */}
          <a
            href="/agentes/login"
            className="px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-colors"
            style={{
              background: scrolled ? '#fff' : 'rgba(255,255,255,0.15)',
              border: scrolled ? '1.5px solid #e5e7eb' : '1.5px solid rgba(255,255,255,0.3)',
              color: scrolled ? '#1A5C38' : '#fff',
              fontFamily: "'Raleway', system-ui, sans-serif",
              backdropFilter: scrolled ? 'none' : 'blur(8px)',
            }}
          >
            Agentes
          </a>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', animation: 'slideRight 200ms ease-out' }}>
            <div className="px-5 pb-4 mb-2 border-b border-gray-100 flex items-center justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SI Inmobiliaria" style={{ height: 32, width: 'auto' }} />
              <button onClick={() => setIsOpen(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="px-3 space-y-0.5">
              {[
                { href: '/propiedades', label: 'Propiedades', icon: true },
                { href: '/emprendimientos', label: 'Emprendimientos' },
                { href: '/nosotros', label: 'Nosotros' },
                { href: '/tasaciones', label: 'Tasaciones' },
                { href: '/blog', label: 'Blog' },
                { href: '/informes', label: 'Informes' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-3 text-[15px] text-gray-700 hover:text-brand-600 font-medium transition-colors rounded-lg hover:bg-gray-50"
                >
                  {item.icon && <MapPin className="w-4 h-4" />}
                  {item.label}
                </Link>
              ))}
              <a
                href="/agentes/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center bg-[#1A5C38] text-white text-sm font-semibold px-4 py-3 rounded-full hover:bg-[#0f3d25] transition-colors mt-4"
              >
                Acceder
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
