import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle, Phone, FileText, CheckCircle2 } from 'lucide-react'
import { getDockGarden } from '@/lib/brickfy'
import DockGardenUnits, { DockGardenMedia } from '@/components/dockgarden/DockGardenUnits'
import { OficinaVentas, SeccionCercanias } from '@/components/dockgarden/Confianza'
import MotorDockGarden from '@/components/dockgarden/experiencia/MotorDockGarden'
import { DGX_ABAJO, DGX_EXPLORAR, DGX_PORTADA } from '@/components/dockgarden/experiencia/markup'
import '@/components/dockgarden/experiencia/experiencia.css'

// Landing compartible de Dock Garden (Aldea Fisherton) — versión SI del link
// de compartir de Brickfy del desarrollador, con todas las unidades, planos,
// vistas 360 y videos. Se alimenta de la API pública de Brickfy vía ISR.
// Desde el 25-nov-2026 arriba va la "experiencia" (igual que Galinda!): portada,
// maqueta con las calles y los pisos de la torre en venta, plano real y ficha
// por unidad. El HTML lo dibuja el servidor (experiencia/markup.ts) y lo anima
// experiencia/motor.js; precio y estado de cada unidad le llegan en vivo por el
// script #dgxVivo. Debajo sigue la lista oficial con todas las unidades.
// noindex: es una herramienta de venta para enviar por WhatsApp; la página
// SEO canónica del proyecto sigue siendo /emprendimientos/67173-....

export const revalidate = 3600

const WA_PHONE = '5493413340916'
const PAGE_URL = 'https://siinmobiliaria.com/dockgarden'
// Mismo ancho que el header y la lista de esta página.
const CONTENEDOR = 'mx-auto w-full max-w-6xl px-4 sm:px-6'

export const metadata: Metadata = {
  title: 'Dock Garden — Unidades, precios y vistas 360°',
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
  // Rangos de lo que está en venta (sin las vendidas), como la lista de abajo.
  const enVenta = units.filter(u => u.status === 'available' || u.status === 'reserved')
  const areas = enVenta.map(u => u.coveredSurfaceM2).filter(a => a > 0).sort((a, b) => a - b)
  const dormsSet = Array.from(new Set(enVenta.map(u => u.bedrooms))).sort((a, b) => a - b)
  const m2 = (n: number) => n.toLocaleString('es-AR')
  const videos = (project.videos || []).map(v => ({
    nombre: v.nombre,
    // El iframe de Cloudflare Stream vive en el mismo host que el thumbnail.
    iframeUrl: v.thumbnailUrl.replace(/\/thumbnails\/.*$/, '/iframe'),
    thumbnailUrl: v.thumbnailUrl,
  }))

  // Precio y estado de hoy por unidad, para la maqueta (el id de Brickfy sin su prefijo: 2-1-1 = torre-piso-unidad).
  const vivo = Object.fromEntries(
    units.map(u => [u.id.replace(/^DOCK_GARDEN-/, ''), { p: u.price, pref: !!u.preferencial, e: u.status === 'available' ? 'd' : u.status === 'reserved' ? 'r' : 'v' }]),
  )

  const stats = [
    { label: 'Unidades disponibles', value: String(available.length) },
    // "1, 2 y 3" (antes salía "1 y 2 y 3").
    { label: 'Dormitorios', value: dormsSet.length > 1 ? `${dormsSet.slice(0, -1).join(', ')} y ${dormsSet[dormsSet.length - 1]}` : String(dormsSet[0] ?? '') },
    ...(areas.length > 0 ? [{ label: 'Superficies', value: `${m2(areas[0])} a ${m2(areas[areas.length - 1])} m²` }] : []),
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
          <a href="tel:+5493413340916"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-700 transition-colors hover:bg-gray-50">
            <Phone className="h-4 w-4" /> <span className="hidden font-numeric sm:inline">(341) 334-0916</span><span className="sm:hidden">Llamar</span>
          </a>
        </div>
      </header>

      {/* Portada de la experiencia (reemplaza al hero anterior) */}
      <div className="dgx" dangerouslySetInnerHTML={{ __html: DGX_PORTADA }} />

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

      {/* Elegir la unidad en la maqueta antes de la lista completa. El motor lee
          de acá el precio y el estado de hoy de cada unidad. */}
      <script id="dgxVivo" type="application/json" dangerouslySetInnerHTML={{ __html: JSON.stringify(vivo).replace(/</g, '\\u003c') }} />
      <div className="dgx" dangerouslySetInnerHTML={{ __html: DGX_EXPLORAR }} />

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

      {/* Después de la lista: el resto de la experiencia (cómo se vive cada
          tipología, terminaciones, la obra, quién lo hace) y qué hay cerca. */}
      <div className="dgx" dangerouslySetInnerHTML={{ __html: DGX_ABAJO }} />
      <SeccionCercanias contenedor={CONTENEDOR} />
      <div className="bg-white pb-12">
        <div className={CONTENEDOR}>
          <OficinaVentas className="max-w-md" />
        </div>
      </div>

      {/* Footer compacto — el contacto vive en el FAB de WhatsApp. */}
      <footer className="border-t border-gray-100 bg-white px-4 py-8 text-center">
        <p className="text-xs text-gray-400">
          SI INMOBILIARIA · David Flores · Mat. N° 0621 ·{' '}
          <a href="tel:+5493413340916" className="font-numeric hover:text-gray-600">(341) 334-0916</a> ·{' '}
          <Link href="/emprendimientos" className="underline decoration-gray-300 underline-offset-2 hover:text-gray-600">
            Ver más emprendimientos
          </Link>
        </p>
      </footer>

      {/* FAB WhatsApp con mensaje pre-cargado, solo en pantallas grandes: en el
          celular la experiencia ya trae su barra fija "Consultar". */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Consultar por WhatsApp"
        className="fixed bottom-5 right-5 z-50 hidden h-14 w-14 min-[761px]:flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_14px_rgba(37,211,102,0.45)] transition-transform hover:scale-105 hover:bg-[#1ea952]"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
        </svg>
      </a>
      <MotorDockGarden />
    </div>
  )
}
