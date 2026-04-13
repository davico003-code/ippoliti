'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const hidden = pathname.startsWith('/propiedades')
  const [scrolled, setScrolled] = useState(hidden)

  useEffect(() => {
    // On /propiedades the page doesn't scroll (overflow:hidden), so force
    // the opaque header so it's visible over the white filter bar.
    if (hidden) { setScrolled(true); return }
    const handler = () => setScrolled(window.scrollY > 80)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [hidden])

  const R = "'Raleway', system-ui, sans-serif"

  return (
    <div className={hidden ? 'hidden md:block' : ''}>
      {/* ── Desktop nav ── */}
      <nav className={`hidden md:block fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo-si.png"
                alt="SI Inmobiliaria"
                width={160}
                height={28}
                className="object-contain"
                style={{ filter: scrolled ? 'brightness(0)' : 'none', transition: 'filter 0.2s' }}
                priority
              />
            </Link>
            <div className="flex items-center gap-5 flex-shrink-0">
              {[
                { href: '/propiedades?op=venta', label: 'Comprar' },
                { href: '/propiedades?op=alquiler', label: 'Alquilar' },
                { href: '/tasaciones', label: 'Vender' },
                { href: '/emprendimientos', label: 'Emprendimientos' },
                { href: '/nosotros', label: 'Nosotros' },
                { href: '/blog', label: 'Blog' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="hover:text-[#1A5C38] transition-colors"
                  style={{ fontFamily: R, fontSize: 14, fontWeight: 500, color: scrolled ? '#1d1d1f' : '#fff', textDecoration: 'none', letterSpacing: '0.3px' }}>
                  {item.label}
                </Link>
              ))}
              <Link href="/agentes"
                className="hover:text-[#1A5C38] transition-colors"
                style={{ fontFamily: R, fontSize: 14, fontWeight: 500, color: scrolled ? '#1d1d1f' : '#fff', textDecoration: 'none' }}>
                Ingresar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile nav ── */}
      <nav
        className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          scrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100' : 'bg-transparent'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center px-4 h-14">
          {/* Left — hamburger */}
          <div className="flex-1">
            <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 flex items-center justify-center" aria-label="Menú" aria-expanded={isOpen}>
              {isOpen
                ? <X className="w-6 h-6" style={{ color: scrolled ? '#1d1d1f' : '#fff' }} />
                : <Menu className="w-6 h-6" style={{ color: scrolled ? '#1d1d1f' : '#fff' }} />}
            </button>
          </div>

          {/* Center — logo */}
          <Link href="/" className="flex justify-center">
            <Image
              src="/logo-si.png"
              alt="SI Inmobiliaria"
              width={137}
              height={24}
              className="object-contain"
              style={{ filter: scrolled ? 'brightness(0)' : 'none', transition: 'filter 0.2s' }}
              priority
            />
          </Link>

          {/* Right — ingresar */}
          <div className="flex-1 flex justify-end">
            <Link href="/agentes"
              className="transition-colors"
              style={{ fontFamily: R, fontSize: 14, fontWeight: 500, color: scrolled ? '#1d1d1f' : '#fff', textDecoration: 'none' }}>
              Ingresar
            </Link>
          </div>
        </div>
      </nav>

      {/* Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', animation: 'slideRight 200ms ease-out' }}>
            <div className="px-5 pb-4 mb-2 border-b border-gray-100 flex items-center justify-between">
              <Image src="/logo-si.png" alt="SI Inmobiliaria" width={120} height={21}
                style={{ height: 24, width: 'auto', filter: 'brightness(0)' }} />
              <button onClick={() => setIsOpen(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="px-3 space-y-0.5">
              {[
                { href: '/propiedades?op=venta', label: 'Comprar' },
                { href: '/propiedades?op=alquiler', label: 'Alquilar' },
                { href: '/tasaciones', label: 'Vender' },
                { href: '/emprendimientos', label: 'Emprendimientos' },
                { href: '/nosotros', label: 'Nosotros' },
                { href: '/blog', label: 'Blog' },
                { href: '/informes', label: 'Informes' },
              ].map(item => (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 text-[15px] text-gray-800 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: R }}>
                  {item.label}
                </Link>
              ))}
              <a href="/agentes" onClick={() => setIsOpen(false)}
                className="flex items-center justify-center bg-[#1A5C38] text-white text-sm font-bold px-4 py-3 rounded-lg hover:bg-[#0f3d25] transition-colors mt-4"
                style={{ fontFamily: R }}>
                Ingresar
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
    </div>
  )
}
