import Image from 'next/image';
import Link from 'next/link';
import { Bed, Maximize, MapPin, Bath } from 'lucide-react';
import {
  getFeaturedProperties,
  generatePropertySlug,
  getMainPhoto,
  formatPrice,
  getOperationType,
  getTotalSurface,
  formatLocation,
  type TokkoProperty,
} from '@/lib/tokko';

function PropertyCard({ property }: { property: TokkoProperty }) {
  const photo = getMainPhoto(property);
  const slug = generatePropertySlug(property);
  const operation = getOperationType(property);
  const price = formatPrice(property);
  const area = getTotalSurface(property);
  const location = formatLocation(property);

  return (
    <Link
      href={`/propiedades/${slug}`}
      className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100/50 overflow-hidden group hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full"
    >
      <div className="relative h-64 overflow-hidden w-full bg-gray-100">
        {photo ? (
          <Image
            src={photo}
            alt={property.publication_title || property.address}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-sm">Sin imagen</span>
          </div>
        )}

        {operation && (
          <div className="absolute top-4 left-4 z-10">
            <span
              className={`px-4 py-1.5 text-xs font-bold rounded-full shadow-lg uppercase tracking-wider backdrop-blur-md border border-white/20 bg-brand-600/90 text-white`}
            >
              {operation}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/90 to-white/0" />
        <div className="absolute bottom-4 left-4 z-10">
          <span className="text-brand-600 font-bold text-2xl drop-shadow-md font-numeric">{price}</span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h4 className="text-xl font-bold text-navy-800 mb-2 group-hover:text-gold-600 transition-colors line-clamp-2">
          {property.publication_title || property.address}
        </h4>

        {location && (
          <div className="flex items-center text-gray-500 mb-6 mt-1">
            <MapPin className="w-4 h-4 mr-1.5 text-gold-500 flex-shrink-0" />
            <span className="text-sm font-medium line-clamp-1">{location}</span>
          </div>
        )}

        <div className="mt-auto grid grid-cols-3 gap-4 border-t border-gray-100 pt-5">
          {(property.suite_amount || property.room_amount) > 0 && (
            <div className="flex items-center justify-center gap-2" title="Dormitorios">
              <Bed className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-bold text-gray-700 font-numeric">{property.suite_amount || property.room_amount}</span>
            </div>
          )}
          {property.bathroom_amount != null && property.bathroom_amount > 0 && (
            <div className="flex items-center justify-center gap-2 border-l border-r border-gray-100" title="Baños">
              <Bath className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-bold text-gray-700 font-numeric">{property.bathroom_amount}</span>
            </div>
          )}
          {area != null && area > 0 && (
            <div className="flex items-center justify-center gap-2" title="Superficie">
              <Maximize className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-bold text-gray-700 font-numeric">
                {area} <span className="text-xs font-normal">m²</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function FeaturedProperties() {
  let properties: TokkoProperty[] = [];

  try {
    properties = await getFeaturedProperties(6);
  } catch {
    // Silently fail — section will be hidden
  }

  if (properties.length === 0) return null;

  return (
    <section id="propiedades" className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 px-4">
          <h2 className="text-sm font-bold tracking-widest text-gold-500 uppercase mb-3">Encontrá Tu Lugar</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-navy-800 font-serif mb-6">Propiedades Destacadas</h3>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Descubrí nuestra selección de propiedades exclusivas en las mejores zonas de Roldán, Funes y Rosario.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/propiedades"
            className="px-8 py-4 bg-white border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white rounded-lg font-bold transition-all shadow-md hover:shadow-xl transform hover:-translate-y-1 inline-block"
          >
            Ver Todo Nuestro Catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}
