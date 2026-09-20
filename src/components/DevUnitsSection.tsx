'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Send } from 'lucide-react'
import type { DevUnit } from '@/lib/developments'

function getPhoto(u: DevUnit): string | null {
  const photos = (u.photos || []).filter(p => !p.is_blueprint)
  const cover = photos.find(p => p.is_front_cover)
  // Preferir el thumb (las cards son chicas): la original full-res de Tokko
  // pesa MB por card y se descargaban todas de una.
  return (cover || photos[0])?.thumb || (cover || photos[0])?.image || null
}

function getDorms(u: DevUnit): number {
  return u.suite_amount || u.room_amount || 0
}

function getArea(u: DevUnit): number {
  return parseFloat(u.roofed_surface || u.total_surface || u.surface || '0') || 0
}

const TYPE_MAP: Record<string, string> = {
  'Apartment': 'Departamento',
  'House': 'Casa',
  'Land': 'Terreno',
  'Bussiness Premises': 'Local comercial',
  'Business Premises': 'Local comercial',
  'Garage': 'Cochera',
  'Office': 'Oficina',
  'PH': 'PH',
  'Duplex': 'Dúplex',
  'Local': 'Local comercial',
  // Completado con el resto de tipos del feed para no mostrar inglés crudo.
  'Warehouse': 'Galpón',
  'Condo': 'Condominio',
  'Countryside': 'Campo / Chacra',
  'Country House': 'Casa de campo',
  'Farm': 'Campo',
  'Building': 'Edificio',
  'Store': 'Local comercial',
}

function translateType(name: string): string {
  return TYPE_MAP[name] || name
}

function getUnitTitle(u: DevUnit): string {
  // Prefer publication_title or address over reference_code
  if (u.publication_title && !u.publication_title.match(/^[A-Z]{2,4}\d{5,}/)) return u.publication_title
  if (u.address && u.address.trim()) return u.address
  if (u.publication_title) return u.publication_title
  return translateType(u.type?.name || 'Unidad')
}

interface Props {
  units: DevUnit[]
  devName: string
  whatsappUrl: string
  location?: string
  /** URL absoluta de la página del emprendimiento — habilita "Enviar lista de precios". */
  pageUrl?: string
}

// Con pocas unidades los filtros por dormitorio son ruido: la lista entra entera.
const MIN_UNITS_FOR_FILTERS = 7

export default function DevUnitsSection({ units, devName, whatsappUrl, location, pageUrl }: Props) {
  const [activeTab, setActiveTab] = useState<number | null>(null)

  // Link wa.me SIN número: abre WhatsApp con la lista completa de precios ya
  // redactada y deja elegir el destinatario. Se arma desde las units vivas de
  // Tokko, así la lista nunca queda desactualizada.
  const priceListHref = useMemo(() => {
    if (!pageUrl) return null
    const rows = units
      .map(u => {
        const p = u.operations?.[0]?.prices?.[0]
        return { u, price: p?.price || 0, currency: p?.currency || 'USD' }
      })
      .sort((a, b) => (a.price || Number.MAX_SAFE_INTEGER) - (b.price || Number.MAX_SAFE_INTEGER))
    if (!rows.some(r => r.price > 0)) return null

    // El encabezado ya nombra el emprendimiento: si el título termina en
    // "en <emprendimiento/zona>" se recorta para que cada línea quede corta.
    const ctx = `${devName} ${location || ''}`.toLowerCase()
    const lines = rows.map(({ u, price, currency }) => {
      const area = getArea(u)
      let title = getUnitTitle(u)
      const m = title.match(/^(.*\S)\s+en\s+(.+)$/i)
      if (m && m[2].toLowerCase().split(/[\s,]+/).some(w => w.length > 3 && ctx.includes(w))) {
        title = m[1]
      }
      const parts = [title, ...(area > 0 && !title.includes('m²') ? [`${area.toLocaleString('es-AR')} m²`] : [])]
      const precio = price > 0 ? `*${currency} ${price.toLocaleString('es-AR')}*` : 'Consultar'
      return `▪️ ${parts.join(' · ')} — ${precio}`
    })
    const msg = [
      `*Lista de precios — ${devName}*${location && !devName.toLowerCase().includes(location.toLowerCase()) ? ` (${location})` : ''}`,
      `${rows.length} unidad${rows.length !== 1 ? 'es' : ''} en venta:`,
      '',
      ...lines,
      '',
      `Más info y fotos: ${pageUrl}`,
      'SI INMOBILIARIA · (341) 334-0916',
    ].join('\n')
    return `https://wa.me/?text=${encodeURIComponent(msg)}`
  }, [units, devName, location, pageUrl])

  // Build available tabs from real data
  const tabs = useMemo(() => {
    const dormCounts = new Map<number, number>()
    for (const u of units) {
      const d = getDorms(u)
      dormCounts.set(d, (dormCounts.get(d) || 0) + 1)
    }
    const sorted = Array.from(dormCounts.keys()).sort((a, b) => a - b)
    return sorted.map(d => ({
      value: d,
      label: d === 0 ? 'Monoambiente' : `${d} Dormitorio${d > 1 ? 's' : ''}`,
      count: dormCounts.get(d) || 0,
    }))
  }, [units])

  // De menor a mayor precio: la lista se lee como una lista de precios.
  const filtered = useMemo(() => {
    const priceOf = (u: DevUnit) => u.operations?.[0]?.prices?.[0]?.price || Number.MAX_SAFE_INTEGER
    return (activeTab !== null ? units.filter(u => getDorms(u) === activeTab) : units)
      .slice()
      .sort((a, b) => priceOf(a) - priceOf(b))
  }, [units, activeTab])

  if (units.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <p className="mb-4 text-gray-600">No hay unidades cargadas en este momento.</p>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-bold text-white transition-colors hover:bg-[#1ea952]">
          Consultanos por disponibilidad
        </a>
      </div>
    )
  }

  return (
    <div>
      {/* Filter tabs */}
      {tabs.length > 1 && units.length >= MIN_UNITS_FOR_FILTERS && (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveTab(null)}
            className={`min-h-11 shrink-0 rounded-full px-5 text-sm font-semibold transition-colors ${
              activeTab === null ? 'bg-[#1A5C38] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Todas
          </button>
          {tabs.map(t => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={`min-h-11 shrink-0 rounded-full px-5 text-sm font-semibold transition-colors ${
                activeTab === t.value ? 'bg-[#1A5C38] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Lista simple: una fila por unidad, toda la fila lleva a la ficha. */}
      <ul className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {filtered.map(u => {
          const photo = getPhoto(u)
          const area = getArea(u)
          const price = u.operations?.[0]?.prices?.[0]
          const dorms = getDorms(u)
          const specs = [
            area > 0 ? `${area.toLocaleString('es-AR')} m²` : null,
            dorms > 0 ? `${dorms} dorm.` : null,
            u.bathroom_amount > 0 ? `${u.bathroom_amount} baño${u.bathroom_amount > 1 ? 's' : ''}` : null,
            u.parking_lot_amount > 0 ? `${u.parking_lot_amount} coch.` : null,
          ].filter(Boolean) as string[]

          return (
            <li key={u.id}>
              <Link
                href={`/propiedades/${u.id}-unidad`}
                className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-gray-50 sm:px-6"
              >
                <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:block">
                  {photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold leading-snug text-gray-900 sm:truncate sm:text-base">
                    {getUnitTitle(u)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 font-numeric">
                    {specs.join(' · ') || translateType(u.type?.name || 'Unidad')}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold text-[#1A5C38] font-numeric sm:text-xl">
                    {price?.price ? `${price.currency || 'USD'} ${price.price.toLocaleString('es-AR')}` : 'Consultar'}
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold text-gray-400 transition-colors group-hover:text-[#1A5C38]">
                    Ver unidad &rarr;
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      {priceListHref && (
        <div className="mt-5 flex justify-center sm:justify-end">
          <a
            href={priceListHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-300 bg-white px-5 text-sm font-bold text-gray-700 transition-colors hover:border-[#1A5C38] hover:text-[#1A5C38]"
          >
            <Send className="h-4 w-4" aria-hidden />
            Enviar lista de precios
          </a>
        </div>
      )}
    </div>
  )
}
