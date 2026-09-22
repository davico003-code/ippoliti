import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MessageCircle, Map as MapIcon } from 'lucide-react'
import {
  getDevelopments,
  getDevelopmentById,
  generateDevSlug,
  getDevIdFromSlug,
  getDevAllPhotos,
  getDevMainPhoto,
  absoluteDevPhotoUrl,
  getConstructionStatus,
  translateDevType,
  getDevUnits,
  type Development,
  type DevUnit,
} from '@/lib/developments'
import { getDockGarden } from '@/lib/brickfy'
import { filasDesdeBrickfy, filasDesdeCrm, type UnidadFila } from '@/lib/unidadesFilas'
import EmprendimientoFunnel from '@/components/emprendimiento/EmprendimientoFunnel'
import BotonVolver from '@/components/BotonVolver'
import HeroAerea from '@/components/distrito-roldan/HeroAerea'

// Sitio dedicado del tour 360° de Distrito Roldán (botón del hero).
const TOUR_360_EXTERNO = 'https://distritoroldan360.com'
import { distritoFontVars } from '@/components/distrito-roldan/fonts'
import SeccionIntro from '@/components/distrito-roldan/SeccionIntro'
import SeccionPlanoLotes from '@/components/distrito-roldan/SeccionPlanoLotes'
import SeccionRenders from '@/components/distrito-roldan/SeccionRenders'
import SeccionGaleriaBarrio from '@/components/distrito-roldan/SeccionGaleriaBarrio'
import SeccionAvancesObra from '@/components/distrito-roldan/SeccionAvancesObra'
import SeccionUbicacion from '@/components/distrito-roldan/SeccionUbicacion'
import SeccionServicios from '@/components/distrito-roldan/SeccionServicios'
import SeccionCtaFinanciacion from '@/components/distrito-roldan/SeccionCtaFinanciacion'
import { getClienteFormatted } from '@/lib/clientes'
import { getPropertyById, type TokkoProperty, formatPrice, generatePropertySlug, getMainPhoto, translatePropertyType, getTotalSurface } from '@/lib/tokko'
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

// Overrides de SEO por emprendimiento (keyed por ID de Tokko). Permite title/meta
// custom sin tocar dev.name — que además arma el slug, así que cambiarlo rompería
// la URL ya indexada. displayName solo cambia el H1/JSON-LD en el render (no el
// slug), intro se antepone a "Sobre el emprendimiento" y bodyFixes corrige el
// texto visible de la descripción.
const DEV_SEO: Record<
  number,
  { title: string; description: string; displayName?: string; intro?: string; bodyFixes?: Array<[RegExp, string]> }
> = {
  // Dock Garden — Aldea Fisherton (Fisherton, Rosario)
  67173: {
    title: 'Dock Garden Aldea Fisherton | Condominio y Paseo Comercial en Rosario',
    description:
      'Dock Garden Aldea Fisherton: condominio residencial de baja altura con paseo comercial en Fisherton, Rosario. Departamentos en venta con financiación.',
    // El CRM escribe "Dockgarden" pegado; la marca (y las búsquedas) usan
    // "Dock Garden" separado.
    displayName: 'Dock Garden - Aldea Fisherton',
    intro:
      'Dock Garden Aldea Fisherton es un condominio residencial de baja altura ubicado en Fisherton, Rosario. El proyecto Dock Garden combina viviendas y un paseo comercial integrado al entorno verde de la Aldea.',
    bodyFixes: [[/DockGarden/g, 'Dock Garden']],
  },
  // Distrito Roldán (barrio abierto sobre Ruta 9)
  67178: {
    title: 'Distrito Roldán | Lotes Residenciales y Comerciales en Roldán, Ruta 9',
    description:
      'Distrito Roldán: barrio abierto con 180 lotes residenciales y comerciales sobre Ruta 9, a minutos de Funes y Rosario. Financiación 30% + 24 cuotas fijas en dólares.',
  },
}

// Imágenes propias de la landing por emprendimiento (keyed por ID de Tokko).
// fotosLimpias: fragmento del nombre del archivo en el CRM → versión sin el
// logo estampado del desarrollador (renders nuevos o el mismo render recortado).
const DEV_LANDING: Record<
  number,
  {
    hero: string
    proyecto?: string
    ubicacion?: string
    /** og:image en JPEG 1200x630 (WhatsApp no renderiza bien webp). */
    og?: string
    /** Lista de precios viva del desarrollador (Brickfy) en vez de las unidades del CRM. */
    listaDesarrollador?: () => Promise<UnidadFila[] | null>
    fotosLimpias?: Record<string, string>
    /** Última tanda de fotos reales de la obra (la más nueva reemplaza a la anterior). */
    avances?: { fecha: string; fotos: string[] }
  }
> = {
  // Dock Garden — Aldea Fisherton
  67173: {
    og: '/og-dockgarden.jpg',
    // Brickfy tiene todas las unidades reales con torre, piso, plano y precio
    // al día; el CRM solo una parte. Misma fuente que /dockgarden.
    listaDesarrollador: async () => {
      const data = await getDockGarden()
      return data ? filasDesdeBrickfy(data.units) : null
    },
    hero: '/images/dockgarden/render-frente.webp',
    proyecto: '/images/dockgarden/render-amenities.webp',
    ubicacion: '/images/dockgarden/aerea-fisherton.webp',
    avances: {
      fecha: 'Septiembre 2026',
      fotos: Array.from({ length: 7 }, (_, i) => `/images/dockgarden/obra-2026-09/${String(i + 1).padStart(2, '0')}.webp`),
    },
    fotosLimpias: {
      '67173_9377506084': '/images/dockgarden/render-frente.webp',
      '67173_2866677624': '/images/dockgarden/render-amenities.webp',
      '67173_9538025828': '/images/dockgarden/interior-04.webp',
      '67173_9030628622': '/images/dockgarden/interior-05.webp',
      '67173_3730031188': '/images/dockgarden/interior-06.webp',
      '67173_7880761121': '/images/dockgarden/interior-07.webp',
      '67173_4037633902': '/images/dockgarden/interior-08.webp',
      '67173_7118392677': '/images/dockgarden/interior-09.webp',
      '67173_7625859200': '/images/dockgarden/interior-10.webp',
      '67173_9665924367': '/images/dockgarden/aerea-fisherton.webp',
    },
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const id = getDevIdFromSlug(params.slug)
    const dev = await getDevelopmentById(id)
    const override = DEV_SEO[dev.id]
    const ogLimpia = DEV_LANDING[dev.id]?.og
    const ogImage = ogLimpia ? `https://siinmobiliaria.com${ogLimpia}` : absoluteDevPhotoUrl(getDevMainPhoto(dev))
    const desc =
      override?.description ??
      (dev.description?.replace(/<[^>]*>/g, '').slice(0, 160) || dev.publication_title)
    return {
      title: override?.title ?? `${dev.name} | Emprendimientos SI INMOBILIARIA`,
      description: desc,
      // Canonical al slug CANÓNICO del dev (no al pedido): así /emprendimientos/
      // 67173-cualquier-cosa consolida en la URL correcta en vez de auto-
      // canonicalizarse y generar duplicados infinitos.
      alternates: { canonical: `https://siinmobiliaria.com/emprendimientos/${generateDevSlug(dev)}` },
      openGraph: {
        title: override?.title ?? `${dev.name} | SI INMOBILIARIA`,
        description: desc,
        images: ogImage ? [{ url: ogImage }] : [],
      },
    }
  } catch {
    // Try manual client
    try {
      const { getClienteBySlug } = await import('@/lib/clientes')
      const cliente = await getClienteBySlug(params.slug)
      if (cliente) {
        return {
          title: `${cliente.name} | SI INMOBILIARIA`,
          description: cliente.description || `Propiedades de ${cliente.name} en SI INMOBILIARIA`,
          alternates: { canonical: `https://siinmobiliaria.com/emprendimientos/${params.slug}` },
        }
      }
    } catch {}
    return { title: 'Emprendimiento | SI INMOBILIARIA' }
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

    // Ni emprendimiento ni cliente manual → 404 real (antes servía este JSX con
    // HTTP 200 = soft-404, y Google indexaba páginas de error).
    notFound()
  }

  // Fotos del CRM, con las que traen el sello del desarrollador reemplazadas
  // por su versión limpia. Las que no están en el mapa pasan tal cual, así una
  // foto nueva cargada en el CRM aparece sola.
  const landing = DEV_LANDING[dev.id]
  const fotosCrm = getDevAllPhotos(dev).map(url => {
    const limpia = Object.entries(landing?.fotosLimpias ?? {}).find(([hash]) => url.includes(hash))
    return limpia ? limpia[1] : url
  })
  // La galería abre con lo que todavía no se vio: las imágenes que ya ocupan el
  // hero, "El proyecto" y "Ubicación" pasan al final (siguen en el visor).
  const yaVistas = new Set([landing?.hero, landing?.proyecto, landing?.ubicacion].filter(Boolean))
  const photos = landing
    ? [
        ...fotosCrm.filter(f => !yaVistas.has(f) && f.startsWith('/')),
        ...fotosCrm.filter(f => !yaVistas.has(f) && !f.startsWith('/')),
        ...fotosCrm.filter(f => yaVistas.has(f)),
      ]
    : fotosCrm
  const mainPhoto = fotosCrm[0] || null
  const status = getConstructionStatus(dev.construction_status)
  const typeName = translateDevType(dev.type?.name || '')
  const locationName = dev.location?.full_location?.split('|').slice(-2).map(s => s.trim()).reverse().join(', ') || dev.location?.name || dev.address
  // Override de SEO: nombre para display (H1/JSON-LD, no cambia el slug),
  // párrafo intro antepuesto a "Sobre el emprendimiento" y fixes del texto.
  const seoOverride = DEV_SEO[dev.id]
  const displayName = seoOverride?.displayName ?? dev.name
  let description = (dev.description || '').replace(/<[^>]*>/g, '').trim()
  for (const [pattern, replacement] of seoOverride?.bodyFixes ?? []) {
    description = description.replace(pattern, replacement)
  }
  const paragraphs = [
    ...(seoOverride?.intro ? [seoOverride.intro] : []),
    ...description.split('\n').filter(p => p.trim()),
  ]

  const whatsappText = encodeURIComponent(`Hola! Quiero información sobre ${displayName}`)
  const whatsappUrl = `https://wa.me/5493413340916?text=${whatsappText}`

  const isDistrito = dev.id === 67178

  // Distrito tiene un funnel propio y no necesita volver a pedir unidades ni
  // emprendimientos relacionados que después quedarían ocultos.
  const [units, otherDevs] = isDistrito
    ? [[], []] as [DevUnit[], Development[]]
    : await Promise.all([
        getDevUnits(dev.id).catch(() => [] as DevUnit[]),
        getDevelopments()
          .then(all => all.filter(d => d.id !== dev!.id).slice(0, 3))
          .catch(() => [] as Development[]),
      ])

  // Lista de precios: la del desarrollador si el emprendimiento la tiene (y
  // responde); si no, las unidades del CRM. Cuando una fila del desarrollador
  // coincide en dormitorios y precio con una unidad del CRM, hereda su ficha.
  const filasCrm = filasDesdeCrm(units, `${displayName} ${dev.location?.name || ''}`)
  const filasDev = (await landing?.listaDesarrollador?.().catch(() => null)) ?? null
  const fichasLibres = [...filasCrm]
  const filas: UnidadFila[] = filasDev?.length
    ? filasDev.map(f => {
        const i = fichasLibres.findIndex(c => c.dorms === f.dorms && c.precio === f.precio && c.precio > 0)
        return i >= 0 ? { ...f, href: fichasLibres.splice(i, 1)[0].href } : f
      })
    : filasCrm

  const mainPhotoUrl = landing?.og
    ? `https://siinmobiliaria.com${landing.og}`
    : absoluteDevPhotoUrl(getDevMainPhoto(dev))
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: displayName,
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

  // Distrito Roldán (67178): la aérea es el hero y el tour 360° pasó a ser un
  // botón que abre el sitio dedicado.
  // Distrito Roldán (67178): rediseño con secciones de marca.
  return (
    <div className={`min-h-screen bg-gray-50 ${isDistrito ? distritoFontVars : ''}`}>
      {/* Con el Navbar global oculto en Distrito, este acceso mantiene una salida
          clara hacia el listado de emprendimientos. */}
      {isDistrito && <BotonVolver />}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero — en 67178, la aérea del barrio con los dos accesos que busca la
          visita: el tour 360° (externo) y la disponibilidad de lotes con
          precios. El tour dejó de ser el hero: ahora es uno de los dos botones.
          El resto de los emprendimientos usa el funnel genérico a ancho completo. */}
      {isDistrito ? (
        <HeroAerea
          tourUrl={TOUR_360_EXTERNO}
          disponibilidadUrl="/distrito-roldan-precios"
          titulo="Distrito Roldán"
          bajada="Lotes residenciales y comerciales sobre Ruta 9 y María Auxiliadora, con financiación propia y una ubicación conectada con Roldán, Funes y Rosario."
        />
      ) : (
        <EmprendimientoFunnel
          dev={dev}
          slug={params.slug}
          displayName={displayName}
          typeName={typeName}
          status={status}
          locationName={locationName}
          lineas={paragraphs}
          photos={photos}
          media={{ hero: landing?.hero ?? mainPhoto, proyecto: landing?.proyecto, ubicacion: landing?.ubicacion, avances: landing?.avances }}
          filas={filas}
          otherDevs={otherDevs}
          whatsappUrl={whatsappUrl}
        />
      )}

      {/* Secciones de marca de Distrito Roldán (solo 67178). */}
      {isDistrito && (
        <>
          <SeccionIntro />
          <SeccionRenders />
          {/* El nombre va escrito acá y no desde el CRM, que lo tiene sin tilde. */}
          <SeccionGaleriaBarrio fotos={photos} proyecto="Distrito Roldán" />
          <SeccionPlanoLotes tourUrl={TOUR_360_EXTERNO} />
          <SeccionAvancesObra />
          <SeccionServicios />
          <SeccionUbicacion />
        </>
      )}

      {/* CTA financiación — cierre full-width, solo Distrito Roldán */}
      {isDistrito && <SeccionCtaFinanciacion />}

      {/* FAB dedicado — solo 67178 (el global se oculta acá).
          06-sep-2026: antes abría WhatsApp al celular del corredor. Esa consulta
          no quedaba en Hilo, no rotaba entre los agentes y no se medía. Ahora
          lleva al plano, que es donde vive el pedido por lote ("Consultar por
          este lote" → Hilo → rota → aviso + tarea a 15 min). El cliente igual
          termina hablando por WhatsApp, pero con el lote y su cuota adentro.
          data-fab-whatsapp: lo esconde la hoja del lote del plano cuando se abre
          (globals.css + SeccionPlanoLotes), para no taparla. */}
      {isDistrito && (
        <Link
          href="/distrito-roldan-precios"
          data-fab-whatsapp
          aria-label="Ver lotes y precios"
          className="fixed bottom-5 right-5 z-50 flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#B35E21] px-5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(179,94,33,0.45)] transition-transform hover:scale-105 hover:bg-[#9d4f18]"
        >
          <MapIcon className="h-5 w-5" aria-hidden />
          Ver lotes y precios
        </Link>
      )}
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
  const whatsappUrl = `https://wa.me/5493413340916?text=${whatsappText}`

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
                      {photo && <Image src={photo} alt={p.publication_title || p.address} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />}
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
                      {photo && <Image src={photo} alt={p.publication_title || p.address} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />}
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
