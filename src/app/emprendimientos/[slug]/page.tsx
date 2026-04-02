import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Building2, Banknote, ArrowLeft, CheckCircle2, Phone, MessageCircle, Calendar } from 'lucide-react'
import {
  getDevelopments,
  getDevelopmentById,
  generateDevSlug,
  getDevIdFromSlug,
  getDevAllPhotos,
  getDevMainPhoto,
  getConstructionStatus,
  translateDevType,
  translateTag,
  getDevUnits,
  type Development,
  type DevUnit,
} from '@/lib/developments'
import DevUnitsSection from '@/components/DevUnitsSection'
import ShareButtons from '@/components/ShareButtons'
import VisitWidget from '@/components/VisitWidget'
import { getClienteFormatted } from '@/lib/clientes'
import { getPropertyById, type TokkoProperty, formatPrice, generatePropertySlug, getMainPhoto, translatePropertyType, getTotalSurface } from '@/lib/tokko'

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), { ssr: false })
const PhotoGallery = dynamic(() => import('@/components/PhotoGallery'), { ssr: false })
const NearbyPlaces = dynamic(() => import('@/components/NearbyPlaces'), { ssr: false })

export const revalidate = 21600

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  try {
    const devs = await getDevelopments()
    return devs.map(d => ({ slug: generateDevSlug(d) }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const id = getDevIdFromSlug(params.slug)
    const dev = await getDevelopmentById(id)
    const desc = dev.description?.replace(/<[^>]*>/g, '').slice(0, 160) || dev.publication_title
    return {
      title: `${dev.name} | Emprendimientos SI Inmobiliaria`,
      description: desc,
      openGraph: {
        title: `${dev.name} | SI Inmobiliaria`,
        description: desc,
        images: getDevMainPhoto(dev) ? [{ url: getDevMainPhoto(dev)! }] : [],
      },
    }
  } catch {
    // Try manual client
    try {
      const { getClienteBySlug } = await import('@/lib/clientes')
      const cliente = await getClienteBySlug(params.slug)
      if (cliente) {
        return {
          title: `${cliente.name} | SI Inmobiliaria`,
          description: cliente.description || `Propiedades de ${cliente.name} en SI Inmobiliaria`,
        }
      }
    } catch {}
    return { title: 'Emprendimiento | SI Inmobiliaria' }
  }
}

export default async function DevelopmentPage({ params }: Props) {
  let dev: Development | null = null

  try {
    const id = getDevIdFromSlug(params.slug)
    if (!isNaN(id)) dev = await getDevelopmentById(id)
  } catch {}

  if (!dev) {
    // Try manual client from Redis
    try {
      const cliente = await getClienteFormatted(params.slug)
      if (cliente) return <ManualClientePage cliente={cliente} />
    } catch {}

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-black text-gray-900 mb-4">Emprendimiento no encontrado</h1>
        <Link href="/emprendimientos" className="px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors">
          Ver emprendimientos
        </Link>
      </div>
    )
  }

  const photos = getDevAllPhotos(dev)
  const mainPhoto = photos[0] || null
  const status = getConstructionStatus(dev.construction_status)
  const typeName = translateDevType(dev.type?.name || '')
  const locationName = dev.location?.full_location?.split('|').slice(-2).map(s => s.trim()).reverse().join(', ') || dev.location?.name || dev.address
  const description = (dev.description || '').replace(/<[^>]*>/g, '').trim()
  const paragraphs = description.split('\n').filter(p => p.trim())

  const whatsappText = encodeURIComponent(`Hola! Quiero información sobre ${dev.name}`)
  const whatsappUrl = `https://wa.me/5493412101694?text=${whatsappText}`

  // Fetch units for this development
  let units: DevUnit[] = []
  try {
    units = await getDevUnits(dev.id)
  } catch {}

  // Fetch other developments
  let otherDevs: Development[] = []
  try {
    const allDevs = await getDevelopments()
    otherDevs = allDevs.filter(d => d.id !== dev!.id).slice(0, 3)
  } catch {}

  const mainPhotoUrl = getDevMainPhoto(dev)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: dev.name,
    description: description.slice(0, 300),
    image: mainPhotoUrl ? [mainPhotoUrl] : [],
    address: {
      '@type': 'PostalAddress',
      streetAddress: dev.address,
      addressLocality: dev.location?.name,
      addressRegion: 'Santa Fe',
      addressCountry: 'AR',
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero image — full screen */}
      {mainPhoto ? (
        <div className="relative w-full h-[60vh] md:h-[75vh]">
          <Image src={mainPhoto} alt={dev.name} fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#1A5C38] text-white uppercase tracking-wide">
                  {typeName}
                </span>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/90 text-[#1A5C38] uppercase tracking-wide">
                  {status}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 drop-shadow-md">{dev.name}</h1>
              {dev.publication_title && dev.publication_title !== dev.name && (
                <p className="text-white/80 text-lg font-medium">{dev.publication_title}</p>
              )}
              <div className="flex items-center gap-2 mt-3 text-white/70">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{locationName}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#1A5C38] text-white py-20 px-4 text-center">
          <h1 className="text-4xl font-black">{dev.name}</h1>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Key specs grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <Building2 className="w-5 h-5 text-[#1A5C38] mx-auto mb-2" />
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tipología</p>
                <p className="text-sm font-bold text-gray-900">{typeName}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <Calendar className="w-5 h-5 text-[#1A5C38] mx-auto mb-2" />
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Estado</p>
                <p className="text-sm font-bold text-gray-900">{status}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <Banknote className="w-5 h-5 text-[#1A5C38] mx-auto mb-2" />
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Financiación</p>
                <p className="text-sm font-bold text-gray-900">{dev.financing_details || 'Consultar'}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <MapPin className="w-5 h-5 text-[#1A5C38] mx-auto mb-2" />
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Ubicación</p>
                <p className="text-sm font-bold text-gray-900">{dev.location?.name || 'Consultar'}</p>
              </div>
            </div>

            {/* Units section — before description */}
            <DevUnitsSection units={units} devName={dev.name} whatsappUrl={whatsappUrl} />

            {/* Description */}
            {paragraphs.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre el emprendimiento</h2>
                <div className="space-y-4">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="text-gray-700 leading-relaxed">{p}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {dev.videos && dev.videos.length > 0 && (() => {
              const video = dev.videos[0]
              const embedUrl = video.provider === 'youtube' && video.player_url
                ? (video.player_url.startsWith('https://www.youtube.com/embed/')
                    ? video.player_url
                    : `https://www.youtube.com/embed/${video.video_id}`)
                : null
              if (!embedUrl) return null
              return (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Video</h2>
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                      src={embedUrl}
                      title={video.title || dev.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>
              )
            })()}

            {/* Photo gallery with lightbox */}
            {photos.length > 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Galería
                  <span className="text-gray-400 text-sm font-normal ml-2 font-numeric">{photos.length} fotos</span>
                </h2>
                <PhotoGallery photos={photos} alt={dev.name} />
              </div>
            )}

            {/* Tags / amenities */}
            {dev.tags && dev.tags.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Servicios y amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {dev.tags.filter(tag => tag.name !== 'Venta directa' && tag.name !== 'Direct sale').map(tag => (
                    <div key={tag.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-[#1A5C38] flex-shrink-0" />
                      {translateTag(tag.name)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lugares cercanos */}
            {dev.geo_lat && dev.geo_long && (
              <NearbyPlaces lat={dev.geo_lat} lng={dev.geo_long} />
            )}

            {/* Location map */}
            {dev.geo_lat && dev.geo_long && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ubicación</h2>
                <PropertyMap
                  lat={dev.geo_lat}
                  lng={dev.geo_long}
                  address={dev.fake_address || dev.address}
                />
                <div className="flex items-center gap-2 mt-4 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 text-[#1A5C38] flex-shrink-0" />
                  <span>{dev.fake_address || dev.address}{locationName ? `, ${locationName}` : ''}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right column — Contact (same as property page) */}
          <div className="space-y-4">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#1ea952] text-white rounded-xl font-bold text-sm transition-colors mb-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Consultar por WhatsApp
                </a>

                {/* Call */}
                <a
                  href="tel:+5493412101694"
                  className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors hover:bg-gray-50 mb-4"
                >
                  <Phone className="w-5 h-5" />
                  Llamar <span className="font-numeric">(341) 210-1694</span>
                </a>

                <hr className="border-gray-100 mb-4" />

                {/* Agent card */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#1A5C38] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    DF
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-gray-900 block">David Flores</span>
                    <span className="text-xs text-gray-400">Mat. N° 0621</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#1A5C38] bg-[#e8f5ee] px-2 py-0.5 rounded-full uppercase">Agente</span>
                </div>

                <hr className="border-gray-100" />

                {/* Share */}
                <ShareButtons
                  slug={`emprendimientos/${params.slug}`}
                  title={dev.name}
                />

                {dev.financing_details && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs text-[#1A5C38] font-bold uppercase tracking-wider mb-1">Financiación</p>
                    <p className="text-[#1A5C38] font-bold text-sm">{dev.financing_details}</p>
                  </div>
                )}
              </div>

              {/* Visit widget */}
              <VisitWidget propertyId={dev.id} propertyTitle={dev.name} />
            </div>
          </div>
        </div>

        {/* Other developments */}
        {otherDevs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Otros emprendimientos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherDevs.map(d => {
                const photo = getDevMainPhoto(d)
                const slug = generateDevSlug(d)
                return (
                  <Link key={d.id} href={`/emprendimientos/${slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {photo && <Image src={photo} alt={d.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />}
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-bold text-[#1A5C38] uppercase tracking-wider mb-1">{translateDevType(d.type?.name || '')}</p>
                      <h3 className="font-bold text-gray-900">{d.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{d.location?.name || d.address}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Back */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/emprendimientos" className="inline-flex items-center gap-2 text-[#1A5C38] hover:text-[#15472c] font-bold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a emprendimientos
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Manual Client Page (Redis-backed) ── */
async function ManualClientePage({ cliente }: { cliente: import('@/lib/clientes').ClienteFormatted }) {
  // Resolve all tokkoIds to real properties — fully defensive
  const edificios = cliente.edificios || []
  const sueltasIds = cliente.sueltasIds || []
  const allIds = [
    ...edificios.flatMap(e => (e.tokkoIds || [])),
    ...sueltasIds,
  ].filter(Boolean).map(Number).filter(id => !isNaN(id) && id > 0)

  const propsMap: Record<number, TokkoProperty> = {}
  if (allIds.length > 0) {
    await Promise.allSettled(
      allIds.map(async id => {
        try {
          propsMap[id] = await getPropertyById(id)
        } catch {}
      })
    )
  }

  const whatsappText = encodeURIComponent(`Hola! Quiero información sobre propiedades de ${cliente.name}`)
  const whatsappUrl = `https://wa.me/5493412101694?text=${whatsappText}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1A5C38] py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-white/60 text-sm uppercase tracking-widest mb-3">Propiedades</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">{cliente.name}</h1>
          {cliente.description && <p className="text-white/70 text-base max-w-2xl mx-auto">{cliente.description}</p>}
          <span className="inline-block mt-4 text-sm font-semibold text-white/50 bg-white/10 px-3 py-1 rounded-full">
            {allIds.length} propiedad{allIds.length !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        {allIds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Sin propiedades asignadas todavía</p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white text-sm font-bold rounded-xl hover:bg-[#1ea952] transition-colors">
              Consultar por WhatsApp
            </a>
          </div>
        )}

        {/* Edificios */}
        {edificios.filter(e => (e.tokkoIds || []).length > 0).map(ed => (
          <div key={ed.id}>
            <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>{ed.nombre}</h2>
            {ed.descripcion && <p className="text-sm text-gray-500 mb-4">{ed.descripcion}</p>}
            <div className="h-px bg-gray-200 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ed.tokkoIds.map(id => {
                const p = propsMap[Number(id)]
                if (!p) return null
                const photo = getMainPhoto(p)
                const price = formatPrice(p)
                const slug = generatePropertySlug(p)
                const area = getTotalSurface(p)
                return (
                  <Link key={id} href={`/propiedades/${slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {photo && <img src={photo} alt={p.publication_title || p.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-400 mb-1">{translatePropertyType(p.type?.name)}</p>
                      <h3 className="font-bold text-sm text-gray-900 line-clamp-1 mb-1">{p.publication_title || p.address}</h3>
                      <p className="text-lg font-bold text-[#1A5C38] font-numeric mb-1">{price}</p>
                      <div className="flex gap-3 text-xs text-gray-500">
                        {area != null && area > 0 && <span className="font-numeric">{area} m²</span>}
                        {(p.suite_amount || p.room_amount) > 0 && <span>{p.suite_amount || p.room_amount} dorm.</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Sueltas */}
        {sueltasIds.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>Otras propiedades</h2>
            <div className="h-px bg-gray-200 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sueltasIds.map(id => {
                const p = propsMap[Number(id)]
                if (!p) return null
                const photo = getMainPhoto(p)
                const price = formatPrice(p)
                const slug = generatePropertySlug(p)
                const area = getTotalSurface(p)
                return (
                  <Link key={id} href={`/propiedades/${slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {photo && <img src={photo} alt={p.publication_title || p.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-400 mb-1">{translatePropertyType(p.type?.name)}</p>
                      <h3 className="font-bold text-sm text-gray-900 line-clamp-1 mb-1">{p.publication_title || p.address}</h3>
                      <p className="text-lg font-bold text-[#1A5C38] font-numeric mb-1">{price}</p>
                      <div className="flex gap-3 text-xs text-gray-500">
                        {area != null && area > 0 && <span className="font-numeric">{area} m²</span>}
                        {(p.suite_amount || p.room_amount) > 0 && <span>{p.suite_amount || p.room_amount} dorm.</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center py-8">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl text-sm hover:bg-[#1ea952] transition-colors">
            <MessageCircle className="w-5 h-5" /> Consultar por WhatsApp
          </a>
        </div>

        <Link href="/emprendimientos" className="inline-flex items-center gap-2 text-[#1A5C38] font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver a emprendimientos
        </Link>
      </div>
    </div>
  )
}
