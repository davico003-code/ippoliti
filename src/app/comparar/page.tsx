import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bed, Bath, Maximize, Car, MessageCircle, ArrowLeft } from 'lucide-react';
import {
  getPropertyById,
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
  title: 'Selección de Propiedades | SI Inmobiliaria',
  description: 'Propiedades seleccionadas especialmente para vos por SI Inmobiliaria.',
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
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="bg-[#1A5C38] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SI Inmobiliaria" className="h-10 w-auto brightness-0 invert" />
            </Link>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">Sin propiedades seleccionadas</h1>
          <p className="text-gray-500 mb-8 text-center max-w-md">Seleccion&aacute; propiedades desde la ficha de una propiedad para armar tu comparaci&oacute;n.</p>
          <Link href="/propiedades" className="px-6 py-3 bg-[#1A5C38] text-white rounded-xl font-bold hover:bg-[#15472c] transition-colors font-poppins">
            Ver propiedades
          </Link>
        </div>
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
      <div className="min-h-screen bg-white flex flex-col">
        <header className="bg-[#1A5C38] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SI Inmobiliaria" className="h-10 w-auto brightness-0 invert" />
            </Link>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">No se encontraron propiedades</h1>
          <p className="text-gray-500 mb-8">Las propiedades solicitadas no est&aacute;n disponibles.</p>
          <Link href="/propiedades" className="px-6 py-3 bg-[#1A5C38] text-white rounded-xl font-bold hover:bg-[#15472c] transition-colors font-poppins">
            Ver propiedades
          </Link>
        </div>
      </div>
    );
  }

  const whatsappLines = properties.map(p => {
    const title = p.publication_title || p.address;
    const price = formatPrice(p);
    return `- ${title} (${price})`;
  });
  const whatsappText = encodeURIComponent(
    `Hola! Me interesan estas propiedades:\n\n${whatsappLines.join('\n')}\n\nLink: https://siinmobiliaria.com/comparar?ids=${ids.join(',')}`
  );
  const whatsappUrl = `https://wa.me/5493412101694?text=${whatsappText}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <header className="bg-[#1A5C38] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SI Inmobiliaria" className="h-10 md:h-12 w-auto brightness-0 invert" />
            </Link>
            <Link
              href="/propiedades"
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Ver todas
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-black font-poppins leading-tight">
            Selecci&oacute;n de propiedades
          </h1>
          <p className="text-white/70 mt-2 text-lg font-poppins">
            {properties.length} propiedad{properties.length !== 1 ? 'es' : ''} seleccionada{properties.length !== 1 ? 's' : ''} para vos
          </p>
        </div>
      </header>

      {/* Property cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid gap-6 md:grid-cols-2">
          {properties.map(property => {
            const photo = getMainPhoto(property);
            const price = formatPrice(property);
            const operation = getOperationType(property);
            const area = getTotalSurface(property);
            const roofedArea = getRoofedArea(property);
            const location = formatLocation(property);
            const typeName = translatePropertyType(property.type?.name);
            const slug = generatePropertySlug(property);
            const address = property.real_address || property.fake_address || property.address;

            return (
              <div key={property.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Photo — tall */}
                <Link href={`/propiedades/${slug}`} className="block relative h-64 md:h-72 bg-gray-200 overflow-hidden">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={property.publication_title || property.address}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 font-poppins">Sin foto</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {operation && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#1A5C38] text-white uppercase tracking-wide font-poppins shadow-md">
                        {operation}
                      </span>
                    )}
                    {typeName && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/90 text-[#1A5C38] uppercase tracking-wide font-poppins shadow-md">
                        {typeName}
                      </span>
                    )}
                  </div>

                  {/* Price overlay */}
                  <div className="absolute bottom-4 left-4">
                    <p className="text-white font-black text-2xl md:text-3xl font-numeric drop-shadow-lg">
                      {price}
                    </p>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6">
                  <Link href={`/propiedades/${slug}`}>
                    <h2 className="text-xl font-black text-gray-900 leading-tight hover:text-[#1A5C38] transition-colors line-clamp-2 font-poppins">
                      {property.publication_title || property.address}
                    </h2>
                  </Link>

                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-2">
                    <MapPin className="w-4 h-4 text-[#1A5C38] flex-shrink-0" />
                    <span className="truncate">{address}{location ? `, ${location}` : ''}</span>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                    {(property.suite_amount || property.room_amount) > 0 && (
                      <div className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl">
                        <Bed className="w-5 h-5 text-[#1A5C38]" />
                        <span className="text-lg font-black text-gray-900 font-numeric">{property.suite_amount || property.room_amount}</span>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide font-poppins">Dorm.</span>
                      </div>
                    )}
                    {property.bathroom_amount > 0 && (
                      <div className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl">
                        <Bath className="w-5 h-5 text-[#1A5C38]" />
                        <span className="text-lg font-black text-gray-900 font-numeric">{property.bathroom_amount}</span>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide font-poppins">Ba&ntilde;o{property.bathroom_amount > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {area != null && area > 0 && (
                      <div className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl">
                        <Maximize className="w-5 h-5 text-[#1A5C38]" />
                        <span className="text-lg font-black text-gray-900 font-numeric">{area}</span>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide font-poppins">m&sup2; tot.</span>
                      </div>
                    )}
                    {roofedArea != null && roofedArea > 0 && (
                      <div className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl">
                        <Maximize className="w-5 h-5 text-[#1A5C38]" />
                        <span className="text-lg font-black text-gray-900 font-numeric">{roofedArea}</span>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide font-poppins">m&sup2; cub.</span>
                      </div>
                    )}
                    {property.parking_lot_amount > 0 && (
                      <div className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl">
                        <Car className="w-5 h-5 text-[#1A5C38]" />
                        <span className="text-lg font-black text-gray-900 font-numeric">{property.parking_lot_amount}</span>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide font-poppins">Cochera{property.parking_lot_amount > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* View property link */}
                  <Link
                    href={`/propiedades/${slug}`}
                    className="mt-5 w-full flex items-center justify-center px-4 py-3 border-2 border-[#1A5C38] text-[#1A5C38] rounded-xl text-sm font-bold hover:bg-[#1A5C38] hover:text-white transition-colors font-poppins"
                  >
                    Ver ficha completa
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA section */}
        <div className="mt-12 mb-16">
          <div className="bg-[#1A5C38] rounded-2xl p-8 md:p-10 text-center shadow-lg">
            <h2 className="text-2xl md:text-3xl font-black text-white font-poppins mb-3">
              &iquest;Te interesan estas propiedades?
            </h2>
            <p className="text-white/70 mb-8 text-lg font-poppins max-w-lg mx-auto">
              Consult&aacute; por todas de una sola vez. Te respondemos a la brevedad.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#1A5C38] rounded-2xl font-black text-lg hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg font-poppins"
            >
              <MessageCircle className="w-6 h-6" />
              Consultar por todas estas propiedades
            </a>
            <p className="text-white/50 text-sm mt-4 font-poppins">
              SI Inmobiliaria &middot; Desde 1983
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
