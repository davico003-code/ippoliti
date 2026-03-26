import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bed, Bath, Maximize, Home, Tag, MessageCircle } from 'lucide-react';
import {
  getPropertyById,
  getAllPhotos,
  formatPrice,
  getOperationType,
  getRoofedArea,
  getTotalSurface,
  formatLocation,
  getMainPhoto,
  translatePropertyType,
  generatePropertySlug,
  type TokkoProperty,
} from '@/lib/tokko';

export const metadata: Metadata = {
  title: 'Comparar Propiedades | SI Inmobiliaria',
  description: 'Compará propiedades seleccionadas lado a lado.',
};

interface Props {
  searchParams: { ids?: string };
}

export default async function CompararPage({ searchParams }: Props) {
  const idsParam = searchParams.ids || '';
  const ids = idsParam
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n) && n > 0);

  if (ids.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sin propiedades para comparar</h1>
        <p className="text-gray-500 mb-8">Seleccioná propiedades similares desde la ficha de una propiedad para compararlas.</p>
        <Link href="/propiedades" className="px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors">
          Ver propiedades
        </Link>
      </div>
    );
  }

  const properties: TokkoProperty[] = [];
  for (const id of ids.slice(0, 10)) {
    try {
      const p = await getPropertyById(id);
      if (p) properties.push(p);
    } catch {}
  }

  if (properties.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">No se encontraron propiedades</h1>
        <p className="text-gray-500 mb-8">Las propiedades solicitadas no están disponibles.</p>
        <Link href="/propiedades" className="px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors">
          Ver propiedades
        </Link>
      </div>
    );
  }

  const whatsappText = encodeURIComponent(
    `Hola! Me interesan estas propiedades:\n${properties.map(p => `- ${p.publication_title || p.address}`).join('\n')}\nhttps://siinmobiliaria.com/comparar?ids=${ids.join(',')}`
  );
  const whatsappUrl = `https://wa.me/5493412101694?text=${whatsappText}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-brand-600 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/propiedades" className="hover:text-brand-600 transition-colors">Propiedades</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Comparar</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900">Comparar Propiedades</h1>
          <p className="text-gray-500 mt-2">{properties.length} propiedad{properties.length !== 1 ? 'es' : ''} seleccionada{properties.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Property cards */}
        <div className={`grid gap-6 ${properties.length === 1 ? 'grid-cols-1 max-w-md' : properties.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {properties.map(property => {
            const photo = getMainPhoto(property);
            const photos = getAllPhotos(property);
            const price = formatPrice(property);
            const operation = getOperationType(property);
            const area = getTotalSurface(property);
            const roofedArea = getRoofedArea(property);
            const location = formatLocation(property);
            const typeName = translatePropertyType(property.type?.name);
            const slug = generatePropertySlug(property);

            return (
              <div key={property.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Photo */}
                <Link href={`/propiedades/${slug}`} className="block relative h-56 bg-gray-200">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={property.publication_title || property.address}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">Sin foto</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {operation && (
                    <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full bg-brand-600 text-white uppercase tracking-wide">
                      {operation}
                    </span>
                  )}
                  {photos.length > 1 && (
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded bg-black/50 text-white backdrop-blur-sm font-numeric">
                      {photos.length} fotos
                    </span>
                  )}
                </Link>

                {/* Content */}
                <div className="p-5">
                  <Link href={`/propiedades/${slug}`}>
                    <h2 className="text-lg font-black text-gray-900 leading-tight hover:text-brand-600 transition-colors line-clamp-2">
                      {property.publication_title || property.address}
                    </h2>
                  </Link>

                  <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{property.real_address || property.fake_address || property.address}{location ? `, ${location}` : ''}</span>
                  </div>

                  <p className="text-brand-600 font-black text-2xl mt-3 font-numeric">{price}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {area != null && area > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Maximize className="w-4 h-4 text-brand-600" />
                        <span className="font-numeric">{area} m²</span>
                      </div>
                    )}
                    {roofedArea != null && roofedArea > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Home className="w-4 h-4 text-brand-600" />
                        <span className="font-numeric">{roofedArea} m² cub.</span>
                      </div>
                    )}
                    {property.room_amount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bed className="w-4 h-4 text-brand-600" />
                        <span className="font-numeric">{property.room_amount} dorm.</span>
                      </div>
                    )}
                    {property.bathroom_amount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bath className="w-4 h-4 text-brand-600" />
                        <span className="font-numeric">{property.bathroom_amount} baño{property.bathroom_amount > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {typeName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Tag className="w-4 h-4 text-brand-600" />
                        <span>{typeName}</span>
                      </div>
                    )}
                    {property.parking_lot_amount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-brand-600 text-xs font-bold">P</span>
                        <span className="font-numeric">{property.parking_lot_amount} cochera{property.parking_lot_amount > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {property.tags && property.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {property.tags.slice(0, 6).map(tag => (
                        <span key={tag.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-medium">
                          {tag.name}
                        </span>
                      ))}
                      {property.tags.length > 6 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-[11px] font-medium">
                          +{property.tags.length - 6}
                        </span>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    href={`/propiedades/${slug}`}
                    className="mt-4 w-full flex items-center justify-center px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors"
                  >
                    Ver propiedad
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Shared WhatsApp CTA */}
        <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">¿Te interesan estas propiedades?</h2>
            <p className="text-gray-500 text-sm mt-1">Consultanos por todas las propiedades seleccionadas de una sola vez.</p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <MessageCircle className="w-5 h-5" />
            Consultar por WhatsApp
          </a>
        </div>

        {/* Back link */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <Link href="/propiedades" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold transition-colors text-lg">
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
