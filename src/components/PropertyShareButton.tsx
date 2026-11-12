'use client'

// Botón "Compartir" de las tarjetas (listado, home) y del mapa de /propiedades:
//   - Popup desktop (PropiedadesMap.tsx) — Leaflet Popup
//   - Card mobile preview (PropiedadesView.tsx) — Bottom-sheet style
//   - Tarjetas de PropiedadCardGrid / PropertyGrid
//
// El toque abre SIEMPRE el menú (celu y compu), para elegir qué se manda:
// Enviar por WhatsApp y Copiar link (el link nuestro) o Link para colega (la
// ficha sin marca). Del 7 al 10-nov-2026 el celu iba directo a la hoja nativa
// y no dejaba elegir (David, 10-nov: "que vuelva a estar como antes").
// El asesor con sesión suma "Compartir…" (hoja nativa, en el celu) y "Crear
// placa". El menú es MenuCompartirPropiedad (el mismo del panel de la compu).
// El texto lleva título, precio y zona, y cada link sale con utm y queda medido.

import { useRef, useState } from 'react'
import { Share2 } from 'lucide-react'

import type { ContextoCompartir, PropiedadCompartible } from '@/lib/compartir'
import { useEsAgente } from '@/lib/use-es-agente'
import MenuCompartirPropiedad from './MenuCompartirPropiedad'

interface Props {
  propertyId: number
  slug: string
  title: string
  priceLabel?: string
  /** "Cotos de la Alameda, Roldán" (formatUbicacion): va en el texto que se comparte. */
  ubicacion?: string
  /** Desde dónde se comparte (utm_campaign + GA4). Default 'tarjeta'; el mapa pasa 'mapa'. */
  contexto?: ContextoCompartir
  /** Placa de Instagram (solo asesor). Default: /propiedades/<slug>/placa. */
  placaHref?: string
  // Modo flotante: posiciona el wrapper en absolute con top/right.
  // Modo inline (default): el wrapper queda en el flujo normal del padre.
  inline?: boolean
  top?: number | string
  right?: number | string
  size?: number
  // Dirección del popover relativa al botón.
  popoverDirection?: 'up' | 'down'
  // Variante visual del botón (icono+container).
  buttonVariant?: 'overlay' | 'card'
}

export default function PropertyShareButton({
  propertyId,
  slug,
  title,
  priceLabel,
  ubicacion,
  contexto = 'tarjeta',
  placaHref,
  inline = false,
  top = 8,
  right = 8,
  size = 32,
  popoverDirection = 'down',
  buttonVariant = 'overlay',
}: Props) {
  const [open, setOpen] = useState(false)
  const esAgente = useEsAgente()
  const btnRef = useRef<HTMLButtonElement>(null)

  const propiedad: PropiedadCompartible = { id: propertyId, slug, titulo: title, precio: priceLabel, ubicacion }

  const stopAll = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onToggle = (e: React.MouseEvent) => {
    stopAll(e)
    setOpen(o => !o)
  }

  const cerrar = (devolverFoco: boolean) => {
    setOpen(false)
    if (devolverFoco) btnRef.current?.focus({ preventScroll: true })
  }

  const wrapperStyle: React.CSSProperties = inline
    ? { position: 'relative', display: 'inline-block' }
    : { position: 'absolute', top, right, zIndex: 20 }

  const buttonStyle: React.CSSProperties = buttonVariant === 'card'
    ? {
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--theme-overlay, rgba(255,255,255,0.9))',
        border: '1px solid var(--theme-border, #f3f4f6)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }
    : {
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--theme-overlay, rgba(255,255,255,0.95))',
        border: 'none',
        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }

  return (
    <div
      style={wrapperStyle}
      onClick={stopAll}
    >
      {/* El área de toque crece a 44 px con el ::before (el círculo se ve de
          32-36 px); si-tap da el "hundido" al presionar. */}
      <button
        ref={btnRef}
        type="button"
        onClick={onToggle}
        aria-label="Compartir propiedad"
        aria-haspopup="menu"
        aria-expanded={open}
        className="si-tap relative before:absolute before:-inset-1.5 before:content-['']"
        style={buttonStyle}
      >
        <Share2 size={Math.round(size * 0.5)} style={{ color: buttonVariant === 'card' ? 'var(--theme-muted, #6b7280)' : 'var(--theme-ink, #1f2937)' }} aria-hidden />
      </button>

      {open && (
        <MenuCompartirPropiedad
          propiedad={propiedad}
          contexto={contexto}
          anclaRef={btnRef}
          direccion={popoverDirection === 'up' ? 'arriba' : 'abajo'}
          alineacion="derecha"
          esAgente={esAgente}
          // En tarjetas y mapa la placa es solo del asesor (acá nunca fue de todos).
          placaHref={esAgente ? (placaHref ?? `/propiedades/${slug}/placa`) : undefined}
          onCerrar={cerrar}
        />
      )}
    </div>
  )
}
