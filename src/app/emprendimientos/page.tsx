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

export const revalidate = 21600

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
                      <ShareCardButton path={`/emprendimientos/${slug}`} />
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
                className="group bg-brand-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-800 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative h-64 bg-gray-900 overflow-hidden">
                  <Image
                    src="https://static.tokkobroker.com/pictures/7875941_1024376343499529783409226669565094537099892096586113157951486578364028507bf60f4d86ec7a1f7e9b5733219979.jpg"
                    alt="Hausing - Casas de diseño en Funes"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-70"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-green-500 text-black uppercase tracking-wide">
                      Casas Premium
                    </span>
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-white/10 text-white uppercase tracking-wide backdrop-blur-sm border border-white/20">
                      Funes
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                        <span className="text-black font-black text-xs">H</span>
                      </div>
                      <span className="text-white font-bold text-sm tracking-widest">HAUSING</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col bg-brand-800">
                  <h2 className="text-2xl font-black text-white mb-2 group-hover:text-green-400 transition-colors">
                    Hausing — Casas de Diseño
                  </h2>
                  <p className="text-green-500 font-semibold text-sm mb-2">Barrios cerrados premium · Funes</p>
                  <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-3">
                    <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Vida, Cadaques, Don Mateo, Kentucky · Funes</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    6 casas exclusivas en los mejores barrios cerrados de Funes. Diseño contemporáneo, pileta, 3 y 4 dormitorios. Financiación en dólares.
                  </p>
                  <div className="flex items-center gap-1.5 text-sm text-green-400 bg-green-500/10 px-3 py-2 rounded-lg mb-4 border border-green-500/20">
                    <Banknote className="w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold">6 propiedades disponibles desde USD 380K</span>
                  </div>
                  <div className="mt-auto pt-2">
                    <span className="inline-flex items-center gap-1.5 text-green-400 font-bold text-sm group-hover:gap-2.5 transition-all">
                      Ver propiedades Hausing <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Card Aurea */}
              <div className="group bg-gradient-to-br from-amber-900 to-amber-950 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-amber-800/50 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                <div className="relative h-64 bg-amber-950 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-transparent to-amber-900/40" />
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-400/30">
                      <span className="text-amber-400 font-black text-2xl font-poppins">A</span>
                    </div>
                    <span className="text-amber-300 font-bold text-xl tracking-widest">AUREA</span>
                  </div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-amber-500 text-amber-950 uppercase tracking-wide">
                      Pr&oacute;ximamente
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-2xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors">
                    Aurea &mdash; Desarrollo Residencial Premium
                  </h2>
                  <p className="text-amber-400/80 font-semibold text-sm mb-2">Nuevo emprendimiento</p>
                  <div className="flex items-center gap-1.5 text-amber-200/50 text-sm mb-3">
                    <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Zona oeste &middot; Gran Rosario</span>
                  </div>
                  <p className="text-amber-200/40 text-sm leading-relaxed mb-4">
                    Desarrollo residencial premium con dise&ntilde;o contempor&aacute;neo, espacios verdes y amenities de primer nivel. Pr&oacute;ximamente m&aacute;s informaci&oacute;n.
                  </p>
                  <div className="mt-auto pt-2">
                    <a
                      href="https://wa.me/5493412101694?text=Hola!%20Quiero%20info%20sobre%20Aurea"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-amber-400 font-bold text-sm group-hover:gap-2.5 transition-all"
                    >
                      Consultar <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
