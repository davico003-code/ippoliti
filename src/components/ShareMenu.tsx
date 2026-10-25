'use client'

// Botón "Compartir" de la ficha. Vive en el header del panel (variant="header",
// a la derecha del logo); variant="sidebar" es el bloque ancho con título.
//
// Política de compartir (25-oct-2026, igual en todo el sitio):
//   · Celu + visitante común: el toque abre la hoja nativa DIRECTO.
//   · Celu + asesor: menú con "Compartir…" (hoja nativa) primero.
//   · Compu: menú con Enviar por WhatsApp, Copiar link, Crear placa (solo
//     asesor) y, separado al final, Link para colega (para todos).
// El menú es MenuCompartirPropiedad (el mismo de tarjetas y mapa): va por
// portal a document.body (position:fixed) para no quedar cortado por el
// overflow del panel, con z-index por encima del PropertyPanel (z-[9995]).
// WhatsApp y Copiar mandan el link con utm (contexto "panel") y el texto con
// título, precio y zona.

import { useRef, useState } from 'react'
import { Share2 } from 'lucide-react'

import { compartirPropiedadNativo, type PropiedadCompartible } from '@/lib/compartir'
import { useEsAgente } from '@/lib/use-es-agente'
import MenuCompartirPropiedad from './MenuCompartirPropiedad'

interface Props {
  propertyId: number
  slug: string
  title: string
  placaHref?: string
  variant?: 'sidebar' | 'header'
  /** Como se muestra en la ficha ("USD 178.000"): va en el texto de WhatsApp. */
  precio?: string
  /** "Cotos de la Alameda, Roldán" (formatUbicacion). */
  ubicacion?: string
}

const R = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"
const MENU_W_HEADER = 260

export default function ShareMenu({ propertyId, slug, title, placaHref, variant = 'sidebar', precio, ubicacion }: Props) {
  const [open, setOpen] = useState(false)
  const esAgente = useEsAgente()
  const btnRef = useRef<HTMLButtonElement>(null)

  const propiedad: PropiedadCompartible = { id: propertyId, slug, titulo: title, precio, ubicacion }

  const abrir = () => {
    if (open) {
      setOpen(false)
      return
    }
    // Celu con hoja nativa y visitante común: un toque, directo a la hoja.
    if (!esAgente && compartirPropiedadNativo(propiedad, 'panel')) return
    setOpen(true)
  }

  const cerrar = (devolverFoco: boolean) => {
    setOpen(false)
    if (devolverFoco) btnRef.current?.focus({ preventScroll: true })
  }

  // Header: colores con los tokens del modo oscuro (el hover:bg-gray-200 de
  // antes no tenía equivalente oscuro y se prendía gris claro). El ::before
  // lleva el área de toque a 44 px sin agrandar el botón.
  const boton = variant === 'header' ? (
    <button
      ref={btnRef}
      type="button"
      onClick={abrir}
      aria-label="Compartir propiedad"
      aria-haspopup="menu"
      aria-expanded={open}
      className="relative inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold sm:px-4 bg-[var(--theme-surface-soft,#F3F4F6)] text-[color:var(--theme-ink,#1f2937)] hover:bg-[var(--theme-border,#E5E7EB)] transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 before:absolute before:-inset-1 before:content-['']"
      style={{ fontFamily: R }}
    >
      <Share2 size={16} aria-hidden />
      <span className="hidden sm:inline">Compartir</span>
    </button>
  ) : (
    <button
      ref={btnRef}
      type="button"
      onClick={abrir}
      aria-haspopup="menu"
      aria-expanded={open}
      className="si-tap"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 44,
        padding: '12px 18px',
        background: 'var(--theme-surface-soft, #F3F4F6)',
        color: 'var(--theme-ink, #1f2937)',
        border: 'none',
        borderRadius: 14,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: R,
        cursor: 'pointer',
      }}
    >
      <Share2 size={16} aria-hidden />
      Compartir
    </button>
  )

  return (
    <div className={variant === 'header' ? 'flex items-center' : 'mt-6 pt-6 border-t border-gray-100'}>
      {variant === 'sidebar' && (
        <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
          Compartir propiedad
        </p>
      )}

      {boton}

      {open && (
        <MenuCompartirPropiedad
          propiedad={propiedad}
          contexto="panel"
          anclaRef={btnRef}
          direccion="abajo"
          alineacion={variant === 'header' ? 'derecha' : 'ancho'}
          ancho={MENU_W_HEADER}
          esAgente={esAgente}
          placaHref={placaHref}
          onCerrar={cerrar}
        />
      )}
    </div>
  )
}
