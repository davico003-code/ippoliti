'use client'

// Global gallery lightbox.
//
// History: we tried `yet-another-react-lightbox` rendered (a) inline,
// (b) inside `createPortal(node, document.body)`, and (c) inside this
// provider. None reliably covered the viewport when opened from inside
// PropertyPanel — the panel uses `transform: translateX(-50%)` + an
// `animation`, both of which create a containing block for `position:
// fixed`. YARL's portal default IS document.body, but its internal
// `.yarl__container` uses `position: absolute` and we kept fighting CSS.
//
// So this is a custom lightbox — a single `<div className="fixed inset-0">`
// rendered at the layout root (sibling of <main>), above any panel in the
// React tree, with no third-party CSS dependencies. Same UX: prev/next,
// counter, close, finite carousel, "Volver al inicio" on the last slide,
// keyboard nav and swipe.
//
// Consumers call `useGalleryLightbox().openGallery(photos, startIndex)`.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react'

interface GalleryLightboxContextValue {
  openGallery: (photos: string[], startIndex?: number) => void
  closeGallery: () => void
}

const GalleryLightboxContext = createContext<GalleryLightboxContextValue | null>(null)

export function useGalleryLightbox(): GalleryLightboxContextValue {
  const ctx = useContext(GalleryLightboxContext)
  if (!ctx) {
    throw new Error('useGalleryLightbox must be used inside <GalleryLightboxProvider>')
  }
  return ctx
}

const GREEN = '#1A5C38'
const RALEWAY = "'Raleway', system-ui, sans-serif"
const POPPINS = "'Poppins', system-ui, sans-serif"

export default function GalleryLightboxProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)

  const openGallery = useCallback((next: string[], startIndex = 0) => {
    if (!next || next.length === 0) return
    const safeIndex = Math.min(Math.max(0, startIndex), next.length - 1)
    setPhotos(next)
    setIndex(safeIndex)
    setOpen(true)
  }, [])

  const closeGallery = useCallback(() => setOpen(false), [])

  const value = useMemo<GalleryLightboxContextValue>(
    () => ({ openGallery, closeGallery }),
    [openGallery, closeGallery],
  )

  return (
    <GalleryLightboxContext.Provider value={value}>
      {children}
      {open && (
        <Lightbox
          photos={photos}
          index={index}
          setIndex={setIndex}
          onClose={closeGallery}
        />
      )}
    </GalleryLightboxContext.Provider>
  )
}

interface LightboxProps {
  photos: string[]
  index: number
  setIndex: (i: number | ((prev: number) => number)) => void
  onClose: () => void
}

function Lightbox({ photos, index, setIndex, onClose }: LightboxProps) {
  const total = photos.length
  const isFirst = index === 0
  const isLast = index === total - 1
  const touchRef = useRef<{ x: number; y: number } | null>(null)

  const goPrev = useCallback(() => {
    if (isFirst) return
    setIndex(i => Math.max(0, (typeof i === 'number' ? i : 0) - 1))
  }, [isFirst, setIndex])

  const goNext = useCallback(() => {
    if (isLast) return
    setIndex(i => Math.min(total - 1, (typeof i === 'number' ? i : 0) + 1))
  }, [isLast, setIndex, total])

  const goFirst = useCallback(() => setIndex(0), [setIndex])

  // Keyboard navigation + lock body scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, goPrev, goNext])

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = Math.abs(t.clientY - start.y)
    if (Math.abs(dx) > 50 && dy < 80) {
      if (dx < 0) goNext()
      else goPrev()
    }
    touchRef.current = null
  }

  const photo = photos[index]
  if (!photo) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galería de fotos"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo}
        alt={`Foto ${index + 1} de ${total}`}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        draggable={false}
      />

      {/* Counter (top-left) */}
      {total > 1 && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: '#fff',
            fontFamily: POPPINS,
            fontSize: 14,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            background: 'rgba(0,0,0,0.45)',
            padding: '6px 12px',
            borderRadius: 999,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          {index + 1} / {total}
        </div>
      )}

      {/* Close (top-right) */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar galería"
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255,255,255,0.18)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      >
        <X size={20} strokeWidth={2.5} />
      </button>

      {/* Prev */}
      {!isFirst && total > 1 && (
        <button
          type="button"
          onClick={goPrev}
          aria-label="Foto anterior"
          style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.92)',
            color: GREEN,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
          }}
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
      )}

      {/* Next OR Restart on the last slide */}
      {total > 1 && (isLast ? (
        <button
          type="button"
          onClick={goFirst}
          aria-label="Volver a la primera foto"
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 18px',
            height: 48,
            borderRadius: 999,
            border: 'none',
            background: GREEN,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: RALEWAY,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 0.2,
            boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
          }}
        >
          <RotateCcw size={18} strokeWidth={2.5} />
          <span>Volver al inicio</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={goNext}
          aria-label="Foto siguiente"
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.92)',
            color: GREEN,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
          }}
        >
          <ChevronRight size={24} strokeWidth={2.5} />
        </button>
      ))}
    </div>
  )
}
