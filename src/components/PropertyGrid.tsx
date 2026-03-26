import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Maximize2, Home, Bed } from 'lucide-react'
import ShareCardButton from '@/components/ShareCardButton'
import {
  type TokkoProperty,
  generatePropertySlug,
  getMainPhoto,
  formatPrice,
  getOperationType,
  getTotalSurface,
  getRoofedArea,
  translatePropertyType,
} from '@/lib/tokko'

function PropertyCard({ property }: { property: TokkoProperty }) {
  const photo = getMainPhoto(property)
  const slug = generatePropertySlug(property)
  const operation = getOperationType(property)
  const price = formatPrice(property)
  const area = getTotalSurface(property)
  const roofed = getRoofedArea(property)

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group flex flex-col h-full relative">
      <Link href={`/propiedades/${slug}`} className="flex flex-col h-full">
        <div className="relative h-52 overflow-hidden bg-gray-100">
          {photo ? (
            <Image
              src={photo}
              alt={property.publication_title || property.address}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="w-10 h-10 text-gray-300" />
            </div>
          )}
          {operation && (
            <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wide text-white ${
              operation === 'Venta' ? 'bg-gray-900/80' : 'bg-brand-600/80'
            }`}>
              {operation}
            </span>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          {property.type?.name && (
            <p className="text-brand-600 text-[10px] font-bold uppercase tracking-widest mb-1">
              {translatePropertyType(property.type.name)}
            </p>
          )}
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-brand-700 transition-colors">
            {property.publication_title || property.address}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
            {area != null && area > 0 && (
              <span className="flex items-center gap-0.5"><Maximize2 className="w-3 h-3" /><span className="font-numeric">{area}</span> m²</span>
            )}
            {roofed != null && roofed > 0 && roofed !== area && (
              <span className="flex items-center gap-0.5"><Home className="w-3 h-3" /><span className="font-numeric">{roofed}</span> m² cub.</span>
            )}
            {property.room_amount > 0 && (
              <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" /><span className="font-numeric">{property.room_amount}</span></span>
            )}
          </div>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-brand-600 font-black text-lg font-numeric">{price}</span>
          </div>
        </div>
      </Link>
      <div className="absolute top-3 right-3 z-10">
        <ShareCardButton slug={slug} />
      </div>
    </div>
  )
}

export default function PropertyGrid({ properties }: { properties: TokkoProperty[] }) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No se encontraron propiedades en esta zona actualmente.</p>
        <Link href="/propiedades" className="text-brand-600 font-semibold mt-3 inline-block hover:text-brand-700">
          Ver todas las propiedades →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map(p => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  )
}
