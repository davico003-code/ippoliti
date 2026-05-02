'use client'

// Used by emprendimientos detail (developments). Mobile keeps the
// TikTok-style vertical scroll viewer; desktop delegates to the global
// `GalleryLightboxProvider` that lives at the layout root.
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useGalleryLightbox } from '@/components/lightbox/useGalleryLightbox'

interface Props {
  photos: string[]
  alt: string
}

export default function PhotoGallery({ photos, alt }: Props) {
  const { openGallery } = useGalleryLightbox()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileIndex, setMobileIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleOpen = useCallback((i: number) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileIndex(i)
      setMobileOpen(true)
    } else {
      openGallery(photos, i)
    }
  }, [openGallery, photos])

  if (photos.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => handleOpen(i)}
            className="relative h-40 bg-gray-100 rounded-lg overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <Image
              src={photo}
              alt={`${alt} - Foto ${i + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Mobile TikTok-style viewer (preserved as-is from the original UX) */}
      {mobileOpen && isMobile && (
        <MobilePhotoViewer photos={photos} alt={alt} initialIndex={mobileIndex} onClose={() => setMobileOpen(false)} />
      )}
    </>
  )
}

/* ── Mobile TikTok-style Photo Viewer ── */
function MobilePhotoViewer({
  photos, alt, initialIndex, onClose,
}: { photos: string[]; alt: string; initialIndex: number; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const touchRef = useRef<{ startX: number; startY: number; dx: number } | null>(null)
  const [swipeX, setSwipeX] = useState(0)
  const [closing, setClosing] = useState(false)

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Scroll to initial photo
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const photoEls = el.querySelectorAll('[data-photo-index]')
    const target = photoEls[initialIndex] as HTMLElement | undefined
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'center' })
  }, [initialIndex])

  // IntersectionObserver to track current photo
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const photoEls = el.querySelectorAll('[data-photo-index]')
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.photoIndex)
            if (!isNaN(idx)) setCurrentIndex(idx)
          }
        }
      },
      { root: el, threshold: 0.6 }
    )
    photoEls.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [photos.length])

  // Swipe-to-close handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    touchRef.current = { startX: t.clientX, startY: t.clientY, dx: 0 }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return
    const t = e.touches[0]
    const dx = t.clientX - touchRef.current.startX
    const dy = Math.abs(t.clientY - touchRef.current.startY)
    // Only track horizontal if mostly horizontal
    if (Math.abs(dx) > 20 && dy < Math.abs(dx) * 0.3) {
      touchRef.current.dx = dx
      setSwipeX(dx)
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!touchRef.current) return
    const dx = Math.abs(touchRef.current.dx)
    if (dx > 80) {
      setClosing(true)
      setTimeout(onClose, 200)
    } else {
      setSwipeX(0)
    }
    touchRef.current = null
  }, [onClose])

  const opacity = closing ? 0 : Math.max(0, 1 - Math.abs(swipeX) / 300)

  return (
    <div
      className="fixed inset-0 z-[60] bg-black"
      style={{ opacity, transition: closing ? 'opacity 200ms ease-out' : undefined }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-[70] flex items-center justify-between px-5 py-4">
        <span className="text-white/90 text-[15px] font-semibold font-numeric" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {currentIndex + 1} / {photos.length}
        </span>
        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center -mr-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable photos */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto pt-16 pb-12"
        style={{
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          transform: swipeX ? `translateX(${swipeX}px)` : undefined,
          transition: swipeX ? undefined : 'transform 300ms ease-out',
        }}
      >
        {photos.map((photo, i) => (
          <div
            key={i}
            data-photo-index={i}
            className="flex items-center justify-center px-0"
            style={{
              scrollSnapAlign: 'center',
              minHeight: '75vh',
              paddingTop: '8px',
              paddingBottom: '8px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={`${alt} - Foto ${i + 1}`}
              className="w-full object-contain"
              style={{ maxHeight: '72vh' }}
              loading={Math.abs(i - initialIndex) <= 2 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] flex justify-center py-3">
        <span className="text-white/40 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>siinmobiliaria.com</span>
      </div>
    </div>
  )
}
