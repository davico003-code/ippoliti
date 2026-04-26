'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import ShareCardButton from '@/components/ShareCardButton'
import {
  type TokkoProperty,
  getAllPhotos,
  getMainPhoto,
  formatPrice,
  getOperationType,
  getRoofedArea,
  getLotSurface,
  isLand,
  translatePropertyType,
  generatePropertySlug,
} from '@/lib/tokko'

const RALEWAY = "'Raleway', system-ui, sans-serif"
const POPPINS = "'Poppins', system-ui, sans-serif"

export default function PropiedadCardGrid({ property, isSelected, onClick, variant = 'desktop' }: {
  property: TokkoProperty
  isSelected: boolean
  onClick: () => void
  variant?: 'desktop' | 'mobile'
}) {
  const isMobile = variant === 'mobile'
  const photos = getAllPhotos(property)
  const fallback = getMainPhoto(property)
  const images = photos.length > 0 ? photos : fallback ? [fallback] : []
  const [imgIdx, setImgIdx] = useState(0)

  const operation = getOperationType(property)
  const price = formatPrice(property)
  const roofed = getRoofedArea(property)
  const lot = getLotSurface(property)
  const land = isLand(property)
  const typeName = translatePropertyType(property.type?.name)
  const slug = generatePropertySlug(property)
  const beds = property.suite_amount || property.room_amount
  const baths = property.bathroom_amount
  const address = property.fake_address || property.address
  const location = property.location?.short_location || property.location?.name || ''

  // Build specs: "3 dorm · 2 baños · 190 m² · 1.691 m² lote"
  const specs: { num: string; label: string }[] = []
  if (!land && beds > 0) specs.push({ num: String(beds), label: ' dorm' })
  if (!land && baths > 0) specs.push({ num: String(baths), label: ` baño${baths > 1 ? 's' : ''}` })
  if (roofed != null && roofed > 0) specs.push({ num: roofed.toLocaleString('es-AR'), label: ' m²' })
  if (lot != null && lot > 0 && lot !== roofed) specs.push({ num: lot.toLocaleString('es-AR'), label: ' m² lote' })
  if (land && lot != null && lot > 0 && specs.length === 0) specs.push({ num: lot.toLocaleString('es-AR'), label: ' m²' })

  const prev = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setImgIdx(i => (i - 1 + images.length) % images.length)
  }
  const next = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setImgIdx(i => (i + 1) % images.length)
  }

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer"
      style={{
        borderRadius: 14,
        border: isSelected ? '1px solid #1A5C38' : '1px solid #e5e7eb',
        overflow: 'hidden',
        background: '#fff',
        boxShadow: isSelected
          ? '0 10px 25px rgba(0,0,0,0.1)'
          : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'box-shadow 200ms, border-color 200ms',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'
          e.currentTarget.style.borderColor = '#1A5C38'
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
          e.currentTarget.style.borderColor = '#e5e7eb'
        }
      }}
    >
      {/* Image */}
      <div className="relative w-full bg-gray-100 overflow-hidden aspect-[16/9]">
        {images.length > 0 ? (
          <Image
            src={images[imgIdx]}
            alt={address}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            Sin foto
          </div>
        )}

        {/* Carousel arrows — hover only */}
        {images.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.slice(0, 5).map((_, i) => (
                <div key={i} className="rounded-full"
                  style={{
                    width: 4, height: 4,
                    background: i === imgIdx ? 'white' : 'rgba(255,255,255,0.5)',
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Badge top-left — operation only (Destacada eliminado) */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {operation && (
            <span style={{
              background: operation === 'Venta' ? '#1A5C38'
                : operation === 'Alquiler' ? '#2563eb' : '#7c3aed',
              color: '#fff',
              fontFamily: RALEWAY,
              fontWeight: 600,
              fontSize: 11,
              textTransform: 'uppercase',
              padding: '5px 14px',
              borderRadius: 9999,
            }}>
              {operation}
            </span>
          )}
        </div>

        {/* Heart top-right */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation() }}
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Heart className="w-[18px] h-[18px] text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <p style={{
            fontFamily: POPPINS,
            fontWeight: 800,
            fontSize: isMobile ? 20 : 22,
            color: '#0a0a0a',
            margin: 0,
            lineHeight: 1.2,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {price}
          </p>
          <div onClick={e => e.stopPropagation()}>
            <ShareCardButton slug={slug} title={address} price={price} />
          </div>
        </div>

        {specs.length > 0 && (
          <p style={{
            fontFamily: RALEWAY,
            fontSize: 13,
            color: '#4b5563',
            margin: '0 0 6px',
            lineHeight: 1.4,
            fontWeight: 400,
          }}>
            {specs.map((s, i) => (
              <span key={i}>
                <span style={{ fontFamily: POPPINS, fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#0a0a0a' }}>{s.num}</span>
                {s.label}
                {i < specs.length - 1 && <span style={{ margin: '0 6px', color: '#d1d5db' }}>&middot;</span>}
              </span>
            ))}
          </p>
        )}

        <p style={{
          fontFamily: RALEWAY,
          fontWeight: 500,
          fontSize: 13,
          color: '#0a0a0a',
          margin: '0 0 2px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {typeName}{typeName && address ? ' \u00B7 ' : ''}{address}
        </p>

        <p style={{
          fontFamily: RALEWAY,
          fontSize: 12,
          color: '#6b7280',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {location}
        </p>
      </div>

    </div>
  )
}
