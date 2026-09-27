import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Bed, Bath, CalendarDays, Clock } from 'lucide-react'
import { generatePropertySlug, getMainPhoto, translatePropertyType, tituloVisible } from '@/lib/tokko'
import { cargarTemporarios, type Temporario } from '@/lib/temporarios-data'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'

export const revalidate = 3600

const URL_SECCION = 'https://siinmobiliaria.com/alquileres-temporarios'
// Alquileres → número de alquiler (contactoDelAviso de HILO, sin captador).
const WHATSAPP_ALQUILER = 'https://wa.me/5493413415159?text=' + encodeURIComponent('Hola! Quiero consultar por un alquiler temporario')

export const metadata: Metadata = {
  title: 'Alquileres Temporarios en Funes, Roldán y Rosario | Por quincena o por mes',
  description:
    'Casas y departamentos en alquiler temporario. Valor por quincena o por mes, depósito, estadía mínima, horarios y qué incluye, todo a la vista. SI INMOBILIARIA.',
  alternates: { canonical: URL_SECCION },
  openGraph: {
    images: ['/og-image.jpg'],
    title: 'Alquileres Temporarios | SI INMOBILIARIA',
    description: 'Valor por quincena o por mes y todas las condiciones a la vista.',
    url: URL_SECCION,
    type: 'website',
    siteName: 'SI INMOBILIARIA',
  },
}

function TarjetaTemporario({ property, condiciones: c }: Temporario) {
  const foto = getMainPhoto(property)
  const titulo = tituloVisible(property) || property.address
  const ubicacion = property.location?.short_location || property.location?.name || ''
  const tipo = translatePropertyType(property.type?.name)
  const dormitorios = property.suite_amount || 0
  const banos = property.bathroom_amount || 0

  return (
    <li className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
      <Link href={`/propiedades/${generatePropertySlug(property)}?operacion=temporario`} className="flex flex-col h-full">
        <div className="relative h-48 bg-gray-100">
          {foto && (
            <Image src={foto} alt={titulo} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          )}
          <span className="absolute top-3 left-3 px-3 py-1 bg-[#DC2626] text-white text-[11px] font-bold rounded-full uppercase tracking-wide">
            Temporario
          </span>
        </div>
        <div className="p-4 flex flex-col gap-3 flex-1">
          <div>
            <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">{titulo}</h3>
            {ubicacion && (
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden /> {ubicacion}
              </p>
            )}
          </div>

          {c.precios.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {c.precios.map((p) => (
                <div key={p.periodo} className="rounded-lg bg-gray-50 px-3 py-2">
                  <span className="block text-[11px] uppercase tracking-wide text-gray-500">Por {p.periodo}</span>
                  <span className="font-extrabold text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{p.texto}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="font-bold text-[#1A5C38]">Consultar valor</span>
          )}

          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-gray-600">
            {tipo && <li>{tipo}</li>}
            {dormitorios > 0 && <li className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" aria-hidden /> {dormitorios} dorm.</li>}
            {banos > 0 && <li className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" aria-hidden /> {banos} baño{banos > 1 ? 's' : ''}</li>}
            {c.estadiaMinima && <li className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" aria-hidden /> Mínimo {c.estadiaMinima}</li>}
            {c.disponible && <li className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" aria-hidden /> {c.disponible}</li>}
          </ul>

          {c.incluye.length > 0 && (
            <p className="mt-auto text-[13px] text-gray-600">
              <span className="font-semibold text-gray-900">Incluye:</span> {c.incluye.slice(0, 5).join(' · ')}
              {c.incluye.length > 5 ? ' …' : ''}
            </p>
          )}
        </div>
      </Link>
    </li>
  )
}

export default async function AlquileresTemporariosPage() {
  const temporarios = await cargarTemporarios()

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbJsonLd
        items={[
          { name: 'Inicio', url: 'https://siinmobiliaria.com' },
          { name: 'Alquileres temporarios', url: URL_SECCION },
        ]}
      />

      <section className="bg-brand-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-200 text-sm font-bold tracking-widest uppercase mb-4">Alquileres temporarios</p>
          <h1 className="text-4xl md:text-5xl font-black mb-5 leading-tight">Por quincena o por mes</h1>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto">
            Cada propiedad muestra su valor por quincena y por mes, y todas las condiciones a la vista: depósito, forma de
            pago, estadía mínima, horarios de entrada y salida, y qué incluye.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 mb-8 text-center">
            {temporarios.length > 0
              ? `${temporarios.length} propiedad${temporarios.length !== 1 ? 'es' : ''} en alquiler temporario`
              : 'Propiedades en alquiler temporario'}
          </h2>
          {temporarios.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {temporarios.map((t) => (
                <TarjetaTemporario key={t.property.id} {...t} />
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">En este momento no hay alquileres temporarios publicados.</p>
              <Link href="/propiedades" className="text-brand-600 font-semibold hover:text-brand-700">
                Ver todas las propiedades →
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-14 px-4 bg-white text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-3">¿Buscás fechas o una zona en particular?</h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">Escribinos y te pasamos disponibilidad y condiciones al momento.</p>
        <a
          href={WHATSAPP_ALQUILER}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
        >
          Consultar por WhatsApp
        </a>
      </section>
    </div>
  )
}
