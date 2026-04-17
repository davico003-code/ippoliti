import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { getDevelopments, generateDevSlug, type Development } from '@/lib/developments'

// TODO: reemplazar por fotos reales en /public/emprendimientos/
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  'https://images.unsplash.com/photo-1582268611958-ebfd161df9d8?w=800&q=80',
]

function getDevPhoto(dev: Development, index: number): string {
  const photos = dev.photos ?? []
  if (photos.length > 0) return photos[0].image || photos[0].original || photos[0].thumb
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
}

function getDevBadge(dev: Development): string {
  const name = (dev.name ?? '').toLowerCase()
  if (name.includes('hausing')) return 'CASAS PREMIUM'
  if (name.includes('dock')) return 'CONDOMINIO'
  if (name.includes('vida')) return 'POZO'
  if (name.includes('distrito')) return 'BARRIO ABIERTO'
  return 'EMPRENDIMIENTO'
}

export default async function ProyectosCarousel() {
  let developments: Development[] = []
  try {
    developments = await getDevelopments()
  } catch {
    // Tokko API no disponible (ej: preview sin TOKKO_API_KEY)
  }
  if (!developments || developments.length === 0) return null

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
        {developments.map((dev, i) => {
          const slug = generateDevSlug(dev)
          const photo = getDevPhoto(dev, i)
          const badge = getDevBadge(dev)
          const location = dev.location?.name || dev.fake_address || ''

          return (
            <Link
              key={dev.id}
              href={`/emprendimientos/${slug}`}
              className="min-w-[78%] snap-start rounded-2xl overflow-hidden relative block"
              style={{ aspectRatio: '4/5', textDecoration: 'none' }}
            >
              <Image
                src={photo}
                alt={dev.name}
                fill
                className="object-cover"
                sizes="78vw"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.40) 40%, rgba(0,0,0,0.30) 100%)' }}
              />

              {/* Badge arriba */}
              <span className="absolute top-4 left-4 bg-white/15 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wider font-poppins border border-white/20">
                {badge}
              </span>

              {/* Contenido abajo */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="font-raleway font-black text-2xl leading-tight">{dev.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <p className="font-poppins text-white/90 text-sm font-medium">{location}</p>
                </div>
                {dev.description && (
                  <p className="font-poppins text-white/80 text-[12px] mt-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {dev.description.slice(0, 60)}{dev.description.length > 60 ? '...' : ''}
                  </p>
                )}
              </div>
            </Link>
          )
        })}

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
            {developments.length} emprendimientos
          </p>
        </Link>
      </div>
    </section>
  )
}
