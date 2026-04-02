import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Building2, Banknote, ArrowRight } from 'lucide-react'
import ShareCardButton from '@/components/ShareCardButton'
import {
  getDevelopments,
  generateDevSlug,
  getDevMainPhoto,
  getConstructionStatus,
  translateDevType,
} from '@/lib/developments'
import { getAllClientes } from '@/lib/clientes'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Emprendimientos | SI Inmobiliaria',
  description:
    'Emprendimientos inmobiliarios en Roldán, Funes y Rosario. Condominios, barrios abiertos y cerrados. SI Inmobiliaria — desde 1983.',
}

export default async function EmprendimientosPage() {
  const [developments, clientes] = await Promise.all([
    getDevelopments().catch(() => []),
    getAllClientes().catch(() => []),
  ])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="relative h-[420px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/9338940/pexels-photo-9338940.jpeg?auto=compress&cs=tinysrgb&w=1400"
          alt="Emprendimientos en construcción"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative z-10 text-white text-center px-4 max-w-4xl mx-auto">
          <p className="text-green-400 text-sm font-bold tracking-widest uppercase mb-4">
            Inversión y Desarrollo
          </p>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight drop-shadow-lg">
            Emprendimientos
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Conocé los desarrollos inmobiliarios que comercializamos en Roldán, Funes y Rosario.
            Barrios, condominios y proyectos con financiación.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {developments.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay emprendimientos disponibles actualmente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {developments.map(dev => {
                const photo = getDevMainPhoto(dev)
                const slug = generateDevSlug(dev)
                const status = getConstructionStatus(dev.construction_status)
                const typeName = translateDevType(dev.type?.name || '')
                const locationName = dev.location?.name || dev.fake_address || dev.address

                return (
                  <div key={dev.id} className="relative">
                    <div className="absolute top-4 right-4 z-10">
                      <ShareCardButton slug={slug} title={dev.name} path={`/emprendimientos/${slug}`} />
                    </div>
                  <Link
                    href={`/emprendimientos/${slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={dev.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-brand-600/90 text-white uppercase tracking-wide backdrop-blur-sm">
                          {typeName}
                        </span>
                        <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-white/90 text-brand-700 uppercase tracking-wide backdrop-blur-sm">
                          {status}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                        {dev.name}
                      </h2>
                      {dev.publication_title && dev.publication_title !== dev.name && (
                        <p className="text-brand-600 font-semibold text-sm mb-2">{dev.publication_title}</p>
                      )}
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                        <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                        <span>{locationName}</span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                        {dev.description?.replace(/<[^>]*>/g, '').slice(0, 200)}...
                      </p>
                      {dev.financing_details && (
                        <div className="flex items-center gap-1.5 text-sm text-brand-700 bg-brand-50 px-3 py-2 rounded-lg mb-4">
                          <Banknote className="w-4 h-4 flex-shrink-0" />
                          <span className="font-semibold">{dev.financing_details}</span>
                        </div>
                      )}
                      <div className="mt-auto pt-2">
                        <span className="inline-flex items-center gap-1.5 text-brand-600 font-bold text-sm group-hover:gap-2.5 transition-all">
                          Ver emprendimiento <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                  </div>
                )
              })}
              {/* Card Hausing */}
              <Link
                href="/hausing"
                className="group bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-800 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative h-64 bg-gray-900 overflow-hidden">
                  <Image
                    src="/hausing-portada.jpg"
                    alt="Hausing - Casas de diseño en Funes"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-[#1A5C38] text-white uppercase tracking-wide">
                      Casas Premium
                    </span>
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-white/10 text-white uppercase tracking-wide backdrop-blur-sm border border-white/20">
                      Funes
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-2xl font-black text-white mb-2 group-hover:text-[#4ADE80] transition-colors">
                    Hausing — Casas de Diseño
                  </h2>
                  <p className="text-[#4ADE80] font-semibold text-sm mb-2">Barrios cerrados premium · Funes</p>
                  <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-3">
                    <MapPin className="w-4 h-4 text-[#1A5C38] flex-shrink-0" />
                    <span>Vida, Cadaques, Don Mateo, Kentucky · Funes</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Casas exclusivas en los mejores barrios cerrados de Funes. Diseño contemporáneo, pileta, 3 y 4 dormitorios. Financiación en dólares.
                  </p>
                  <div className="mt-auto pt-2">
                    <span className="inline-flex items-center gap-1.5 text-[#4ADE80] font-bold text-sm group-hover:gap-2.5 transition-all">
                      Ver propiedades Hausing <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Card Aurea */}
              <Link
                href="/propiedades/7296792-lotes-en-venta-desde-500m2-barrio-privado-aurea-en-roldan"
                className="group bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-[#C9A84C]/20 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative h-64 bg-gray-900 overflow-hidden">
                  <Image
                    src="/aurea-portada.jpg"
                    alt="Aurea - Barrio Privado en Roldán"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-[#C9A84C] text-black uppercase tracking-wide">
                      Lotes desde 500m²
                    </span>
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-white/10 text-white uppercase tracking-wide backdrop-blur-sm border border-white/20">
                      Roldán
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-2xl font-black text-white mb-2 group-hover:text-[#C9A84C] transition-colors">
                    Aurea — Barrio Privado
                  </h2>
                  <p className="text-[#C9A84C] font-semibold text-sm mb-2">Desarrollo residencial premium · Roldán</p>
                  <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-3">
                    <MapPin className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                    <span>Roldán, Santa Fe · Acceso directo por autopista</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Lotes desde 500m² en barrio privado con seguridad 24hs, club house, pileta y espacios verdes. Financiación disponible.
                  </p>
                  <div className="mt-auto pt-2">
                    <span className="inline-flex items-center gap-1.5 text-[#C9A84C] font-bold text-sm group-hover:gap-2.5 transition-all">
                      Ver lotes disponibles <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Manual clients from Redis */}
              {clientes.map(c => (
                <Link
                  key={c.slug}
                  href={`/emprendimientos/${c.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative h-64 bg-[#1A5C38]/5 overflow-hidden flex items-center justify-center">
                    <div className="w-16 h-16 bg-[#1A5C38]/10 rounded-2xl flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-[#1A5C38]" />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-xl font-black text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
                      {c.name}
                    </h2>
                    {c.description && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{c.description}</p>
                    )}
                    <div className="mt-auto pt-2">
                      <span className="inline-flex items-center gap-1.5 text-brand-600 font-bold text-sm group-hover:gap-2.5 transition-all">
                        Ver propiedades <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
