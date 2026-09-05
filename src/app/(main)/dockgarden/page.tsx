import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, MessageCircle, Phone, FileText, CheckCircle2 } from 'lucide-react'
import { getDockGarden } from '@/lib/brickfy'
import DockGardenUnits, { DockGardenMedia } from '@/components/dockgarden/DockGardenUnits'

// Landing compartible de Dock Garden (Aldea Fisherton) — versión SI del link
// de compartir de Brickfy del desarrollador, con todas las unidades, planos,
// vistas 360 y videos. Se alimenta de la API pública de Brickfy vía ISR.
// noindex: es una herramienta de venta para enviar por WhatsApp; la página
// SEO canónica del proyecto sigue siendo /emprendimientos/67173-....

export const revalidate = 3600

const WA_PHONE = '5493413340916'
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
    // JPEG propio 1200x630 (<300KB) servido desde nuestro dominio: WhatsApp no
    // siempre renderiza webp de terceros, y el original traía el sello del
    // desarrollador. Generado del cover de Brickfy recortando la franja del logo.
    images: [{ url: 'https://siinmobiliaria.com/og-dockgarden.jpg', width: 1200, height: 630, type: 'image/jpeg', alt: 'Dock Garden — Aldea Fisherton' }],
  },
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
          {/* Único WhatsApp de la página = FAB flotante; el header queda liviano. */}
          <a href="tel:+5493412101694"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-700 transition-colors hover:bg-gray-50">
            <Phone className="h-4 w-4" /> <span className="hidden font-numeric sm:inline">(341) 210-1694</span><span className="sm:hidden">Llamar</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      {/* Hero compacto en mobile: la info manda, la foto acompaña. */}
      <section className="relative h-[34vh] min-h-[240px] w-full md:h-[56vh]">
        {/* El render trae el logo del desarrollador estampado en la franja
            superior: crop anclado abajo + zoom para dejarlo fuera del encuadre
            en cualquier viewport. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
          {project.brochureUrl && (
            <a href={project.brochureUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-bold text-gray-700 transition-colors hover:bg-gray-50">
              <FileText className="h-4 w-4" /> Brochure PDF
            </a>
          )}
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

      {/* Footer compacto — el contacto vive en el FAB de WhatsApp. */}
      <footer className="border-t border-gray-100 bg-white px-4 py-8 text-center">
        <p className="text-xs text-gray-400">
          SI INMOBILIARIA · David Flores · Mat. N° 0621 ·{' '}
          <a href="tel:+5493412101694" className="font-numeric hover:text-gray-600">(341) 210-1694</a> ·{' '}
          <Link href="/emprendimientos" className="underline decoration-gray-300 underline-offset-2 hover:text-gray-600">
            Ver más emprendimientos
          </Link>
        </p>
      </footer>

      {/* FAB WhatsApp — ÚNICO botón de WhatsApp de la página, con mensaje
          pre-cargado (mismo patrón que Distrito Roldán; el global se oculta acá). */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Consultar por WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_14px_rgba(37,211,102,0.45)] transition-transform hover:scale-105 hover:bg-[#1ea952]"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
        </svg>
      </a>
    </div>
  )
}
