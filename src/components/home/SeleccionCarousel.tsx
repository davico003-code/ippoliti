import Link from 'next/link'
import CardMediaButtons from '@/components/CardMediaButtons'
import FotosDeslizables from '@/components/FotosDeslizables'
import {
  getFeaturedProperties,
  generatePropertySlug,
  getMainPhoto,
  getAllPhotos,
  formatPrice,
  getOperationType,
  operationBadgeColor,
  getRoofedArea,
  getLotSurface,
  isLand,
  getPropertyCount,
  esOportunidadConsultanos,
  propertyTypeLabelById,
  type TokkoProperty,
  tituloVisible,
} from '@/lib/tokko'
import { formatDireccionCompleta } from '@/lib/ubicacion'
import EncabezadoSeccion from './EncabezadoSeccion'
import CaraAgenteCard, { CARA_AGENTE_CELU, espacioCaraAgente } from './CaraAgenteCard'
import { ArrowRight } from 'lucide-react'
import { getAgentesPorPropiedad } from '@/lib/agentes-por-propiedad'

// Badge basado en operation_type real de Tokko
function getBadge(p: TokkoProperty): { label: string; bg: string } {
  const op = getOperationType(p)
  if (op.startsWith('Alquiler')) return { label: 'Alquiler', bg: operationBadgeColor(op) }
  return { label: 'Venta', bg: operationBadgeColor('Venta') }
}

export default async function SeleccionCarousel() {
  // Destacadas y total A LA VEZ (antes en serie). Si el feed no responde,
  // la sección sigue con el CTA y su texto de respaldo.
  const [properties, totalCount] = await Promise.all([
    getFeaturedProperties(8).catch((): TokkoProperty[] => []),
    getPropertyCount().catch(() => 0),
  ])
  const agentes = await getAgentesPorPropiedad(properties)

  return (
    <section className="px-5 pt-8 pb-8">
      <EncabezadoSeccion
        eyebrow="Propiedades"
        titulo="Nuestra selección"
        bajada="Elegidas con criterio, no por algoritmo."
      />

      {/* Carrusel */}
      <div
        className="mt-5 -mx-5 px-5 scroll-pl-5 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {properties.map((p, i) => {
          const slug = generatePropertySlug(p)
          // Portada primero (la misma que se veía sola) y después el resto en orden.
          const portada = getMainPhoto(p)
          const fotos = portada ? [portada, ...getAllPhotos(p).filter(f => f !== portada)] : []
          const price = formatPrice(p)
          const roofed = getRoofedArea(p)
          const land = isLand(p)
          const beds = p.suite_amount ?? p.room_amount
          const baths = p.bathroom_amount
          const address = p.fake_address || p.address
          const direccion = formatDireccionCompleta(p, address, ' | ')
          const typeName = propertyTypeLabelById(p.type?.id)
          const badge = getBadge(p)
          // Con agente, su cara va a la derecha sobre el borde de la foto:
          // precio y datos le dejan lugar, la dirección pasa por debajo y se
          // lee entera, y la flecha se va (la cara invita a entrar).
          const agente = agentes.get(p.id)
          const espacio = agente ? espacioCaraAgente(CARA_AGENTE_CELU) : null

          const specs: string[] = []
          if (!land && beds != null && beds > 0) specs.push(`${beds} dorm`)
          if (!land && baths != null && baths > 0) specs.push(`${baths} baño${baths > 1 ? 's' : ''}`)
          if (roofed != null && roofed > 0) specs.push(`${roofed.toLocaleString('es-AR')} m²`)
          const lot = getLotSurface(p)
          if (lot != null && lot > 0) {
            if (land) specs.push(`${lot.toLocaleString('es-AR')} m²`)
            else if (lot !== roofed) specs.push(`${lot.toLocaleString('es-AR')} m² lote`)
          }

          return (
            <Link
              key={p.id}
              href={`/propiedades/${slug}`}
              className="min-w-[88%] snap-start bg-white block"
              style={{ textDecoration: 'none' }}
            >
              <div className="relative">
              {/* Fotos con flechas siempre visibles: la tarjeta vive en un
                  carrusel que se desliza de costado, así que acá no hay swipe
                  de fotos (se pelearían el gesto). */}
              <FotosDeslizables
                images={fotos}
                alt={tituloVisible(p) || address}
                sizes="88vw"
                priority={i === 0}
                swipe={false}
                flechasSiempre
                puntos={agente ? 'izquierda' : 'centro'}
                className="aspect-video"
                portadaViva={p.portada_viva}
              >
                {/* Badges como en /propiedades: operación (color) + tipo (blanco) */}
                <div className="absolute top-3 left-3 z-10 flex gap-1.5" style={{ transform: 'translateZ(0)' }}>
                  <span
                    className="text-white text-[12px] font-semibold leading-none px-3.5 py-2 rounded-full font-raleway"
                    style={{ background: badge.bg }}
                  >
                    {badge.label}
                  </span>
                  {typeName && (
                    <span className="text-[12px] font-semibold leading-none px-3.5 py-2 rounded-full font-raleway text-gray-900 bg-white/[0.94]">
                      {typeName}
                    </span>
                  )}
                </div>
                {/* Play + like juntos, arriba-derecha. audioUrl no viene
                    enriquecido acá (home ISR) → CardMediaButtons lo resuelve
                    client-side por lote. */}
                <CardMediaButtons propertyId={p.id} size={40} className="absolute top-3 right-3 z-10" />
              </FotosDeslizables>
              <CaraAgenteCard agente={agente} size={CARA_AGENTE_CELU} />
              </div>
              <div className="px-0.5 pt-2.5 pb-1 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                <div style={espacio ? { paddingRight: espacio.derecha, minHeight: espacio.abajo - 10 } : undefined}>
                {esOportunidadConsultanos(p.id) ? (
                  <div className="flex items-center gap-2">
                    <span className="font-poppins font-extrabold text-[10.5px] uppercase tracking-wider text-gray-900 rounded-md px-2 py-1 whitespace-nowrap" style={{ background: '#fbce07' }}>
                      Oportunidad
                    </span>
                    <span className="font-poppins font-bold text-[14px] text-white rounded-full px-3.5 py-1.5 whitespace-nowrap" style={{ background: '#1A5C38' }}>
                      Consultanos →
                    </span>
                  </div>
                ) : (
                <p className="font-poppins font-black text-[22px] text-gray-900 tracking-tight leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {price}
                </p>
                )}
                {specs.length > 0 && (
                  <p className="font-poppins text-[13px] text-gray-700 mt-0.5 font-medium">
                    {specs.join(' · ')}
                  </p>
                )}
                </div>
                <p className="font-poppins text-[12px] text-gray-500 mt-1">
                  {direccion || address}
                </p>
                </div>
                {!agente && (
                  <span className="flex-shrink-0 w-10 h-10 rounded-full border-[1.5px] border-gray-200 flex items-center justify-center text-gray-900" aria-hidden="true">
                    <ArrowRight size={17} strokeWidth={2} />
                  </span>
                )}
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
