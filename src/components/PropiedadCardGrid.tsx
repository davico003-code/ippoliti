'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PropertyShareButton from '@/components/PropertyShareButton'
import CardMediaButtons from '@/components/CardMediaButtons'
import {
  type TokkoProperty,
  getAllPhotos,
  getMainPhoto,
  formatPrice,
  getOperationType,
  operationBadgeColor,
  getRoofedArea,
  getLotSurface,
  isLand,
  isMonoambiente,
  propertyTypeLabelById,
  generatePropertySlug,
  esOportunidadConsultanos,
} from '@/lib/tokko'
import { formatDistanceAR } from '@/lib/geo'

const RALEWAY = "'Raleway', system-ui, sans-serif"
const POPPINS = "'Poppins', system-ui, sans-serif"

type NetworkInformationLite = {
  saveData?: boolean
  effectiveType?: string
}

type WindowWithIdle = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
  cancelIdleCallback?: (id: number) => void
}

export default function PropiedadCardGrid({ property, isSelected, onClick, variant = 'desktop', priority = false, distanceKm }: {
  property: TokkoProperty
  isSelected: boolean
  /** Si se pasa, se ejecuta antes de la navegación. Llamar e.preventDefault() para
   * evitar que el Link navegue (caso desktop = abrir panel modal en su lugar). */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  variant?: 'desktop' | 'mobile'
  priority?: boolean
  /** Distancia en km desde la ubicación del usuario (modo "buscar cerca").
   *  Null/undefined → no se muestra. */
  distanceKm?: number | null
}) {
  const router = useRouter()
  const cardRef = useRef<HTMLAnchorElement | null>(null)
  const isMobile = variant === 'mobile'
  const photos = getAllPhotos(property)
  const fallback = getMainPhoto(property)
  const images = photos.length > 0 ? photos : fallback ? [fallback] : []
  const [imgIdx, setImgIdx] = useState(0)
  // Corta el shimmer del blur-up cuando la primera foto pintó (evita decenas de
  // animaciones corriendo bajo imágenes ya cargadas en grillas grandes).
  const [imgLoaded, setImgLoaded] = useState(false)

  const operation = getOperationType(property)
  const price = formatPrice(property)
  const roofed = getRoofedArea(property)
  const lot = getLotSurface(property)
  const land = isLand(property)
  const mono = isMonoambiente(property)
  const typeName = propertyTypeLabelById(property.type?.id)
  const slug = generatePropertySlug(property)
  const beds = property.suite_amount || property.room_amount
  const baths = property.bathroom_amount
  const address = property.fake_address || property.address
  const location = property.location?.short_location || property.location?.name || ''
  const cardHref = `/propiedades/${slug}`

  // Build specs: "3 dorm · 2 baños · 190 m² · 1.691 m² lote"
  const specs: { num: string; label: string }[] = []
  if (!land && mono) specs.push({ num: '', label: 'Monoambiente' })
  else if (!land && beds > 0) specs.push({ num: String(beds), label: ' dorm' })
  if (!land && baths > 0) specs.push({ num: String(baths), label: ` baño${baths > 1 ? 's' : ''}` })
  if (roofed != null && roofed > 0) specs.push({ num: roofed.toLocaleString('es-AR'), label: ' m²' })
  if (lot != null && lot > 0 && lot !== roofed) specs.push({ num: lot.toLocaleString('es-AR'), label: ' m² lote' })
  if (land && lot != null && lot > 0 && specs.length === 0) specs.push({ num: lot.toLocaleString('es-AR'), label: ' m²' })

  const prev = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setImgIdx(i => (i - 1 + images.length) % images.length)
  }
  const next = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setImgIdx(i => (i + 1) % images.length)
  }
  const goTo = (e: React.MouseEvent, i: number) => {
    e.preventDefault(); e.stopPropagation()
    setImgIdx(i)
  }

  // Dots: máximo 5 y discretos. Si hay más de 5 fotos, los 5 dots actúan como
  // indicador de progreso — el dot activo se mapea proporcionalmente al índice
  // real, y al clickear un dot se salta a la foto representativa de ese tramo.
  const DOT_MAX = 5
  const dotCount = Math.min(images.length, DOT_MAX)
  const activeDot = images.length <= DOT_MAX
    ? imgIdx
    : Math.round((imgIdx / (images.length - 1)) * (dotCount - 1))
  const dotToIndex = (d: number) => images.length <= DOT_MAX
    ? d
    : Math.round((d / (dotCount - 1)) * (images.length - 1))

  // Swipe en mobile: en pantallas chicas no hay flechas, así que el gesto
  // horizontal es la forma de pasar fotos (navegación circular). Si el
  // desplazamiento supera el umbral lo tratamos como swipe y bloqueamos el
  // click sintético para que no abra la ficha.
  const touchStartX = useRef<number | null>(null)
  const swipedRef = useRef(false)
  const SWIPE_THRESHOLD = 40
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    swipedRef.current = false
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || images.length <= 1) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      swipedRef.current = true
      setImgIdx(i => dx < 0
        ? (i + 1) % images.length
        : (i - 1 + images.length) % images.length)
    }
    touchStartX.current = null
  }
  const onClickCapture = (e: React.MouseEvent) => {
    if (swipedRef.current) {
      e.preventDefault(); e.stopPropagation()
      swipedRef.current = false
    }
  }

  useEffect(() => {
    const el = cardRef.current
    if (!el || typeof window === 'undefined') return
    const connection = (navigator as Navigator & { connection?: NetworkInformationLite }).connection
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')) return

    let timeoutId: number | null = null
    let idleId: number | null = null
    let prefetched = false
    const prefetch = () => {
      if (prefetched) return
      prefetched = true
      const win = window as WindowWithIdle
      if (typeof win.requestIdleCallback === 'function') {
        idleId = win.requestIdleCallback(() => router.prefetch(cardHref), { timeout: 1200 })
        return
      }
      timeoutId = window.setTimeout(() => router.prefetch(cardHref), 220)
    }

    if (!('IntersectionObserver' in window)) {
      prefetch()
      return () => {
        if (timeoutId) window.clearTimeout(timeoutId)
        if (idleId != null) (window as WindowWithIdle).cancelIdleCallback?.(idleId)
      }
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        prefetch()
        observer.disconnect()
      }
    }, { rootMargin: '520px 0px', threshold: 0.01 })

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (timeoutId) window.clearTimeout(timeoutId)
      if (idleId != null) (window as WindowWithIdle).cancelIdleCallback?.(idleId)
    }
  }, [cardHref, router])

  // Render como <Link> para que Next prefetchee la ficha en hover (desktop)
  // y al entrar al viewport (mobile). El onClick del padre puede llamar
  // e.preventDefault() para evitar la navegación (caso desktop = abrir panel).
  return (
    <Link
      ref={cardRef}
      href={cardHref}
      prefetch={false}
      onClick={onClick}
      className="group si-press-lift cursor-pointer block"
      style={{
        borderRadius: 14,
        border: isSelected ? '1px solid #1A5C38' : '1px solid #e5e7eb',
        overflow: 'hidden',
        background: '#fff',
        textDecoration: 'none',
        color: 'inherit',
        boxShadow: isSelected
          ? '0 10px 25px rgba(0,0,0,0.1)'
          : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'box-shadow 250ms, border-color 250ms, transform 250ms cubic-bezier(0.22,1,0.36,1)',
      }}
      onMouseEnter={e => {
        router.prefetch(cardHref)
        if (!isSelected) {
          e.currentTarget.style.boxShadow = '0 14px 30px rgba(9,30,20,0.13)'
          e.currentTarget.style.borderColor = 'var(--mundial-accent)'
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
          e.currentTarget.style.borderColor = '#e5e7eb'
        }
      }}
    >
      {/* Image — `group/media` acota el hover a la imagen (no a toda la card),
          así flechas y dots aparecen solo al pasar el mouse sobre la foto.
          Los handlers touch dan swipe horizontal en mobile. */}
      <div
        className={`group/media relative w-full overflow-hidden aspect-[2/1] ${images.length === 0 ? 'bg-gray-100' : imgLoaded ? '' : 'si-img-shimmer'}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClickCapture={onClickCapture}
      >
        {images.length > 0 ? (
          <Image
            src={images[imgIdx]}
            alt={address}
            fill
            className="object-cover"
            sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1280px) 48vw, 25vw"
            priority={priority && imgIdx === 0}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            Sin foto
          </div>
        )}

        {/* Carrusel — patrón Vanzini: en desktop, flechas + dots aparecen solo
            en hover sobre la imagen (group/media). En mobile no hay flechas y
            los dots quedan siempre visibles pero discretos. */}
        {images.length > 1 && (
          <>
            {/* Flechas: solo desktop (hidden md:flex), visibles en hover o foco */}
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 shadow-sm items-center justify-center text-gray-700 hover:bg-white opacity-0 group-hover/media:opacity-100 focus-visible:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 transition-opacity duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Foto siguiente"
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 shadow-sm items-center justify-center text-gray-700 hover:bg-white opacity-0 group-hover/media:opacity-100 focus-visible:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 transition-opacity duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Dots: máx 5, discretos. Mobile siempre visibles (opacity-100),
                desktop solo en hover. Solo indican avance en la galería. */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-100 md:opacity-0 md:group-hover/media:opacity-100 transition-opacity duration-200">
              {Array.from({ length: dotCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => goTo(e, dotToIndex(i))}
                  aria-label={`Ir a foto ${dotToIndex(i) + 1}`}
                  className="w-1.5 h-1.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
                  style={{
                    background: i === activeDot ? 'white' : 'rgba(255,255,255,0.45)',
                    boxShadow: i === activeDot ? '0 0 2px rgba(0,0,0,0.4)' : 'none',
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Badge top-left — operation only (Destacada eliminado) */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {operation && (
            <span style={{
              background: operationBadgeColor(operation),
              color: '#fff',
              fontFamily: RALEWAY,
              fontWeight: 600,
              fontSize: 11,
              textTransform: 'uppercase',
              padding: '5px 14px',
              borderRadius: 9999,
            }}>
              {operation}
            </span>
          )}
        </div>

        {/* Play + like juntos, arriba-derecha. audioUrl ya viene enriquecido en
            el listado (string = hay audio, null = no hay). */}
        <CardMediaButtons
          propertyId={property.id}
          audioUrl={property.audioUrl ?? null}
          size={32}
          className="absolute top-2.5 right-2.5"
        />
      </div>

      {/* Body */}
      <div style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          {esOportunidadConsultanos(property.id) ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
              <span style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', background: '#fbce07', color: '#111', borderRadius: 6, padding: '3px 8px', whiteSpace: 'nowrap' }}>
                Oportunidad
              </span>
              <span style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: isMobile ? 13 : 14, background: '#1A5C38', color: '#fff', borderRadius: 999, padding: '5px 13px', whiteSpace: 'nowrap' }}>
                Consultanos →
              </span>
            </span>
          ) : (
          <p style={{
            fontFamily: POPPINS,
            fontWeight: 800,
            fontSize: isMobile ? 20 : 22,
            color: '#0a0a0a',
            margin: 0,
            lineHeight: 1.2,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {price}
          </p>
          )}
          <div onClick={e => e.stopPropagation()}>
            <PropertyShareButton
              propertyId={property.id}
              slug={slug}
              title={address || ''}
              priceLabel={price}
              inline
              size={36}
              popoverDirection="up"
              buttonVariant="card"
            />
          </div>
        </div>

        {specs.length > 0 && (
          <p style={{
            fontFamily: RALEWAY,
            fontSize: 13,
            color: '#4b5563',
            margin: '0 0 3px',
            lineHeight: 1.3,
            fontWeight: 400,
          }}>
            {specs.map((s, i) => (
              <span key={i}>
                <span style={{ fontFamily: POPPINS, fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#0a0a0a' }}>{s.num}</span>
                {s.label}
                {i < specs.length - 1 && <span style={{ margin: '0 6px', color: '#d1d5db' }}>&middot;</span>}
              </span>
            ))}
          </p>
        )}

        <p style={{
          fontFamily: RALEWAY,
          fontWeight: 500,
          fontSize: 13,
          color: '#0a0a0a',
          margin: '0 0 1px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {typeName}{typeName && address ? ' \u00B7 ' : ''}{address}
        </p>

        <p style={{
          fontFamily: RALEWAY,
          fontSize: 12,
          color: '#6b7280',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {location}
        </p>

        {distanceKm != null && Number.isFinite(distanceKm) && (
          <p style={{
            fontFamily: RALEWAY,
            fontSize: 12,
            fontWeight: 600,
            color: '#1A5C38',
            margin: '2px 0 0',
            fontVariantNumeric: 'tabular-nums',
          }}>
            a {formatDistanceAR(distanceKm)}
          </p>
        )}
      </div>

    </Link>
  )
}
