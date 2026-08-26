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
  isMonoambiente,
  type TokkoProperty,
} from '@/lib/tokko'
import PlacaSelectorClient, { type PlacaPhoto } from '@/components/PlacaSelectorClient'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

interface Props {
  params: { slug: string }
}

function stripLocationSuffix(address: string, locationNames: Array<string | null>): string {
  const names = locationNames
    .filter((name): name is string => Boolean(name?.trim()))
    .sort((a, b) => b.length - a.length)

  let normalized = address.trim()
  let previous = ''
  while (normalized && normalized !== previous) {
    previous = normalized
    for (const name of names) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      normalized = normalized
        .replace(new RegExp(`\\s*(?:-|,|\\|)\\s*${escaped}\\s*$`, 'i'), '')
        .trim()
    }
  }

  return normalized
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

  const allPhotos = (property.photos || []).sort((a, b) => a.order - b.order)

  const photos: PlacaPhoto[] = allPhotos
    .filter(p => !p.is_blueprint)
    .map(p => ({ thumb: p.thumb || p.image, full: p.image }))

  const blueprints: PlacaPhoto[] = allPhotos
    .filter(p => p.is_blueprint)
    .map(p => ({ thumb: p.thumb || p.image, full: p.image }))

  const title = property.publication_title || property.fake_address || property.address || 'Propiedad'
  const price = formatPrice(property)
  const operation = getOperationType(property)
  const propertyType = translatePropertyType(property.type?.name)
  const area = getTotalSurface(property)
  const lotSurface = getLotSurface(property)
  // Monoambiente: 0 dormitorios. Pasamos rooms=0 para que la placa no muestre
  // "1 dorm" (fallback erróneo de suite_amount 0 → room_amount 1).
  const rooms = isMonoambiente(property) ? 0 : (property.suite_amount || property.room_amount || 0)
  const bathrooms = property.bathroom_amount || 0
  const parking = property.parking_lot_amount || 0
  const locationParts = (property.location?.full_location || property.location?.short_location || '')
    .split('|')
    .map(part => part.trim())
    .filter(part => part && part.toLowerCase() !== 'argentina')
  const province = locationParts[0] || null
  const cityFromLocation = locationParts.filter(part => /^(funes|rold[aá]n|rosario)$/i.test(part)).pop() || null
  const city = cityFromLocation || property.location?.name || null

  const addrText = property.fake_address || property.address || ''
  const sortedDivs = [...(property.location?.divisions ?? [])].sort((a, b) => b.name.length - a.name.length)
  const divisionNeighborhood = sortedDivs.find(d => {
    const esc = d.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${esc}\\b`, 'i').test(addrText)
  })?.name || null
  const neighborhoodFromLocation = [...locationParts]
    .reverse()
    .find(part => part !== province && part !== cityFromLocation) || null
  const neighborhood = divisionNeighborhood || neighborhoodFromLocation

  const rawStreetAddress = property.real_address || property.address || property.fake_address || ''
  const streetAddress = stripLocationSuffix(rawStreetAddress, [neighborhood, cityFromLocation, city, province])
  const addressHead = [streetAddress, province]
    .filter(Boolean)
    .filter((part, index, parts) => index === 0 || !String(parts[0]).toLowerCase().includes(String(part).toLowerCase()))
    .join(', ')
  const addressLine = [addressHead, cityFromLocation, neighborhood]
    .filter(Boolean)
    .filter((part, index, parts) =>
      parts.findIndex(candidate => String(candidate).toLowerCase() === String(part).toLowerCase()) === index,
    )
    .join(' | ')

  const locationLabel = [neighborhood, city].filter(Boolean).join(' · ') || 'Propiedad'

  return (
    <PlacaSelectorClient
      slug={params.slug}
      photos={photos}
      blueprints={blueprints}
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
      addressLine={addressLine}
    />
  )
}
