'use client'

// Zillow-style gallery for desktop (1 big + 4 thumbs 2×2 in a 5-col grid at
// 440px tall) and a COMPACT hero for mobile (single main photo ~280px tall
// with a "Ver las N fotos" badge overlay that opens the shared lightbox).
//
// We keep two simple blocks guarded by md:hidden / hidden md:block because
// the two layouts are structurally different enough (mobile: single item,
// desktop: 5-col grid with row-span) that unifying forced a tall 2×2 thumb
// strip on mobile that filled the viewport.
import { useState } from 'react'
import Image from 'next/image'
import { Camera, Images } from 'lucide-react'
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
      {/* ── MOBILE: single compact hero photo (~280px) with "Ver las N fotos" badge ── */}
      <div className="md:hidden">
        <div
          className="relative w-full h-[280px] rounded-xl overflow-hidden cursor-pointer"
          onClick={() => setShowAll(true)}
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
            onClick={() => setShowAll(true)}
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
                onClick={() => setShowAll(true)}
              >
                <Image
                  src={photo}
                  alt=""
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  sizes="20vw"
                />
                {isLastSlot && hasOverlaySlot && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center gap-1.5">
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
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-lg text-xs font-semibold text-gray-800 shadow-sm"
              style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
            >
              <Images className="w-3.5 h-3.5" /> Ver las {photos.length} fotos
            </button>
          </div>
        )}
      </div>

      {/* Lightbox fullscreen — compartido entre mobile y desktop */}
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
