'use client'

import Link from 'next/link'
import {
  type TokkoProperty,
  generatePropertySlug,
  getMainPhoto,
  formatPrice,
  getTotalSurface,
  getRoofedArea,
  translatePropertyType,
} from '@/lib/tokko'

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

export default function SimplePropertyCard({ property }: { property: TokkoProperty }) {
  const photo = getMainPhoto(property)
  const slug = generatePropertySlug(property)
  const price = formatPrice(property)
  const type = translatePropertyType(property.type?.name)
  const area = getTotalSurface(property) || getRoofedArea(property)
  const rooms = property.suite_amount || property.room_amount || 0
  const baths = property.bathroom_amount || 0
  const title = property.publication_title || property.fake_address || property.address || ''
  const location = property.location?.short_location || property.location?.name || ''

  const specs = [
    area && `${area} m²`,
    rooms && `${rooms} dorm`,
    baths && `${baths} baño${baths > 1 ? 's' : ''}`,
  ].filter(Boolean).join(' · ')

  return (
    <Link href={`/propiedades/${slug}`} className="block group">
      {/* Image */}
      <div className="overflow-hidden rounded-2xl md:rounded-3xl mb-3">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={title}
            className="w-full aspect-[3/4] object-cover"
            style={{ transition: `transform 600ms ${EASE}` }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)' }}
          />
        ) : (
          <div className="w-full aspect-[3/4] bg-[#f5f5f7] flex items-center justify-center rounded-2xl md:rounded-3xl">
            <svg className="w-10 h-10 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        )}
      </div>

      {/* Text — no container */}
      {type && (
        <p className="text-[11px] text-[#86868b] uppercase tracking-wide mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {type}
        </p>
      )}
      <h3
        className="text-base md:text-lg text-[#1d1d1f] leading-[1.3] line-clamp-2 mb-1"
        style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 500 }}
      >
        {title}
      </h3>
      {location && (
        <p className="text-sm text-[#6e6e73] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {location}
        </p>
      )}
      {specs && (
        <p className="text-xs text-[#86868b] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {specs}
        </p>
      )}
      <p
        className="text-sm text-[#1d1d1f] font-numeric"
        style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
      >
        {price}
      </p>
    </Link>
  )
}
