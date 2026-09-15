import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { normalizarTitulo } from '@/lib/titulo'
import {
  getIdFromSlug,
  getPropertyById,
  sanitizeProperty,
  getMainPhoto,
  formatPrice,
  getTotalSurface,
  buildPropertyWhatsappUrl,
  getProducerName,
  type TokkoProperty,
} from '@/lib/tokko'
import ConsultaCalificadaForm from '@/components/consulta/ConsultaCalificadaForm'

/**
 * Landing de CONSULTA de una propiedad (15-sep-2026): el destino de la pauta de
 * prueba "formulario vs WhatsApp directo". Misma resolución que la ficha
 * (/propiedades/[slug]) pero con una sola acción: el formulario calificador.
 * El WhatsApp del captador queda como camino secundario. No se indexa: es una
 * página de aterrizaje de anuncios, no contenido.
 */

export const revalidate = 3600
export const dynamicParams = true
export async function generateStaticParams() {
  return []
}

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const property = await getPropertyById(getIdFromSlug(params.slug))
    const titulo = normalizarTitulo(property.publication_title) || property.address || 'Propiedad'
    return { title: `Consultar · ${titulo} | SI INMOBILIARIA`, robots: { index: false, follow: false } }
  } catch {
    return { title: 'Consultar | SI INMOBILIARIA', robots: { index: false, follow: false } }
  }
}

export default async function ConsultaPage({ params }: Props) {
  const id = getIdFromSlug(params.slug)
  if (!Number.isFinite(id)) notFound()
  let property: TokkoProperty
  try {
    property = sanitizeProperty(await getPropertyById(id))
  } catch {
    notFound()
  }

  const titulo = normalizarTitulo(property.publication_title) || property.address || 'Propiedad'
  const foto = getMainPhoto(property)
  const precio = formatPrice(property)
  const superficie = getTotalSurface(property)
  const whatsappUrl = buildPropertyWhatsappUrl(property, params.slug)
  const agente = getProducerName(property)
  // El feed de Hilo trae el uuid de la propiedad; con él Hilo la resuelve aunque
  // no tenga tokko_id (las cargadas directo en Hilo).
  const hiloId = (property as TokkoProperty & { hilo_id?: string | null }).hilo_id ?? null

  const datos = [
    property.suite_amount ? `${property.suite_amount} dorm.` : property.room_amount ? `${property.room_amount} amb.` : null,
    property.bathroom_amount ? `${property.bathroom_amount} baños` : null,
    superficie ? `${Math.round(superficie)} m²` : null,
  ].filter(Boolean) as string[]

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {foto ? (
          <div className="relative aspect-[4/3] w-full bg-neutral-100">
            <Image src={foto} alt={titulo} fill sizes="(max-width: 672px) 100vw, 672px" className="object-cover" priority />
          </div>
        ) : null}
        <div className="p-5 sm:p-6">
          <p className="text-2xl font-bold tracking-tight text-neutral-900">{precio}</p>
          <h1 className="mt-1 text-lg font-semibold leading-snug text-neutral-800">{titulo}</h1>
          {datos.length ? <p className="mt-1 text-[15px] text-neutral-600">{datos.join(' · ')}</p> : null}
        </div>
      </article>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-neutral-900">Te escribimos por esta propiedad</h2>
        <p className="mt-1 text-[15px] text-neutral-600">Dos datos más y {agente} te contacta por WhatsApp con las condiciones.</p>
        <div className="mt-5">
          <ConsultaCalificadaForm
            propertyId={id}
            hiloPropertyId={hiloId}
            propertyTitle={titulo}
            propertyPrice={precio}
            whatsappUrl={whatsappUrl}
            agente={agente}
          />
        </div>
      </section>

      <p className="mt-5 text-center text-[14px] text-neutral-600">
        ¿Preferís escribir directo?{' '}
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-emerald-700 underline">
          <MessageCircle className="size-4" aria-hidden /> WhatsApp de {agente}
        </a>
      </p>
    </main>
  )
}
