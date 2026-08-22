'use client'

// Shared desktop body: all content sections in identical order for
// the modal (PropertyPanel) and the full page (/propiedades/[slug]).
// Mobile is NOT rendered here — each parent keeps its own mobile layout.
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight, MapPin, Bed, Bath, Maximize, Home, Car, MessageCircle, Phone, ShieldCheck } from 'lucide-react'
import {
  type TokkoProperty,
  formatPrice,
  mostrarPrecio,
  esOportunidadConsultanos,
  buildPriceConsultWhatsappUrl,
  generatePropertySlug,
  getOperationType,
  getRoofedArea,
  getTotalSurface,
  getLotSurface,
  isMonoambiente,
  formatLocation,
  getDescription,
  getBlueprintPhotos,
  translatePropertyType,
  agruparTags,
  translateCondition,
  translateOrientation,
  translateDisposition,
} from '@/lib/tokko'
import PropertyDescription from '../PropertyDescription'
import SectionBoundary from './SectionBoundary'
import BarrioPanel from './BarrioPanel'
import type { Barrio } from '@/lib/barrios'
import PropertyVideo from './PropertyVideo'
import { getAgenteRol } from '@/lib/agente-titulo'
import CostosIngresoMini from '../propiedades/CostosIngresoMini'
import NearbyPropertiesMapClient from './NearbyPropertiesMapClient'
import FeedbackDetalle from '../feedback/FeedbackDetalle'
import { getPropertyLocalContext } from '@/lib/seo/property-listing'

// Skeletons mientras se carga el chunk JS — evitan que la sección quede en
// blanco hasta que llega el bundle de Leaflet (mapa) o la galería de planos.
// Altura aproximada al componente real para no saltar el layout.
const MapSkeleton = () => (
  <div className="w-full h-[320px] rounded-xl bg-gray-100 animate-pulse" aria-hidden />
)
const BlueprintSkeleton = () => (
  <div className="w-full h-[280px] rounded-xl bg-gray-100 animate-pulse" aria-hidden />
)
const NearbyPlacesSkeleton = () => (
  <div className="w-full h-[180px] rounded-xl bg-gray-100 animate-pulse" aria-hidden />
)

const PropertyMap = dynamic(() => import('../PropertyMap'), { ssr: false, loading: MapSkeleton })
const BlueprintGallery = dynamic(() => import('../BlueprintGallery'), { ssr: false, loading: BlueprintSkeleton })
const NearbyPlaces = dynamic(() => import('../NearbyPlaces'), { ssr: false, loading: NearbyPlacesSkeleton })

const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"
const GREEN = '#1A5C38'
const CARD = 'bg-white rounded-2xl p-6 shadow-sm border border-gray-100'

function SpecCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5 py-3 px-2 bg-[#f9fafb] rounded-xl">
      <div style={{ color: GREEN }}>{icon}</div>
      <span style={{ fontFamily: P, fontWeight: 800, fontSize: 18, fontVariantNumeric: 'tabular-nums', color: '#111' }}>{value}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#4b5563' }}>{label}</span>
    </div>
  )
}

function Row({ label, value, numeric = true }: { label: string; value: string; numeric?: boolean }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${numeric ? 'font-numeric' : ''}`}>{value}</span>
    </div>
  )
}

export default function PropertyDetailBody({
  property,
  // Compat: PropertyPanel todavía pasa allProperties. Lo aceptamos pero
  // no lo usamos — el mapa de "otras propiedades cercanas" ahora vive
  // en NearbyPropertiesMapClient que fetchea su propia data del endpoint.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  allProperties: _allProperties = [],
  whatsappUrl,
  showMobileContact = false,
}: {
  property: TokkoProperty
  allProperties?: TokkoProperty[]
  whatsappUrl: string
  /** If true, render a mobile-only contact card after the title (used inside the modal). */
  showMobileContact?: boolean
}) {
  // Derived
  const price = formatPrice(property)
  // null = "Sin Precio" en Tokko → en vez del monto va un botón que pide el
  // precio por WhatsApp (mismo número/armador que "Consultar por WhatsApp").
  const tienePrecio = mostrarPrecio(property) !== null
  const esOportunidad = esOportunidadConsultanos(property.id)
  const consultarPrecioUrl = tienePrecio
    ? null
    : buildPriceConsultWhatsappUrl(property, generatePropertySlug(property))
  const operation = getOperationType(property)
  const roofedArea = getRoofedArea(property)
  const area = getTotalSurface(property)
  const lotSurface = getLotSurface(property)
  const location = formatLocation(property)
  const propType = translatePropertyType(property.type?.name)
  const description = getDescription(property)
  const blueprints = getBlueprintPhotos(property)
  const address = property.fake_address || property.address
  const localContext = getPropertyLocalContext(property)
  const listingCode = property.reference_code || String(property.id)
  const advisorName = property.producer?.name?.trim() || 'equipo de SI INMOBILIARIA'

  // Barrio privado (si aplica). Se carga por dynamic import para no meter el
  // dataset grande de barrios.ts en el First Load JS de la ficha.
  const [barrio, setBarrio] = useState<Barrio | null>(null)
  useEffect(() => {
    let alive = true
    import('@/lib/barrios')
      .then(m => { if (alive) setBarrio(m.findBarrioForProperty(property)) })
      .catch(() => {})
    return () => { alive = false }
  }, [property])

  // Costos iniciales — solo alquiler permanente (operation_type === 'Rent';
  // 'Sale' y 'Temporary rent' / 'Temporary' quedan fuera).
  const op0 = property.operations?.[0]
  const price0 = op0?.prices?.[0]
  const isAlquilerPermanente = op0?.operation_type === 'Rent'
  const alquilerMonto = typeof price0?.price === 'number' ? price0.price : 0
  const monedaContrato = price0?.currency
  const showCostosIngreso =
    isAlquilerPermanente &&
    property.web_price !== false &&  // "Sin Precio": no exponer el monto vía costos
    alquilerMonto > 0 &&
    (monedaContrato === 'ARS' || monedaContrato === 'USD')

  const currentLat = property.geo_lat ? parseFloat(property.geo_lat) : null
  const currentLng = property.geo_long ? parseFloat(property.geo_long) : null
  const hasCoords = currentLat != null && !isNaN(currentLat) && currentLng != null && !isNaN(currentLng)

  // Specs (icon cards)
  const specs: { icon: React.ReactNode; label: string; value: string | number }[] = []
  if (area != null && area > 0) specs.push({ icon: <Maximize className="w-5 h-5" />, label: 'Superficie', value: `${area} m²` })
  if (roofedArea != null && roofedArea > 0) specs.push({ icon: <Home className="w-5 h-5" />, label: 'Cubierta', value: `${roofedArea} m²` })
  if (isMonoambiente(property)) specs.push({ icon: <Bed className="w-5 h-5" />, label: 'Ambientes', value: 'Monoambiente' })
  else if (property.suite_amount > 0) specs.push({ icon: <Bed className="w-5 h-5" />, label: 'Dormitorios', value: property.suite_amount })
  if (property.bathroom_amount > 0) specs.push({ icon: <Bath className="w-5 h-5" />, label: 'Baños', value: property.bathroom_amount })
  if (property.parking_lot_amount > 0) specs.push({ icon: <Car className="w-5 h-5" />, label: 'Cocheras', value: property.parking_lot_amount })
  if (lotSurface != null && lotSurface > 0 && lotSurface !== area) specs.push({ icon: <Maximize className="w-5 h-5" />, label: 'Lote', value: `${lotSurface} m²` })

  const hasSurfaces =
    (roofedArea && roofedArea > 0) ||
    parseFloat(property.semiroofed_surface) > 0 ||
    parseFloat(property.total_surface) > 0 ||
    parseFloat(property.surface) > 0

  const hasDetails =
    property.age != null ||
    translateCondition(property.property_condition) ||
    translateOrientation(property.orientation) ||
    property.suite_amount > 0 ||
    property.floors_amount > 0 ||
    translateDisposition(property.disposition)

  return (
    <div className="space-y-6">
      {/* OVERVIEW — title + location + price + badges */}
      <section id="overview" className={`${CARD} scroll-mt-40`}>
        <h1 style={{ fontFamily: R, fontWeight: 800, fontSize: 28, color: '#111', lineHeight: 1.2, marginBottom: 8 }}>
          {property.publication_title || address}
        </h1>
        <div className="flex gap-2 mb-3">
          {operation && (
            <span className="px-3 py-1 bg-[#1A5C38] text-white text-[11px] font-bold rounded-full uppercase tracking-wide">{operation}</span>
          )}
          {propType && (
            <span className="px-3 py-1 bg-[#e8f5ee] text-[#1A5C38] text-[11px] font-bold rounded-full uppercase tracking-wide">{propType}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mb-5">
          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: GREEN }} />
          <span style={{ fontFamily: P, fontSize: 13, color: '#6b7280' }}>
            {property.real_address || address}{location ? `, ${location}` : ''}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide block mb-0.5">Precio</span>
          {tienePrecio ? (
            <span style={{ fontFamily: P, fontWeight: 800, fontSize: 32, fontVariantNumeric: 'tabular-nums', color: '#111', lineHeight: 1 }}>
              {price}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2.5 flex-wrap">
              {esOportunidad && (
                <span className="font-bold text-[11px] uppercase tracking-wider text-gray-900 rounded-md px-2.5 py-1" style={{ fontFamily: P, background: '#fbce07' }}>
                  Oportunidad
                </span>
              )}
              <a
                href={consultarPrecioUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1A5C38] hover:bg-[#145030] text-white font-bold rounded-xl px-5 py-3 transition-colors"
                style={{ fontFamily: P, fontSize: 17 }}
              >
                <MessageCircle className="w-5 h-5" /> {esOportunidad ? 'Consultanos' : 'Consultar precio'}
              </a>
            </span>
          )}
        </div>
        <div className="mt-5 flex items-start gap-3 border-t border-gray-100 pt-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1A5C38]" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">Publicación de SI INMOBILIARIA</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">
              Código <span className="font-numeric font-semibold">{listingCode}</span> · Asesor responsable: {advisorName}.
              {' '}Disponibilidad, medidas, condiciones y documentación se confirman antes de avanzar.
            </p>
          </div>
        </div>
      </section>

      {/* COSTOS INICIALES — solo alquiler permanente con precio + moneda válidos */}
      {showCostosIngreso && (
        <CostosIngresoMini
          alquiler={alquilerMonto}
          moneda={monedaContrato as 'ARS' | 'USD'}
          tipoPropiedad={property.type?.name ?? ''}
          propertyId={property.id}
        />
      )}

      {/* Mobile-only contact (inside modal, since modal is used only on desktop anyway this is defensive) */}
      {showMobileContact && (
        <section className={`md:hidden ${CARD}`}>
          {/* Agente — foto + nombre + badge */}
          {(() => {
            const producer = property.producer
            const name = producer?.name?.trim() || 'SI INMOBILIARIA'
            const rol = getAgenteRol(name)
            const initials =
              name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(s => s[0])
                .join('')
                .toUpperCase() || 'SI'
            return (
              <div className="flex items-center gap-3 mb-4">
                {producer?.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={producer.picture}
                    alt={name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0 bg-gray-100"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                    style={{ background: '#1A5C38', fontFamily: "'Raleway', system-ui, sans-serif" }}
                  >
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span
                    className="block"
                    style={{ fontFamily: "'Raleway', system-ui, sans-serif", fontWeight: 700, fontSize: 16, color: '#111' }}
                  >
                    {name}
                  </span>
                  <span className="text-xs text-gray-500 block truncate">{rol.titulo}</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex-shrink-0"
                  style={{ background: '#e7f2eb', color: '#1A5C38' }}
                >
                  {rol.badge}
                </span>
              </div>
            )
          })()}

          <div className="grid grid-cols-2 gap-2.5">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm"
              style={{ background: '#0B6B3A', color: '#fff' }}>
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a href="tel:+5493412101694"
              className="flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm"
              style={{ border: '1.5px solid #e5e7eb', color: '#111' }}>
              <Phone className="w-4 h-4" /> Llamar
            </a>
          </div>
        </section>
      )}

      {/* CARACTERÍSTICAS */}
      {specs.length > 0 && (
        <section id="caracteristicas" className={`${CARD} scroll-mt-40`}>
          <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 16 }}>Características</h2>
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
            {specs.map((s, i) => <SpecCard key={i} icon={s.icon} label={s.label} value={s.value} />)}
          </div>
        </section>
      )}

      {/* VIDEO — arriba de la descripción, solo si la propiedad tiene videos */}
      {property.videos && property.videos.length > 0 && (
        <SectionBoundary name="video">
          <section id="video" className={`${CARD} scroll-mt-40`}>
            <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 12 }}>Recorrido en video</h2>
            <PropertyVideo videos={property.videos} fallbackPoster={property.photos?.[0]?.image ?? null} />
          </section>
        </SectionBoundary>
      )}

      {/* DESCRIPCIÓN */}
      {description && (
        <SectionBoundary name="descripcion">
          <section id="descripcion" className={`${CARD} scroll-mt-40`}>
            <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 12 }}>Descripción</h2>
            <PropertyDescription text={description} />
          </section>
        </SectionBoundary>
      )}

      {/* CONTEXTO LOCAL — enlaces internos útiles para comparar y para captar
          propietarios con una vivienda similar, sin generar landings nuevas. */}
      <section className={CARD} aria-labelledby={`contexto-local-${property.id}`}>
        <h2
          id={`contexto-local-${property.id}`}
          style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 8 }}
        >
          Más contexto para decidir
        </h2>
        <p className="max-w-[68ch] text-sm leading-relaxed text-gray-600">
          Compará esta opción con el inventario actual{localContext.city ? ` de ${localContext.city}` : ''}.
          {' '}Si tenés una propiedad similar, conocé también nuestro criterio de tasación antes de vender.
        </p>
        <nav className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap" aria-label="Enlaces relacionados con esta propiedad">
          <Link
            href={localContext.browseHref}
            className="inline-flex min-h-11 items-center justify-between gap-3 rounded-xl bg-[#1A5C38] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#145030] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A5C38]"
          >
            {localContext.browseLabel}
            <ArrowRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          </Link>
          <Link
            href={localContext.valuationHref}
            className="inline-flex min-h-11 items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-[#1A5C38] transition-colors hover:border-[#1A5C38]/35 hover:bg-[#f4f8f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A5C38]"
          >
            {localContext.valuationLabel}
            <ArrowRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          </Link>
        </nav>
      </section>

      {/* SUPERFICIES */}
      {hasSurfaces && (
        <section className={CARD}>
          <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 16 }}>Superficies</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {parseFloat(property.surface) > 0 && <Row label="Terreno" value={`${parseFloat(property.surface)} m²`} />}
            {roofedArea != null && roofedArea > 0 && <Row label="Cubierta" value={`${roofedArea} m²`} />}
            {parseFloat(property.semiroofed_surface) > 0 && <Row label="Semicubierta" value={`${parseFloat(property.semiroofed_surface)} m²`} />}
            {parseFloat(property.total_surface) > 0 && <Row label="Total" value={`${parseFloat(property.total_surface)} m²`} />}
          </div>
        </section>
      )}

      {/* DETALLES */}
      {hasDetails && (
        <section className={CARD}>
          <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 16 }}>Detalles</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {property.age != null && property.age >= 0 && <Row label="Antigüedad" value={property.age === 0 ? 'A estrenar' : `${property.age} años`} />}
            {translateCondition(property.property_condition) && <Row label="Estado" value={translateCondition(property.property_condition)!} numeric={false} />}
            {translateOrientation(property.orientation) && <Row label="Orientación" value={translateOrientation(property.orientation)!} numeric={false} />}
            {property.suite_amount > 0 && <Row label="Suites" value={String(property.suite_amount)} />}
            {property.floors_amount > 0 && <Row label="Plantas" value={String(property.floors_amount)} />}
            {translateDisposition(property.disposition) && <Row label="Disposición" value={translateDisposition(property.disposition)!} numeric={false} />}
          </div>
        </section>
      )}

      {/* SERVICIOS Y AMENITIES — agrupados por categoría (servicios, seguridad,
          amenities, ambientes, confort). Tags sin categoría no se muestran. */}
      {(() => {
        const grupos = agruparTags(property.tags ?? [])
        if (grupos.length === 0) return null
        return (
          <section className={CARD}>
            {grupos.map((g, i) => (
              <div key={g.cat} className={i > 0 ? 'mt-5' : ''}>
                <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 15, color: '#111', marginBottom: 10 }}>{g.label}</h2>
                <div className="flex flex-wrap gap-2">
                  {g.items.map(item => (
                    <span key={item} className="px-4 py-1.5 rounded-full text-sm border border-gray-200" style={{ color: '#374151' }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )
      })()}

      {/* PLANOS */}
      {blueprints.length > 0 && (
        <SectionBoundary name="planos">
          <section id="planos" className={`${CARD} scroll-mt-40`}>
            <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 12 }}>Planos</h2>
            <BlueprintGallery blueprints={blueprints} />
          </section>
        </SectionBoundary>
      )}

      {/* BARRIO PRIVADO — solo si la propiedad está en un barrio cerrado conocido */}
      {barrio && (
        <SectionBoundary name="barrio">
          <BarrioPanel barrio={barrio} />
        </SectionBoundary>
      )}

      {/* UBICACIÓN */}
      <SectionBoundary name="ubicacion">
        <section id="ubicacion" className={`${CARD} scroll-mt-40`}>
          <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 12 }}>Ubicación</h2>
          <div className="rounded-[14px] overflow-hidden mb-3" style={{ aspectRatio: '4/3' }}>
            <PropertyMap
              lat={currentLat}
              lng={currentLng}
              address={property.real_address || address}
            />
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: GREEN }} />
            <span style={{ fontFamily: P, fontSize: 13, color: '#6b7280' }}>
              {property.real_address || address}{location ? `, ${location}` : ''}
            </span>
          </div>
        </section>
      </SectionBoundary>

      {/* LUGARES CERCANOS */}
      {hasCoords && (
        <SectionBoundary name="lugares-cercanos">
          <section className={CARD}>
            <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 4 }}>Lugares cercanos</h2>
            <p className="font-poppins text-gray-500 text-[13px] mb-4">Escuelas, hospitales, comercios y espacios verdes en la zona</p>
            <NearbyPlaces lat={currentLat!} lng={currentLng!} />
          </section>
        </SectionBoundary>
      )}

      {/* OTRAS PROPIEDADES EN LA ZONA — mapa con pines verdes.
          El wrapper client fetchea /api/propiedades/nearby (cacheado en
          CDN 15 min) y maneja loading/error/success internamente. */}
      {hasCoords && (
        <SectionBoundary name="nearby-properties-map">
          <NearbyPropertiesMapClient
            lat={currentLat!}
            lng={currentLng!}
            excludeId={property.id}
          />
        </SectionBoundary>
      )}

      {/* FEEDBACK ANÓNIMO — caritas + valuación + "avisame si baja".
          Aditivo y detrás de NEXT_PUBLIC_FEEDBACK_ENABLED (se auto-oculta si
          el flag está off). publishedPrice=0 cuando no hay precio visible
          (oculta el slider, deja caritas + alerta). */}
      <FeedbackDetalle
        key={property.id}
        propertyId={property.id}
        publishedPrice={
          property.web_price !== false && typeof price0?.price === 'number' && price0.price > 0
            ? price0.price
            : 0
        }
        currency={price0?.currency ?? 'USD'}
      />

      {/* "Otras opciones para vos" ya no va acá — el parent lo renderiza full-width
          via <PropertyDetailSimilars /> debajo del grid de 2 columnas. */}
    </div>
  )
}
