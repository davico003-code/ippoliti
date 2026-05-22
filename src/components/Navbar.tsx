'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, User, X } from 'lucide-react'

const R = "'Raleway', system-ui, sans-serif"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

type IngresarButtonProps = {
  agent: { name: string } | null
  onClick?: () => void
}

function IngresarButton({ agent, onClick }: IngresarButtonProps) {
  const isAuthed = !!agent
  return (
    <Link
      href="/agentes"
      onClick={onClick}
      aria-label={isAuthed ? `Cuenta de ${agent!.name}` : 'Ingresar'}
      className="inline-flex items-center justify-center transition-colors duration-200"
      style={{
        width: 40,
        height: 40,
        background: '#1A5C38',
        border: '2px solid rgba(255,255,255,0.25)',
        borderRadius: 9999,
        cursor: 'pointer',
        textDecoration: 'none',
        color: '#fff',
        flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#144a2c' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#1A5C38' }}
    >
      {isAuthed ? (
        <span style={{ fontFamily: R, fontWeight: 500, fontSize: 13, color: '#fff', lineHeight: 1 }}>
          {getInitials(agent!.name)}
        </span>
      ) : (
        <User size={18} strokeWidth={2} color="#fff" />
      )}
    </Link>
  )
}

const LEFT_ITEMS = [
  { href: '/propiedades?op=venta', label: 'Comprar' },
  { href: '/propiedades?op=alquiler', label: 'Alquilar' },
  { href: '/tasaciones', label: 'Vender' },
  { href: '/emprendimientos', label: 'Emprendimientos' },
]

const RIGHT_ITEMS = [
  { href: '/barrios-privados', label: 'Barrios cerrados' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/blog', label: 'Blog' },
  { href: '/recursos', label: 'Recursos' },
]

const DRAWER_ITEMS = [...LEFT_ITEMS, ...RIGHT_ITEMS]

function NavLink({ href, label, transparent }: { href: string; label: string; transparent: boolean }) {
  return (
    <Link
      href={href}
      className="hover:text-[#1A5C38] transition-colors duration-200 whitespace-nowrap text-[14px] xl:text-[17px]"
      style={{
        fontFamily: R,
        fontWeight: 500,
        color: transparent ? '#fff' : '#111',
        textDecoration: 'none',
        textShadow: transparent ? '0 1px 4px rgba(0,0,0,0.45)' : 'none',
      }}
    >
      {label}
    </Link>
  )
}


export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [agent, setAgent] = useState<{ name: string } | null>(null)
  const isPropiedades = pathname.startsWith('/propiedades')
  const isHome = pathname === '/'
  const transparent = isHome && !scrolled

  useEffect(() => {
    if (!isHome) return
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  useEffect(() => {
    let alive = true
    fetch('/api/agentes/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { agent: null }))
      .then((data) => { if (alive) setAgent(data.agent ?? null) })
      .catch(() => { if (alive) setAgent(null) })
    return () => { alive = false }
  }, [pathname])

  // Panel /fichas: layout propio con header simple, sin Navbar SI.
  if (pathname === '/fichas' || pathname?.startsWith('/fichas/')) return null

  // En /propiedades mobile: ocultar (PropiedadesView tiene su propio header)
  // En home y demás rutas: MOSTRAR navbar blanco con logo + hamburguesa
  const hideOnMobile = isPropiedades

  return (
    <div className={hideOnMobile ? 'hidden lg:block' : ''}>
      {/* ── Desktop nav (lg+) ── */}
      <nav
        className="hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: transparent ? 'transparent' : '#fff',
          borderBottom: transparent ? '1px solid transparent' : '1px solid #eee',
          boxShadow: transparent ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <div className="relative mx-auto flex items-center" style={{ maxWidth: 1400, padding: '18px 40px' }}>
          {/* Left menu */}
          <div className="flex items-center gap-5 xl:gap-8">
            {LEFT_ITEMS.map(item => <NavLink key={item.href} {...item} transparent={transparent} />)}
          </div>

          {/* Centered logo (absolute) — swap dinámico:
              transparent (sobre el hero) → logo blanco webp con fallback .png vía <picture>;
              opaco (scrolleado) → logo verde horizontal. */}
          <Link
            href="/"
            className="absolute left-1/2 top-1/2"
            style={{ transform: 'translate(-50%, -50%)', textDecoration: 'none' }}
          >
            {transparent ? (
              <picture>
                <source srcSet="/logo-blanco.webp" type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-blanco.png"
                  alt="SI Inmobiliaria"
                  width={192}
                  height={28}
                  className="object-contain"
                  style={{ height: 28, width: 'auto' }}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />
              </picture>
            ) : (
              <Image
                src="/LOGO_HORIZONTAL.png"
                alt="SI Inmobiliaria"
                width={192}
                height={28}
                className="object-contain"
                style={{ height: 28, width: 'auto' }}
                priority
                quality={90}
              />
            )}
          </Link>

          {/* Right menu + CTA */}
          <div className="ml-auto flex items-center gap-5 xl:gap-8">
            {RIGHT_ITEMS.map(item => <NavLink key={item.href} {...item} transparent={transparent} />)}
            <IngresarButton agent={agent} />
          </div>
        </div>
      </nav>

      {/* ── Mobile nav (<lg) ── */}
      <nav
        className="md:hidden sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-100"
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

          {/* Right — Ingresar (círculo con halo) */}
          <IngresarButton agent={agent} />
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[101]">
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
