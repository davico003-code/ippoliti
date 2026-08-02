'use client'

import { CheckCircle2, Clock3, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'

import HeroGallery from '@/components/v/HeroGallery'
import KeyDataGrid from '@/components/v/KeyDataGrid'
import Surfaces from '@/components/v/Surfaces'
import StructuredDescription from '@/components/v/StructuredDescription'
import AmenityChips from '@/components/v/AmenityChips'
import LocationMap from '@/components/v/LocationMap'
import type { FichaSnapshot } from '@/lib/ficha'
import {
  type TokkoProperty,
  formatPrice,
  getAllPhotos,
  getDescription,
  getOperationType,
  getRoofedArea,
  getLotSurface,
  translatePropertyType,
} from '@/lib/tokko'

const priceNumber = (property: TokkoProperty): number =>
  Number(property.operations?.flatMap((operation) => operation.prices ?? [])[0]?.price ?? 0)

function snapshotFromMarketProperty(property: TokkoProperty): FichaSnapshot {
  const photos = property.market_photo_rights === 'autorizadas' ? getAllPhotos(property) : []
  const roofed = getRoofedArea(property)
  const lot = getLotSurface(property)
  const lat = property.geo_lat ? Number(property.geo_lat) : null
  const lng = property.geo_long ? Number(property.geo_long) : null
  const price = priceNumber(property)
  const currency = property.operations?.flatMap((operation) => operation.prices ?? [])[0]?.currency ?? 'USD'
  const tags = (property.tags ?? []).map((tag) => tag.name).filter(Boolean)

  return {
    fotos: photos,
    blueprints: [],
    ogImage: photos[0] ?? null,
    precio: formatPrice(property),
    precioRaw: price,
    moneda: currency,
    operacion: getOperationType(property) || 'Venta',
    tipo: translatePropertyType(property.type?.name) || property.type?.name || 'Propiedad',
    tituloGenerico: property.publication_title || `${property.type?.name || 'Propiedad'} en ${property.address}`,
    zonaAprox: property.location?.name || property.address,
    zonaCompleta: property.location?.short_location || property.location?.name || property.address,
    direccionCalle: '',
    m2cubiertos: roofed,
    m2totales: null,
    m2terreno: lot && lot !== roofed ? lot : null,
    m2semicubiertos: null,
    m2descubiertos: null,
    ambientes: null,
    dormitorios: property.suite_amount || property.room_amount || null,
    banos: property.bathroom_amount || null,
    cocheras: property.parking_lot_amount || property.covered_parking_lot || null,
    antiguedad: property.age > 0 ? property.age : null,
    estado: property.property_condition || undefined,
    descripcion: getDescription(property),
    caracteristicas: tags,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  }
}

function valueTier(discount: number | null | undefined): { title: string; detail: string } {
  if (discount != null && discount >= 25) {
    return { title: 'Oportunidad excepcional', detail: `${Math.round(discount)}% debajo de la mediana comparable` }
  }
  if (discount != null && discount >= 15) {
    return { title: 'Muy buen valor', detail: `${Math.round(discount)}% debajo de la mediana comparable` }
  }
  if (discount != null && discount >= 8) {
    return { title: 'Precio competitivo', detail: `${Math.round(discount)}% debajo de la mediana comparable` }
  }
  return { title: 'Selección verificada', detail: 'Cumple los criterios de esta búsqueda' }
}

function verifiedLabel(value: string | null | undefined): string {
  if (!value) return 'Verificación vigente'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Verificación vigente'
  return `Verificada el ${new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(date)}`
}

export default function MarketVerFicha({
  property,
  whatsappUrl,
}: {
  property: TokkoProperty
  whatsappUrl: string
}) {
  const snapshot = snapshotFromMarketProperty(property)
  const tier = valueTier(property.market_discount_pct)
  const hasPhotos = snapshot.fotos.length > 0
  const hasCoords = snapshot.lat != null && snapshot.lng != null

  return (
    <div className="min-h-screen bg-[#F5F7F4] pb-24 md:pb-12" style={{ fontFamily: "'Montserrat', 'Raleway', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-[1180px] px-0 py-0 md:px-6 md:py-6">
        <section className="border-y border-[#D9E8DE] bg-[#EFF7F1] px-5 py-3 md:mb-4 md:rounded-2xl md:border">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#17613C] text-white">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#17613C]">Mercado verificado por SI INMOBILIARIA</p>
              <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-[#315A42]">
                Publicación de otro participante del mercado. Reconfirmamos disponibilidad antes de coordinar cualquier visita.
              </p>
            </div>
          </div>
        </section>

        {hasPhotos ? (
          <HeroGallery photos={snapshot.fotos} />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-[#E9F0EB] px-8 text-center md:aspect-[5/2] md:rounded-2xl">
            <div className="max-w-sm">
              <ShieldCheck className="mx-auto h-10 w-10 text-[#17613C]" aria-hidden="true" />
              <p className="mt-3 text-base font-extrabold text-[#183D2A]">Portada protegida</p>
              <p className="mt-1 text-sm leading-relaxed text-[#52705E]">No publicamos una imagen hasta confirmar que está autorizada y libre de logos de terceros.</p>
            </div>
          </div>
        )}

        <div className="grid gap-5 px-4 pt-5 md:grid-cols-[minmax(0,1fr)_320px] md:px-0 md:pt-6">
          <main className="min-w-0 rounded-2xl border border-[#E2E7E3] bg-white p-5 shadow-[0_12px_35px_rgba(20,58,37,0.06)] md:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#17613C] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {tier.title}
              </span>
              <span className="rounded-full border border-[#CFE3D6] bg-[#F4FAF6] px-3 py-1.5 text-[11px] font-bold tabular-nums text-[#17613C]">
                {tier.detail}
              </span>
            </div>

            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#6B7F70]">{snapshot.operacion} · {snapshot.tipo}</p>
            <h1 className="mt-2 text-balance text-[25px] font-extrabold leading-tight text-[#17221B] md:text-[34px]">
              {snapshot.tituloGenerico}
            </h1>
            <p className="mt-2 text-sm font-medium text-[#607066]">{snapshot.zonaCompleta}</p>
            <p className="mt-5 text-[34px] font-extrabold leading-none tracking-[-0.03em] tabular-nums text-[#111A14] md:text-[44px]">{snapshot.precio}</p>

            <KeyDataGrid snapshot={snapshot} />
            <Surfaces snapshot={snapshot} />
            {snapshot.descripcion && <StructuredDescription text={snapshot.descripcion} />}
            {snapshot.caracteristicas.length > 0 && (
              <AmenityChips caracteristicas={snapshot.caracteristicas} />
            )}
            {hasCoords && (
              <section className="mt-9">
                <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.06em] text-[#1A1A1A]">Ubicación aproximada</h2>
                <LocationMap lat={snapshot.lat!} lng={snapshot.lng!} />
              </section>
            )}
          </main>

          <aside className="h-fit rounded-2xl border border-[#DCE7DF] bg-white p-5 shadow-[0_12px_35px_rgba(20,58,37,0.08)] md:sticky md:top-20">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#17613C]">Por qué te la mostramos</p>
            <h2 className="mt-2 text-xl font-extrabold leading-tight text-[#17221B]">{tier.title}</h2>
            <p className="mt-1 text-sm font-semibold tabular-nums text-[#466052]">{tier.detail}</p>
            <ul className="mt-5 space-y-3 text-[13px] font-medium leading-snug text-[#43544A]">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#17613C]" aria-hidden="true" /> Precio comparado dentro del mismo barrio y tipología.</li>
              <li className="flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-[#17613C]" aria-hidden="true" /> Sin portal, inmobiliaria ni logo visible.</li>
              <li className="flex gap-2"><Clock3 className="h-4 w-4 shrink-0 text-[#17613C]" aria-hidden="true" /> {verifiedLabel(property.market_verified_at)}.</li>
            </ul>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-[#17613C] px-4 text-center text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(23,97,60,0.22)] transition-colors hover:bg-[#124E30] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#17613C]/25"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" /> Consultar esta oportunidad
            </a>
            <p className="mt-2 text-center text-[11px] font-medium leading-relaxed text-[#718078]">Te respondemos desde SI INMOBILIARIA y reconfirmamos la disponibilidad.</p>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#D8E4DB] bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] pt-2 shadow-[0_-8px_24px_rgba(20,58,37,0.12)] backdrop-blur md:hidden">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto flex min-h-12 max-w-lg touch-manipulation items-center justify-center gap-2 rounded-xl bg-[#17613C] px-4 text-sm font-extrabold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#17613C]/25"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" /> Consultar disponibilidad
        </a>
      </div>
    </div>
  )
}
