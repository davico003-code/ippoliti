'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from '@/components/Imagen'
import { Menu, User, X } from 'lucide-react'
import FranjaMundial from './FranjaMundial'
import ThemeToggle from './ThemeToggle'

const R = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

type IngresarButtonProps = {
  agent: { name: string; foto?: string | null } | null
  onClick?: () => void
}

function IngresarButton({ agent, onClick }: IngresarButtonProps) {
  const pathname = usePathname()
  // /agentes es 100% dinámico (consulta clientes, autorizaciones, feedback):
  // la navegación tarda 1-3 s y sin respuesta visual parecía que el toque no
  // había entrado, y se volvía a tocar. Marcamos "abriendo" al instante con un
  // aro girando hasta que cambia la ruta.
  const [abriendo, setAbriendo] = useState(false)
  useEffect(() => { setAbriendo(false) }, [pathname])
  const isAuthed = !!agent
  // Solo si está logueado y tiene foto curada/Tokko mostramos su avatar, y más
  // grande que el círculo de iniciales (48 vs 44). Sin foto → iniciales; sin
  // sesión → ícono genérico. 44 = toque mínimo de la guía de Apple (antes 40);
  // la fila del navbar ya mide 44 por el botón de tema, así que no crece.
  const foto = isAuthed ? agent!.foto : null
  const size = foto ? 48 : 44
  return (
    <Link
      href="/agentes"
      onClick={e => {
        if (!e.metaKey && !e.ctrlKey && !e.shiftKey && pathname !== '/agentes') setAbriendo(true)
        onClick?.()
      }}
      aria-busy={abriendo}
      // "Acceso agentes" y no "Ingresar": el visitante no tiene cuenta (es el
      // panel interno), y "Ingresar" le hacía creer que tenía que registrarse.
      aria-label={isAuthed ? `Cuenta de ${agent!.name}` : 'Acceso agentes'}
      className="relative inline-flex items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-105 active:scale-95"
      style={{
        touchAction: 'manipulation',
        width: size,
        height: size,
        // El avatar con foto es más grande (48 vs 44). Con margen vertical
        // negativo ocupa solo 44px de alto en el flujo del navbar (se centra y
        // protruye dentro del padding), así NO agranda la barra: si crecía, el
        // hero (-mt-[77px]) dejaba una franja blanca arriba cuando el usuario
        // estaba logueado.
        marginTop: foto ? -2 : 0,
        marginBottom: foto ? -2 : 0,
        background: foto ? '#fff' : '#1A5C38',
        border: foto ? '2px solid #fff' : '2px solid rgba(255,255,255,0.25)',
        borderRadius: 9999,
        cursor: 'pointer',
        textDecoration: 'none',
        color: '#fff',
        flexShrink: 0,
        boxShadow: foto ? '0 2px 10px rgba(0,0,0,0.22)' : 'none',
      }}
      onMouseEnter={e => { if (!foto) e.currentTarget.style.background = '#144a2c' }}
      onMouseLeave={e => { if (!foto) e.currentTarget.style.background = '#1A5C38' }}
    >
      {foto ? (
        <Image
          src={foto}
          alt={agent!.name}
          width={size}
          height={size}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9999 }}
        />
      ) : isAuthed ? (
        <span style={{ fontFamily: R, fontWeight: 500, fontSize: 13, color: '#fff', lineHeight: 1 }}>
          {getInitials(agent!.name)}
        </span>
      ) : (
        <User size={18} strokeWidth={2} color="#fff" />
      )}
      {abriendo && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full animate-spin"
          style={{ background: 'rgba(0,0,0,0.25)', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff' }}
        />
      )}
    </Link>
  )
}

const LEFT_ITEMS = [
  { href: '/propiedades?op=venta', label: 'Comprar' },
  { href: '/propiedades?op=alquiler', label: 'Alquilar' },
  { href: '/vender', label: 'Vender' },
  { href: '/emprendimientos', label: 'Emprendimientos' },
]

const RIGHT_ITEMS = [
  { href: '/barrios-privados', label: 'Barrios cerrados' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contenidos', label: 'Contenido' },
  { href: '/recursos', label: 'Recursos' },
]

const DRAWER_ITEMS = [...LEFT_ITEMS, ...RIGHT_ITEMS]

function NavLink({ href, label, transparent }: { href: string; label: string; transparent: boolean }) {
  // El color va en clase y no en style: un color inline le gana también al
  // :hover, y el hover verde nunca se veía. Sobre la foto del hero el hover
  // es un blanco apenas más suave (verde sobre foto oscura no se lee); con la
  // barra sólida, el verde de marca (--brand se aclara solo en modo oscuro).
  const color = transparent
    ? 'text-white hover:text-white/75'
    : 'text-[var(--foreground)] hover:text-[var(--brand)]'
  return (
    <Link
      href={href}
      className={`${color} transition-colors duration-200 whitespace-nowrap text-[13px] min-[1200px]:text-[14px] min-[1440px]:text-[16px]`}
      style={{
        fontFamily: R,
        fontWeight: 500,
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
  const [agent, setAgent] = useState<{ name: string; foto?: string | null } | null>(null)
  const hamburguesaRef = useRef<HTMLButtonElement | null>(null)
  const cerrarDrawerRef = useRef<HTMLButtonElement | null>(null)
  const isPropiedades = pathname.startsWith('/propiedades')
  const isHome = pathname === '/'
  const isBarriosHub = pathname === '/barrios-privados'
  // Navbar transparente sobre el hero inmersivo (home + hub de barrios).
  const overHero = isHome || isBarriosHub
  const transparent = overHero && !scrolled

  useEffect(() => {
    if (!overHero) return
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overHero])

  useEffect(() => {
    let alive = true
    fetch('/api/agentes/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { agent: null }))
      .then((data) => { if (alive) setAgent(data.agent ?? null) })
      .catch(() => { if (alive) setAgent(null) })
    return () => { alive = false }
  }, [pathname])

  // Menú lateral del celu abierto: la página de atrás no se mueve (arrastrar el
  // dedo sobre el menú scrolleaba la home), Escape lo cierra y el foco entra al
  // menú. El bloqueo va en <html> y no en <body>: html tiene overflow-x: clip
  // (globals.css), y con eso el overflow del body ya no llega al viewport y no
  // bloquea nada. Tampoco position:fixed en el body: el navbar sticky saltaba
  // fuera de la pantalla detrás del velo.
  useEffect(() => {
    if (!isOpen) return
    const html = document.documentElement
    const prevOverflow = html.style.overflow
    html.style.overflow = 'hidden'
    cerrarDrawerRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setIsOpen(false)
      hamburguesaRef.current?.focus({ preventScroll: true })
    }
    document.addEventListener('keydown', onKey)
    return () => {
      html.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  // Panel /fichas: layout propio con header simple, sin Navbar SI.
  if (pathname === '/fichas' || pathname?.startsWith('/fichas/')) return null

  // En /propiedades mobile: ocultar (PropiedadesView tiene su propio header)
  // En home y demás rutas: MOSTRAR navbar blanco con logo + hamburguesa
  const hideOnMobile = isPropiedades

  return (
    <div className={hideOnMobile ? 'hidden md:block' : 'contents'}>
      {/* Desktop navigation, with space reserved for the theme control. */}
      <nav
        className="hidden lg:block sticky top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: transparent ? 'transparent' : 'var(--background)',
          borderBottom: transparent ? '1px solid transparent' : '1px solid var(--line)',
          boxShadow: transparent ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {/* Entre 1024 y ~1065 px (iPad apaisado, ventanas chicas) el logo
            centrado se encimaba con "Barrios cerrados": hasta xl va más
            ajustado (menos margen lateral y menos separación entre links). */}
        <div className="relative mx-auto flex items-center px-4 xl:px-8 py-[16px]" style={{ maxWidth: 1400 }}>
          {/* Left menu — flex-1 + justify-end empuja los links hacia el logo */}
          <div className="flex-1 flex items-center justify-end gap-3 min-[1440px]:gap-5">
            {LEFT_ITEMS.map(item => <NavLink key={item.href} {...item} transparent={transparent} />)}
          </div>

          {/* Logo centrado — flex-1 en ambos lados le da espacio simétrico */}
          <Link
            href="/"
            className="shrink-0 mx-6 xl:mx-10 flex items-center justify-center"
            style={{ textDecoration: 'none', width: 191 }}
          >
            {transparent ? (
              // Logo blanco sobre el hero. El archivo es de 2930×512 (40 KB en
              // webp) y antes iba como <img> eager con prioridad alta: se bajaba
              // también en el celu, donde este navbar está oculto, peleando con
              // la portada (LCP). Con next/image se pide al tamaño que se ve
              // (ancho fijo → srcset 1x/2x de 256/384 px, pocos KB) y, sin
              // priority, es lazy: dentro de un display:none no se descarga.
              <Image
                src="/logo-blanco.png"
                alt="SI INMOBILIARIA"
                width={191}
                height={28}
                className="object-contain"
                style={{ height: 28, width: 191 }}
                quality={90}
              />
            ) : (
              <Image
                src="/LOGO_HORIZONTAL.png"
                alt="SI INMOBILIARIA"
                width={191}
                height={28}
                className="object-contain si-theme-logo"
                priority
                quality={90}
              />
            )}
            {/* PIEZA 2 — franja bandera bajo el logo (gateada por esEdicionMundial) */}
            <FranjaMundial scrolled={!transparent} />
          </Link>

          {/* Right menu + CTA — flex-1 + spacer empuja utilidades al borde */}
          <div className="flex-1 flex items-center gap-3 min-[1440px]:gap-5">
            {RIGHT_ITEMS.map(item => <NavLink key={item.href} {...item} transparent={transparent} />)}
            <span className="flex-1" />
            <ThemeToggle className={transparent ? 'si-theme-toggle--hero' : ''} />
            <IngresarButton agent={agent} />
          </div>
        </div>
      </nav>

      {/* Mobile navigation */}
      <nav
        className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-100"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="relative flex items-center justify-between px-4 py-2.5">
          {/* Left — hamburger */}
          <button
            ref={hamburguesaRef}
            onClick={() => setIsOpen(!isOpen)}
            className="w-11 h-11 flex items-center justify-center"
            aria-label="Menú"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>

          {/* Center — logo */}
          <Link href="/" className="absolute left-1/2 top-1/2 max-[359px]:-ml-3" style={{ transform: 'translate(-50%, -50%)', textDecoration: 'none' }}>
            <Image
              src="/LOGO_HORIZONTAL.png"
              alt="SI INMOBILIARIA"
              width={164}
              height={24}
              className="object-contain si-theme-logo w-[128px] min-[390px]:w-[150px]"
              priority
              quality={90}
            />
            {/* PIEZA 2 — franja bandera (mobile siempre fondo blanco → scrolled) */}
            <FranjaMundial scrolled={true} />
          </Link>

          {/* Right — tema e ingreso */}
          <div className="flex items-center gap-1"><ThemeToggle /><IngresarButton agent={agent} /></div>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[9990]">
          {/* touch-none: un arrastre que arranca en el velo no mueve la página. */}
          <div className="absolute inset-0 bg-black/50 touch-none" onClick={() => setIsOpen(false)} />
          {/* overflow-y-auto: con el celu acostado o la letra agrandada, los
              últimos ítems quedaban cortados y no había forma de llegar. */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="si-theme-drawer absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl overflow-y-auto overscroll-contain"
            style={{
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
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
                  className="object-contain si-theme-logo"
                  quality={90}
                />
              </Link>
              <button
                ref={cerrarDrawerRef}
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar menú"
                className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center"
              >
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
              {/* El acceso de los agentes era el único botón verde lleno del
                  menú: al visitante le ofrecía como acción principal un login
                  que no es para él. Queda abajo, secundario y con borde (sin
                  colores inline, así el hover y el modo oscuro funcionan). */}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <a
                  href="/agentes"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center min-h-[44px] px-4 text-sm font-semibold text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: R }}
                >
                  Acceso agentes
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `@keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }` }} />
    </div>
  )
}
