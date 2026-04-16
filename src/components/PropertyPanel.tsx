'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Bed, Bath, Maximize, Home, Car, Phone, MessageCircle } from 'lucide-react'
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
import ShareButtons from './ShareButtons'
import PropertyDescription from './PropertyDescription'

const PhotoGallery = dynamic(() => import('./PhotoGallery'), { ssr: false })
const PropertyMap = dynamic(() => import('./PropertyMap'), { ssr: false })
const BlueprintGallery = dynamic(() => import('./BlueprintGallery'), { ssr: false })

interface Props {
  propertyId: number
  onClose: () => void
}

function SpecCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center text-center gap-1 py-3 px-2 bg-[#f9fafb] rounded-xl">
      <div className="text-[#1A5C38]">{icon}</div>
      <span className="text-gray-900 font-bold text-sm font-numeric">{value}</span>
      <span className="text-[11px] text-gray-400 font-medium">{label}</span>
    </div>
  )
}

export default function PropertyPanel({ propertyId, onClose }: Props) {
  const [property, setProperty] = useState<TokkoProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Fetch property data
  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch(`/api/propiedades/${propertyId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then((data: TokkoProperty) => { setProperty(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [propertyId])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Update URL (shallow) for sharing, restore on close
  useEffect(() => {
    if (!property) return
    const slug = generatePropertySlug(property)
    const prevUrl = window.location.href
    window.history.pushState(null, '', `/propiedades/${slug}`)
    return () => { window.history.pushState(null, '', prevUrl) }
  }, [property])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Close on browser back
  useEffect(() => {
    const handler = () => onClose()
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [onClose])

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200]">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute inset-y-0 right-0 w-full md:w-[55%] lg:w-[50%] xl:w-[45%] bg-[#fafafa] overflow-y-auto" style={{ animation: 'ppSlideIn 200ms ease-out' }}>
          <div className="animate-pulse p-6 space-y-4">
            <div className="h-8 w-40 bg-gray-200 rounded" />
            <div className="h-[300px] bg-gray-200 rounded-2xl" />
            <div className="h-6 w-3/4 bg-gray-200 rounded" />
            <div className="h-10 w-1/3 bg-gray-200 rounded" />
          </div>
        </div>
        <style>{`@keyframes ppSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="fixed inset-0 z-[200]">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute inset-y-0 right-0 w-full md:w-[55%] bg-white flex items-center justify-center">
          <div className="text-center px-6">
            <p className="text-xl font-bold text-gray-900 mb-2">No se pudo cargar</p>
            <button onClick={onClose} className="text-[#1A5C38] font-semibold">Volver</button>
          </div>
        </div>
      </div>
    )
  }

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

  // Resolve neighborhood
  const addrText = property.fake_address || property.address || ''
  const sortedDivisions = [...(property.location?.divisions ?? [])].sort((a, b) => b.name.length - a.name.length)
  const neighborhood = sortedDivisions.find(d => {
    const escaped = d.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${escaped}\\b`, 'i').test(addrText)
  })?.name

  const whatsappMsg = encodeURIComponent(
    `Hola! Me interesa esta propiedad:\n\n*${property.publication_title || address}*\n📍 ${address}\n💰 ${price}\n\n🔗 https://siinmobiliaria.com/propiedades/${slug}`
  )
  const whatsappUrl = `https://wa.me/5493412101694?text=${whatsappMsg}`

  const specs: { icon: React.ReactNode; label: string; value: string | number }[] = []
  if (area != null && area > 0) specs.push({ icon: <Maximize className="w-5 h-5" />, label: 'Superficie', value: `${area} m²` })
  if (roofedArea != null && roofedArea > 0) specs.push({ icon: <Home className="w-5 h-5" />, label: 'Cubierta', value: `${roofedArea} m²` })
  if (property.suite_amount > 0) specs.push({ icon: <Bed className="w-5 h-5" />, label: 'Dormitorios', value: property.suite_amount })
  if (property.bathroom_amount > 0) specs.push({ icon: <Bath className="w-5 h-5" />, label: 'Baños', value: property.bathroom_amount })
  if (property.parking_lot_amount > 0) specs.push({ icon: <Car className="w-5 h-5" />, label: 'Cocheras', value: property.parking_lot_amount })
  if (lotSurface != null && lotSurface > 0 && lotSurface !== area) specs.push({ icon: <Maximize className="w-5 h-5" />, label: 'Lote', value: `${lotSurface} m²` })

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop — mapa visible detrás */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} style={{ animation: 'ppFadeIn 200ms ease-out' }} />

      {/* Panel deslizante desde la derecha */}
      <div
        className="absolute inset-y-0 right-0 w-full md:w-[55%] lg:w-[50%] xl:w-[45%] bg-[#fafafa] overflow-y-auto"
        style={{ animation: 'ppSlideIn 250ms ease-out' }}
      >
        {/* Header sticky */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6" style={{ height: 56 }}>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#1A5C38] transition-colors"
            style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la búsqueda
          </button>
          <Link
            href={`/propiedades/${slug}`}
            className="text-xs font-medium text-gray-400 hover:text-[#1A5C38] transition-colors"
          >
            Abrir página completa →
          </Link>
        </div>

        {/* Hero image */}
        {mainPhoto && (
          <div className="relative w-full aspect-[16/9]">
            <Image src={mainPhoto} alt={property.publication_title || address} fill className="object-cover" sizes="50vw" priority />
          </div>
        )}

        <div className="p-4 md:p-6 space-y-5">
          {/* Title + price */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex gap-2 mb-2">
              {operation && <span className="px-3 py-1 bg-[#1A5C38] text-white text-[11px] font-bold rounded-full uppercase">{operation}</span>}
              {propType && <span className="px-3 py-1 bg-[#e8f5ee] text-[#1A5C38] text-[11px] font-bold rounded-full uppercase">{propType}</span>}
            </div>
            <h2 className="text-xl font-black text-gray-900 leading-tight mb-2">
              {property.publication_title || address}
            </h2>
            <div className="flex items-center gap-1.5 mb-4">
              <MapPin className="w-4 h-4 text-[#1A5C38] flex-shrink-0" />
              <span className="text-[13px] text-gray-500">{property.real_address || address}{location ? `, ${location}` : ''}</span>
            </div>
            <span className="text-[28px] font-extrabold text-[#111] font-numeric leading-none">{price}</span>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1ea952] text-white rounded-xl font-bold text-sm transition-colors mb-2">
              <MessageCircle className="w-5 h-5" />Consultar por WhatsApp
            </a>
            <a href="tel:+5493412101694"
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors mb-3">
              <Phone className="w-5 h-5" />Llamar <span className="font-numeric">(341) 210-1694</span>
            </a>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1A5C38] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">DF</div>
              <div>
                <span className="text-sm font-bold text-gray-900 block">David Flores</span>
                <span className="text-xs text-gray-400">Mat. N° 0621</span>
              </div>
            </div>
          </div>

          {/* Specs */}
          {specs.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">Características</h3>
              <div className="grid grid-cols-3 gap-2">
                {specs.map((s, i) => <SpecCard key={i} icon={s.icon} label={s.label} value={s.value} />)}
              </div>
            </div>
          )}

          {/* Gallery */}
          {photos.length > 1 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">Galería <span className="text-gray-400 text-sm font-normal">{photos.length} fotos</span></h3>
              <PhotoGallery photos={photos} alt={property.publication_title || address} />
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">Descripción</h3>
              <PropertyDescription text={description} />
            </div>
          )}

          {/* Surfaces */}
          {(roofedArea || parseFloat(property.semiroofed_surface) > 0 || parseFloat(property.total_surface) > 0 || parseFloat(property.surface) > 0) && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">Superficies</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {parseFloat(property.surface) > 0 && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Terreno</span><span className="font-semibold font-numeric">{parseFloat(property.surface)} m²</span></div>}
                {roofedArea != null && roofedArea > 0 && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Cubierta</span><span className="font-semibold font-numeric">{roofedArea} m²</span></div>}
                {parseFloat(property.semiroofed_surface) > 0 && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Semicubierta</span><span className="font-semibold font-numeric">{parseFloat(property.semiroofed_surface)} m²</span></div>}
                {parseFloat(property.total_surface) > 0 && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Total</span><span className="font-semibold font-numeric">{parseFloat(property.total_surface)} m²</span></div>}
              </div>
            </div>
          )}

          {/* Details */}
          {(property.age != null || translateCondition(property.property_condition) || translateOrientation(property.orientation)) && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">Detalles</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {property.age != null && property.age >= 0 && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Antigüedad</span><span className="font-semibold">{property.age === 0 ? 'A estrenar' : `${property.age} años`}</span></div>}
                {translateCondition(property.property_condition) && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Estado</span><span className="font-semibold">{translateCondition(property.property_condition)}</span></div>}
                {translateOrientation(property.orientation) && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Orientación</span><span className="font-semibold">{translateOrientation(property.orientation)}</span></div>}
                {translateDisposition(property.disposition) && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Disposición</span><span className="font-semibold">{translateDisposition(property.disposition)}</span></div>}
              </div>
            </div>
          )}

          {/* Tags */}
          {property.tags && property.tags.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">Servicios y amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.tags.map(tag => <span key={tag.id} className="px-3 py-1.5 bg-[#f7f7f7] text-gray-600 rounded-full text-sm font-medium">{translateTag(tag.name)}</span>)}
              </div>
            </div>
          )}

          {/* Blueprints */}
          {blueprints.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">Planos</h3>
              <BlueprintGallery blueprints={blueprints} />
            </div>
          )}

          {/* Map */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-3">Ubicación</h3>
            <PropertyMap
              lat={property.geo_lat ? parseFloat(property.geo_lat) : null}
              lng={property.geo_long ? parseFloat(property.geo_long) : null}
              address={property.real_address || address}
            />
          </div>

          {/* Share */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <ShareButtons slug={slug} title={property.publication_title || address} price={price} photo={mainPhoto} operation={operation} propertyType={propType} area={area} rooms={property.suite_amount || property.room_amount || 0} bathrooms={property.bathroom_amount} lotSurface={lotSurface} parking={property.parking_lot_amount} city={property.location?.name} neighborhood={neighborhood} />
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
