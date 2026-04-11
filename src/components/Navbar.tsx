'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const hidden = pathname.startsWith('/propiedades')

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 400)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  if (hidden) return null

  const R = "'Raleway', system-ui, sans-serif"

  return (
    <>
      {/* ── Desktop nav ── */}
      <nav className="hidden md:block bg-white sticky top-0 z-40 w-full" style={{ borderBottom: '1px solid #e0e0e0' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between" style={{ height: 52 }}>
            <Link href="/" className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SI Inmobiliaria" style={{ height: 36, width: 'auto' }} />
            </Link>
            <div className="flex items-center gap-5 flex-shrink-0">
              <Link href="/propiedades?op=venta" style={{ fontFamily: R, fontSize: 14, fontWeight: 700, color: '#1d1d1f', textDecoration: 'none' }} className="hover:text-[#1A5C38] transition-colors">
                Comprar
              </Link>
              <Link href="/propiedades?op=alquiler" style={{ fontFamily: R, fontSize: 14, fontWeight: 700, color: '#1d1d1f', textDecoration: 'none' }} className="hover:text-[#1A5C38] transition-colors">
                Alquilar
              </Link>
              <Link href="/tasaciones" style={{ fontFamily: R, fontSize: 14, fontWeight: 700, color: '#1d1d1f', textDecoration: 'none' }} className="hover:text-[#1A5C38] transition-colors">
                Vender
              </Link>
              <Link href="/emprendimientos" style={{ fontFamily: R, fontSize: 14, fontWeight: 700, color: '#1d1d1f', textDecoration: 'none' }} className="hover:text-[#1A5C38] transition-colors">
                Emprendimientos
              </Link>
              <Link href="/nosotros" style={{ fontFamily: R, fontSize: 14, fontWeight: 700, color: '#1d1d1f', textDecoration: 'none' }} className="hover:text-[#1A5C38] transition-colors">
                Nosotros
              </Link>
              <Link href="/blog" style={{ fontFamily: R, fontSize: 14, fontWeight: 700, color: '#1d1d1f', textDecoration: 'none' }} className="hover:text-[#1A5C38] transition-colors">
                Blog
              </Link>
              <a href="/agentes/login" style={{ fontFamily: R, fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 8, background: '#1A5C38', color: '#fff', textDecoration: 'none' }}
                className="hover:bg-[#0f3d25] transition-colors">
                Acceder
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile nav ── */}
      <nav
        className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          scrolled ? 'bg-white' : 'bg-transparent'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', borderBottom: scrolled ? '1px solid #e0e0e0' : 'none' }}
      >
        <div className="flex items-center justify-between px-4 relative" style={{ height: 52 }}>
          <button onClick={() => setIsOpen(!isOpen)} className="w-11 h-11 flex items-center justify-center" aria-label="Menú" aria-expanded={isOpen}>
            {isOpen
              ? <X className="w-6 h-6" style={{ color: scrolled ? '#1d1d1f' : '#fff' }} />
              : <Menu className="w-6 h-6" style={{ color: scrolled ? '#1d1d1f' : '#fff' }} />}
          </button>
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {scrolled ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/logo.png" alt="SI Inmobiliaria" style={{ height: 32, width: 'auto' }} />
            ) : (
              <Image src="/logo-blanco.png" alt="SI Inmobiliaria" width={140} height={36}
                style={{ height: 32, width: 'auto' }} priority />
            )}
          </Link>
          <a href="/agentes/login" className="text-[12px] font-bold transition-colors" style={{
            fontFamily: R, padding: '5px 12px', borderRadius: 8,
            background: scrolled ? '#fff' : 'rgba(255,255,255,0.15)',
            border: scrolled ? '1px solid #e0e0e0' : '1px solid rgba(255,255,255,0.3)',
            color: scrolled ? '#1A5C38' : '#fff', textDecoration: 'none',
            backdropFilter: scrolled ? 'none' : 'blur(8px)',
          }}>
            Agentes
          </a>
        </div>
      </nav>

      {/* Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', animation: 'slideRight 200ms ease-out' }}>
            <div className="px-5 pb-4 mb-2 border-b border-gray-100 flex items-center justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SI Inmobiliaria" style={{ height: 28, width: 'auto' }} />
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
              <a href="/agentes/login" onClick={() => setIsOpen(false)}
                className="flex items-center justify-center bg-[#1A5C38] text-white text-sm font-bold px-4 py-3 rounded-lg hover:bg-[#0f3d25] transition-colors mt-4"
                style={{ fontFamily: R }}>
                Acceder
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
    </>
  )
}
