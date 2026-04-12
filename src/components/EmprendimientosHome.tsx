'use client'

import Link from 'next/link'
import Image from 'next/image'

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif"

const ITEMS = [
  {
    id: 'hausing',
    badge: 'Casas Premium',
    title: 'Hausing',
    location: 'Funes',
    price: 'Desde USD 380K · Financiación en dólares',
    href: '/hausing',
    image: '/hausing-portada.jpg',
  },
  {
    id: 'dockgarden',
    badge: 'Condominio',
    title: 'Dockgarden',
    location: 'Aldea Fisherton',
    price: 'Entrega 20% + 36 cuotas fijas en USD',
    href: '/emprendimientos/67173-dockgarden-aldea-fisherton',
    image: 'https://static.tokkobroker.com/dev_pictures/67173_93775060846060385394324593876733363454956168345677306486130087037249128718036.jpg',
  },
  {
    id: 'distrito-roldan',
    badge: 'Barrio Abierto',
    title: 'Distrito Roldán',
    location: 'Roldán',
    price: 'Entrega 40% + 18 cuotas fijas en USD',
    href: '/emprendimientos/67178-distrito-roldan',
    image: 'https://static.tokkobroker.com/dev_pictures/67178_41755302210101797952152961824111367170079757743169980171710493926367681957871.jpg',
  },
  {
    id: 'aurea',
    badge: 'Barrio Privado',
    title: 'Aurea',
    location: 'Roldán',
    price: 'Lotes desde 500m² · Financiación disponible',
    href: '/propiedades/7296792-lotes-en-venta-desde-500m2-barrio-privado-aurea-en-roldan',
    image: '/aurea-portada.jpg',
  },
]

export default function EmprendimientosHome() {
  return (
    <section style={{ background: '#f9fafb' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-6 md:pt-12 md:pb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: R, fontWeight: 700, color: '#1d1d1f', fontSize: 22, margin: 0, lineHeight: 1.2 }}>
            Emprendimientos en la zona
          </h2>
          <Link href="/emprendimientos" style={{ fontFamily: R, fontSize: 13, fontWeight: 600, color: '#1A5C38', textDecoration: 'none' }}>
            Ver todos →
          </Link>
        </div>

        {/* Scroll container */}
        <div
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-3"
          style={{ scrollbarColor: '#1A5C38 #e5e7eb', scrollbarWidth: 'thin' }}
        >
          {ITEMS.map(item => (
            <Link
              key={item.id}
              href={item.href}
              className="emp-card flex-shrink-0 snap-start block relative overflow-hidden"
              style={{
                width: 'clamp(280px, 80vw, 320px)',
                aspectRatio: '3/4',
                borderRadius: 16,
                textDecoration: 'none',
              }}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover emp-card-img"
                sizes="320px"
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

          {/* CTA card */}
          <Link
            href="/emprendimientos"
            className="flex-shrink-0 snap-start flex flex-col items-center justify-center gap-3 group"
            style={{
              width: 'clamp(280px, 80vw, 320px)',
              aspectRatio: '3/4',
              borderRadius: 16,
              border: '2px solid #1A5C38',
              background: 'transparent',
              textDecoration: 'none',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,92,56,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            <span style={{ fontFamily: R, fontSize: 16, fontWeight: 600, color: '#1A5C38' }}>Ver todos</span>
          </Link>
        </div>
      </div>

      <style>{`
        .emp-card-img { transition: transform 0.4s ease; }
        @media (hover: hover) {
          .emp-card:hover .emp-card-img { transform: scale(1.05); }
          .emp-card:hover .emp-card-overlay { background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%) !important; }
        }
      `}</style>
    </section>
  )
}
