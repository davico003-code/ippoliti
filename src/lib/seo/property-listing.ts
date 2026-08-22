import {
  agruparTags,
  formatLocation,
  getLotSurface,
  getOperationType,
  getRoofedArea,
  getTotalSurface,
  isMonoambiente,
  translatePropertyType,
  type TokkoProperty,
} from '@/lib/tokko'

const SITE_URL = 'https://siinmobiliaria.com'

type PropertyCity = 'Funes' | 'Roldán' | 'Fisherton' | 'Rosario' | null
type PropertyKind = 'casa' | 'terreno' | 'departamento' | 'otro'

export interface PropertyLocalContext {
  city: PropertyCity
  browseHref: string
  browseLabel: string
  valuationHref: string
  valuationLabel: string
}

function normalize(value: string | null | undefined): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function propertySearchText(property: TokkoProperty): string {
  return normalize([
    property.publication_title,
    property.type?.name,
    property.fake_address,
    property.address,
    property.location?.name,
    property.location?.short_location,
    property.location?.full_location,
  ].filter(Boolean).join(' '))
}

export function getPropertyCity(property: TokkoProperty): PropertyCity {
  const text = propertySearchText(property)
  // Fisherton suele venir acompañado por “Rosario”; se evalúa primero para
  // conservar la intención de búsqueda barrial más precisa.
  if (text.includes('fisherton')) return 'Fisherton'
  if (text.includes('funes')) return 'Funes'
  if (text.includes('roldan')) return 'Roldán'
  if (text.includes('rosario')) return 'Rosario'
  return null
}

export function getPropertyKind(property: TokkoProperty): PropertyKind {
  const type = normalize(property.type?.name)
  const title = normalize(property.publication_title)
  // El adaptador Hilo puede homologar locales y salones como “House”. La
  // intención explícita del título evita publicar esos inmuebles como casas en
  // los datos estructurados y en los enlaces de tasación.
  if (/^(salon|local|oficina|galpon|deposito|nave industrial|cochera)\b/.test(title)
    || /commercial|comercial|office|oficina|warehouse|galpon|deposito/.test(type)) return 'otro'
  if (/land|terreno|lote/.test(type)) return 'terreno'
  if (/apartment|departamento|monoambiente/.test(type)) return 'departamento'
  if (/house|casa|duplex|triplex|chalet/.test(type)) return 'casa'
  return 'otro'
}

function propertyKindWithArticle(kind: PropertyKind | 'propiedad'): string {
  if (kind === 'casa' || kind === 'propiedad') return `una ${kind}`
  if (kind === 'otro') return 'una propiedad'
  return `un ${kind}`
}

function tasadorType(kind: PropertyKind): 'casa' | 'lote' | 'departamento' | null {
  if (kind === 'terreno') return 'lote'
  if (kind === 'casa' || kind === 'departamento') return kind
  return null
}

export function getStablePropertyCoverUrl(propertyId: number): string {
  return `${SITE_URL}/api/propiedades/${propertyId}/cover`
}

export function cleanSeoText(value: string, maxLength = 160): string {
  const clean = value.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  const clipped = clean.slice(0, maxLength + 1)
  const lastSpace = clipped.lastIndexOf(' ')
  return `${clipped.slice(0, lastSpace > maxLength * 0.72 ? lastSpace : maxLength).trim()}…`
}

export function buildPropertyMetaDescription(property: TokkoProperty, description: string): string {
  if (description) return cleanSeoText(description)

  const operation = getOperationType(property)?.toLowerCase() || 'publicada'
  const type = translatePropertyType(property.type?.name) || 'Propiedad'
  const location = formatLocation(property) || getPropertyCity(property) || 'Santa Fe'
  const details: string[] = []
  if (isMonoambiente(property)) details.push('monoambiente')
  else if (property.suite_amount > 0) details.push(`${property.suite_amount} dormitorio${property.suite_amount === 1 ? '' : 's'}`)
  if (property.bathroom_amount > 0) details.push(`${property.bathroom_amount} baño${property.bathroom_amount === 1 ? '' : 's'}`)
  const area = getTotalSurface(property)
  if (area && area > 0) details.push(`${area} m²`)

  return cleanSeoText(
    `${type} en ${operation} en ${location}${details.length ? `: ${details.join(', ')}` : ''}. Consultá disponibilidad y condiciones con SI INMOBILIARIA.`,
  )
}

export function getPropertyLocalContext(property: TokkoProperty): PropertyLocalContext {
  const city = getPropertyCity(property)
  const kind = getPropertyKind(property)
  const operation = normalize(getOperationType(property))
  const isSale = operation.includes('venta')
  const isRent = operation.includes('alquiler')
  const valuationType = tasadorType(kind)

  if (city === 'Funes') {
    const browse = isSale && kind === 'casa'
      ? ['/casas-en-venta-funes', 'Ver más casas en venta en Funes']
      : isSale && kind === 'terreno'
        ? ['/terrenos-funes', 'Ver más terrenos en Funes']
        : ['/inmobiliaria-funes', 'Explorar propiedades y servicios en Funes']
    const type = kind === 'otro' ? 'propiedad' : kind
    return {
      city,
      browseHref: browse[0],
      browseLabel: browse[1],
      valuationHref: valuationType ? `/tasar/${valuationType}-funes` : '/tasaciones',
      valuationLabel: `Conocer cómo tasamos ${propertyKindWithArticle(type)} en Funes`,
    }
  }

  if (city === 'Roldán') {
    const browse = isRent
      ? ['/alquiler-roldan', 'Ver alquileres en Roldán']
      : isSale && kind === 'casa'
        ? ['/casas-en-venta-roldan', 'Ver más casas en venta en Roldán']
        : isSale && kind === 'terreno'
          ? ['/terrenos-roldan', 'Ver más terrenos en Roldán']
          : ['/inmobiliaria-roldan', 'Explorar propiedades y servicios en Roldán']
    const type = kind === 'otro' ? 'propiedad' : kind
    return {
      city,
      browseHref: browse[0],
      browseLabel: browse[1],
      valuationHref: valuationType ? `/tasar/${valuationType}-roldan` : '/tasaciones',
      valuationLabel: `Conocer cómo tasamos ${propertyKindWithArticle(type)} en Roldán`,
    }
  }

  if (city === 'Fisherton') {
    return {
      city,
      browseHref: isSale && kind === 'casa' ? '/casas-en-venta-fisherton' : '/inmobiliaria-fisherton',
      browseLabel: isSale && kind === 'casa' ? 'Ver más casas en venta en Fisherton' : 'Explorar propiedades en Fisherton',
      valuationHref: '/tasaciones',
      valuationLabel: 'Solicitar una tasación profesional en Fisherton',
    }
  }

  if (city === 'Rosario') {
    return {
      city,
      browseHref: '/propiedades?location=rosario',
      browseLabel: 'Ver más propiedades en Rosario',
      valuationHref: valuationType ? `/tasar/${valuationType}-rosario` : '/tasaciones',
      valuationLabel: kind === 'otro' ? 'Conocer nuestro proceso de tasación' : `Conocer cómo tasamos ${propertyKindWithArticle(kind)} en Rosario`,
    }
  }

  return {
    city: null,
    browseHref: '/propiedades',
    browseLabel: 'Ver todas las propiedades',
    valuationHref: '/tasaciones',
    valuationLabel: 'Conocer nuestro proceso de tasación',
  }
}

export function getSchemaPropertyType(property: TokkoProperty): 'House' | 'Apartment' | 'Place' {
  const kind = getPropertyKind(property)
  if (kind === 'casa') return 'House'
  if (kind === 'departamento') return 'Apartment'
  if (kind === 'terreno') return 'Place'
  return 'Place'
}

export function buildPropertyEntity(property: TokkoProperty, propUrl: string, imageUrl: string | null) {
  const area = getTotalSurface(property)
  const lotSurface = getLotSurface(property)
  const roofedArea = getRoofedArea(property)
  const currentLat = property.geo_lat ? Number.parseFloat(property.geo_lat) : null
  const currentLng = property.geo_long ? Number.parseFloat(property.geo_long) : null
  const hasCoords = currentLat != null && Number.isFinite(currentLat) && currentLng != null && Number.isFinite(currentLng)
  const amenities = agruparTags(property.tags ?? [])
    .flatMap(group => group.items)
    .slice(0, 24)

  return {
    '@type': getSchemaPropertyType(property),
    '@id': `${propUrl}#property`,
    name: property.publication_title || property.fake_address || property.address,
    ...(imageUrl ? { image: [imageUrl] } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.real_address || property.fake_address || property.address,
      addressLocality: getPropertyCity(property) || property.location?.name || '',
      addressRegion: 'Santa Fe',
      addressCountry: 'AR',
    },
    ...(hasCoords ? {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: currentLat,
        longitude: currentLng,
      },
    } : {}),
    numberOfRooms: property.room_amount || property.suite_amount || undefined,
    numberOfBedrooms: isMonoambiente(property) ? 0 : (property.suite_amount || property.room_amount || undefined),
    numberOfBathroomsTotal: property.bathroom_amount || undefined,
    floorSize: area ? { '@type': 'QuantitativeValue', value: area, unitCode: 'MTK' } : undefined,
    ...(lotSurface && lotSurface > 0 ? {
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Superficie del terreno',
          value: lotSurface,
          unitCode: 'MTK',
        },
        ...(roofedArea && roofedArea > 0 ? [{
          '@type': 'PropertyValue',
          name: 'Superficie cubierta',
          value: roofedArea,
          unitCode: 'MTK',
        }] : []),
      ],
    } : {}),
    ...(amenities.length ? {
      amenityFeature: amenities.map(name => ({
        '@type': 'LocationFeatureSpecification',
        name,
        value: true,
      })),
    } : {}),
  }
}

export function buildListingAuthor(property: TokkoProperty) {
  const name = property.producer?.name?.trim()
  if (!name) return { '@id': `${SITE_URL}/#organization` }

  const normalizedName = normalize(name)
  const profileId = normalizedName.includes('david flores')
    ? `${SITE_URL}/nosotros#david-flores`
    : normalizedName.includes('susana ippoliti')
      ? `${SITE_URL}/nosotros#susana-ippoliti`
      : normalizedName.includes('laura flores')
        ? `${SITE_URL}/nosotros#laura-flores`
        : null

  return {
    '@type': 'Person',
    ...(profileId ? { '@id': profileId } : {}),
    name,
    ...(property.producer?.picture ? { image: property.producer.picture } : {}),
    worksFor: { '@id': `${SITE_URL}/#organization` },
  }
}
