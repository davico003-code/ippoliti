'use client'

// Menú de compartir de UNA propiedad (25-oct-2026).
//
// Había un menú distinto por lugar para la misma acción: el del header del
// panel de la compu (ShareMenu) y el de tarjetas y mapa (PropertyShareButton),
// cada uno con su ancho, sus textos ("Compartir por WhatsApp" / "Enviar por
// WhatsApp", "Copiado!" sin signo), su verde de WhatsApp (#22c55e suelto) y un
// borde claro fijo que en modo oscuro quedaba como un aro blanco. Este es el
// único; el botón que lo abre es de cada componente.
//
// Qué muestra (política de compartir del sitio):
//   · "Compartir…" (hoja nativa): solo asesor en el celu. El visitante común
//     del celu ni ve este menú: su toque va directo a la hoja nativa.
//   · Enviar por WhatsApp · Copiar link: para todos.
//   · Crear placa: solo asesor.
//   · Link para colega: para todos, separado al final (colegas de otras
//     inmobiliarias lo usan para pasarle la ficha neutra a su cliente).
//
// Teclado: el foco entra al primer ítem, flechas / Inicio / Fin se mueven,
// Escape y Tab cierran y devuelven el foco al botón. Entra con fade + escala
// corto (160 ms, ease-out) que se apaga con prefers-reduced-motion.

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject, type SyntheticEvent } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Check, Instagram, Link2, Loader2, MessageCircle, Share, Sparkles } from 'lucide-react'

import {
  compartirPropiedadNativo,
  copiarLinkPropiedad,
  linkPropiedad,
  puedeCompartirNativo,
  registrarCompartir,
  whatsappPropiedad,
  type ContextoCompartir,
  type PropiedadCompartible,
} from '@/lib/compartir'
import { haptico } from '@/lib/haptico'
import { generarYCopiarFichaLink } from '@/lib/share-ficha'
import { showToast } from './Toast'

/** El verde de WhatsApp de todo el sitio. */
export const WHATSAPP_VERDE = '#25D366'

const R = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"

export interface MenuCompartirPropiedadProps {
  propiedad: PropiedadCompartible
  /** Desde dónde se comparte (va a utm_campaign y al evento de GA4). */
  contexto: ContextoCompartir
  /** El botón que lo abrió: de ahí sale la posición y ahí vuelve el foco. */
  anclaRef: RefObject<HTMLElement>
  /** Hacia dónde abre. Si no entra de ese lado y del otro sí, se da vuelta. */
  direccion?: 'arriba' | 'abajo'
  /** 'derecha': borde derecho con el del botón. 'ancho': mismo ancho que el botón. */
  alineacion?: 'derecha' | 'ancho'
  ancho?: number
  esAgente: boolean
  /** Ruta de la placa de Instagram (solo la ve un asesor). */
  placaHref?: string
  /** Por encima del panel de la compu (9995), de la card del mapa (9998) y del sheet (10001). */
  zIndex?: number
  /** devolverFoco: true cuando cerró el teclado o terminó una acción. */
  onCerrar: (devolverFoco: boolean) => void
}

type Pos = { top?: number; bottom?: number; left: number; width: number; origen: string }

function itemsDe(menu: HTMLElement | null): HTMLElement[] {
  return Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
}

export default function MenuCompartirPropiedad({
  propiedad,
  contexto,
  anclaRef,
  direccion = 'abajo',
  alineacion = 'derecha',
  ancho = 240,
  esAgente,
  placaHref,
  zIndex = 10050,
  onCerrar,
}: MenuCompartirPropiedadProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<Pos | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [generando, setGenerando] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const enfocado = useRef(false)
  // El cierre se guarda en un ref: los listeners del documento se suscriben
  // una sola vez aunque el padre pase una función nueva en cada render.
  const cerrarRef = useRef(onCerrar)
  useEffect(() => {
    cerrarRef.current = onCerrar
  })

  // El menú solo se monta en el cliente (después de un toque), así que leer
  // window acá no rompe el render del servidor.
  const conHoja = esAgente && puedeCompartirNativo()

  // Posición: se mide el menú ya dibujado (invisible) antes de pintarlo, para
  // poder darlo vuelta si no entra (tarjetas al pie de la pantalla).
  useLayoutEffect(() => {
    const a = anclaRef.current
    const m = menuRef.current
    if (!a || !m) return
    const r = a.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const width = alineacion === 'ancho' ? r.width : Math.min(ancho, vw - 16)
    const left = alineacion === 'ancho' ? r.left : Math.min(Math.max(8, r.right - width), vw - width - 8)
    const alto = m.offsetHeight
    let arriba = direccion === 'arriba'
    if (arriba && r.top - alto - 16 < 0 && r.bottom + alto + 16 <= vh) arriba = false
    else if (!arriba && r.bottom + alto + 16 > vh && r.top - alto - 16 >= 0) arriba = true
    const lado = alineacion === 'ancho' ? 'left' : 'right'
    setPos(
      arriba
        ? { bottom: vh - r.top + 8, left, width, origen: `bottom ${lado}` }
        : { top: r.bottom + 8, left, width, origen: `top ${lado}` },
    )
  }, [anclaRef, alineacion, ancho, direccion])

  // Foco al primer ítem apenas se ubica (con teclado se puede seguir de ahí).
  // preventScroll: en el celu un scroll cerraría el menú.
  useEffect(() => {
    if (!pos || enfocado.current) return
    enfocado.current = true
    itemsDe(menuRef.current)[0]?.focus({ preventScroll: true })
  }, [pos])

  // Cierre: toque afuera, Escape, scroll o resize (el menú es position:fixed
  // y quedaría desalineado del botón).
  useEffect(() => {
    const fuera = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (menuRef.current?.contains(t) || anclaRef.current?.contains(t)) return
      cerrarRef.current(false)
    }
    const tecla = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      cerrarRef.current(true)
    }
    const mover = () => cerrarRef.current(false)
    document.addEventListener('mousedown', fuera)
    document.addEventListener('touchstart', fuera, { passive: true })
    document.addEventListener('keydown', tecla)
    window.addEventListener('scroll', mover, true)
    window.addEventListener('resize', mover)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('touchstart', fuera)
      document.removeEventListener('keydown', tecla)
      window.removeEventListener('scroll', mover, true)
      window.removeEventListener('resize', mover)
      window.clearTimeout(timer.current)
    }
  }, [anclaRef])

  const onTeclaMenu = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      // El menú vive al final del <body>: con Tab el foco se iría lejos del botón.
      e.preventDefault()
      onCerrar(true)
      return
    }
    const lista = itemsDe(menuRef.current)
    if (!lista.length) return
    const i = lista.indexOf(document.activeElement as HTMLElement)
    let j = -1
    if (e.key === 'ArrowDown') j = (i + 1) % lista.length
    else if (e.key === 'ArrowUp') j = (i - 1 + lista.length) % lista.length
    else if (e.key === 'Home') j = 0
    else if (e.key === 'End') j = lista.length - 1
    if (j < 0) return
    e.preventDefault()
    lista[j].focus()
  }

  // El menú va por portal, pero los eventos de React igual suben por el árbol:
  // sin esto, un toque adentro llegaba al <Link> de la tarjeta y abría la ficha.
  const cortar = (e: SyntheticEvent) => e.stopPropagation()

  // ── Acciones. Cada una llama a la hoja nativa / WhatsApp / portapapeles como
  // PRIMERA instrucción del toque (regla iOS: nada de await antes). ──────────

  const onNativo = () => {
    compartirPropiedadNativo(propiedad, contexto)
    onCerrar(false)
  }

  const onWhatsApp = () => {
    whatsappPropiedad(propiedad, contexto)
    haptico()
    onCerrar(true)
  }

  const onCopiar = () => {
    void copiarLinkPropiedad(propiedad, contexto).then(ok => {
      if (ok) {
        setCopiado(true)
        showToast('Link copiado')
        timer.current = window.setTimeout(() => cerrarRef.current(true), 900)
      } else {
        // Navegadores de Instagram/Facebook: el portapapeles se niega. Que el
        // link quede a la vista para copiarlo a mano.
        showToast(`No se pudo copiar. Copialo a mano: ${linkPropiedad(propiedad, 'copiar', contexto)}`, {
          variant: 'error',
          duration: 8000,
        })
        cerrarRef.current(true)
      }
    })
  }

  const onPlaca = () => {
    registrarCompartir('placa', contexto, propiedad.id)
    onCerrar(false)
  }

  const onColega = () => {
    if (generando) return
    // Primero la llamada (reserva el portapapeles dentro del toque), después el
    // estado. El menú queda abierto con "Generando link…" hasta que el link
    // está copiado: antes se cerraba antes del POST y durante esos segundos no
    // se veía nada, y el asesor volvía a tocar.
    const tarea = generarYCopiarFichaLink(propiedad.id, contexto)
    setGenerando(true)
    void tarea.then(ok => {
      if (ok) haptico()
      setGenerando(false)
      cerrarRef.current(true)
    })
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Compartir propiedad"
      className="si-menu-cmp"
      data-listo={pos ? '' : undefined}
      onKeyDown={onTeclaMenu}
      onClick={cortar}
      onMouseDown={cortar}
      onTouchStart={cortar}
      onPointerDown={cortar}
      style={{
        top: pos ? pos.top : 0,
        bottom: pos?.bottom,
        left: pos ? pos.left : 0,
        width: pos ? pos.width : Math.min(ancho, typeof window !== 'undefined' ? window.innerWidth - 16 : ancho),
        transformOrigin: pos?.origen,
        visibility: pos ? 'visible' : 'hidden',
        zIndex,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {conHoja && (
        <button type="button" role="menuitem" className="si-menu-cmp__item" onClick={onNativo}>
          <span className="si-menu-cmp__ico" style={{ background: 'var(--theme-surface-soft, #F1F3F4)' }}>
            <Share size={15} style={{ color: 'var(--theme-ink, #1a1a1a)' }} aria-hidden />
          </span>
          Compartir…
        </button>
      )}

      <button type="button" role="menuitem" className="si-menu-cmp__item" onClick={onWhatsApp}>
        <span className="si-menu-cmp__ico" style={{ background: WHATSAPP_VERDE }}>
          <MessageCircle size={15} color="#fff" aria-hidden />
        </span>
        Enviar por WhatsApp
      </button>

      <button type="button" role="menuitem" className="si-menu-cmp__item" onClick={onCopiar}>
        <span className="si-menu-cmp__ico" style={{ background: 'var(--theme-surface-soft, #F1F3F4)' }}>
          {copiado ? (
            <Check size={15} style={{ color: 'var(--theme-accent, #1A5C38)' }} aria-hidden />
          ) : (
            <Link2 size={15} style={{ color: 'var(--theme-muted, #4B5563)' }} aria-hidden />
          )}
        </span>
        <span aria-live="polite">{copiado ? '¡Copiado!' : 'Copiar link'}</span>
      </button>

      {esAgente && placaHref && (
        <Link href={placaHref} role="menuitem" className="si-menu-cmp__item" onClick={onPlaca}>
          <span className="si-menu-cmp__ico" style={{ background: 'var(--theme-surface-soft, #F1F3F4)' }}>
            <Instagram size={15} style={{ color: 'var(--theme-muted, #4B5563)' }} aria-hidden />
          </span>
          Crear placa
        </Link>
      )}

      <div className="si-menu-cmp__sep" role="separator" />

      <button
        type="button"
        role="menuitem"
        className="si-menu-cmp__item si-menu-cmp__colega"
        onClick={onColega}
        aria-disabled={generando || undefined}
        aria-busy={generando || undefined}
      >
        <span className="si-menu-cmp__ico" style={{ background: 'var(--theme-tint, #E7F2EB)' }}>
          {generando ? (
            <Loader2 size={15} className="si-menu-cmp__gira" style={{ color: 'var(--theme-accent, #1A5C38)' }} aria-hidden />
          ) : (
            <Sparkles size={15} style={{ color: 'var(--theme-accent, #1A5C38)' }} aria-hidden />
          )}
        </span>
        <span aria-live="polite">{generando ? 'Generando link…' : 'Link para colega'}</span>
      </button>
    </div>,
    document.body,
  )
}

// Estilos en un solo bloque: los :hover / :active no se pueden poner inline
// (y un background inline pisaba el hover de Tailwind: nunca se veía). Colores
// con los tokens del modo oscuro; en claro valen los de respaldo.
const CSS = `
.si-menu-cmp{position:fixed;padding:6px;background:var(--theme-surface,#fff);border:1px solid var(--theme-border,#ECECEE);border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.14);font-family:${R}}
.si-menu-cmp[data-listo]{animation:si-menu-cmp-in 160ms cubic-bezier(.22,1,.36,1)}
@keyframes si-menu-cmp-in{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
.si-menu-cmp__item{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:8px 10px;border:0;border-radius:10px;background:transparent;color:var(--theme-ink,#1a1a1a);font-family:${R};font-size:14px;font-weight:500;line-height:1.25;text-align:left;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background-color 150ms ease-out,transform 150ms ease-out}
@media (hover:hover){.si-menu-cmp__item:hover{background:var(--theme-surface-soft,#F4F5F6)}}
.si-menu-cmp__item:active{background:var(--theme-border,#E9EBED);transform:scale(.98)}
.si-menu-cmp__item:focus{outline:none}
.si-menu-cmp__item:focus-visible{outline:2px solid var(--theme-accent,#1A5C38);outline-offset:-2px}
.si-menu-cmp__item[aria-disabled]{cursor:wait}
.si-menu-cmp__colega{color:var(--theme-accent,#1A5C38);font-weight:600}
.si-menu-cmp__ico{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:28px;height:28px;border-radius:50%}
.si-menu-cmp__sep{height:1px;margin:4px 8px;background:var(--theme-border,#EEF0F1)}
.si-menu-cmp__gira{animation:si-menu-cmp-gira .8s linear infinite}
@keyframes si-menu-cmp-gira{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.si-menu-cmp[data-listo]{animation:none}.si-menu-cmp__item{transition:none}.si-menu-cmp__item:active{transform:none}.si-menu-cmp__gira{animation-duration:2.4s}}
`
