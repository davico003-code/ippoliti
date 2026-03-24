import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Building2, Banknote, ArrowRight } from 'lucide-react'
import {
  getDevelopments,
  generateDevSlug,
  getDevMainPhoto,
  getConstructionStatus,
  translateDevType,
} from '@/lib/developments'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Emprendimientos | SI Inmobiliaria',
  description:
    'Emprendimientos inmobiliarios en Roldán, Funes y Rosario. Condominios, barrios abiertos y cerrados. SI Inmobiliaria — desde 1983.',
}

export default async function EmprendimientosPage() {
  const developments = await getDevelopments().catch(() => [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-brand-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-200 text-sm font-bold tracking-widest uppercase mb-4">
            Inversión y Desarrollo
          </p>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Emprendimientos
          </h1>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto">
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
                  <Link
                    key={dev.id}
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
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
