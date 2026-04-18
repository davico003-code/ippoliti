'use client'

// Zillow-style gallery: 1 big photo + 2x2 grid of thumbs (desktop).
// Mobile: the component renders nothing — each parent supplies its own mobile hero.
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

  // Determine thumb slots — adapt when < 5 photos
  const thumbs = photos.slice(1, 5)

  return (
    <>
      {/* Zillow grid: desktop only */}
      <div className="hidden md:block">
        <div className="grid grid-cols-5 gap-1" style={{ maxHeight: 480 }}>
          {/* Main photo (60%) */}
          <div
            className="relative col-span-3 aspect-[16/10] overflow-hidden cursor-pointer group"
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

          {/* 2x2 thumbs (40%) */}
          <div className="col-span-2 grid grid-cols-2 gap-1">
            {Array.from({ length: 4 }).map((_, i) => {
              const photo = thumbs[i]
              const isLastSlot = i === 3
              if (!photo) return <div key={i} className="bg-gray-100" />
              return (
                <div
                  key={i}
                  className="relative overflow-hidden cursor-pointer group"
                  onClick={() => setShowAll(true)}
                >
                  <Image
                    src={photo}
                    alt=""
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    sizes="20vw"
                  />
                  {isLastSlot && photos.length > 5 && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center gap-1.5">
                      <Images className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-semibold">Ver las {photos.length} fotos</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Ver todas (floating) cuando no hay overlay automático */}
        {photos.length > 1 && photos.length <= 5 && (
          <button
            onClick={() => setShowAll(true)}
            className="relative -mt-12 ml-auto mr-4 flex items-center gap-1.5 bg-white/95 backdrop-blur px-4 py-2 rounded-lg text-xs font-semibold text-gray-800 shadow float-right"
            style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
          >
            <Images className="w-3.5 h-3.5" /> Ver las {photos.length} fotos
          </button>
        )}
      </div>

      {/* Lightbox fullscreen — shared */}
      {showAll && (
        <div className="fixed inset-0 z-[300] bg-black">
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
