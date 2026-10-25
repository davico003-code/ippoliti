'use client'

// Botón "Compartir" de las tarjetas (listado, home) y del mapa de /propiedades:
//   - Popup desktop (PropiedadesMap.tsx) — Leaflet Popup
//   - Card mobile preview (PropiedadesView.tsx) — Bottom-sheet style
//   - Tarjetas de PropiedadCardGrid / PropertyGrid
//
// Política de compartir (25-oct-2026, igual en todo el sitio):
//   · Celu + visitante común: el toque abre la hoja nativa DIRECTO (WhatsApp,
//     Instagram, Mensajes, AirDrop…). Antes eran dos toques y un menú web.
//   · Celu + asesor: menú con "Compartir…" (hoja nativa) + WhatsApp + Copiar
//     + Crear placa + Link para colega.
//   · Compu: menú con WhatsApp, Copiar link y Link para colega.
// El menú es MenuCompartirPropiedad (el mismo del panel de la compu). El texto
// lleva título, precio y zona, y cada link sale con utm y queda medido.

import { useRef, useState } from 'react'
import { Share2 } from 'lucide-react'

import { compartirPropiedadNativo, type ContextoCompartir, type PropiedadCompartible } from '@/lib/compartir'
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
    if (open) {
      setOpen(false)
      return
    }
    // Celu con hoja nativa y visitante común: un toque, directo a la hoja
    // (sincrónico: navigator.share es lo primero que corre en el toque).
    if (!esAgente && compartirPropiedadNativo(propiedad, contexto)) return
    setOpen(true)
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
          placaHref={placaHref ?? `/propiedades/${slug}/placa`}
          onCerrar={cerrar}
        />
      )}
    </div>
  )
}
