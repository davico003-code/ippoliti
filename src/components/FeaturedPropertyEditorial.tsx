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

export default function FeaturedPropertyEditorial({ property }: { property: TokkoProperty }) {
  const photo = getMainPhoto(property)
  const slug = generatePropertySlug(property)
  const price = formatPrice(property)
  const type = translatePropertyType(property.type?.name)
  const area = getTotalSurface(property) || getRoofedArea(property)
  const rooms = property.suite_amount || property.room_amount || 0
  const baths = property.bathroom_amount || 0
  const parking = property.parking_lot_amount || 0
  const address = property.fake_address || property.real_address || property.address || ''
  const title = property.publication_title || address
  const location = property.location?.short_location || property.location?.name || ''

  const specs = [
    area && `${area} m²`,
    rooms && `${rooms} dorm`,
    baths && `${baths} baño${baths > 1 ? 's' : ''}`,
    parking && `${parking} cochera${parking > 1 ? 's' : ''}`,
    type,
  ].filter(Boolean).join(' · ')

  return (
    <Link href={`/propiedades/${slug}`} className="block group">
      <div className="py-8 md:py-12">
        {/* Label */}
        <p className="text-center text-[#1A5C38] text-xs font-medium uppercase tracking-[0.2em] mb-6">
          Selección SI
        </p>

        {/* Photo */}
        <div className="overflow-hidden rounded-3xl">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={title}
              className="w-full aspect-video object-cover"
              style={{ transition: `transform 600ms ${EASE}` }}
              onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)' }}
            />
          ) : (
            <div className="w-full aspect-video bg-[#f5f5f7] flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 md:mt-8 max-w-3xl mx-auto text-center">
          <h2
            className="text-2xl md:text-4xl lg:text-[48px] text-[#1d1d1f] leading-[1.15] mb-2"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 500, letterSpacing: '-0.03em' }}
          >
            {title}
          </h2>

          {location && (
            <p className="text-sm md:text-base text-[#6e6e73] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {location}
            </p>
          )}

          {specs && (
            <p className="text-xs md:text-sm text-[#86868b] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {specs}
            </p>
          )}

          {/* Price + Link */}
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <span
              className="text-lg md:text-xl text-[#1d1d1f] font-numeric"
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
            >
              {price}
            </span>
            <span
              className="text-sm text-[#1A5C38] font-medium inline-flex items-center gap-1 group-hover:gap-2"
              style={{ fontFamily: 'Poppins, sans-serif', transition: `gap 400ms ${EASE}` }}
            >
              Ver propiedad <span aria-hidden>&rarr;</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
