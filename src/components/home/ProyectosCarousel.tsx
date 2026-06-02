import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'

type ProyectoItem = {
  id: string
  badge: string
  title: string
  location: string
  description: string
  href: string
  image: string
}

const ITEMS: ProyectoItem[] = [
  {
    id: 'hausing',
    badge: 'CASAS PREMIUM',
    title: 'Hausing',
    location: 'Funes',
    description: 'Desde USD 380K · Financiación en dólares',
    href: '/hausing',
    image: '/hausing-portada.jpg',
  },
  {
    id: 'dockgarden',
    badge: 'CONDOMINIO',
    title: 'Dockgarden',
    location: 'Aldea Fisherton',
    description: 'Entrega 20% + 36 cuotas fijas en USD',
    href: '/emprendimientos/67173-dockgarden-aldea-fisherton',
    image: 'https://static.tokkobroker.com/dev_pictures/67173_93775060846060385394324593876733363454956168345677306486130087037249128718036.jpg',
  },
  {
    id: 'distrito-roldan',
    badge: 'BARRIO ABIERTO',
    title: 'Distrito Roldán',
    location: 'Roldán',
    description: 'Entrega 30% + 24 cuotas fijas en USD',
    href: '/emprendimientos/67178-distrito-roldan',
    image: 'https://static.tokkobroker.com/dev_pictures/67178_41755302210101797952152961824111367170079757743169980171710493926367681957871.jpg',
  },
  {
    id: 'aurea',
    badge: 'BARRIO PRIVADO',
    title: 'Aurea',
    location: 'Roldán',
    description: 'Lotes desde 500m² · Financiación disponible',
    href: '/propiedades/7296792-lotes-en-venta-desde-500m2-barrio-privado-aurea-en-roldan',
    image: '/aurea-portada.jpg',
  },
]

export default function ProyectosCarousel() {
  return (
    <section className="px-5 pt-2 pb-6 bg-gray-50">
      <h2 className="font-raleway font-black text-[22px] leading-tight" style={{ color: '#111' }}>
        Proyectos destacados
      </h2>
      <p className="font-poppins text-gray-500 mt-0.5 text-[13px]">
        Invertí con respaldo.
      </p>

      <div
        className="mt-5 -mx-5 px-5 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {ITEMS.map(item => (
          <Link
            key={item.id}
            href={item.href}
            className="min-w-[70%] snap-start rounded-2xl overflow-hidden relative block"
            style={{ aspectRatio: '4/5', textDecoration: 'none' }}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="70vw"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0.85) 100%)' }}
            />

            {/* Badge arriba */}
            <span className="absolute top-4 left-4 bg-white/15 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wider font-poppins border border-white/20">
              {item.badge}
            </span>

            {/* Contenido abajo */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <p className="font-raleway font-black text-2xl leading-tight">{item.title}</p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <p className="font-poppins text-white/90 text-sm font-medium">{item.location}</p>
              </div>
              <p className="font-poppins text-white/80 text-[12px] mt-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {item.description}
              </p>
            </div>
          </Link>
        ))}

        {/* Card final */}
        <Link
          href="/emprendimientos"
          className="min-w-[55%] snap-start rounded-2xl bg-white border border-gray-200 flex flex-col items-center justify-center text-center px-5 py-10"
          style={{ textDecoration: 'none' }}
        >
          <div className="w-12 h-12 rounded-full bg-[#1A5C38] flex items-center justify-center mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
          <p className="font-raleway font-bold text-base text-gray-900">Ver todos</p>
          <p className="font-poppins text-[12px] text-gray-500 mt-1">
            {ITEMS.length} emprendimientos
          </p>
        </Link>
      </div>
    </section>
  )
}
