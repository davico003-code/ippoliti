'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Check, MessageCircle, Plus } from 'lucide-react'
import { events, trackEvent } from '@/lib/analytics'
import type { BarrioCombinador, CasaCombinador, LoteCombinador } from '@/lib/hausing'

const nf = (n: number) => Math.round(n).toLocaleString('es-AR')
const usd = (n: number | null) => (n ? `USD ${nf(n)}` : 'Consultar')
const WA = '5493413340916'

// Una casa "entra" en un lote si el lote tiene al menos la superficie del lote
// sobre el que Hausing la construyó (con 5% de tolerancia).
function entra(casa: CasaCombinador, lote: LoteCombinador | null): boolean {
  if (!lote?.superficie || !casa.lote) return true
  return lote.superficie >= casa.lote * 0.95
}

function casaInicial(b: BarrioCombinador, casas: CasaCombinador[], lote: LoteCombinador | null): number | null {
  const aqui = casas.find(c => c.id === b.casaAqui && entra(c, lote))
  if (aqui) return aqui.id
  return casas.find(c => entra(c, lote))?.id ?? casas[0]?.id ?? null
}

export default function Combinador({ barrios, casas }: { barrios: BarrioCombinador[]; casas: CasaCombinador[] }) {
  const [slug, setSlug] = useState(barrios[0]?.slug)
  const barrio = barrios.find(b => b.slug === slug) ?? barrios[0]
  const [loteId, setLoteId] = useState<number | null>(barrio?.lotes[0]?.id ?? null)
  const lote = barrio?.lotes.find(l => l.id === loteId) ?? null
  const [casaId, setCasaId] = useState<number | null>(() => (barrio ? casaInicial(barrio, casas, lote) : null))
  const [verTodos, setVerTodos] = useState(false)

  const casasQueEntran = useMemo(() => casas.filter(c => entra(c, lote)), [casas, lote])
  const casa = casas.find(c => c.id === casaId) ?? null

  if (!barrio) return null

  function elegirBarrio(b: BarrioCombinador, el?: HTMLElement) {
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
    setSlug(b.slug)
    const l = b.lotes[0] ?? null
    setLoteId(l?.id ?? null)
    setCasaId(casaInicial(b, casas, l))
    setVerTodos(false)
    trackEvent('hausing_combinador_barrio', { barrio: b.slug, lotes: b.lotes.length })
  }

  function elegirLote(l: LoteCombinador) {
    setLoteId(l.id)
    if (casa && !entra(casa, l)) setCasaId(casaInicial(barrio, casas, l))
  }

  const lotesVisibles = verTodos ? barrio.lotes : barrio.lotes.slice(0, 4)

  const mensaje = lote
    ? `Hola! Me interesa combinar el lote de ${lote.superficie ? `${nf(lote.superficie)} m² ` : ''}en ${barrio.nombre} (${usd(lote.precio)}) con una casa Hausing${casa ? ` como la N° ${String(casa.numero).padStart(2, '0')} (${casa.identificador}, ${casa.barrio})` : ''}. Lote: https://siinmobiliaria.com/propiedades/${lote.slug}`
    : `Hola! Quiero una casa Hausing en ${barrio.nombre}${casa ? ` como la N° ${String(casa.numero).padStart(2, '0')}` : ''}. ¿Me avisan cuando tengan un lote disponible ahí?`

  return (
    <div>
      {/* Selector de barrio */}
      <div
        role="tablist"
        aria-label="Elegí un barrio"
        className="-mx-4 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 pb-3 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {barrios.map(b => {
          const activo = b.slug === barrio.slug
          return (
            <button
              key={b.slug}
              role="tab"
              aria-selected={activo}
              onClick={e => elegirBarrio(b, e.currentTarget)}
              className={`group flex shrink-0 snap-start items-center gap-3 rounded-2xl py-2 pl-2 pr-4 text-left transition-colors ${
                activo ? 'bg-white text-[#07120C]' : 'bg-white/[0.05] text-white ring-1 ring-white/10 hover:bg-white/[0.09]'
              }`}
            >
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl">
                <Image src={b.foto} alt="" fill sizes="44px" className="object-cover" />
              </span>
              <span>
                <span className="block whitespace-nowrap text-[14px] font-semibold leading-tight">{b.nombre}</span>
                <span
                  className={`mt-0.5 block whitespace-nowrap text-[11px] ${activo ? 'text-[#1A5C38]' : 'text-white/50'}`}
                >
                  {b.lotes.length
                    ? `${b.lotes.length} ${b.lotes.length === 1 ? 'lote disponible' : 'lotes disponibles'}`
                    : b.casaAqui
                      ? 'Con casa Hausing'
                      : 'Sin lotes publicados hoy'}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Panel */}
      <div className="mt-4 grid overflow-hidden rounded-3xl bg-[#0C1C14] ring-1 ring-white/[0.08] lg:grid-cols-[1fr_1.05fr]">
        {/* El barrio */}
        <div className="relative min-h-[340px] lg:min-h-[640px]">
          <Image
            key={barrio.foto}
            src={barrio.foto}
            alt={barrio.nombre}
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="hz-fade object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07120C] via-[#07120C]/60 to-[#07120C]/25" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8FD1AE] [text-shadow:0_1px_8px_rgba(0,0,0,.6)]">{barrio.tier}</p>
            <h3 className="mt-2 text-[30px] font-semibold leading-[1.05] text-white sm:text-[38px]">{barrio.nombre}</h3>
            <p className="mt-3 max-w-[440px] text-[15px] leading-relaxed text-white/75">“{barrio.frase}”</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {barrio.datos.map(d => (
                <li key={d} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-sm">
                  {d}
                </li>
              ))}
            </ul>
            <Link
              href={barrio.href}
              className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/80 transition-colors hover:text-white"
            >
              Conocé {barrio.nombre} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Lote + casa */}
        <div className="flex flex-col gap-8 p-6 sm:p-8">
          <div>
            <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/50">
              <span className="font-numeric text-[#8FD1AE]">01</span> Tu lote en {barrio.nombre}
            </p>
            {barrio.lotes.length ? (
              <>
                <ul className="mt-4 flex flex-col gap-2">
                  {lotesVisibles.map(l => {
                    const activo = l.id === lote?.id
                    return (
                      <li key={l.id}>
                        <div
                          className={`flex items-center gap-3 rounded-xl p-2 pr-3 transition-colors ${
                            activo ? 'bg-white/[0.09] ring-1 ring-white/40' : 'ring-1 ring-white/[0.08] hover:bg-white/[0.04]'
                          }`}
                        >
                          <button
                            onClick={() => elegirLote(l)}
                            aria-pressed={activo}
                            className="flex flex-1 items-center gap-3 text-left"
                          >
                            <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                              {l.foto && <Image src={l.foto} alt="" fill sizes="64px" className="object-cover" />}
                            </span>
                            <span className="flex-1">
                              <span className="font-numeric block text-[16px] text-white">
                                {l.superficie ? `${nf(l.superficie)} m²` : 'Lote'}
                              </span>
                              <span className="font-numeric block text-[13px] text-white/55">{usd(l.precio)}</span>
                            </span>
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                                activo ? 'bg-white text-[#07120C]' : 'ring-1 ring-white/25'
                              }`}
                            >
                              {activo && <Check className="h-3 w-3" strokeWidth={3} />}
                            </span>
                          </button>
                          <Link
                            href={`/propiedades/${l.slug}`}
                            className="rounded-full p-1.5 text-white/45 transition-colors hover:text-white"
                            aria-label="Ver la ficha del lote"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                {barrio.lotes.length > 4 && !verTodos && (
                  <button
                    onClick={() => setVerTodos(true)}
                    className="mt-2 text-[13px] font-semibold text-white/60 transition-colors hover:text-white"
                  >
                    Ver los {barrio.lotes.length} lotes
                  </button>
                )}
              </>
            ) : (
              <div className="mt-4 rounded-xl bg-white/[0.04] p-4 text-[14px] leading-relaxed text-white/70 ring-1 ring-white/[0.08]">
                Hoy no tenemos lotes publicados en {barrio.nombre}
                {barrio.loteDesde
                  ? barrio.loteHasta && barrio.loteHasta !== barrio.loteDesde
                    ? ` (allí los lotes van de ${nf(barrio.loteDesde)} a ${nf(barrio.loteHasta)} m²)`
                    : ` (allí los lotes son de ${nf(barrio.loteDesde)} m²)`
                  : ''}.
                {' '}Si querés vivir acá, lo buscamos por vos.
              </div>
            )}
          </div>

          <div>
            <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/50">
              <span className="font-numeric text-[#8FD1AE]">02</span>
              {lote ? 'Casas Hausing que entran en ese lote' : 'Tu casa Hausing'}
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(casasQueEntran.length ? casasQueEntran : casas).map(c => {
                const activo = c.id === casa?.id
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setCasaId(c.id)}
                      aria-pressed={activo}
                      className={`group block w-full overflow-hidden rounded-xl text-left transition ${
                        activo ? 'ring-2 ring-white' : 'ring-1 ring-white/[0.08] hover:ring-white/30'
                      }`}
                    >
                      <span className="relative block aspect-[4/3] bg-white/5">
                        {c.foto && <Image src={c.foto} alt="" fill sizes="(max-width:640px) 45vw, 180px" className="object-cover" />}
                        {c.id === barrio.casaAqui && (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-[#07120C]/75 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                            Ya está en este barrio
                          </span>
                        )}
                      </span>
                      <span className="block p-2.5">
                        <span className="font-numeric block text-[12px] tracking-[0.1em] text-[#8FD1AE]">
                          N° {String(c.numero).padStart(2, '0')}
                        </span>
                        <span className="font-numeric mt-0.5 block text-[13px] text-white">
                          {c.construida ? `${nf(c.construida)} m²` : c.identificador}
                          {c.dormitorios ? ` · ${c.dormitorios} dorm.` : ''}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Resumen */}
          <div className="mt-auto rounded-2xl bg-white/[0.05] p-5 ring-1 ring-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Tu combinación</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[16px] leading-snug text-white">
              <span>{lote ? <>Lote <span className="font-numeric">{lote.superficie ? `${nf(lote.superficie)} m²` : ''}</span> en {barrio.nombre}</> : barrio.nombre}</span>
              {casa && (
                <>
                  <Plus className="h-4 w-4 text-[#8FD1AE]" />
                  <span>
                    casa como la <span className="font-numeric">N° {String(casa.numero).padStart(2, '0')}</span>
                  </span>
                </>
              )}
            </p>
            <a
              href={`https://wa.me/${WA}?text=${encodeURIComponent(mensaje)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                events.clickWhatsapp(lote?.id, `Hausing combinador · ${barrio.nombre}`)
                trackEvent('hausing_combinador_whatsapp', { barrio: barrio.slug, lote: lote?.id ?? 0, casa: casa?.id ?? 0 })
              }}
              className="hz-btn hz-btn-green mt-4 w-full"
            >
              <MessageCircle className="h-4 w-4" />
              {lote ? 'Quiero esta combinación' : `Avisame cuando haya lote en ${barrio.nombre}`}
            </a>
            <p className="mt-3 text-center text-[12px] text-white/45">
              Hausing cotiza la obra a medida sobre tu lote. Te respondemos por WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
