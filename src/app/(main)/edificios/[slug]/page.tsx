// Página única de un edificio: agrupa las unidades que compartimos en la misma
// dirección. Las unidades siguen publicadas individualmente (para que aparezcan
// al filtrar por dormitorios o precio); esta página las muestra juntas.

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { getProperties, sanitizeProperty } from '@/lib/tokko'
import {
  detectarEdificios,
  desdeTexto,
  formatPrice,
  generatePropertySlug,
  getMainPhoto,
  type Edificio,
} from '@/lib/edificios'
import {
  getRoofedArea,
  getTotalSurface,
  getOperationType,
  operationBadgeColor,
  isMonoambiente,
} from '@/lib/tokko'

export const revalidate = 3600

const BASE = 'https://siinmobiliaria.com'
const R = "'Raleway', system-ui, sans-serif"
const GREEN = '#1A5C38'

async function cargarEdificios(): Promise<Edificio[]> {
  try {
    const data = await getProperties()
    return detectarEdificios((data.objects ?? []).map(sanitizeProperty))
  } catch {
    return []
  }
}

export async function generateStaticParams() {
  const edificios = await cargarEdificios()
  return edificios.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const edificio = (await cargarEdificios()).find((e) => e.slug === params.slug)
  if (!edificio) return { title: 'Edificio | SI INMOBILIARIA' }
  const desde = desdeTexto(edificio)
  const title = `${edificio.nombre} — ${edificio.unidades.length} departamentos en venta`
  const description = `${edificio.unidades.length} unidades disponibles en ${edificio.direccion}${
    desde ? `, desde ${desde}` : ''
  }. Fotos, plantas y valores actualizados. SI INMOBILIARIA.`
  const url = `${BASE}/edificios/${edificio.slug}`
  return {
    title: `${title} | SI INMOBILIARIA`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'SI INMOBILIARIA',
      images: [edificio.foto ?? '/og-image.jpg'],
      type: 'website',
    },
  }
}

export default async function EdificioPage({ params }: { params: { slug: string } }) {
  const edificios = await cargarEdificios()
  const edificio = edificios.find((e) => e.slug === params.slug)
  if (!edificio) notFound()

  const desde = desdeTexto(edificio)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    name: edificio.nombre,
    address: { '@type': 'PostalAddress', streetAddress: edificio.direccion, addressLocality: edificio.ciudad },
    numberOfAvailableAccommodationUnits: edificio.unidades.length,
    url: `${BASE}/edificios/${edificio.slug}`,
    ...(edificio.foto ? { image: edificio.foto } : {}),
    ...(edificio.lat && edificio.lon
      ? { geo: { '@type': 'GeoCoordinates', latitude: edificio.lat, longitude: edificio.lon } }
      : {}),
  }

  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-[1100px] px-5 pb-14">
        {/* HERO */}
        <div className="pt-10">
          <span
            className="inline-block rounded-full px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wider"
            style={{ background: '#e7f2eb', color: GREEN }}
          >
            Edificio · {edificio.unidades.length} unidades disponibles
          </span>
          <h1
            className="mt-3 text-[clamp(28px,4.6vw,42px)] font-extrabold leading-[1.1] tracking-tight"
            style={{ fontFamily: R }}
          >
            {edificio.nombre}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-[15px] text-[#6e6e73]">
            <MapPin className="h-4 w-4" aria-hidden />
            {edificio.direccion}
          </p>
          {edificio.descripcion && (
            <p className="mt-3 max-w-[720px] text-[15.5px] leading-[1.7] text-[#374151]">
              {edificio.descripcion}
            </p>
          )}
          {desde && (
            <p className="mt-4 text-[15px]">
              <span className="text-[#6e6e73]">Unidades desde </span>
              <b className="font-numeric text-[20px]" style={{ color: GREEN }}>{desde}</b>
            </p>
          )}
        </div>

        {/* UNIDADES */}
        <section className="pt-9">
          <h2 className="mb-4 text-[20px] font-extrabold" style={{ fontFamily: R }}>
            Unidades disponibles
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {edificio.unidades.map((u) => {
              const foto = getMainPhoto(u)
              const slug = generatePropertySlug(u)
              const op = getOperationType(u)
              const cubierta = getRoofedArea(u) ?? getTotalSurface(u)
              const mono = isMonoambiente(u)
              const dorm = u.suite_amount || u.room_amount || 0
              return (
                <Link
                  key={u.id}
                  href={`/propiedades/${slug}`}
                  className="group overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-[190px] bg-gray-100">
                    {foto ? (
                      <Image
                        src={foto}
                        alt={u.publication_title || edificio.nombre}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-300">
                        Sin foto
                      </div>
                    )}
                    {op && (
                      <span
                        className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                        style={{ background: operationBadgeColor(op) }}
                      >
                        {op}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-numeric text-[19px] font-black text-gray-900">
                      {formatPrice(u)}
                    </p>
                    <p className="mt-1 text-[13.5px] text-[#6e6e73]">
                      {[
                        mono ? 'Monoambiente' : dorm > 0 ? `${dorm} dorm` : null,
                        u.bathroom_amount > 0
                          ? `${u.bathroom_amount} baño${u.bathroom_amount > 1 ? 's' : ''}`
                          : null,
                        cubierta ? `${cubierta} m²` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <p className="mt-1.5 truncate text-[13px] text-gray-400">
                      {u.publication_title}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-10 rounded-2xl px-6 py-8 text-center" style={{ background: GREEN }}>
          <h2 className="text-[22px] font-extrabold text-white" style={{ fontFamily: R }}>
            ¿Querés visitar alguna de estas unidades?
          </h2>
          <p className="mx-auto mt-2 max-w-[520px] text-[15px] text-white/85">
            Coordinamos la visita cuando te quede cómodo y te contamos todo del edificio: expensas,
            reglamento y lo que no figura en el aviso.
          </p>
          <a
            href={`https://wa.me/5493412101694?text=${encodeURIComponent(
              `Hola! Me interesan los departamentos de ${edificio.nombre} (${edificio.direccion}).`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-[15px] font-bold"
            style={{ color: GREEN }}
          >
            Consultar por WhatsApp
          </a>
        </section>

        {/* OTROS EDIFICIOS */}
        {edificios.length > 1 && (
          <section className="pt-10">
            <h2 className="mb-3 text-[17px] font-extrabold" style={{ fontFamily: R }}>
              Otros edificios con varias unidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {edificios
                .filter((e) => e.slug !== edificio.slug)
                .slice(0, 8)
                .map((e) => (
                  <Link
                    key={e.slug}
                    href={`/edificios/${e.slug}`}
                    className="rounded-[10px] bg-[#f5f5f7] px-3.5 py-2 text-[13.5px] font-semibold text-[#374151] hover:bg-[#e7f2eb] hover:text-[#1A5C38]"
                  >
                    {e.nombre} ({e.unidades.length})
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
