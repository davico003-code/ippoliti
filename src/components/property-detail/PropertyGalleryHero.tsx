'use client'

// Zillow-style gallery for desktop (1 big + 4 thumbs 2×2 in a 5-col grid at
// 440px tall) and a COMPACT hero for mobile (single main photo ~280px tall
// with a "Ver las N fotos" badge overlay that opens the shared lightbox).
//
// We keep two simple blocks guarded by md:hidden / hidden md:block because
// the two layouts are structurally different enough (mobile: single item,
// desktop: 5-col grid with row-span) that unifying forced a tall 2×2 thumb
// strip on mobile that filled the viewport.
//
// The fullscreen viewer is `yet-another-react-lightbox` — rendered via portal
// so it escapes any transformed ancestor (PropertyPanel uses translateX which
// would otherwise contain a `position: fixed` overlay and let the listing/map
// leak around the edges). Configured with `finite: true` so the carousel
// stops at the last slide instead of advancing to a blank slot, and a
// "Volver al inicio" toolbar button appears on the last slide.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Camera, Images, RotateCcw } from 'lucide-react'
import Lightbox, { type ControllerRef } from 'yet-another-react-lightbox'
import type { TokkoProperty } from '@/lib/tokko'
import { getAllPhotos, getOperationType, translatePropertyType } from '@/lib/tokko'

const GREEN = '#1A5C38'

export default function PropertyGalleryHero({ property }: { property: TokkoProperty }) {
  const photos = getAllPhotos(property)
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const lightboxRef = useRef<ControllerRef>(null)
  const operation = getOperationType(property)
  const propType = translatePropertyType(property.type?.name)
  const address = property.fake_address || property.address

  useEffect(() => { setMounted(true) }, [])

  if (photos.length === 0) return null

  const thumbs = photos.slice(1, 5)
  const hasOverlaySlot = photos.length > 5
  const isLast = photos.length > 1 && index >= photos.length - 1

  const openAt = (i: number) => {
    setIndex(i)
    setOpen(true)
  }

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
    <>
      {/* ── MOBILE: single compact hero photo (~280px) with "Ver las N fotos" badge ── */}
      <div className="md:hidden">
        <div
          className="relative w-full h-[280px] rounded-xl overflow-hidden cursor-pointer"
          onClick={() => openAt(0)}
        >
          <Image
            src={photos[0]}
            alt={property.publication_title || address}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          {operation && (
            <span
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold uppercase text-white"
              style={{ background: operation === 'Venta' ? '#dc2626' : '#2563eb' }}
            >
              {operation}
            </span>
          )}
          {propType && (
            <span
              className="absolute top-3 left-[90px] px-3 py-1 bg-white/90 rounded-full text-[11px] font-bold uppercase"
              style={{ color: GREEN }}
            >
              {propType}
            </span>
          )}
          {photos.length > 1 && (
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur px-3 py-2 rounded-lg text-[12px] font-semibold text-gray-800 shadow-md">
              <Camera className="w-4 h-4" />
              Ver las {photos.length} fotos
            </span>
          )}
        </div>
      </div>

      {/* ── DESKTOP: Zillow 5-col grid (1 big + 4 thumbs 2×2) h-[440px] ── */}
      <div className="hidden md:block">
        <div className="grid grid-cols-5 grid-rows-2 gap-2 h-[440px] rounded-2xl overflow-hidden">
          <div
            className="relative col-span-3 row-span-2 cursor-pointer group overflow-hidden"
            onClick={() => openAt(0)}
          >
            <Image
              src={photos[0]}
              alt={property.publication_title || address}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority
            />
            {operation && (
              <span
                className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold uppercase text-white"
                style={{ background: operation === 'Venta' ? '#dc2626' : '#2563eb' }}
              >
                {operation}
              </span>
            )}
            {propType && (
              <span
                className="absolute top-3 left-[90px] px-3 py-1 bg-white/90 rounded-full text-[11px] font-bold uppercase"
                style={{ color: GREEN }}
              >
                {propType}
              </span>
            )}
          </div>

          {Array.from({ length: 4 }).map((_, i) => {
            const photo = thumbs[i]
            const isLastSlot = i === 3
            if (!photo) return <div key={i} className="col-span-1 bg-gray-100" />
            return (
              <div
                key={i}
                className="relative col-span-1 cursor-pointer group overflow-hidden"
                onClick={() => openAt(i + 1)}
              >
                <Image
                  src={photo}
                  alt=""
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  sizes="20vw"
                />
                {isLastSlot && hasOverlaySlot && (
                  <div
                    className="absolute inset-0 bg-black/55 flex items-center justify-center gap-1.5"
                    onClick={(e) => { e.stopPropagation(); openAt(0) }}
                  >
                    <Images className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-semibold">Ver las {photos.length} fotos</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Fallback button en desktop si no hay overlay slot (≤ 5 fotos) */}
        {photos.length > 1 && !hasOverlaySlot && (
          <div className="flex justify-end mt-3">
            <button
              onClick={() => openAt(0)}
              className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-lg text-xs font-semibold text-gray-800 shadow-sm"
              style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
            >
              <Images className="w-3.5 h-3.5" /> Ver las {photos.length} fotos
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen lightbox — manual portal a document.body para escapar el
          containing block que crean los `transform`/`animation` de PropertyPanel.
          (YARL portea por defecto, pero el manual portal es nuestra red de
          seguridad y garantiza que `position: fixed` siempre se ancle al viewport.) */}
      {mounted && createPortal(
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={index}
          controller={{ ref: lightboxRef, closeOnBackdropClick: true }}
          slides={photos.map(src => ({ src }))}
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </div>
            ),
            iconNext: () => (
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
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
        />,
        document.body,
      )}
    </>
  )
}
