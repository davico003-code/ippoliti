'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import StoryPlateMulti from './StoryPlateMulti'
import PlacaPreview from './PlacaPreview'

export interface PlacaPhoto {
  thumb: string
  full: string
}

interface Props {
  slug: string
  photos: PlacaPhoto[]
  title: string
  price: string
  operation: string
  propertyType: string
  area: number | null
  rooms: number
  bathrooms: number
  lotSurface: number | null
  parking: number
  city: string | null
  neighborhood: string | null
  locationLabel: string
}

export default function PlacaSelectorClient(props: Props) {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (full: string) => {
    setSelected(prev => {
      if (prev.includes(full)) return prev.filter(x => x !== full)
      if (prev.length >= 2) return prev
      return [...prev, full]
    })
  }

  // Preview always shows something: empty selection → first available photo
  const previewPhotos =
    selected.length > 0
      ? selected
      : props.photos[0]
        ? [props.photos[0].full]
        : []

  const counterTone =
    selected.length === 0
      ? 'bg-gray-100 text-gray-500'
      : selected.length === 1
        ? 'bg-[#e7f2eb] text-[#1A5C38]'
        : 'bg-amber-100 text-amber-800'

  const sharedPlateProps = {
    title: props.title,
    price: props.price,
    operation: props.operation,
    propertyType: props.propertyType,
    area: props.area,
    rooms: props.rooms,
    bathrooms: props.bathrooms,
    lotSurface: props.lotSurface,
    parking: props.parking,
    city: props.city ?? undefined,
    neighborhood: props.neighborhood ?? undefined,
  }

  const downloadBtnStyle: React.CSSProperties = {
    width: '100%',
    height: 50,
    borderRadius: 14,
    border: 'none',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Raleway', system-ui, sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    letterSpacing: '0.02em',
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Topbar sticky */}
      <header
        className="sticky top-0 z-40 border-b border-gray-200"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'rgba(255,255,255,0.92)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">
          <Link
            href={`/propiedades/${props.slug}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-[#1A5C38] transition-colors"
            style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Link>
          <h1
            className="font-bold text-base text-gray-900 truncate text-center flex-1 mx-2"
            style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
          >
            Crear placa
          </h1>
          <span
            className={`flex items-center justify-center min-w-[58px] h-8 rounded-full px-3 text-sm font-bold tabular-nums transition-colors ${counterTone}`}
            style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
            aria-live="polite"
          >
            {selected.length} / 2
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-5 pb-44 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6 md:gap-8">
          {/* Left: photo grid */}
          <section>
            <p
              className="text-[11px] text-gray-500 mb-3 uppercase tracking-[0.15em] font-bold"
              style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
            >
              Elegí 1 o 2 fotos
            </p>
            {props.photos.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <p className="text-sm text-gray-500">Esta propiedad no tiene fotos disponibles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {props.photos.map(p => {
                  const idx = selected.indexOf(p.full)
                  const isSelected = idx >= 0
                  const isFull = !isSelected && selected.length >= 2
                  return (
                    <button
                      key={p.full}
                      type="button"
                      onClick={() => toggle(p.full)}
                      disabled={isFull}
                      aria-pressed={isSelected}
                      className={`relative aspect-square overflow-hidden rounded-xl bg-gray-100 transition-all ${
                        isSelected
                          ? 'ring-4 ring-[#1A5C38]'
                          : 'ring-1 ring-gray-200 hover:ring-gray-400'
                      } ${isFull ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <Image
                        src={p.thumb}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover"
                        unoptimized
                      />
                      {isSelected && (
                        <span
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#1A5C38] text-white text-sm font-bold flex items-center justify-center shadow-md"
                          style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
                        >
                          {idx + 1}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Right: info + preview + download */}
          <aside>
            <div className="md:sticky md:top-[72px] space-y-4">
              {/* Property info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <p
                  className="text-[11px] uppercase tracking-[0.15em] text-gray-500 font-bold mb-1"
                  style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
                >
                  {props.locationLabel}
                </p>
                <h2
                  className="font-bold text-base text-gray-900 leading-tight"
                  style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
                >
                  {props.title}
                </h2>
                <p
                  className="font-bold text-lg text-[#1A5C38] mt-2 tabular-nums"
                  style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
                >
                  {props.price}
                </p>
              </div>

              {/* Preview */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <p
                  className="text-[11px] uppercase tracking-[0.15em] text-gray-500 font-bold mb-3"
                  style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
                >
                  Vista previa
                </p>
                <PlacaPreview photos={previewPhotos} {...sharedPlateProps} />
              </div>

              {/* Download button — fixed-bottom on mobile, inline (sticky via parent) on desktop */}
              <div
                className="
                  fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3
                  md:relative md:border-t-0 md:bg-transparent md:p-0
                "
                style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
              >
                <StoryPlateMulti
                  {...sharedPlateProps}
                  slug={props.slug}
                  photos={selected}
                  disabled={selected.length === 0}
                  buttonLabel="Descargar placa"
                  btnStyle={downloadBtnStyle}
                />
                <p
                  className="text-[11px] text-gray-400 text-center mt-2"
                  style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
                >
                  PNG 1080×1920 · listo para Instagram Story
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
