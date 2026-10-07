'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PropertyShareButton from '@/components/PropertyShareButton'
import CardMediaButtons from '@/components/CardMediaButtons'
import FotosDeslizables from '@/components/FotosDeslizables'
import PastillaAgenteCard from '@/components/home/PastillaAgenteCard'
import { useAgentePropiedad } from '@/components/AgentesPropiedadContext'
import { useFotosExtra } from '@/components/FotosExtraCards'
import {
  type TokkoProperty,
  getAllPhotos,
  getMainPhoto,
  formatPrice,
  getOperationType,
  operationBadgeColor,
  preciosPorOperacion,
  getRoofedArea,
  getLotSurface,
  isLand,
  isMonoambiente,
  propertyTypeLabelById,
  generatePropertySlug,
  esOportunidadConsultanos,
} from '@/lib/tokko'
import { formatDistanceAR } from '@/lib/geo'
import { formatDireccionCompleta } from '@/lib/ubicacion'

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
  // El listado de HILO ya trae el agente; si no (undefined), lo pide el provider.
  const agenteFeed = property.agente
  const agentePedido = useAgentePropiedad(property.id)
  const agente = agenteFeed === undefined ? agentePedido : agenteFeed ?? undefined
  const photos = getAllPhotos(property)
  const fallback = getMainPhoto(property)
  const base = photos.length > 0 ? photos : fallback ? [fallback] : []
  // En /propiedades la card llega con la portada sola y las fotos 2-5 las suma
  // FotosExtraProvider cuando la página terminó de cargar.
  const extra = useFotosExtra(property.id)
  const images = extra && base.length === 1 ? [base[0], ...extra.filter(u => u !== base[0])] : base

  const operation = getOperationType(property)
  const price = formatPrice(property)
  // Venta Y alquiler a la vez: el segundo valor va en una línea chica bajo el
  // precio, y la foto lleva un cartel por operación.
  const precios = preciosPorOperacion(property)
  const otrosPrecios = precios.slice(1)
  const operaciones = precios.length > 1 ? precios.map(p => p.operacion) : operation ? [operation] : []
  const roofed = getRoofedArea(property)
  const lot = getLotSurface(property)
  const land = isLand(property)
  const mono = isMonoambiente(property)
  const typeName = propertyTypeLabelById(property.type?.id)
  const slug = generatePropertySlug(property)
  const beds = property.suite_amount || property.room_amount
  const baths = property.bathroom_amount
  const address = property.fake_address || property.address
  const direccion = formatDireccionCompleta(property, address, ' | ')
  // Mixta (venta + alquiler) listada como alquiler: el foco viaja en el link
  // para que la ficha mobile muestre los costos de ingreso y la planilla. Igual
  // con el filtro Temporario: si no, la ficha abría con la venta adelante.
  const focoOp = precios.length > 1
    ? precios[0].operacion === 'Alquiler' ? 'alquiler'
      : precios[0].operacion === 'Alquiler temporario' ? 'temporario'
      : null
    : null
  const cardHref = `/propiedades/${slug}${focoOp ? `?operacion=${focoOp}` : ''}`

  // Build specs: "3 dorm · 2 baños · 190 m² · 1.691 m² lote"
  const specs: { num: string; label: string }[] = []
  if (!land && mono) specs.push({ num: '', label: 'Monoambiente' })
  else if (!land && beds > 0) specs.push({ num: String(beds), label: ' dorm' })
  if (!land && baths > 0) specs.push({ num: String(baths), label: ` baño${baths > 1 ? 's' : ''}` })
  if (roofed != null && roofed > 0) specs.push({ num: roofed.toLocaleString('es-AR'), label: ' m²' })
  if (lot != null && lot > 0 && lot !== roofed) specs.push({ num: lot.toLocaleString('es-AR'), label: ' m² lote' })
  if (land && lot != null && lot > 0 && specs.length === 0) specs.push({ num: lot.toLocaleString('es-AR'), label: ' m²' })


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
      className="group cursor-pointer block"
      style={{
        background: '#fff',
        textDecoration: 'none',
        color: 'inherit',
      }}
      onMouseEnter={() => router.prefetch(cardHref)}
    >
      {/* Fotos deslizables (flechas en hover en la compu, swipe en el celu). */}
      <FotosDeslizables
        images={images}
        alt={address}
        sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1280px) 48vw, 25vw"
        priority={priority}
        puntos={agente ? 'derecha' : 'centro'}
        className="aspect-[16/9]"
        style={isSelected ? { boxShadow: '0 0 0 2px #1A5C38' } : undefined}
      >
        {/* Badges top-left — operación (color) + tipo de inmueble (blanco).
            z-10 + capa propia: la tira de fotos se mueve con transform y en
            iOS Safari tapaba/despintaba los badges al pasar de foto. */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5" style={{ right: 48, transform: 'translateZ(0)' }}>
          {operaciones.map(operation => (
            <span key={operation} style={{
              background: operationBadgeColor(operation),
              color: '#fff',
              fontFamily: RALEWAY,
              fontWeight: 600,
              fontSize: 12,
              lineHeight: 1,
              padding: '8px 14px',
              borderRadius: 9999,
            }}>
              {operation}
            </span>
          ))}
          {typeName && (
            <span style={{
              background: 'rgba(255,255,255,0.94)',
              color: '#0a0a0a',
              fontFamily: RALEWAY,
              fontWeight: 600,
              fontSize: 12,
              lineHeight: 1,
              padding: '8px 14px',
              borderRadius: 9999,
            }}>
              {typeName}
            </span>
          )}
        </div>

        {/* Agente que atiende la propiedad (pastilla de vidrio, como en la
            home). Con agente, los puntitos de las fotos se corren a la derecha. */}
        <PastillaAgenteCard agente={agente} size={isMobile ? 32 : 34} />

        {/* Play arriba-derecha (solo si hay audio). audioUrl ya viene enriquecido
            en el listado (string = hay audio, null = no hay). */}
        <CardMediaButtons
          propertyId={property.id}
          audioUrl={property.audioUrl ?? null}
          size={32}
          className="absolute top-2.5 right-2.5 z-10"
        />
      </FotosDeslizables>

      {/* Body */}
      <div style={{ padding: '8px 2px' }}>
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

        {!esOportunidadConsultanos(property.id) && otrosPrecios.map(({ operacion, precio }) => (
          <p key={operacion} style={{
            fontFamily: RALEWAY,
            fontSize: 13,
            color: '#4b5563',
            margin: '0 0 3px',
            lineHeight: 1.3,
          }}>
            {operacion}{' '}
            <span style={{ fontFamily: POPPINS, fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#0a0a0a' }}>{precio}</span>
          </p>
        ))}

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
          fontSize: 12,
          color: '#6b7280',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {direccion || typeName}
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
