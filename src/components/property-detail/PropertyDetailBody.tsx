'use client'

// Shared desktop body: all content sections in identical order for
// the modal (PropertyPanel) and the full page (/propiedades/[slug]).
// Mobile is NOT rendered here — each parent keeps its own mobile layout.
import dynamic from 'next/dynamic'
import { MapPin, Bed, Bath, Maximize, Home, Car, MessageCircle, Phone } from 'lucide-react'
import {
  type TokkoProperty,
  formatPrice,
  getOperationType,
  getRoofedArea,
  getTotalSurface,
  getLotSurface,
  formatLocation,
  getDescription,
  getBlueprintPhotos,
  translatePropertyType,
  translateTag,
  translateCondition,
  translateOrientation,
  translateDisposition,
  generatePropertySlug,
} from '@/lib/tokko'
import PropertyDescription from '../PropertyDescription'
import type { NearbyProperty } from '../NearbyPropertiesMap'
import SectionBoundary from './SectionBoundary'
import PropertyVideo from './PropertyVideo'

const PropertyMap = dynamic(() => import('../PropertyMap'), { ssr: false })
const BlueprintGallery = dynamic(() => import('../BlueprintGallery'), { ssr: false })
const NearbyPlaces = dynamic(() => import('../NearbyPlaces'), { ssr: false })
const NearbyPropertiesMap = dynamic(() => import('../NearbyPropertiesMap'), { ssr: false })

const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"
const GREEN = '#1A5C38'
const CARD = 'bg-white rounded-2xl p-6 shadow-sm border border-gray-100'

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function SpecCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5 py-3 px-2 bg-[#f9fafb] rounded-xl">
      <div style={{ color: GREEN }}>{icon}</div>
      <span style={{ fontFamily: P, fontWeight: 800, fontSize: 18, fontVariantNumeric: 'tabular-nums', color: '#111' }}>{value}</span>
      <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>{label}</span>
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
  allProperties = [],
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
  const operation = getOperationType(property)
  const roofedArea = getRoofedArea(property)
  const area = getTotalSurface(property)
  const lotSurface = getLotSurface(property)
  const location = formatLocation(property)
  const propType = translatePropertyType(property.type?.name)
  const description = getDescription(property)
  const blueprints = getBlueprintPhotos(property)
  const address = property.fake_address || property.address

  const currentLat = property.geo_lat ? parseFloat(property.geo_lat) : null
  const currentLng = property.geo_long ? parseFloat(property.geo_long) : null
  const hasCoords = currentLat != null && !isNaN(currentLat) && currentLng != null && !isNaN(currentLng)

  // Specs (icon cards)
  const specs: { icon: React.ReactNode; label: string; value: string | number }[] = []
  if (area != null && area > 0) specs.push({ icon: <Maximize className="w-5 h-5" />, label: 'Superficie', value: `${area} m²` })
  if (roofedArea != null && roofedArea > 0) specs.push({ icon: <Home className="w-5 h-5" />, label: 'Cubierta', value: `${roofedArea} m²` })
  if (property.suite_amount > 0) specs.push({ icon: <Bed className="w-5 h-5" />, label: 'Dormitorios', value: property.suite_amount })
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

  // Nearby properties for the map (≤5km from current)
  const nearbyForMap: NearbyProperty[] = hasCoords
    ? allProperties
        .filter(p => p.id !== property.id && p.geo_lat && p.geo_long)
        .map(p => {
          const lat = parseFloat(p.geo_lat!); const lng = parseFloat(p.geo_long!)
          if (isNaN(lat) || isNaN(lng)) return null
          if (haversineKm(currentLat!, currentLng!, lat, lng) > 5) return null
          return {
            id: p.id,
            lat,
            lng,
            title: p.publication_title || p.address,
            price: formatPrice(p),
            slug: generatePropertySlug(p),
          }
        })
        .filter((x): x is NearbyProperty => x != null)
        .slice(0, 40)
    : []

  return (
    <div className="space-y-6">
      {/* OVERVIEW — title + location + price + badges */}
      <section id="overview" className={CARD}>
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
          <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide block mb-0.5">Precio</span>
          <span style={{ fontFamily: P, fontWeight: 800, fontSize: 32, fontVariantNumeric: 'tabular-nums', color: '#111', lineHeight: 1 }}>
            {price}
          </span>
        </div>
      </section>

      {/* Mobile-only contact (inside modal, since modal is used only on desktop anyway this is defensive) */}
      {showMobileContact && (
        <section className={`md:hidden ${CARD}`}>
          <div className="grid grid-cols-2 gap-2.5">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm"
              style={{ background: '#25d366', color: '#fff' }}>
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
        <section id="caracteristicas" className={CARD}>
          <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 16 }}>Características</h2>
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
            {specs.map((s, i) => <SpecCard key={i} icon={s.icon} label={s.label} value={s.value} />)}
          </div>
        </section>
      )}

      {/* VIDEO — arriba de la descripción, solo si la propiedad tiene videos */}
      {property.videos && property.videos.length > 0 && (
        <SectionBoundary name="video">
          <section id="video" className={CARD}>
            <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 12 }}>Recorrido en video</h2>
            <PropertyVideo videos={property.videos} fallbackPoster={property.photos?.[0]?.image ?? null} />
          </section>
        </SectionBoundary>
      )}

      {/* DESCRIPCIÓN */}
      {description && (
        <section id="descripcion" className={CARD}>
          <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 12 }}>Descripción</h2>
          <PropertyDescription text={description} />
        </section>
      )}

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

      {/* AMENITIES */}
      {property.tags && property.tags.length > 0 && (
        <section className={CARD}>
          <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 12 }}>Servicios y amenities</h2>
          <div className="flex flex-wrap gap-2">
            {property.tags.map(tag => (
              <span key={tag.id} className="px-4 py-1.5 rounded-full text-sm border border-gray-200" style={{ color: '#374151' }}>
                {translateTag(tag.name)}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* PLANOS */}
      {blueprints.length > 0 && (
        <SectionBoundary name="planos">
          <section id="planos" className={CARD}>
            <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 12 }}>Planos</h2>
            <BlueprintGallery blueprints={blueprints} />
          </section>
        </SectionBoundary>
      )}

      {/* UBICACIÓN */}
      <SectionBoundary name="ubicacion">
        <section id="ubicacion" className={CARD}>
          <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 12 }}>Ubicación</h2>
          <div className="rounded-[14px] overflow-hidden mb-3" style={{ aspectRatio: '16/9' }}>
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

      {/* OTRAS PROPIEDADES EN LA ZONA — mapa con pines verdes */}
      {hasCoords && nearbyForMap.length > 0 && (
        <SectionBoundary name="nearby-properties-map">
          <NearbyPropertiesMap lat={currentLat!} lng={currentLng!} nearbyProperties={nearbyForMap} />
        </SectionBoundary>
      )}

      {/* "Otras opciones para vos" ya no va acá — el parent lo renderiza full-width
          via <PropertyDetailSimilars /> debajo del grid de 2 columnas. */}
    </div>
  )
}
