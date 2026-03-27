import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Building2, Banknote, ArrowLeft, Download, CheckCircle2 } from 'lucide-react'
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
  type Development,
} from '@/lib/developments'

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
    return {
      title: `${dev.name} | Emprendimientos SI Inmobiliaria`,
      description: dev.description?.replace(/<[^>]*>/g, '').slice(0, 160) || dev.publication_title,
    }
  } catch {
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
  const galleryPhotos = photos.slice(1)
  const status = getConstructionStatus(dev.construction_status)
  const typeName = translateDevType(dev.type?.name || '')
  const locationName = dev.location?.full_location?.split('|').slice(-2).map(s => s.trim()).reverse().join(', ') || dev.location?.name || dev.address
  const description = (dev.description || '').replace(/<[^>]*>/g, '').trim()
  const paragraphs = description.split('\n').filter(p => p.trim()).reduce((acc: string[], line) => {
    const trimmed = line.trim()
    if (trimmed) acc.push(trimmed)
    return acc
  }, [])

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

      {/* Hero image */}
      {mainPhoto ? (
        <div className="relative w-full h-[55vh] md:h-[65vh]">
          <Image src={mainPhoto} alt={dev.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-2 mb-3">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-brand-600 text-white uppercase tracking-wide">
                  {typeName}
                </span>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/90 text-brand-700 uppercase tracking-wide">
                  {status}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 drop-shadow-md">{dev.name}</h1>
              {dev.publication_title && dev.publication_title !== dev.name && (
                <p className="text-white/80 text-lg font-medium">{dev.publication_title}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-brand-600 text-white py-20 px-4 text-center">
          <h1 className="text-4xl font-black">{dev.name}</h1>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Quick info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-5 h-5 text-brand-600" />
                <span className="font-medium">{locationName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Building2 className="w-5 h-5 text-brand-600" />
                <span className="font-medium">{typeName}</span>
              </div>
              {dev.financing_details && (
                <div className="flex items-center gap-2 text-brand-700">
                  <Banknote className="w-5 h-5" />
                  <span className="font-bold">{dev.financing_details}</span>
                </div>
              )}
            </div>

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

            {/* Photo gallery */}
            {galleryPhotos.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Galería ({photos.length} fotos)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryPhotos.map((photo, i) => (
                    <div key={i} className="relative h-40 bg-gray-100 rounded-lg overflow-hidden group">
                      <Image
                        src={photo}
                        alt={`${dev.name} - Foto ${i + 2}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags / amenities */}
            {dev.tags && dev.tags.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Servicios y amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {dev.tags.map(tag => (
                    <div key={tag.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      {translateTag(tag.name)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — Contact */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20">
              <h2 className="text-lg font-black text-gray-900 mb-1">¿Te interesa este emprendimiento?</h2>
              <p className="text-gray-500 text-sm mb-6">Contactanos para recibir información, planos y condiciones de financiación.</p>

              <a
                href={`https://wa.me/5493412101694?text=${encodeURIComponent(`Hola! Me interesa el emprendimiento: ${dev.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg mb-3"
              >
                Consultar por WhatsApp
              </a>

              <a
                href="tel:+5493412101694"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-all shadow-md"
              >
                Llamar <span className="font-numeric">(341) 210-1694</span>
              </a>

              {dev.financing_details && (
                <div className="mt-6 p-4 bg-brand-50 rounded-xl border border-brand-100">
                  <p className="text-xs text-brand-600 font-bold uppercase tracking-wider mb-1">Financiación</p>
                  <p className="text-brand-800 font-bold">{dev.financing_details}</p>
                </div>
              )}

              {/* Downloadable files */}
              {dev.files && dev.files.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-900 mb-3">Documentos</p>
                  <div className="space-y-2">
                    {dev.files.map((file, i) => {
                      const fileName = file.file.split('/').pop() || `Documento ${i + 1}`
                      return (
                        <a
                          key={i}
                          href={file.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
                        >
                          <Download className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{fileName}</span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
                <p className="font-medium text-brand-600 mb-1">SI Inmobiliaria</p>
                <p>Catamarca 775, Roldán</p>
                <p className="mt-1">ventas@inmobiliariaippoliti.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/emprendimientos" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a emprendimientos
          </Link>
        </div>
      </div>
    </div>
  )
}
