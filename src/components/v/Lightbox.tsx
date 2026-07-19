'use client'

// Modal fullscreen para planos de verficha. Sin libs externas.
// - Abre SIEMPRE ajustado a la pantalla (fit / contain). Antes abría a tamaño
//   natural (gigante) y quedabas trabado scrolleando por dentro.
// - Tap sobre el plano → toggle zoom (fit ↔ tamaño real, pan con scroll). Un tap
//   siempre revierte, nunca te deja atrapado en el zoom.
// - Cerrar: ✕ grande arriba, tocar el fondo negro, o Esc.
// - Swipe horizontal entre planos cuando no está en zoom.

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Props {
  images: string[]
  startIndex?: number
  zoomable?: boolean
  onClose: () => void
}

export default function Lightbox({ images, startIndex = 0, zoomable = false, onClose }: Props) {
  const [active, setActive] = useState(startIndex)
  const [zoomed, setZoomed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  // Mientras corre un scroll programático (flechas/teclado), ignoramos el
  // listener de scroll: si no, los índices intermedios re-disparan el scrollTo
  // y cortan la animación (navegación "trabada").
  const programmatic = useRef(false)
  const progTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Esc + flechas teclado. Esc: primero sale del zoom, después cierra.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (zoomed) setZoomed(false); else onClose() }
      if (e.key === 'ArrowRight') { setZoomed(false); setActive(i => Math.min(i + 1, images.length - 1)) }
      if (e.key === 'ArrowLeft') { setZoomed(false); setActive(i => Math.max(i - 1, 0)) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [images.length, onClose, zoomed])

  // Bloquear scroll del body mientras está abierto
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Sincronizar el scroll-snap con el active state (solo cuando no hay zoom)
  useEffect(() => {
    const el = containerRef.current
    if (!el || zoomed) return
    programmatic.current = true
    if (progTimer.current) clearTimeout(progTimer.current)
    el.scrollTo({ left: active * el.clientWidth, behavior: 'smooth' })
    progTimer.current = setTimeout(() => { programmatic.current = false }, 450)
    return () => { if (progTimer.current) clearTimeout(progTimer.current) }
  }, [active, zoomed])

  // Track scroll → active (ignora el scroll programático y el zoom)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      if (programmatic.current || zoomed) return
      const idx = Math.round(el.scrollLeft / el.clientWidth)
      setActive(Math.min(Math.max(idx, 0), images.length - 1))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [images.length, zoomed])

  const total = images.length
  const showArrows = total > 1 && !zoomed

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          color: '#fff',
          flexShrink: 0,
          zIndex: 2,
        }}
      >
        <span style={{ fontSize: 13, opacity: 0.7 }}>
          {total > 1 ? `${active + 1} / ${total}` : ''}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.16)',
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 999,
            height: 44,
            padding: '0 16px',
            cursor: 'pointer',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <X size={20} /> Cerrar
        </button>
      </div>

      {/* Slides */}
      <div
        ref={containerRef}
        className="lightbox-scroll"
        style={{
          flex: 1,
          display: 'flex',
          overflowX: zoomed ? 'hidden' : 'auto',
          overflowY: 'hidden',
          scrollSnapType: zoomed ? 'none' : 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          minHeight: 0,
        }}
      >
        {images.map((url, i) => {
          const isActive = i === active
          const zoomHere = zoomable && zoomed && isActive
          return (
            <div
              key={i}
              // Tocar el área alrededor del plano (fondo) cierra.
              onClick={e => { if (e.target === e.currentTarget) onClose() }}
              style={{
                flex: '0 0 100%',
                scrollSnapAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                boxSizing: 'border-box',
                overflow: zoomHere ? 'auto' : 'hidden',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Plano ${i + 1}`}
                draggable={false}
                onClick={() => { if (zoomable) setZoomed(z => !z) }}
                style={{
                  userSelect: 'none',
                  cursor: zoomable ? (zoomHere ? 'zoom-out' : 'zoom-in') : 'default',
                  ...(zoomHere
                    ? { maxWidth: 'none', maxHeight: 'none', width: 'auto', height: 'auto' }
                    : { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }),
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Hint */}
      {zoomable && (
        <div style={{ flexShrink: 0, textAlign: 'center', color: 'rgba(255,255,255,0.55)', fontSize: 12, padding: '10px 0 14px' }}>
          {zoomed ? 'Tocá el plano para achicar · ✕ para cerrar' : 'Tocá el plano para acercar · tocá afuera o ✕ para cerrar'}
        </div>
      )}

      {showArrows && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => setActive(i => Math.max(i - 1, 0))}
            disabled={active === 0}
            style={arrowBtn('left', active === 0)}
          >
            <ChevronLeft size={26} />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => setActive(i => Math.min(i + 1, total - 1))}
            disabled={active === total - 1}
            style={arrowBtn('right', active === total - 1)}
          >
            <ChevronRight size={26} />
          </button>
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .lightbox-scroll::-webkit-scrollbar { display: none; }
      ` }} />
    </div>
  )
}

function arrowBtn(side: 'left' | 'right', disabled: boolean): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 16,
    width: 44,
    height: 44,
    borderRadius: 999,
    background: 'rgba(255,255,255,0.12)',
    border: 'none',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.3 : 1,
    transition: 'opacity 150ms',
  } as React.CSSProperties
}
