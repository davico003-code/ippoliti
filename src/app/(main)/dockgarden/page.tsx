import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, MessageCircle, Phone, FileText, CheckCircle2 } from 'lucide-react'
import { getDockGarden, unitLabel, type BrickfyUnit } from '@/lib/brickfy'
import DockGardenUnits, { DockGardenMedia } from '@/components/dockgarden/DockGardenUnits'

// Landing compartible de Dock Garden (Aldea Fisherton) — versión SI del link
// de compartir de Brickfy del desarrollador, con todas las unidades, planos,
// vistas 360 y videos. Se alimenta de la API pública de Brickfy vía ISR.
// noindex: es una herramienta de venta para enviar por WhatsApp; la página
// SEO canónica del proyecto sigue siendo /emprendimientos/67173-....

export const revalidate = 3600

const WA_PHONE = '5493412101694'
const PAGE_URL = 'https://siinmobiliaria.com/dockgarden'

export const metadata: Metadata = {
  title: 'Dock Garden — Unidades, precios y vistas 360° | SI INMOBILIARIA',
  description:
    'Todas las unidades en venta de Dock Garden Aldea Fisherton: precios, planos, fotos y recorridos 360°. Financiación en cuotas en USD. SI INMOBILIARIA.',
  robots: { index: false, follow: true },
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Dock Garden — Unidades, precios y vistas 360°',
    description:
      'Condominio y paseo comercial en Aldea Fisherton. Mirá precios, planos y recorridos 360° de todas las unidades.',
    url: PAGE_URL,
    images: [{ url: 'https://brickfy-media.nyc3.cdn.digitaloceanspaces.com/VERS/portadas/c6310535-072b-46c7-9b16-3f19be6615d2.webp' }],
  },
}

// Mensaje de WhatsApp con la lista de precios completa (solo disponibles),
// mismo criterio que el botón de la página de emprendimientos.
function buildPriceListHref(units: BrickfyUnit[]): string {
  const rows = units
    .filter(u => u.status === 'available' && u.price > 0)
    .sort((a, b) => a.price - b.price)
  const lines = rows.map(u =>
    `▪️ ${unitLabel(u)} — ${u.typology} · ${u.coveredSurfaceM2} m² — *USD ${u.price.toLocaleString('es-AR')}*`,
  )
  const msg = [
    '*Lista de precios — Dock Garden (Aldea Fisherton)*',
    `${rows.length} unidad${rows.length !== 1 ? 'es' : ''} disponible${rows.length !== 1 ? 's' : ''}:`,
    '',
    ...lines,
    '',
    `Fotos, planos y vistas 360°: ${PAGE_URL}`,
    'SI INMOBILIARIA · (341) 210-1694',
  ].join('\n')
  return `https://wa.me/?text=${encodeURIComponent(msg)}`
}

export default async function DockGardenPage() {
  const data = await getDockGarden()
  const whatsappUrl = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent('Hola! Quiero información sobre Dock Garden en Aldea Fisherton')}`

  // Fallback si Brickfy no responde y no hay versión cacheada: CTA directa.
  if (!data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-3 text-3xl font-black text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>Dock Garden — Aldea Fisherton</h1>
        <p className="mb-6 max-w-md text-gray-500">
          No pudimos cargar el listado de unidades en este momento. Escribinos y te lo mandamos al instante.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1ea952]">
            <MessageCircle className="h-5 w-5" /> Consultar por WhatsApp
          </a>
          <Link href="/emprendimientos/67173-dockgarden-aldea-fisherton"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
            Ver el emprendimiento
          </Link>
        </div>
      </div>
    )
  }

  const { project, units } = data
  const available = units.filter(u => u.status === 'available')
  const areas = units.map(u => u.coveredSurfaceM2).filter(a => a > 0).sort((a, b) => a - b)
  const dormsSet = Array.from(new Set(units.map(u => u.bedrooms))).sort((a, b) => a - b)
  const priceListHref = buildPriceListHref(units)
  const videos = (project.videos || []).map(v => ({
    nombre: v.nombre,
    // El iframe de Cloudflare Stream vive en el mismo host que el thumbnail.
    iframeUrl: v.thumbnailUrl.replace(/\/thumbnails\/.*$/, '/iframe'),
    thumbnailUrl: v.thumbnailUrl,
  }))

  const stats = [
    { label: 'Unidades disponibles', value: String(available.length) },
    { label: 'Dormitorios', value: dormsSet.join(' y ') },
    ...(areas.length > 0 ? [{ label: 'Superficies', value: `${areas[0]} a ${areas[areas.length - 1]} m²` }] : []),
    { label: 'Entrega estimada', value: project.deliveryDate },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra propia (el navbar global está oculto en esta ruta) */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="SI INMOBILIARIA — inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-si-horizontal.png" alt="SI INMOBILIARIA" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <a href="tel:+5493412101694"
              className="hidden items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:inline-flex">
              <Phone className="h-4 w-4" /> <span className="font-numeric">(341) 210-1694</span>
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#1ea952]">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[52vh] min-h-[380px] w-full md:h-[62vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* El render trae el logo del desarrollador estampado en la franja
            superior: crop anclado abajo + zoom para dejarlo fuera del encuadre
            en cualquier viewport. */}
        <img src={project.coverUrl} alt="Dock Garden — Aldea Fisherton" className="absolute inset-0 h-full w-full scale-125 object-cover object-bottom origin-bottom" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#1A5C38] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Condominio + Paseo comercial</span>
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#1A5C38]">{project.status}</span>
            </div>
            <h1 className="mb-2 text-4xl font-black text-white drop-shadow-md md:text-5xl" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Dock Garden
            </h1>
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">{project.location}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats + financiación */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-[11px] uppercase tracking-wider text-gray-400">{s.label}</p>
                <p className="mt-0.5 font-numeric text-lg font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
            <div className="col-span-2 md:col-span-1">
              <p className="text-[11px] uppercase tracking-wider text-gray-400">Financiación</p>
              <p className="mt-0.5 text-sm font-bold text-[#1A5C38]">{project.financing}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Unidades */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>Unidades y precios</h2>
            {/* Texto en Raleway (la base del sitio); Poppins queda solo para números. */}
            <p className="mt-1 text-sm text-gray-400">
              Listado oficial del desarrollador, actualizado automáticamente
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={priceListHref} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#1ea952]">
              <MessageCircle className="h-4 w-4" /> Enviar lista de precios
            </a>
            {project.brochureUrl && (
              <a href={project.brochureUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-bold text-gray-700 transition-colors hover:bg-gray-50">
                <FileText className="h-4 w-4" /> Brochure PDF
              </a>
            )}
          </div>
        </div>

        <DockGardenUnits units={units} />

        {/* Masterplan + videos */}
        <div className="mt-14">
          <DockGardenMedia blueprints={project.blueprintImageUrls || []} videos={videos} />
        </div>

        {/* Amenities */}
        {project.amenities?.length > 0 && (
          <div className="mt-14 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>Amenities y servicios</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {project.amenities.map(a => (
                <div key={a} className="flex items-center gap-2 text-sm capitalize text-gray-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1A5C38]" />
                  {a}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA final */}
      <section className="bg-[#1A5C38] px-4 py-14 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-3 text-3xl font-black text-white" style={{ fontFamily: 'Raleway, sans-serif' }}>
            ¿Querés conocer Dock Garden?
          </h2>
          <p className="mb-7 text-white/70">
            Coordinamos una visita al showroom, te mandamos el detalle de la financiación y te acompañamos en todo el proceso.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#1ea952]">
              <MessageCircle className="h-5 w-5" /> Consultar por WhatsApp
            </a>
            <a href="tel:+5493412101694"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              <Phone className="h-5 w-5" /> <span className="font-numeric">(341) 210-1694</span>
            </a>
          </div>
          <p className="mt-8 text-xs text-white/50">
            SI INMOBILIARIA · David Flores · Mat. N° 0621 ·{' '}
            <Link href="/emprendimientos" className="underline decoration-white/30 underline-offset-2 hover:text-white/80">
              Ver más emprendimientos
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
