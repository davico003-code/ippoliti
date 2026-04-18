'use client'

// Property detail modal/drawer used from the desktop property list.
// Mobile navigates to the full /propiedades/[slug] page instead, so this
// panel is effectively desktop-only — but we keep a mobile-friendly
// fallback layout just in case the modal is ever opened from mobile.
//
// Content (body, sidebar, gallery, sticky nav) is shared with the full
// page via src/components/property-detail/* to guarantee identical output.
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
  type TokkoProperty,
  formatPrice,
  generatePropertySlug,
} from '@/lib/tokko'
import PropertyGalleryHero from './property-detail/PropertyGalleryHero'
import PropertyStickyNav from './property-detail/PropertyStickyNav'
import PropertyDetailBody from './property-detail/PropertyDetailBody'
import PropertyDetailSidebar from './property-detail/PropertyDetailSidebar'

const R = "'Raleway', system-ui, sans-serif"

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'caracteristicas', label: 'Características' },
  { id: 'descripcion', label: 'Descripción' },
  { id: 'planos', label: 'Planos' },
  { id: 'ubicacion', label: 'Ubicación' },
  { id: 'similares', label: 'Similares' },
]

interface Props {
  propertyId: number
  onClose: () => void
  allProperties?: TokkoProperty[]
}

export default function PropertyPanel({ propertyId, onClose, allProperties = [] }: Props) {
  const [property, setProperty] = useState<TokkoProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch(`/api/propiedades/${propertyId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then((data: TokkoProperty) => { setProperty(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [propertyId])

  // Expose scroll container to the sticky nav once mounted
  useEffect(() => {
    if (scrollRef.current) setScrollRoot(scrollRef.current)
  }, [property])

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

  const slug = generatePropertySlug(property)
  const address = property.fake_address || property.address
  const price = formatPrice(property)
  const whatsappMsg = encodeURIComponent(
    `Hola! Me interesa esta propiedad:\n\n*${property.publication_title || address}*\n📍 ${address}\n💰 ${price}\n\n🔗 https://siinmobiliaria.com/propiedades/${slug}`
  )
  const whatsappUrl = `https://wa.me/5493412101694?text=${whatsappMsg}`

  return (
    <div className="fixed inset-0 z-[200]">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        style={{ animation: 'ppFadeIn 200ms ease-out' }}
      />

      <div
        ref={scrollRef}
        className="absolute inset-0 md:inset-y-4 md:left-1/2 md:-translate-x-1/2 w-full md:max-w-[1250px] md:rounded-2xl bg-[#fafafa] overflow-y-auto"
        style={{ animation: 'ppSlideIn 250ms ease-out' }}
      >
        {/* Header sticky */}
        <div
          className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-5"
          style={{ height: 56 }}
        >
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#1A5C38] transition-colors"
            style={{ fontFamily: R }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver a la búsqueda</span>
            <span className="sm:hidden">Volver</span>
          </button>
          <Link
            href={`/propiedades/${slug}`}
            className="text-xs font-medium text-gray-400 hover:text-[#1A5C38] transition-colors"
          >
            Abrir completa →
          </Link>
        </div>

        {/* Galería Zillow (desktop only) */}
        <PropertyGalleryHero property={property} />

        {/* Sticky nav (desktop only) — ancla al top del modal (56px header) */}
        <PropertyStickyNav sections={SECTIONS} scrollRoot={scrollRoot} stickyTop={56} />

        {/* Contenido */}
        <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6">
          <div className="flex-1 min-w-0">
            <PropertyDetailBody
              property={property}
              allProperties={allProperties}
              whatsappUrl={whatsappUrl}
              showMobileContact
            />
          </div>
          <PropertyDetailSidebar property={property} whatsappUrl={whatsappUrl} topOffset={120} />
        </div>
      </div>

      <style>{`
        @keyframes ppFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ppSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  )
}
