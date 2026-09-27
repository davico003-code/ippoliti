import Link from 'next/link'
import Image from 'next/image'
import HorizontalCarousel from '@/components/HorizontalCarousel'
import CardMediaButtons from '@/components/CardMediaButtons'
import { esDiaDePartido } from '@/lib/mundial'
import {
  getFeaturedProperties,
  generatePropertySlug,
  getMainPhoto,
  formatPrice,
  getOperationType,
  operationBadgeColor,
  getRoofedArea,
  getLotSurface,
  isLand,
  isMonoambiente,
  esOportunidadConsultanos,
  propertyTypeLabelById,
  type TokkoProperty,
} from '@/lib/tokko'
import { formatDireccionCompleta } from '@/lib/ubicacion'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"

// ─── Featured Properties Section ─────────────────────────────────────────────

export default async function FeaturedPropertiesSection() {
  let properties: TokkoProperty[] = []
  try {
    properties = await getFeaturedProperties(6)
  } catch {
    // Tokko API no disponible — seguimos rendering la sección con el CTA.
  }

  // Día de partido: la primera card se destaca (borde celeste + glow + chapa).
  const matchday = esDiaDePartido()
  const renderCard = (property: TokkoProperty, destacada = false) => {
    const slug = generatePropertySlug(property)
    const photo = getMainPhoto(property)
    const price = formatPrice(property)
    const operation = getOperationType(property)
    const roofed = getRoofedArea(property)
    const land = isLand(property)
    const mono = isMonoambiente(property)
    const beds = property.suite_amount ?? property.room_amount
    const baths = property.bathroom_amount
    const address = property.fake_address || property.address
    const direccion = formatDireccionCompleta(property, address, ' | ')
    const typeName = propertyTypeLabelById(property.type?.id)
    const specs: { num: string; unit: string }[] = []
    if (!land && mono) specs.push({ num: '', unit: 'Monoambiente' })
    else if (!land && beds != null && beds > 0) specs.push({ num: String(beds), unit: ' dorm' })
    if (!land && baths != null && baths > 0) specs.push({ num: String(baths), unit: ` baño${baths > 1 ? 's' : ''}` })
    if (roofed != null && roofed > 0) specs.push({ num: String(roofed), unit: ' m²' })
    const lot = getLotSurface(property)
    if (lot != null && lot > 0) {
      if (land) specs.push({ num: lot.toLocaleString('es-AR'), unit: ' m²' })
      else if (lot !== roofed) specs.push({ num: lot.toLocaleString('es-AR'), unit: ' m² lote' })
    }

    return (
      <Link
        key={property.id}
        href={`/propiedades/${slug}`}
        className="prop-card block flex-shrink-0 snap-start bg-white border-0"
        style={{
          textDecoration: 'none',
          position: 'relative',
          width: 'clamp(300px, 88vw, 380px)',
          minWidth: 300,
        }}
      >
        {/* Sin recuadro, como /propiedades: foto con las 4 esquinas redondeadas
            sobre blanco. El destaque de día de partido va en la foto. */}
        <div
          className="relative w-full bg-gray-100 overflow-hidden rounded-[14px]"
          style={{
            aspectRatio: '16 / 9',
            boxShadow: destacada ? '0 0 0 2px #75AADB, 0 0 0 6px rgba(117,170,219,0.22)' : undefined,
          }}
        >
          {photo ? (
            <Image src={photo} alt={property.publication_title || address} fill
              className="object-cover prop-card-img" sizes="340px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin foto</div>
          )}
          {/* Badges como en /propiedades: operación (color) + tipo (blanco) */}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
            {operation && (
              <span style={{
                background: operationBadgeColor(operation),
                color: '#fff', fontFamily: RALEWAY, fontWeight: 600, fontSize: 12,
                lineHeight: 1, padding: '8px 14px', borderRadius: 9999,
              }}>
                {operation}
              </span>
            )}
            {typeName && (
              <span style={{
                background: 'rgba(255,255,255,0.9)', color: '#0a0a0a',
                fontFamily: RALEWAY, fontWeight: 600, fontSize: 12,
                lineHeight: 1, padding: '8px 14px', borderRadius: 9999,
                backdropFilter: 'blur(2px)',
              }}>
                {typeName}
              </span>
            )}
          </div>
          {destacada && (
            <span style={{
              position: 'absolute', top: 10, right: 10,
              background: '#75AADB', color: '#0d3a5c',
              fontFamily: POPPINS, fontWeight: 700, fontSize: 11,
              padding: '3px 10px', borderRadius: 6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)', whiteSpace: 'nowrap',
            }}>
              ★ La jugada del partido
            </span>
          )}
          {/* Play + like juntos, arriba-derecha (oculto en la card "destacada"
              de día de partido, que ya usa ese rincón para la chapa). */}
          {!destacada && (
            <CardMediaButtons propertyId={property.id} size={36} className="absolute top-2.5 right-2.5" />
          )}
        </div>
        <div style={{ padding: '10px 2px 4px' }}>
          {esOportunidadConsultanos(property.id) ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 6px' }}>
              <span style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', background: '#fbce07', color: '#111', borderRadius: 6, padding: '4px 9px', whiteSpace: 'nowrap' }}>
                Oportunidad
              </span>
              <span style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 14, background: '#1A5C38', color: '#fff', borderRadius: 999, padding: '6px 15px', whiteSpace: 'nowrap' }}>
                Consultanos →
              </span>
            </div>
          ) : (
          <p style={{ fontFamily: POPPINS, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#1d1d1f', margin: '0 0 4px', lineHeight: 1.2, fontSize: 22 }}>
            {price}
          </p>
          )}
          {specs.length > 0 && (
            <p style={{ fontFamily: POPPINS, fontSize: 14, color: '#1d1d1f', margin: '0 0 4px', fontWeight: 400 }}>
              {specs.map((s, i) => (
                <span key={i}>
                  {i > 0 && ' · '}
                  <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{s.num}</span>
                  {s.unit}
                </span>
              ))}
            </p>
          )}
          <p style={{ fontFamily: POPPINS, fontSize: 13, color: '#767676', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
            {direccion || address}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <section className="home-section bg-white" style={{ padding: 0 }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-4 md:pt-5 md:pb-6">
        {/* Header row */}
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl tracking-tight" style={{ fontFamily: RALEWAY, fontWeight: 800, color: '#111827', lineHeight: 1.2, margin: 0 }}>
            Nuestra selección
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-2 mt-0.5" style={{ fontFamily: RALEWAY }}>
          Elegidas con criterio, no por algoritmo.
        </p>

        {/* Carousel — fallback al CTA si no hay properties */}
        {properties.length > 0 ? (
          <HorizontalCarousel>
            {properties.map((p, i) => renderCard(p, matchday && i === 0))}
            <Link
              href="/propiedades"
              className="flex-shrink-0 self-center snap-start flex items-center justify-center rounded-full border-2 border-[#1A5C38] bg-white px-7 py-3.5 font-semibold text-sm text-[#1A5C38] hover:bg-[#1A5C38] hover:text-white transition-colors duration-200"
              style={{
                fontFamily: RALEWAY,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
              }}
            >
              Ver todas →
            </Link>
          </HorizontalCarousel>
        ) : (
          <div className="flex items-center justify-center min-h-[280px]">
            <Link
              href="/propiedades"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#1A5C38] bg-white px-7 py-3.5 font-semibold text-sm text-[#1A5C38] hover:bg-[#1A5C38] hover:text-white transition-colors duration-200"
              style={{
                fontFamily: RALEWAY,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
              }}
            >
              Ver todas las propiedades →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
