'use client'

// Masterplan interactivo de Fisherton Work: los 43 lotes calcados del plano
// oficial. Se toca un lote para ver sus datos, o varios para simular una
// unidad unificada (el desarrollo permite unir lotes linderos). El CTA arma el
// WhatsApp con los lotes elegidos ya escritos.

import { useMemo, useState } from 'react'
import { MessageCircle, X, Layers, MapPin, Car, Building2, Ruler } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import {
  FRENTE_LABEL,
  FW_FOS,
  FW_MODULO,
  LOTES,
  MANZANAS,
  formatM2,
  fwWhatsappUrl,
  sonContiguos,
  type Lote,
} from '@/lib/fisherton-work'

const GREEN = '#1A5C38'
const RED = '#F40009'

type Filtro = 'todos' | 'pujato' | 'pasaje' | 'grandes' | 'paseo'

const FILTROS: { id: Filtro; label: string; match: (l: Lote) => boolean }[] = [
  { id: 'todos', label: 'Todos', match: () => true },
  { id: 'pujato', label: 'Frente a Av. Pujato', match: (l) => l.frente === 'pujato' },
  { id: 'pasaje', label: 'Pasaje interno', match: (l) => l.frente === 'pasaje' },
  { id: 'grandes', label: 'Más de 450 m²', match: (l) => l.m2 > 450 },
  { id: 'paseo', label: 'Paseo Fisherton Work', match: (l) => !!l.paseo },
]

function listaLotes(nums: number[]) {
  if (nums.length === 1) return `el lote ${nums[0]}`
  return `los lotes ${nums.slice(0, -1).join(', ')} y ${nums[nums.length - 1]}`
}

export default function Masterplan() {
  const [sel, setSel] = useState<number[]>([])
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [hover, setHover] = useState<number | null>(null)

  const match = FILTROS.find((f) => f.id === filtro)!.match
  const elegidos = useMemo(
    () => LOTES.filter((l) => sel.includes(l.n)).sort((a, b) => a.n - b.n),
    [sel],
  )

  function toggle(n: number) {
    setSel((prev) => {
      const next = prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
      if (!prev.includes(n)) trackEvent('fw_lote_click', { lote: n, seleccionados: next.length })
      return next
    })
  }

  const terreno = elegidos.reduce((s, l) => s + l.m2, 0)
  const contiguos = sonContiguos(elegidos)
  const nums = elegidos.map((l) => l.n)
  const waText =
    elegidos.length === 0
      ? 'Hola! Quiero conocer la disponibilidad de lotes en Fisherton Work.'
      : elegidos.length === 1
        ? `Hola! Quiero consultar por el lote ${nums[0]} de Fisherton Work (${formatM2(terreno)} m², ${FRENTE_LABEL[elegidos[0].frente].toLowerCase()}). ¿Está disponible? ¿Precio y financiación?`
        : contiguos
          ? `Hola! Me interesa unificar ${listaLotes(nums)} de Fisherton Work (${formatM2(terreno)} m² de terreno). ¿Están disponibles? ¿Precio y financiación?`
          : `Hola! Me interesan ${listaLotes(nums)} de Fisherton Work. ¿Están disponibles? ¿Precio y financiación?`

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
      {/* ── Plano ── */}
      <div className="min-w-0 rounded-3xl border border-gray-200 bg-white p-3 shadow-sm md:p-5">
        <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              aria-pressed={filtro === f.id}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                filtro === f.id
                  ? 'border-[#1A5C38] bg-[#1A5C38] text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* En el celular el plano se desliza de costado: a ancho de pantalla
            cada lote quedaría de ~20px y no se podría tocar. */}
        <div className="-mx-3 overflow-x-auto px-3 md:mx-0 md:px-0">
          <svg
            viewBox="70 190 870 500"
            className="block h-auto w-[760px] select-none md:w-full"
            role="group"
            aria-label="Masterplan de Fisherton Work: 43 lotes"
          >
            {/* Calles */}
            <rect x="70" y="190" width="870" height="500" fill="#F4F5F4" />
            <rect x="70" y="204" width="870" height="22" fill="#E6E8E6" />
            <rect x="96" y="190" width="30" height="500" fill="#E6E8E6" />
            <rect x="70" y="466" width="660" height="22" fill="#E6E8E6" />
            <rect x="70" y="646" width="870" height="30" fill="#E6E8E6" />
            <text x="560" y="219" className="fill-gray-400" fontSize="9.5" fontWeight="700" letterSpacing="2">CALLE SANTA COLOMA</text>
            <text x="115" y="560" className="fill-gray-400" fontSize="9.5" fontWeight="700" letterSpacing="2" transform="rotate(-90 115 560)">SÁNCHEZ DE LORIA</text>
            <text x="300" y="480.5" className="fill-gray-400" fontSize="9" fontWeight="700" letterSpacing="2">PASAJE 14127</text>
            <text x="560" y="665" className="fill-gray-500" fontSize="10" fontWeight="800" letterSpacing="2">AV. HERNÁN PUJATO</text>

            {/* Acceso y Circunvalación */}
            <g>
              <text x="132" y="484" fontSize="9" fontWeight="800" fill={RED}>ACCESO</text>
              <path d="M76 477 h50" stroke={RED} strokeWidth="1.6" markerEnd="url(#fw-arrow)" />
            </g>
            <g>
              <text x="790" y="684" fontSize="9" fontWeight="800" fill={GREEN} letterSpacing="1">A 700 m AV. CIRCUNVALACIÓN</text>
              <path d="M912 681 h20" stroke={GREEN} strokeWidth="1.6" markerEnd="url(#fw-arrow-g)" />
            </g>
            <defs>
              <marker id="fw-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill={RED} />
              </marker>
              <marker id="fw-arrow-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill={GREEN} />
              </marker>
            </defs>

            {/* Norte */}
            <g transform="translate(905 250)">
              <circle r="14" fill="white" stroke="#D1D5DB" />
              <path d="M0,-9 L4,4 L0,1 L-4,4 z" fill="#111" />
              <text y="-18" textAnchor="middle" fontSize="8" fontWeight="800" fill="#6B7280">N</text>
            </g>

            {/* Manzanas */}
            {MANZANAS.map((p) => (
              <polygon key={p} points={p} fill="#fff" stroke="#C9CCC9" strokeWidth="14" strokeLinejoin="round" />
            ))}

            {/* Lotes */}
            {LOTES.map((l) => {
              const on = sel.includes(l.n)
              const dim = !match(l)
              const isHover = hover === l.n
              const fill = on ? GREEN : l.paseo ? '#FDE8E8' : isHover ? '#E8F4EC' : '#FFFFFF'
              return (
                <g
                  key={l.n}
                  role="button"
                  tabIndex={0}
                  aria-pressed={on}
                  aria-label={`Lote ${l.n}, ${formatM2(l.m2)} metros cuadrados`}
                  onClick={() => toggle(l.n)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggle(l.n)
                    }
                  }}
                  onMouseEnter={() => setHover(l.n)}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer outline-none [&:focus-visible>polygon]:stroke-[#00754A] [&:focus-visible>polygon]:stroke-[2.5]"
                  style={{ opacity: dim ? 0.28 : 1, transition: 'opacity 200ms' }}
                >
                  <polygon
                    points={l.points}
                    fill={fill}
                    stroke={on ? '#0F3D24' : l.paseo ? '#F2A5A5' : '#B8BDB8'}
                    strokeWidth={on ? 1.6 : 0.9}
                    style={{ transition: 'fill 150ms' }}
                  />
                  <text
                    x={l.cx}
                    y={l.cy - 1}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="800"
                    className="font-numeric pointer-events-none"
                    fill={on ? '#fff' : '#111827'}
                  >
                    {l.n}
                  </text>
                  <text
                    x={l.cx}
                    y={l.cy + 10}
                    textAnchor="middle"
                    fontSize="7.5"
                    className="font-numeric pointer-events-none"
                    fill={on ? 'rgba(255,255,255,.85)' : '#6B7280'}
                  >
                    {Math.round(l.m2)} m²
                  </text>
                </g>
              )
            })}

            {/* Paseo */}
            <g className="pointer-events-none">
              <rect x="386" y="640" width="144" height="18" rx="9" fill={RED} />
              <text x="458" y="652.5" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#fff" letterSpacing="1">PASEO FISHERTON WORK</text>
            </g>
          </svg>
        </div>
        {elegidos.length > 0 && (
          <button
            type="button"
            onClick={() => document.getElementById('fw-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl bg-[#1A5C38] px-4 py-3 text-left text-white lg:hidden"
          >
            <span className="text-sm font-bold">
              {elegidos.length === 1 ? 'Lote' : 'Lotes'} <span className="font-numeric">{nums.join(' · ')}</span>
              <span className="font-numeric ml-2 font-medium text-white/75">{formatM2(terreno)} m²</span>
            </span>
            <span className="shrink-0 text-xs font-bold text-[#7FD1A3]">Ver detalle ↓</span>
          </button>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-gray-400 md:hidden">Deslizá el plano de costado para ver todos los lotes.</p>
        <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
          Esquema ilustrativo calcado del plano oficial del desarrollador. Superficies según plano, sujetas a mensura.
        </p>
      </div>

      {/* ── Panel ── */}
      <aside id="fw-panel" className="flex scroll-mt-24 flex-col rounded-3xl bg-[#0F1411] p-6 text-white shadow-sm lg:sticky lg:top-24 lg:self-start">
        {elegidos.length === 0 ? (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7FD1A3]">Elegí tu lote</p>
            <h3 className="mt-2 text-2xl font-black leading-tight">Tocá uno o varios lotes del plano</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Con uno ves sus medidas. Con varios linderos te mostramos cómo quedaría la unidad unificada: más terreno,
              más metros construidos y más cocheras.
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-3">
              <Stat label="Lotes" value="43" />
              <Stat label="Desde" value="400 m²" />
              <Stat label="Hasta" value="735 m²" />
              <Stat label="FOS" value="0,60" />
            </dl>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7FD1A3]">
                  {elegidos.length === 1
                    ? 'Lote seleccionado'
                    : contiguos
                      ? `${elegidos.length} lotes unificados`
                      : `${elegidos.length} lotes`}
                </p>
                <h3 className="mt-2 text-2xl font-black leading-tight">
                  {elegidos.length === 1 ? (
                    <>Lote <span className="font-numeric">{nums[0]}</span></>
                  ) : (
                    <>Lotes <span className="font-numeric">{nums.join(' · ')}</span></>
                  )}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSel([])}
                className="rounded-full border border-white/15 p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Limpiar selección"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {elegidos.length === 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/85">
                  <MapPin className="h-3.5 w-3.5" /> {FRENTE_LABEL[elegidos[0].frente]}
                </span>
                {elegidos[0].paseo && (
                  <span className="rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ background: RED }}>
                    Paseo Fisherton Work
                  </span>
                )}
              </div>
            )}

            <dl className="mt-5 space-y-2.5">
              <Row icon={Ruler} label="Terreno" value={`${formatM2(terreno)} m²`} />
              <Row
                icon={Building2}
                label={elegidos.length === 1 ? 'Módulo construido' : 'Construido (módulos)'}
                value={`${formatM2(elegidos.length * (FW_MODULO.pb + FW_MODULO.entrepiso))} m²`}
              />
              <Row icon={Car} label="Cocheras propias" value={String(elegidos.length * FW_MODULO.cocheras)} />
              <Row icon={Layers} label="Huella máx. (FOS 0,60)" value={`${formatM2(Math.floor(terreno * FW_FOS))} m²`} />
            </dl>

            {elegidos.length > 1 &&
              (contiguos ? (
                <p className="mt-4 text-xs leading-relaxed text-white/55">
                  El proyecto permite unificar lotes linderos en una sola unidad. La factibilidad final la confirma el
                  desarrollador.
                </p>
              ) : (
                <p className="mt-4 rounded-xl border border-[#fbce07]/30 bg-[#fbce07]/10 px-3 py-2.5 text-xs leading-relaxed text-[#fde68a]">
                  Estos lotes no son linderos: se pueden comprar juntos, pero para unificarlos en una sola unidad
                  elegí lotes que compartan medianera.
                </p>
              ))}
          </>
        )}

        <a
          href={fwWhatsappUrl(waText)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('click_whatsapp', { origen: 'fisherton-work-masterplan', lotes: nums.join(',') })}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <MessageCircle className="h-4 w-4" />
          {elegidos.length === 0
            ? 'Consultar disponibilidad'
            : elegidos.length === 1
              ? `Consultar por el lote ${nums[0]}`
              : contiguos
                ? 'Consultar por la unidad unificada'
                : 'Consultar por estos lotes'}
        </a>
      </aside>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">{label}</dt>
      <dd className="font-numeric mt-1 text-xl font-bold">{value}</dd>
    </div>
  )
}

function Row({ icon: Icon, label, value }: { icon: typeof Ruler; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5">
      <dt className="flex items-center gap-2 text-sm text-white/65">
        <Icon className="h-4 w-4 text-[#7FD1A3]" /> {label}
      </dt>
      <dd className="font-numeric text-base font-bold">{value}</dd>
    </div>
  )
}
