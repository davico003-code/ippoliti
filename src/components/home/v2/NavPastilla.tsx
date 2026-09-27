'use client'

// Barra de navegación flotante en forma de pastilla (como la de SERHANT):
// verde SI translúcido con desenfoque, separada del borde. Al bajar se vuelve
// un poco más sólida. En celular: logo + menú desplegable.

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X, Search } from 'lucide-react'
import { RALEWAY } from './ui'

const LINKS = [
  { label: 'Comprar', href: '/propiedades?op=venta' },
  { label: 'Alquilar', href: '/propiedades?op=alquiler' },
  { label: 'Vender', href: '/tasaciones' },
  { label: 'Emprendimientos', href: '/emprendimientos' },
  { label: 'Barrios cerrados', href: '/barrios-privados' },
  { label: 'Nosotros', href: '/nosotros' },
]

export default function NavPastilla() {
  const [solida, setSolida] = useState(false)
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    const f = () => setSolida(window.scrollY > 40)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  return (
    <div className="fixed inset-x-0 top-3 z-[60] px-3 md:top-4 md:px-5" style={{ fontFamily: RALEWAY }}>
      <nav
        className="mx-auto flex max-w-[1400px] items-center gap-4 rounded-full py-2.5 pl-6 pr-2.5 text-white transition-colors duration-300"
        style={{
          background: solida ? 'rgba(15,61,36,.94)' : 'rgba(26,92,56,.78)',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          boxShadow: '0 12px 40px -16px rgba(0,0,0,.5), inset 0 0 0 1px rgba(255,255,255,.12)',
        }}
        aria-label="Principal"
      >
        <Link href="/" className="flex shrink-0 items-center" style={{ textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-blanco.webp" alt="SI INMOBILIARIA" width={150} height={26} style={{ height: 24, width: 'auto' }} />
        </Link>
        <div className="mx-auto hidden items-center gap-6 lg:flex">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className="text-[14px] font-bold text-white/90 transition-colors hover:text-white" style={{ textDecoration: 'none' }}>{l.label}</Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link href="/propiedades" className="hidden items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold text-white md:inline-flex" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.35)', textDecoration: 'none' }}>
            <Search className="h-3.5 w-3.5" /> Buscar propiedades
          </Link>
          <Link href="/tasaciones" className="hidden rounded-full bg-white px-4 py-2 text-[13px] font-extrabold md:inline-flex" style={{ color: '#0F3D24', textDecoration: 'none' }}>
            Tasá tu propiedad
          </Link>
          <button type="button" onClick={() => setAbierto(a => !a)} className="grid h-10 w-10 place-items-center rounded-full lg:hidden" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.35)' }} aria-label="Menú" aria-expanded={abierto}>
            {abierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {abierto && (
        <div className="mx-auto mt-2 max-w-[1400px] rounded-3xl p-3 text-white lg:hidden" style={{ background: 'rgba(15,61,36,.96)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          {[...LINKS, { label: 'Buscar propiedades', href: '/propiedades' }].map(l => (
            <Link key={l.href} href={l.href} onClick={() => setAbierto(false)} className="block rounded-2xl px-4 py-3 text-[16px] font-bold hover:bg-white/10" style={{ textDecoration: 'none', color: '#fff' }}>{l.label}</Link>
          ))}
          <Link href="/tasaciones" onClick={() => setAbierto(false)} className="mt-2 block rounded-full bg-white px-4 py-3 text-center text-[15px] font-extrabold" style={{ color: '#0F3D24', textDecoration: 'none' }}>Tasá tu propiedad</Link>
        </div>
      )}
    </div>
  )
}
