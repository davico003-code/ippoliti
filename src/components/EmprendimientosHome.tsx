'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProjectMediaCard from '@/components/home/ProjectMediaCard'

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif"

interface Item {
  id: string
  badge: string
  title: string
  location: string
  price: string
  href: string
  image: string
  /** URL sin extensión; el componente arma `${videoUrl}.webm` y `.mp4`. */
  videoUrl?: string
}

const ITEMS: Item[] = [
  {
    id: 'hausing',
    badge: 'Casas Premium',
    title: 'Hausing',
    location: 'Funes',
    price: 'Desde USD 380K · Financiación en dólares',
    href: '/hausing',
    image: '/hausing-portada.jpg',
    videoUrl: '/videos/proyectos/hausing',
  },
  {
    id: 'dockgarden',
    badge: 'Condominio',
    title: 'Dockgarden',
    location: 'Aldea Fisherton',
    price: 'Entrega 20% + 36 cuotas fijas en USD',
    href: '/emprendimientos/67173-dockgarden-aldea-fisherton',
    image: 'https://static.tokkobroker.com/dev_pictures/67173_93775060846060385394324593876733363454956168345677306486130087037249128718036.jpg',
    videoUrl: '/videos/proyectos/dockgarden',
  },
  {
    id: 'distrito-roldan',
    badge: 'Barrio Abierto',
    title: 'Distrito Roldán',
    location: 'Roldán',
    price: 'Entrega 40% + 18 cuotas fijas en USD',
    href: '/emprendimientos/67178-distrito-roldan',
    image: 'https://static.tokkobroker.com/dev_pictures/67178_41755302210101797952152961824111367170079757743169980171710493926367681957871.jpg',
    videoUrl: '/videos/proyectos/distrito-roldan',
  },
  {
    id: 'aurea',
    badge: 'Barrio Privado',
    title: 'Aurea',
    location: 'Roldán',
    price: 'Lotes desde 500m² · Financiación disponible',
    href: '/propiedades/7296792-lotes-en-venta-desde-500m2-barrio-privado-aurea-en-roldan',
    image: '/aurea-portada.jpg',
    videoUrl: '/videos/proyectos/aurea',
  },
]

export default function EmprendimientosHome() {
  // Solo una card a la vez puede estar en hover (controla play/pause del video).
  const [hoveringId, setHoveringId] = useState<string | null>(null)

  return (
    <section style={{ background: '#f9fafb' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-6 md:pt-10 md:pb-10">
        {/* Header — title only, no link */}
        <h2 className="text-2xl md:text-3xl tracking-tight" style={{ fontFamily: R, fontWeight: 800, color: '#111827', lineHeight: 1.2, margin: '0 0 4px' }}>
          Proyectos destacados
        </h2>
        <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: R }}>
          Invertí con respaldo.
        </p>

        {/* Scroll container */}
        <div
          className="flex items-center gap-5 overflow-x-auto snap-x snap-mandatory px-1 py-2 pb-3"
          style={{ scrollbarColor: '#1A5C38 #e5e7eb', scrollbarWidth: 'thin', overflowY: 'visible' }}
        >
          {ITEMS.map(item => (
              <Link
                key={item.id}
                href={item.href}
                className="emp-card flex-shrink-0 snap-start block relative overflow-hidden bg-white rounded-xl border-0 shadow-md hover:shadow-xl"
                style={{
                  width: 'clamp(280px, 80vw, 320px)',
                  aspectRatio: '3/4',
                  textDecoration: 'none',
                  transition: 'box-shadow 300ms',
                }}
                onMouseEnter={() => setHoveringId(item.id)}
                onMouseLeave={() => setHoveringId(prev => (prev === item.id ? null : prev))}
              >
                <ProjectMediaCard
                  imageUrl={item.image}
                  videoUrl={item.videoUrl}
                  alt={item.title}
                  sizes="320px"
                  isHovering={hoveringId === item.id}
                />
                <div className="absolute inset-0 emp-card-overlay" style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
                  transition: 'background 0.3s ease',
                }} />

                {/* Badge */}
                <span className="absolute top-4 left-4" style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontSize: 11,
                  fontFamily: P,
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: 20,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {item.badge}
                </span>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 style={{ fontFamily: R, fontSize: 22, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.2, minHeight: 27 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontFamily: P, fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4, height: 20 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {item.location}
                  </p>
                  <p style={{ fontFamily: P, fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '4px 0 0', height: 18 }}>
                    {item.price}
                  </p>
                </div>
              </Link>
          ))}
          <Link
            href="/emprendimientos"
            className="flex-shrink-0 self-center snap-start flex items-center justify-center rounded-full border-2 border-[#1A5C38] bg-white px-7 py-3.5 font-semibold text-sm text-[#1A5C38] hover:bg-[#1A5C38] hover:text-white transition-colors duration-200"
            style={{
              fontFamily: R,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
            }}
          >
            Ver todos →
          </Link>
        </div>
      </div>

      <style>{`
        /* Zoom suave del media al hover — solo afecta a img/video, no al
           overlay, badge ni textos (que son siblings fuera del wrapper). */
        .emp-card-img { transition: transform 500ms ease-out; }
        @media (hover: hover) {
          .emp-card:hover .emp-card-img { transform: scale(1.05); }
          .emp-card:hover .emp-card-overlay { background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%) !important; }
        }

        /* Pulse opacity-only del CTA (no scale, no chillón). Pasa de
           opacidad 0.85 → 1.0 → 0.85 en 3s, indefinido. Al hover del
           card se queda opaco 1.0 sin pulsar. */
        @keyframes emp-cta-pulse {
          0%, 100% { opacity: 0.85; }
          50%      { opacity: 1; }
        }
        .emp-card-cta { animation: emp-cta-pulse 3s ease-in-out infinite; }
        .emp-card:hover .emp-card-cta { animation: none; opacity: 1; }

        /* Accesibilidad: deshabilitar zoom y pulse cuando el usuario
           pide menos movimiento. El play en hover sigue funcionando. */
        @media (prefers-reduced-motion: reduce) {
          .emp-card-img { transition: none; }
          .emp-card:hover .emp-card-img { transform: none; }
          .emp-card-cta { animation: none; }
        }
      `}</style>
    </section>
  )
}
