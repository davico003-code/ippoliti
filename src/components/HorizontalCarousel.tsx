'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Carrusel horizontal con botones de navegación tipo Zillow.
 *
 * - Children se renderizan dentro de un div con overflow-x-auto + snap-x
 * - Botones < > aparecen solo en desktop (md+)
 * - Botones ocultos en los extremos (primera/última posición)
 * - Scroll suave de ~1 tarjeta por click (usa width del primer hijo)
 * - `arrancarEn`: abre ya corrido hasta ese hijo, alineado donde iría el
 *   primero, así el anterior asoma a la izquierda y la fila llena el ancho.
 * - `arrastrable`: en la compu se arrastra con el mouse como con el dedo (click
 *   sostenido y deslizar); al soltar sigue con la inercia y se acomoda en la
 *   tarjeta más cercana. Si hubo arrastre, el click no abre la tarjeta.
 */

// Arrastre: a partir de cuántos px deja de ser un click, y cuántos ms de la
// última velocidad se proyectan al soltar (la inercia).
const UMBRAL_ARRASTRE = 6
const INERCIA_MS = 220

// Dónde queda el scroll con el hijo `i` alineado donde arranca el primero (la
// misma cuenta que `arrancar`, para todos los hijos).
function posicionesDeHijos(el: HTMLElement): number[] {
  const p = el.children[0]
  if (!p) return [0]
  const base = p.getBoundingClientRect().left
  const max = el.scrollWidth - el.clientWidth
  return Array.from(el.children, c => Math.min(max, Math.max(0, c.getBoundingClientRect().left - base)))
}

// Corre el carrusel hasta el hijo `n` (lo deja donde está el primero). La misma
// cuenta va como texto en el <script> que corre al leer el HTML, antes de la
// primera pintada: con un efecto de React se vería el salto hasta que carga el JS.
function arrancar(el: HTMLElement, n: number) {
  const c = el.children[n], p = el.children[0]
  if (c && p) el.scrollLeft = c.getBoundingClientRect().left - p.getBoundingClientRect().left
}
const ARRANCAR = 'function(el,n){var c=el.children[n],p=el.children[0];if(c&&p)el.scrollLeft=c.getBoundingClientRect().left-p.getBoundingClientRect().left}'

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
export default function HorizontalCarousel({
  children,
  className,
  style,
  arrancarEn,
  arrastrable = false,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  arrancarEn?: number
  arrastrable?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)
  const [arrastrando, setArrastrando] = useState(false)
  const arrastre = useRef<{ id: number; x0: number; scroll0: number; x: number; t: number; v: number; activo: boolean } | null>(null)
  const recienArrastro = useRef(false)
  const reponerSnap = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const updateState = () => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanLeft(scrollLeft > 8)
    setCanRight(scrollLeft + clientWidth < scrollWidth - 8)
  }

  // Al llegar navegando dentro del sitio el <script> no corre (React no
  // ejecuta los que inserta): lo mismo antes de pintar.
  useIsoLayoutEffect(() => {
    const el = scrollRef.current
    if (el && arrancarEn && el.scrollLeft === 0) arrancar(el, arrancarEn)
  }, [arrancarEn])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateState()
    el.addEventListener('scroll', updateState, { passive: true })
    window.addEventListener('resize', updateState)
    return () => {
      el.removeEventListener('scroll', updateState)
      window.removeEventListener('resize', updateState)
    }
  }, [])

  // Solo mouse: el dedo ya desliza nativo. Mientras se arrastra el snap queda
  // apagado (si no, el navegador lo tironea a cada movimiento) y vuelve cuando
  // el carrusel terminó de acomodarse.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!arrastrable || !el || e.pointerType !== 'mouse' || e.button !== 0) return
    clearTimeout(reponerSnap.current)
    arrastre.current = { id: e.pointerId, x0: e.clientX, scroll0: el.scrollLeft, x: e.clientX, t: e.timeStamp, v: 0, activo: false }
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = arrastre.current
    const el = scrollRef.current
    if (!a || !el || e.pointerId !== a.id) return
    // Soltó afuera antes del umbral (sin captura no llegó el pointerup): no es arrastre.
    if (!a.activo && e.buttons === 0) { arrastre.current = null; return }
    const dx = e.clientX - a.x0
    if (!a.activo) {
      if (Math.abs(dx) < UMBRAL_ARRASTRE) return
      a.activo = true
      // Con el puntero capturado el click del final cae en el carrusel, no en la tarjeta.
      el.setPointerCapture(e.pointerId)
      el.style.scrollSnapType = 'none'
      window.getSelection()?.removeAllRanges()
      setArrastrando(true)
    }
    if (e.timeStamp > a.t) a.v = (e.clientX - a.x) / (e.timeStamp - a.t)
    a.x = e.clientX
    a.t = e.timeStamp
    el.scrollLeft = a.scroll0 - dx
  }
  const soltar = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = arrastre.current
    const el = scrollRef.current
    if (!a || e.pointerId !== a.id) return
    arrastre.current = null
    if (!el || !a.activo) return
    setArrastrando(false)
    recienArrastro.current = true
    setTimeout(() => { recienArrastro.current = false }, 0)
    // Quieto hace rato antes de soltar = sin inercia.
    const v = e.timeStamp - a.t > 80 ? 0 : a.v
    const proyectado = el.scrollLeft - v * INERCIA_MS
    const destino = posicionesDeHijos(el).reduce((m, x) => Math.abs(x - proyectado) < Math.abs(m - proyectado) ? x : m)
    el.scrollTo({ left: destino, behavior: 'smooth' })
    // El snap vuelve cuando el scroll se quedó quieto 150 ms (no todos los Safari tienen `scrollend`).
    const alParar = () => {
      clearTimeout(reponerSnap.current)
      reponerSnap.current = setTimeout(() => {
        el.removeEventListener('scroll', alParar)
        el.style.scrollSnapType = ''
      }, 150)
    }
    el.addEventListener('scroll', alParar, { passive: true })
    alParar()
  }
  const onClickCapture = (e: React.MouseEvent) => {
    if (recienArrastro.current) { e.preventDefault(); e.stopPropagation() }
  }

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    // Ancho de la primera card hija como referencia (+ gap aproximado)
    const firstChild = el.firstElementChild as HTMLElement | null
    const step = firstChild ? firstChild.getBoundingClientRect().width + 12 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={`${className ?? 'flex gap-3 overflow-x-auto snap-x snap-mandatory px-1 py-2 pb-3 scrollbar-none'}${arrastrable ? ' select-none' : ''}${arrastrando ? ' cursor-grabbing [&_*]:!cursor-grabbing' : ''}`}
        style={{ overflowY: 'visible', ...style }}
        {...(arrastrable ? {
          onPointerDown,
          onPointerMove,
          onPointerUp: soltar,
          onPointerCancel: soltar,
          onClickCapture,
          // Sin esto el navegador arrastra la foto o el link (y corta el arrastre).
          onDragStart: (e: React.DragEvent) => e.preventDefault(),
        } : {})}
      >
        {children}
      </div>
      {arrancarEn ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=document.currentScript,el=s&&s.previousElementSibling;if(el)(${ARRANCAR})(el,${arrancarEn})})()`,
          }}
        />
      ) : null}

      {/* Botones solo desktop (md+) */}
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scrollByCard(-1)}
        className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-2 z-10 transition-opacity"
        style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#fff', border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          cursor: canLeft ? 'pointer' : 'default',
          opacity: canLeft ? 1 : 0,
          pointerEvents: canLeft ? 'auto' : 'none',
        }}
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => scrollByCard(1)}
        className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-2 z-10 transition-opacity"
        style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#fff', border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          cursor: canRight ? 'pointer' : 'default',
          opacity: canRight ? 1 : 0,
          pointerEvents: canRight ? 'auto' : 'none',
        }}
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  )
}
