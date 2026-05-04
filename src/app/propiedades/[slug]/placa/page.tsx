import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getPropertyById,
  getIdFromSlug,
  formatPrice,
  getOperationType,
  getTotalSurface,
  getLotSurface,
  translatePropertyType,
  type TokkoProperty,
} from '@/lib/tokko'
import PlacaSelectorClient, { type PlacaPhoto } from '@/components/PlacaSelectorClient'

export const revalidate = 21600
export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Crear placa Instagram | SI INMOBILIARIA',
    description: 'Generá una placa lista para Instagram Story con fotos de la propiedad.',
    robots: { index: false, follow: false },
    alternates: { canonical: `https://siinmobiliaria.com/propiedades/${params.slug}/placa` },
  }
}

export default async function PlacaPage({ params }: Props) {
  const id = getIdFromSlug(params.slug)
  if (isNaN(id)) {
    notFound()
  }

  let property: TokkoProperty
  try {
    property = await getPropertyById(id)
  } catch (e) {
    if (e instanceof Error && e.message.includes('not found')) {
      notFound()
    }
    throw e
  }

  const photos: PlacaPhoto[] = (property.photos || [])
    .filter(p => !p.is_blueprint)
    .sort((a, b) => a.order - b.order)
    .map(p => ({ thumb: p.thumb || p.image, full: p.image }))

  const title = property.publication_title || property.fake_address || property.address || 'Propiedad'
  const price = formatPrice(property)
  const operation = getOperationType(property)
  const propertyType = translatePropertyType(property.type?.name)
  const area = getTotalSurface(property)
  const lotSurface = getLotSurface(property)
  const rooms = property.suite_amount || property.room_amount || 0
  const bathrooms = property.bathroom_amount || 0
  const parking = property.parking_lot_amount || 0
  const city = property.location?.name || null

  const addrText = property.fake_address || property.address || ''
  const sortedDivs = [...(property.location?.divisions ?? [])].sort((a, b) => b.name.length - a.name.length)
  const neighborhood = sortedDivs.find(d => {
    const esc = d.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${esc}\\b`, 'i').test(addrText)
  })?.name || null

  const locationLabel = [neighborhood, city].filter(Boolean).join(' · ') || 'Propiedad'

  return (
    <PlacaSelectorClient
      slug={params.slug}
      photos={photos}
      title={title}
      price={price}
      operation={operation}
      propertyType={propertyType}
      area={area}
      rooms={rooms}
      bathrooms={bathrooms}
      lotSurface={lotSurface}
      parking={parking}
      city={city}
      neighborhood={neighborhood}
      locationLabel={locationLabel}
    />
  )
}
