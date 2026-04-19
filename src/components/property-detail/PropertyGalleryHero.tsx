'use client'

// Unified Zillow-style gallery — single render, responsive from 320px to
// 1920px. Structure is the same in all breakpoints: one main photo + up to
// 4 thumbs in a 2×2 grid. Only the grid *layout classes* change with width:
//
//   mobile  → grid-cols-2 (main col-span-2 on top, thumbs col-span-1 below)
//   desktop → grid-cols-5 grid-rows-2 h-[440px] (main col-span-3 row-span-2,
//             thumbs col-span-1 filling the remaining 2 cols × 2 rows).
//
// Lightbox is shared.
import { useState } from 'react'
import Image from 'next/image'
import { Images } from 'lucide-react'
import type { TokkoProperty } from '@/lib/tokko'
import { getAllPhotos, getOperationType, translatePropertyType } from '@/lib/tokko'

const GREEN = '#1A5C38'

export default function PropertyGalleryHero({ property }: { property: TokkoProperty }) {
  const photos = getAllPhotos(property)
  const [showAll, setShowAll] = useState(false)
  const operation = getOperationType(property)
  const propType = translatePropertyType(property.type?.name)
  const address = property.fake_address || property.address

  if (photos.length === 0) return null

  const thumbs = photos.slice(1, 5)
  const hasOverlaySlot = photos.length > 5

  return (
    <>
      <div className="grid grid-cols-2 gap-1 md:grid-cols-5 md:grid-rows-2 md:gap-2 md:h-[440px] rounded-xl md:rounded-2xl overflow-hidden">
        {/* Main photo — full width on mobile, col-span-3 row-span-2 on desktop */}
        <div
          className="relative col-span-2 aspect-[4/3] md:col-span-3 md:row-span-2 md:aspect-auto cursor-pointer group overflow-hidden"
          onClick={() => setShowAll(true)}
        >
          <Image
            src={photos[0]}
            alt={property.publication_title || address}
            fill
            className="object-cover md:group-hover:scale-[1.02] md:transition-transform md:duration-300"
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
          {photos.length > 1 && (
            <span className="md:hidden absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-[11px] font-semibold text-gray-800 shadow">
              <Images className="w-3.5 h-3.5" /> {photos.length} fotos
            </span>
          )}
        </div>

        {/* 4 thumb slots — same markup in both breakpoints */}
        {Array.from({ length: 4 }).map((_, i) => {
          const photo = thumbs[i]
          const isLastSlot = i === 3
          if (!photo) {
            return <div key={i} className="col-span-1 aspect-[4/3] md:aspect-auto bg-gray-100" />
          }
          return (
            <div
              key={i}
              className="relative col-span-1 aspect-[4/3] md:aspect-auto cursor-pointer group overflow-hidden"
              onClick={() => setShowAll(true)}
            >
              <Image
                src={photo}
                alt=""
                fill
                className="object-cover md:group-hover:scale-[1.02] md:transition-transform md:duration-300"
                sizes="(min-width: 768px) 20vw, 50vw"
              />
              {isLastSlot && hasOverlaySlot && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center gap-1.5">
                  <Images className="w-4 h-4 text-white" />
                  <span className="text-white text-xs md:text-sm font-semibold">Ver las {photos.length} fotos</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Fallback button when there's no "Ver X fotos" overlay (photos ≤ 5) — desktop */}
      {photos.length > 1 && !hasOverlaySlot && (
        <div className="hidden md:flex justify-end mt-3">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-lg text-xs font-semibold text-gray-800 shadow-sm"
            style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
          >
            <Images className="w-3.5 h-3.5" /> Ver las {photos.length} fotos
          </button>
        </div>
      )}

      {/* Lightbox fullscreen — shared */}
      {showAll && (
        <div className="fixed inset-0 z-[10500] bg-black">
          <button
            onClick={() => setShowAll(false)}
            aria-label="Cerrar galería"
            className="absolute top-4 right-4 z-10 text-white bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-white/30"
          >
            &times;
          </button>
          <div className="h-full overflow-y-auto p-4 pt-16">
            <div className="max-w-4xl mx-auto space-y-2">
              {photos.map((p, i) => (
                <Image
                  key={i}
                  src={p}
                  alt={`Foto ${i + 1}`}
                  width={1200}
                  height={800}
                  className="w-full h-auto rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
