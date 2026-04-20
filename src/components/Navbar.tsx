'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const R = "'Raleway', system-ui, sans-serif"

const LEFT_ITEMS = [
  { href: '/propiedades?op=venta', label: 'Comprar' },
  { href: '/propiedades?op=alquiler', label: 'Alquilar' },
  { href: '/tasaciones', label: 'Vender' },
  { href: '/emprendimientos', label: 'Emprendimientos' },
]

const RIGHT_ITEMS = [
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/blog', label: 'Blog' },
  { href: '/guia', label: 'Guía' },
  { href: '/informes', label: 'Informes' },
]

const DRAWER_ITEMS = [...LEFT_ITEMS, ...RIGHT_ITEMS]

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="hover:text-[#1A5C38] transition-colors duration-200 whitespace-nowrap text-[14px] xl:text-[17px]"
      style={{ fontFamily: R, fontWeight: 500, color: '#111', textDecoration: 'none' }}
    >
      {label}
    </Link>
  )
}


export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const isPropiedades = pathname.startsWith('/propiedades')

  // En /propiedades mobile: ocultar (PropiedadesView tiene su propio header)
  // En home y demás rutas: MOSTRAR navbar blanco con logo + hamburguesa
  const hideOnMobile = isPropiedades

  return (
    <div className={hideOnMobile ? 'hidden lg:block' : ''}>
      {/* ── Desktop nav (lg+) ── */}
      <nav
        className="hidden lg:block sticky top-0 left-0 right-0 z-[100] bg-white"
        style={{ borderBottom: '1px solid #eee' }}
      >
        <div className="relative mx-auto flex items-center" style={{ maxWidth: 1400, padding: '18px 40px' }}>
          {/* Left menu */}
          <div className="flex items-center gap-5 xl:gap-8">
            {LEFT_ITEMS.map(item => <NavLink key={item.href} {...item} />)}
          </div>

          {/* Centered logo (absolute) */}
          <Link
            href="/"
            className="absolute left-1/2 top-1/2"
            style={{ transform: 'translate(-50%, -50%)', textDecoration: 'none' }}
          >
            <Image
              src="/LOGO_HORIZONTAL.png"
              alt="SI Inmobiliaria"
              width={246}
              height={36}
              className="object-contain"
              style={{ height: 36, width: 'auto' }}
              priority
              quality={90}
            />
          </Link>

          {/* Right menu + CTA */}
          <div className="ml-auto flex items-center gap-5 xl:gap-8">
            {RIGHT_ITEMS.map(item => <NavLink key={item.href} {...item} />)}
            <Link
              href="/agentes"
              className="hover:opacity-90 transition-colors duration-200 text-[14px] xl:text-[17px]"
              style={{
                fontFamily: R, fontWeight: 500, color: '#fff',
                background: '#1A5C38', padding: '10px 24px', borderRadius: 6,
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#144a2c' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1A5C38' }}
            >
              Ingresar
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Mobile nav (<lg) ── */}
      <nav
        className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-100"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="relative flex items-center justify-between px-4 py-2.5">
          {/* Left — hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex items-center justify-center"
            aria-label="Menú"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>

          {/* Center — logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2" style={{ textDecoration: 'none' }}>
            <Image
              src="/LOGO_HORIZONTAL.png"
              alt="SI Inmobiliaria"
              width={205}
              height={24}
              className="object-contain"
              style={{ height: 24, width: 'auto' }}
              priority
              quality={90}
            />
          </Link>

          {/* Right — Ingresar */}
          <Link
            href="/agentes"
            className="text-gray-600 text-sm font-medium"
            style={{ fontFamily: "'Poppins', sans-serif", textDecoration: 'none' }}
          >
            Ingresar
          </Link>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[101]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div
            className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', animation: 'slideRight 200ms ease-out' }}
          >
            <div className="px-5 pb-4 mb-2 border-b border-gray-100 flex items-center justify-between">
              <Link href="/" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                <Image
                  src="/LOGO_HORIZONTAL.png"
                  alt="SI Inmobiliaria"
                  width={164}
                  height={24}
                  className="object-contain"
                  style={{ height: 24, width: 'auto' }}
                  quality={90}
                />
              </Link>
              <button onClick={() => setIsOpen(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="px-3 space-y-0.5">
              {DRAWER_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 text-[15px] text-gray-800 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: R }}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href="/agentes"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center text-sm font-bold px-4 py-3 rounded-lg hover:bg-[#0f3d25] transition-colors mt-4"
                style={{ fontFamily: R, background: '#1A5C38', color: '#fff' }}
              >
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
