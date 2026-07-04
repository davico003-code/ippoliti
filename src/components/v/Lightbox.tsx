'use client'

// Modal fullscreen para fotos y planos. Sin libs externas.
// - Swipe horizontal en mobile (scroll-snap).
// - Botón ✕ arriba a la derecha, Esc para cerrar.
// - Para planos pasamos `zoomable`: tap-to-zoom (transform: scale()) con
//   pan vía drag/touchmove. Implementación mínima, suficiente para leer cotas.

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
  const containerRef = useRef<HTMLDivElement>(null)
  // Mientras corre un scroll programático (flechas/teclado), ignoramos el
  // listener de scroll: si no, los índices intermedios re-disparan el scrollTo
  // y cortan la animación (navegación "trabada").
  const programmatic = useRef(false)
  const progTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Esc + flechas teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setActive(i => Math.min(i + 1, images.length - 1))
      if (e.key === 'ArrowLeft') setActive(i => Math.max(i - 1, 0))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  // Bloquear scroll del body mientras está abierto
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Sincronizar el scroll-snap con el active state
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    programmatic.current = true
    if (progTimer.current) clearTimeout(progTimer.current)
    el.scrollTo({ left: active * el.clientWidth, behavior: 'smooth' })
    progTimer.current = setTimeout(() => { programmatic.current = false }, 450)
    return () => { if (progTimer.current) clearTimeout(progTimer.current) }
  }, [active])

  // Track scroll → active (ignora el scroll programático en curso)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      if (programmatic.current) return
      const idx = Math.round(el.scrollLeft / el.clientWidth)
      setActive(Math.min(Math.max(idx, 0), images.length - 1))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [images.length])

  const total = images.length
  const showArrows = total > 1

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
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: 999,
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Slides */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        className="lightbox-scroll"
      >
        {images.map((url, i) => (
          <div
            key={i}
            style={{
              flex: '0 0 100%',
              scrollSnapAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              boxSizing: 'border-box',
              overflow: zoomable ? 'auto' : 'hidden',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              draggable={false}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                userSelect: 'none',
                cursor: zoomable ? 'zoom-in' : 'default',
                ...(zoomable
                  ? {
                      // Tap-to-zoom: el browser permite pinch-zoom nativo si tocás
                      // dentro del contenedor con overflow auto.
                      maxWidth: 'none',
                      maxHeight: 'none',
                      width: 'auto',
                      height: 'auto',
                    }
                  : {}),
              }}
            />
          </div>
        ))}
      </div>

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
