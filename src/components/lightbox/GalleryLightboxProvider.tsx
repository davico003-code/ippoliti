'use client'

// Global gallery lightbox.
//
// Why this exists at the layout root: PropertyPanel renders the property page
// inside a sliding panel that uses `transform: translateX(...)` plus an
// `animation`. Both create a containing block for `position: fixed`, so any
// `<Lightbox>` mounted inside the panel — even with `createPortal` to
// `document.body` — was getting clipped to the panel's bounds and the listing
// + map underneath leaked through. Mounting the lightbox once at the root of
// the layout tree (above PropertyPanel in the React tree, and physically
// outside the transformed subtree in the DOM) makes the bug impossible by
// construction.
//
// Consumers call `useGalleryLightbox().openGallery(photos, startIndex)`.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { RotateCcw } from 'lucide-react'
import Lightbox, { type ControllerRef } from 'yet-another-react-lightbox'

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

export default function GalleryLightboxProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const lightboxRef = useRef<ControllerRef>(null)

  const openGallery = useCallback((next: string[], startIndex = 0) => {
    if (!next || next.length === 0) return
    const safeIndex = Math.min(Math.max(0, startIndex), next.length - 1)
    setPhotos(next)
    setIndex(safeIndex)
    setOpen(true)
  }, [])

  const closeGallery = useCallback(() => {
    setOpen(false)
  }, [])

  const value = useMemo<GalleryLightboxContextValue>(
    () => ({ openGallery, closeGallery }),
    [openGallery, closeGallery],
  )

  const slides = useMemo(() => photos.map(src => ({ src })), [photos])
  const isLast = photos.length > 1 && index >= photos.length - 1

  const restartButton = (
    <button
      key="restart-gallery"
      type="button"
      onClick={() => {
        if (photos.length <= 1) return
        lightboxRef.current?.prev({ count: photos.length - 1 })
      }}
      aria-label="Volver a la primera foto"
      className="yarl__button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 14px',
        height: 44,
        color: '#fff',
        fontFamily: "'Raleway', system-ui, sans-serif",
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      <RotateCcw className="w-4 h-4" />
      <span>Volver al inicio</span>
    </button>
  )

  return (
    <GalleryLightboxContext.Provider value={value}>
      {children}
      <Lightbox
        open={open}
        close={closeGallery}
        index={index}
        controller={{ ref: lightboxRef, closeOnBackdropClick: true }}
        slides={slides}
        on={{ view: ({ index: i }) => setIndex(i) }}
        carousel={{ finite: true, padding: 0 }}
        animation={{ fade: 250, swipe: 200 }}
        styles={{
          container: { backgroundColor: '#000', zIndex: 99999 },
          button: { filter: 'none' },
        }}
        toolbar={{
          buttons: isLast ? [restartButton, 'close'] : ['close'],
        }}
        render={{
          iconPrev: () => (
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </div>
          ),
          iconNext: () => (
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </div>
          ),
          iconClose: () => (
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </div>
          ),
          buttonPrev: photos.length <= 1 ? () => null : undefined,
          buttonNext: photos.length <= 1 ? () => null : undefined,
        }}
      />
    </GalleryLightboxContext.Provider>
  )
}
