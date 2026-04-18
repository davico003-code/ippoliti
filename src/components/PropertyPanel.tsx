'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Bed, Bath, Maximize, Home, Car, Phone, MessageCircle, Images } from 'lucide-react'
import {
  type TokkoProperty,
  getAllPhotos,
  formatPrice,
  getOperationType,
  getRoofedArea,
  getTotalSurface,
  getLotSurface,
  formatLocation,
  getMainPhoto,
  getDescription,
  getBlueprintPhotos,
  translatePropertyType,
  translateTag,
  translateCondition,
  translateOrientation,
  translateDisposition,
  generatePropertySlug,
} from '@/lib/tokko'
import PropertyDescription from './PropertyDescription'
import ShareButtons from './ShareButtons'
import VisitWidget from './VisitWidget'

const PropertyMap = dynamic(() => import('./PropertyMap'), { ssr: false })
const BlueprintGallery = dynamic(() => import('./BlueprintGallery'), { ssr: false })
const NearbyPlaces = dynamic(() => import('./NearbyPlaces'), { ssr: false })

// ─── Styles ────────────────────────────────────────────────────────────────────

const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"
const GREEN = '#1A5C38'
const CARD = 'bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 mb-4'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function SpecCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5 py-3 px-2 bg-[#f9fafb] rounded-xl">
      <div style={{ color: GREEN }}>{icon}</div>
      <span style={{ fontFamily: P, fontWeight: 800, fontSize: 18, fontVariantNumeric: 'tabular-nums', color: '#111' }}>{value}</span>
      <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>{label}</span>
    </div>
  )
}

function SurfaceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span style={{ fontFamily: R, fontWeight: 700, fontSize: 18, fontVariantNumeric: 'tabular-nums', color: '#111' }}>{value}</span>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-bold text-[#111]">{value}</span>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────

interface Props {
  propertyId: number
  onClose: () => void
}

export default function PropertyPanel({ propertyId, onClose }: Props) {
  const [property, setProperty] = useState<TokkoProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showAllPhotos, setShowAllPhotos] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch(`/api/propiedades/${propertyId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then((data: TokkoProperty) => { setProperty(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [propertyId])

  // Lock body scroll preserving position
  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [])
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [onClose])

  // URL shareable
  useEffect(() => {
    if (!property) return
    const slug = generatePropertySlug(property)
    const prev = window.location.pathname + window.location.search
    window.history.pushState(null, '', `/propiedades/${slug}`)
    return () => { window.history.pushState(null, '', prev) }
  }, [property])

  useEffect(() => {
    const h = () => onClose()
    window.addEventListener('popstate', h); return () => window.removeEventListener('popstate', h)
  }, [onClose])

  // Loading / Error
  if (loading || error || !property) {
    return (
      <div className="fixed inset-0 z-[200]">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute inset-0 md:inset-y-4 md:left-1/2 md:-translate-x-1/2 w-full md:max-w-[1250px] md:rounded-2xl bg-[#fafafa] overflow-y-auto" style={{ animation: 'ppSlideIn 200ms ease-out' }}>
          {loading ? (
            <div className="animate-pulse p-6 space-y-4">
              <div className="h-8 w-40 bg-gray-200 rounded" />
              <div className="h-[280px] bg-gray-200 rounded-2xl" />
              <div className="h-6 w-3/4 bg-gray-200 rounded" />
              <div className="h-10 w-1/3 bg-gray-200 rounded" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-6">
                <p className="text-xl font-bold text-gray-900 mb-2">No se pudo cargar</p>
                <button onClick={onClose} className="text-[#1A5C38] font-semibold">Volver</button>
              </div>
            </div>
          )}
        </div>
        <style>{`@keyframes ppSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      </div>
    )
  }

  // ── Derived data ──
  const photos = getAllPhotos(property)
  const mainPhoto = photos[0] || getMainPhoto(property)
  const price = formatPrice(property)
  const operation = getOperationType(property)
  const roofedArea = getRoofedArea(property)
  const area = getTotalSurface(property)
  const lotSurface = getLotSurface(property)
  const location = formatLocation(property)
  const propType = translatePropertyType(property.type?.name)
  const description = getDescription(property)
  const blueprints = getBlueprintPhotos(property)
  const slug = generatePropertySlug(property)
  const address = property.fake_address || property.address

  const addrText = property.fake_address || property.address || ''
  const sortedDivs = [...(property.location?.divisions ?? [])].sort((a, b) => b.name.length - a.name.length)
  const neighborhood = sortedDivs.find(d => {
    const esc = d.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${esc}\\b`, 'i').test(addrText)
  })?.name

  const whatsappMsg = encodeURIComponent(`Hola! Me interesa esta propiedad:\n\n*${property.publication_title || address}*\n📍 ${address}\n💰 ${price}\n\n🔗 https://siinmobiliaria.com/propiedades/${slug}`)
  const whatsappUrl = `https://wa.me/5493412101694?text=${whatsappMsg}`

  const specs: { icon: React.ReactNode; label: string; value: string | number }[] = []
  if (area != null && area > 0) specs.push({ icon: <Maximize className="w-5 h-5" />, label: 'Superficie', value: `${area} m²` })
  if (roofedArea != null && roofedArea > 0) specs.push({ icon: <Home className="w-5 h-5" />, label: 'Cubierta', value: `${roofedArea} m²` })
  if (property.suite_amount > 0) specs.push({ icon: <Bed className="w-5 h-5" />, label: 'Dormitorios', value: property.suite_amount })
  if (property.bathroom_amount > 0) specs.push({ icon: <Bath className="w-5 h-5" />, label: 'Baños', value: property.bathroom_amount })
  if (property.parking_lot_amount > 0) specs.push({ icon: <Car className="w-5 h-5" />, label: 'Cocheras', value: property.parking_lot_amount })
  if (lotSurface != null && lotSurface > 0 && lotSurface !== area) specs.push({ icon: <Maximize className="w-5 h-5" />, label: 'Lote', value: `${lotSurface} m²` })

  const hasSurfaces = (roofedArea && roofedArea > 0) || parseFloat(property.semiroofed_surface) > 0 || parseFloat(property.total_surface) > 0 || parseFloat(property.surface) > 0
  const hasDetails = property.age != null || translateCondition(property.property_condition) || translateOrientation(property.orientation) || property.suite_amount > 0 || property.floors_amount > 0 || translateDisposition(property.disposition)

  return (
    <div className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} style={{ animation: 'ppFadeIn 200ms ease-out' }} />

      <div className="absolute inset-0 md:inset-y-4 md:left-1/2 md:-translate-x-1/2 w-full md:max-w-[1250px] md:rounded-2xl bg-[#fafafa] overflow-y-auto" style={{ animation: 'ppSlideIn 250ms ease-out' }}>

        {/* ── HEADER sticky ── */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-5" style={{ height: 56 }}>
          <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#1A5C38] transition-colors" style={{ fontFamily: R }}>
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver a la búsqueda</span>
            <span className="sm:hidden">Volver</span>
          </button>
          <Link href={`/propiedades/${slug}`} className="text-xs font-medium text-gray-400 hover:text-[#1A5C38] transition-colors">
            Abrir completa →
          </Link>
        </div>

        {/* ── PHOTO GRID (Zillow style: 1 big + 4 small) ── */}
        {photos.length > 0 && (
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-1" style={{ maxHeight: 420 }}>
              {/* Main photo — spans 3 cols */}
              <div className="relative md:col-span-3 aspect-[16/10] md:aspect-auto overflow-hidden cursor-pointer" onClick={() => setShowAllPhotos(true)}>
                <Image src={photos[0]} alt={property.publication_title || address} fill className="object-cover" sizes="60vw" priority />
                {operation && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold uppercase text-white" style={{ background: operation === 'Venta' ? '#dc2626' : '#2563eb' }}>
                    {operation}
                  </span>
                )}
                {propType && (
                  <span className="absolute top-3 left-[90px] px-3 py-1 bg-white/90 rounded-full text-[11px] font-bold uppercase" style={{ color: GREEN }}>
                    {propType}
                  </span>
                )}
              </div>
              {/* 4 thumbnails — 2x2 grid */}
              <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-1">
                {[1, 2, 3, 4].map(i => {
                  const photo = photos[i]
                  const isLast = i === 4
                  if (!photo) return <div key={i} className="bg-gray-100" />
                  return (
                    <div key={i} className="relative overflow-hidden cursor-pointer" onClick={() => setShowAllPhotos(true)}>
                      <Image src={photo} alt="" fill className="object-cover" sizes="20vw" />
                      {isLast && photos.length > 5 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-1.5">
                          <Images className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-semibold">Ver las {photos.length} fotos</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Mobile: "Ver fotos" button */}
            {photos.length > 1 && (
              <button
                onClick={() => setShowAllPhotos(true)}
                className="md:hidden absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-800 flex items-center gap-1.5 shadow"
              >
                <Images className="w-3.5 h-3.5" /> {photos.length} fotos
              </button>
            )}
          </div>
        )}

        {/* Lightbox fullscreen */}
        {showAllPhotos && (
          <div className="fixed inset-0 z-[300] bg-black">
            <button onClick={() => setShowAllPhotos(false)} className="absolute top-4 right-4 z-10 text-white bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-white/30">&times;</button>
            <div className="h-full overflow-y-auto p-4 pt-16">
              <div className="max-w-4xl mx-auto space-y-2">
                {photos.map((p, i) => (
                  <Image key={i} src={p} alt={`Foto ${i + 1}`} width={1200} height={800} className="w-full h-auto rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 p-4 md:p-5">
          {/* ════ LEFT COLUMN ════ */}
          <div className="flex-1 min-w-0">

            {/* CARD 1 — Título + Precio */}
            <div className={CARD}>
              <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 22, color: '#111', lineHeight: 1.25, marginBottom: 8 }}>
                {property.publication_title || address}
              </h2>
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#e7f2eb' }}>
                  <MapPin className="w-3 h-3" style={{ color: GREEN }} />
                </div>
                <span style={{ fontFamily: P, fontSize: 13, color: '#6b7280' }}>
                  {property.real_address || address}{location ? `, ${location}` : ''}
                </span>
              </div>
              <div style={{ fontFamily: P, fontWeight: 800, fontSize: 32, fontVariantNumeric: 'tabular-nums', color: '#111', lineHeight: 1 }}>
                {price}
              </div>
            </div>

            {/* CARD 2 — Características */}
            {specs.length > 0 && (
              <div className={CARD}>
                <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 16 }}>Características</h2>
                <div className="grid grid-cols-3 gap-2.5">
                  {specs.map((s, i) => <SpecCard key={i} icon={s.icon} label={s.label} value={s.value} />)}
                </div>
              </div>
            )}

            {/* CARD 3 — Descripción */}
            {description && (
              <div className={CARD}>
                <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 12 }}>Descripción</h2>
                <PropertyDescription text={description} />
              </div>
            )}

            {/* CARD 5 — Superficies */}
            {hasSurfaces && (
              <div className={CARD}>
                <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 16 }}>Superficies</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {parseFloat(property.surface) > 0 && <SurfaceRow label="Terreno" value={`${parseFloat(property.surface)} m²`} />}
                  {roofedArea != null && roofedArea > 0 && <SurfaceRow label="Cubierta" value={`${roofedArea} m²`} />}
                  {parseFloat(property.semiroofed_surface) > 0 && <SurfaceRow label="Semicubierta" value={`${parseFloat(property.semiroofed_surface)} m²`} />}
                  {parseFloat(property.total_surface) > 0 && <SurfaceRow label="Total" value={`${parseFloat(property.total_surface)} m²`} />}
                </div>
              </div>
            )}

            {/* CARD 6 — Detalles */}
            {hasDetails && (
              <div className={CARD}>
                <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 16 }}>Detalles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
                  {property.age != null && property.age >= 0 && <DetailRow label="Antigüedad" value={property.age === 0 ? 'A estrenar' : `${property.age} años`} />}
                  {translateCondition(property.property_condition) && <DetailRow label="Estado" value={translateCondition(property.property_condition)!} />}
                  {translateOrientation(property.orientation) && <DetailRow label="Orientación" value={translateOrientation(property.orientation)!} />}
                  {property.suite_amount > 0 && <DetailRow label="Suites" value={String(property.suite_amount)} />}
                  {property.floors_amount > 0 && <DetailRow label="Plantas" value={String(property.floors_amount)} />}
                  {translateDisposition(property.disposition) && <DetailRow label="Disposición" value={translateDisposition(property.disposition)!} />}
                </div>
              </div>
            )}

            {/* CARD 7 — Servicios y amenities */}
            {property.tags && property.tags.length > 0 && (
              <div className={CARD}>
                <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 12 }}>Servicios y amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.tags.map(tag => (
                    <span key={tag.id} className="px-4 py-1.5 rounded-full text-sm border border-gray-200" style={{ color: '#374151' }}>
                      {translateTag(tag.name)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CARD 8 — Ubicación */}
            <div className={CARD}>
              <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 12 }}>Ubicación</h2>
              <div className="rounded-[14px] overflow-hidden mb-3" style={{ aspectRatio: '16/9' }}>
                <PropertyMap
                  lat={property.geo_lat ? parseFloat(property.geo_lat) : null}
                  lng={property.geo_long ? parseFloat(property.geo_long) : null}
                  address={property.real_address || address}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#e7f2eb' }}>
                  <MapPin className="w-3 h-3" style={{ color: GREEN }} />
                </div>
                <span style={{ fontFamily: P, fontSize: 13, color: '#6b7280' }}>
                  {property.real_address || address}{location ? `, ${location}` : ''}
                </span>
              </div>
            </div>

            {/* Planos */}
            {blueprints.length > 0 && (
              <div className={CARD}>
                <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 12 }}>Planos</h2>
                <BlueprintGallery blueprints={blueprints} />
              </div>
            )}

            {/* Lugares cercanos */}
            {property.geo_lat && property.geo_long && (
              <div className={CARD}>
                <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 4 }}>Lugares cercanos</h2>
                <p className="font-poppins text-gray-500 text-[13px] mb-4">Escuelas, hospitales, comercios y espacios verdes en la zona</p>
                <NearbyPlaces lat={parseFloat(property.geo_lat)} lng={parseFloat(property.geo_long)} />
              </div>
            )}
          </div>

          {/* ════ RIGHT COLUMN — sidebar sticky ════ */}
          <div className="w-full md:w-[340px] md:shrink-0">
            <div className="md:sticky md:top-[72px] space-y-4">

              {/* CARD AGENTE */}
              <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-colors mb-2.5"
                  style={{ background: '#25d366', color: '#fff' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1ab856' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#25d366' }}
                >
                  <MessageCircle className="w-5 h-5" />Consultar por WhatsApp
                </a>
                <a href="tel:+5493412101694"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-colors mb-2.5"
                  style={{ border: '1.5px solid #e5e7eb', color: '#111' }}
                >
                  <Phone className="w-5 h-5" />Llamar <span className="font-numeric">(341) 210-1694</span>
                </a>

                <div className="border-t border-gray-100 pt-4 mt-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: GREEN, fontFamily: R }}>DF</div>
                    <div className="flex-1 min-w-0">
                      <span style={{ fontFamily: R, fontWeight: 700, fontSize: 16, color: '#111', display: 'block' }}>David Flores</span>
                      <span className="text-xs text-gray-400">Mat. N° 0621</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider" style={{ background: '#e7f2eb', color: GREEN }}>Agente</span>
                  </div>
                </div>

                {/* Compartir */}
                <div className="border-t border-gray-100 mt-5 pt-4">
                  <p className="text-xs text-gray-400 tracking-wider uppercase mb-3">Compartir propiedad</p>
                  <ShareButtons
                    slug={slug}
                    title={property.publication_title || address}
                    price={price}
                    photo={mainPhoto}
                    operation={operation}
                    propertyType={propType}
                    area={area}
                    rooms={property.suite_amount || property.room_amount || 0}
                    bathrooms={property.bathroom_amount}
                    lotSurface={lotSurface}
                    parking={property.parking_lot_amount}
                    city={property.location?.name}
                    neighborhood={neighborhood}
                  />
                </div>
              </div>

              {/* CARD VISITA */}
              {operation?.toLowerCase().includes('venta') && (
                <VisitWidget propertyId={property.id} propertyTitle={property.publication_title || address} />
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ppFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ppSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  )
}
