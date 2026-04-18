import Link from 'next/link'
import Image from 'next/image'
import {
  getFeaturedProperties,
  generatePropertySlug,
  getMainPhoto,
  formatPrice,
  getOperationType,
  getRoofedArea,
  getLotSurface,
  isLand,
  getProperties,
  type TokkoProperty,
} from '@/lib/tokko'

// Badge basado en operation_type real de Tokko
function getBadge(p: TokkoProperty): { label: string; bg: string } {
  const op = getOperationType(p)
  if (op === 'Alquiler') return { label: 'ALQUILER', bg: '#2563eb' }
  return { label: 'VENTA', bg: '#1A5C38' }
}

export default async function SeleccionCarousel() {
  let properties: TokkoProperty[] = []
  let totalCount = 0
  try {
    properties = await getFeaturedProperties(8)
    const allData = await getProperties({ limit: 1 })
    totalCount = allData.meta?.total_count ?? 0
  } catch {
    // Tokko API no disponible (ej: preview sin TOKKO_API_KEY)
  }
  if (!properties || properties.length === 0) return null

  return (
    <section className="px-5 pt-4 pb-6">
      <h2
        className="font-raleway font-black text-[22px] leading-tight"
        style={{ color: '#111' }}
      >
        Nuestra selección
      </h2>
      <p className="font-poppins text-gray-500 mt-0.5 text-[13px]">
        Elegidas con criterio, no por algoritmo.
      </p>

      {/* Carrusel */}
      <div
        className="mt-5 -mx-5 px-5 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {properties.map(p => {
          const slug = generatePropertySlug(p)
          const photo = getMainPhoto(p)
          const price = formatPrice(p)
          const roofed = getRoofedArea(p)
          const land = isLand(p)
          const beds = p.suite_amount ?? p.room_amount
          const baths = p.bathroom_amount
          const address = p.fake_address || p.address
          const location = p.location?.name || ''
          const badge = getBadge(p)

          const specs: string[] = []
          if (!land && beds != null && beds > 0) specs.push(`${beds} dorm`)
          if (!land && baths != null && baths > 0) specs.push(`${baths} baño${baths > 1 ? 's' : ''}`)
          if (roofed != null && roofed > 0) specs.push(`${roofed} m²`)
          if (land) {
            const lot = getLotSurface(p)
            if (lot != null && lot > 0) specs.push(`${lot.toLocaleString('es-AR')} m²`)
          }

          return (
            <Link
              key={p.id}
              href={`/propiedades/${slug}`}
              className="min-w-[82%] snap-start rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 block"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="relative aspect-video bg-gray-100"
              >
                {photo ? (
                  <Image
                    src={photo}
                    alt={p.publication_title || address}
                    fill
                    className="object-cover"
                    sizes="82vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin foto</div>
                )}
                {badge && (
                  <span
                    className="absolute top-3 left-3 text-white text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wider font-poppins"
                    style={{ background: badge.bg }}
                  >
                    {badge.label}
                  </span>
                )}
              </div>
              <div className="p-3.5">
                <p className="font-poppins font-bold text-lg" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {price}
                </p>
                {specs.length > 0 && (
                  <p className="font-poppins text-[13px] text-gray-700 mt-0.5 font-medium">
                    {specs.join(' · ')}
                  </p>
                )}
                <p className="font-poppins text-[12px] text-gray-500 mt-1">
                  {address}{location ? `, ${location}` : ''}
                </p>
              </div>
            </Link>
          )
        })}

        {/* Card final: Ver todas */}
        <Link
          href="/propiedades"
          className="min-w-[60%] snap-start rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-center px-5 py-10"
          style={{ textDecoration: 'none' }}
        >
          <div className="w-12 h-12 rounded-full bg-[#1A5C38] flex items-center justify-center mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
          <p className="font-raleway font-bold text-base text-gray-900">Ver todas</p>
          <p className="font-poppins text-[12px] text-gray-500 mt-1">
            +{totalCount || 219} propiedades
          </p>
        </Link>
      </div>
    </section>
  )
}
