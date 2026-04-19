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
} from '@/lib/tokko'
import PropertyDescription from '../PropertyDescription'
import SimilarProperties from '../SimilarProperties'

const PropertyMap = dynamic(() => import('../PropertyMap'), { ssr: false })
const BlueprintGallery = dynamic(() => import('../BlueprintGallery'), { ssr: false })
const NearbyPlaces = dynamic(() => import('../NearbyPlaces'), { ssr: false })

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
  const currentOp = property.operations?.[0]?.operation_type
  const currentTypeName = property.type?.name?.toLowerCase() ?? ''
  const currentPrice = property.operations?.[0]?.prices?.[0]?.price ?? 0
  const currentBeds = property.suite_amount || property.room_amount || 0

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

  const similarList = allProperties
    .map(p => {
      if (p.id === property.id) return null
      if (p.operations?.[0]?.operation_type !== currentOp) return null
      if ((p.type?.name?.toLowerCase() ?? '') !== currentTypeName) return null
      let score = 0
      const pPrice = p.operations?.[0]?.prices?.[0]?.price ?? 0
      if (currentPrice > 0 && pPrice > 0) {
        const ratio = pPrice / currentPrice
        if (ratio >= 0.7 && ratio <= 1.3) score += 3
        else if (ratio >= 0.5 && ratio <= 1.5) score += 1
      }
      const pBeds = p.suite_amount || p.room_amount || 0
      if (currentBeds > 0 && pBeds === currentBeds) score += 2
      else if (currentBeds > 0 && Math.abs(pBeds - currentBeds) === 1) score += 1
      if (hasCoords && p.geo_lat && p.geo_long) {
        const lat = parseFloat(p.geo_lat); const lng = parseFloat(p.geo_long)
        if (!isNaN(lat) && !isNaN(lng)) {
          const d = haversineKm(currentLat!, currentLng!, lat, lng)
          if (d < 2) score += 4
          else if (d < 5) score += 2
          else if (d < 15) score += 1
        }
      }
      return score > 0 ? { p, score } : null
    })
    .filter((x): x is { p: TokkoProperty; score: number } => x != null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(x => x.p)

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
        <section id="planos" className={CARD}>
          <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 12 }}>Planos</h2>
          <BlueprintGallery blueprints={blueprints} />
        </section>
      )}

      {/* UBICACIÓN */}
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

      {/* LUGARES CERCANOS */}
      {hasCoords && (
        <section className={CARD}>
          <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 4 }}>Lugares cercanos</h2>
          <p className="font-poppins text-gray-500 text-[13px] mb-4">Escuelas, hospitales, comercios y espacios verdes en la zona</p>
          <NearbyPlaces lat={currentLat!} lng={currentLng!} />
        </section>
      )}

      {/* PROPIEDADES SIMILARES — única sección de recomendadas, 4 max */}
      {similarList.length > 0 && (
        <section id="similares" className={CARD}>
          <SimilarProperties properties={similarList} currentPropertyId={property.id} />
        </section>
      )}
    </div>
  )
}
