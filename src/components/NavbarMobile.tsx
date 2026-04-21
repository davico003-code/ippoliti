'use client'

// Navbar mobile island — menú hamburguesa con drawer. Es la única parte
// con estado (isOpen). El resto del Navbar (desktop nav con todos los
// links) se renderiza server-side.
//
// También resuelve aquí el hide-on-/propiedades — PropiedadesView tiene
// su propio header mobile, así que evitamos doble navbar.

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const R = "'Raleway', system-ui, sans-serif"

interface NavItem {
  href: string
  label: string
}

export default function NavbarMobile({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Propiedades tiene su propio header mobile — no pisarlo.
  if (pathname?.startsWith('/propiedades')) return null

  return (
    <>
      {/* Top bar */}
      <nav
        className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-100"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="relative flex items-center justify-between px-4 py-2.5">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex items-center justify-center"
            aria-label="Menú"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2" style={{ textDecoration: 'none' }}>
            <Image
              src="/LOGO_HORIZONTAL.png"
              alt="SI INMOBILIARIA"
              width={205}
              height={24}
              className="object-contain"
              style={{ height: 24, width: 'auto' }}
              priority
              quality={90}
            />
          </Link>

          <Link
            href="/agentes"
            className="text-gray-600 text-sm font-medium"
            style={{ fontFamily: "'Poppins', sans-serif", textDecoration: 'none' }}
          >
            Ingresar
          </Link>
        </div>
      </nav>

      {/* Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[101]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div
            className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl"
            style={{
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
              animation: 'slideRight 200ms ease-out',
            }}
          >
            <div className="px-5 pb-4 mb-2 border-b border-gray-100 flex items-center justify-between">
              <Link href="/" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                <Image
                  src="/LOGO_HORIZONTAL.png"
                  alt="SI INMOBILIARIA"
                  width={164}
                  height={24}
                  className="object-contain"
                  style={{ height: 24, width: 'auto' }}
                  quality={90}
                />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="px-3 space-y-0.5">
              {items.map(item => (
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
    </>
  )
}
