'use client'

// "Elegí tu departamento": la Torre 2 en 3D para elegir el piso, la planta de
// ese piso con cada unidad en su lugar real (posiciones sacadas de las láminas
// oficiales de VERS) y la ficha de la unidad elegida con su lámina, superficies,
// precio vivo de Brickfy, 360° y contacto. La idea es que nadie tenga que
// descifrar "Torre 2 · Piso 3 · Unidad 4": lo ve.

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Leaf, Maximize2, MessageCircle, Rotate3d } from 'lucide-react'
import {
  ETAPAS_CONJUNTO,
  RECORRIDOS_360,
  TORRE_2,
  urlRecorrido,
  type UnidadExplorador,
} from '@/lib/dockgarden'
import ViewerModal, { type Viewer } from '@/components/ViewerModal'

const VERDE = '#1A5C38'

type Nivel = { piso: 0 | 1 | 2 | 3 | 4; label: string; sub: string; alto: number }

const NIVELES: Nivel[] = [
  { piso: 0, label: 'Planta baja', sub: 'Cocheras y paseo comercial', alto: 1 },
  { piso: 1, label: 'Piso 1', sub: '', alto: 1 },
  { piso: 2, label: 'Piso 2', sub: '', alto: 1 },
  { piso: 3, label: 'Piso 3', sub: '', alto: 1 },
  { piso: 4, label: 'Pisos 4 y 5', sub: 'Dúplex', alto: 2 },
]

function usd(n: number) {
  return `USD ${n.toLocaleString('es-AR')}`
}

function etiquetaPiso(piso: number) {
  return piso === 4 ? 'Pisos 4 y 5' : `Piso ${piso}`
}

// ── Torre en 3D (proyección oblicua: el frente largo de cara, la punta del
// bosque a la derecha) ───────────────────────────────────────────────────

const K = 0.78 // escala del largo
const DX = 0.42 // corrimiento horizontal por unidad de profundidad
const DY = 0.3 // corrimiento vertical por unidad de profundidad
const H = 30 // alto de un piso
const LARGO = TORRE_2.largo * K
const PROF = TORRE_2.ancho

function Torre({
  pisoActivo,
  disponibles,
  onElegir,
}: {
  pisoActivo: number
  disponibles: Record<number, number>
  onElegir: (piso: number) => void
}) {
  const niveles = NIVELES.reduce<{ n: Nivel; z: number }[]>((acc, n) => {
    const z = acc.length ? acc[acc.length - 1].z + acc[acc.length - 1].n.alto : 0
    return [...acc, { n, z }]
  }, [])
  const total = niveles.reduce((s, x) => s + x.n.alto, 0)
  const base = total * H + PROF * DY + 8
  const ancho = LARGO + PROF * DX + 8

  // Esquinas del bloque de un nivel (frente, costado derecho y techo).
  const caras = (z: number, alto: number) => {
    const y0 = base - z * H
    const y1 = base - (z + alto) * H
    const p = (x: number, y: number, d: number) => `${x + d * DX},${y - d * DY}`
    return {
      frente: [p(0, y0, 0), p(LARGO, y0, 0), p(LARGO, y1, 0), p(0, y1, 0)].join(' '),
      costado: [p(LARGO, y0, 0), p(LARGO, y0, PROF), p(LARGO, y1, PROF), p(LARGO, y1, 0)].join(' '),
      techo: [p(0, y1, 0), p(LARGO, y1, 0), p(LARGO, y1, PROF), p(0, y1, PROF)].join(' '),
      yMedio: (y0 + y1) / 2,
    }
  }

  return (
    <svg viewBox={`0 0 ${ancho + 16} ${base + 4}`} className="mx-auto h-auto w-full max-w-[460px] overflow-visible" role="group" aria-label="Torre 2 de Dock Garden: elegí un piso">
        {niveles.map(({ n, z }) => {
          const c = caras(z, n.alto)
          const activo = n.piso === pisoActivo
          const elegible = n.piso > 0
          const hay = disponibles[n.piso] ?? 0
          return (
            <g
              key={n.piso}
              role={elegible ? 'button' : undefined}
              tabIndex={elegible ? 0 : undefined}
              aria-pressed={elegible ? activo : undefined}
              aria-label={elegible ? `${n.label}: ${hay} disponible${hay === 1 ? '' : 's'}` : n.label}
              onClick={elegible ? () => onElegir(n.piso) : undefined}
              onKeyDown={elegible ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onElegir(n.piso)) : undefined}
              className={`${elegible ? 'cursor-pointer' : ''} outline-none transition-transform duration-500 ease-out motion-reduce:transition-none`}
              style={{ transform: activo ? 'translateX(14px)' : 'translateX(0)' }}
            >
              <polygon points={c.costado} fill={activo ? '#14482c' : n.piso === 0 ? '#d1d5db' : '#e5e7eb'} stroke="#ffffff" strokeWidth={1} />
              <polygon points={c.frente} fill={activo ? VERDE : n.piso === 0 ? '#e5e7eb' : '#f3f4f6'} stroke="#ffffff" strokeWidth={1.2} />
              {/* Ventanas: una franja por piso que lo hace leer como edificio */}
              {n.piso > 0 &&
                Array.from({ length: n.alto }).flatMap((_, i) => {
                  const yv = base - (z + i) * H - H * 0.74
                  const panos = 11
                  const ancho = (LARGO - 12) / panos
                  return Array.from({ length: panos }).map((__, j) => (
                    <rect
                      key={`${i}-${j}`}
                      x={6 + j * ancho + 1.5}
                      y={yv}
                      width={ancho - 3}
                      height={H * 0.46}
                      rx={1.5}
                      fill={activo ? 'rgba(255,255,255,0.28)' : hay > 0 ? '#cfe2d5' : '#e2e5e9'}
                    />
                  ))
                })}
              {n.piso === 0 &&
                Array.from({ length: 7 }).map((_, j) => (
                  <rect key={j} x={10 + j * ((LARGO - 20) / 7)} y={base - z * H - H * 0.82} width={5} height={H * 0.82} fill="#d1d5db" />
                ))}
              {z + n.alto === total && <polygon points={c.techo} fill={activo ? '#2f7a4f' : '#e9eee9'} stroke="#ffffff" strokeWidth={1} />}
              {elegible && hay > 0 && !activo && (
                <circle cx={LARGO - 14} cy={c.yMedio} r={5} fill={VERDE} className="motion-safe:animate-pulse" />
              )}
            </g>
          )
        })}
        {/* Hacia dónde mira la punta derecha */}
        <text x={LARGO + PROF * DX - 2} y={base + 2} textAnchor="end" className="fill-gray-400" style={{ fontSize: 11, fontWeight: 600 }}>
          bosque y arroyo →
        </text>
      </svg>
  )
}

// ── Planta del piso, vista desde arriba ───────────────────────────────────

function Planta({
  unidades,
  activaId,
  onElegir,
}: {
  unidades: UnidadExplorador[]
  activaId: string | null
  onElegir: (id: string) => void
}) {
  const { largo, ancho } = TORRE_2
  return (
    <svg viewBox={`-6 -6 ${largo + 12} ${ancho + 30}`} className="h-auto w-full" role="group" aria-label="Planta del piso con las unidades en venta">
      <defs>
        <pattern id="dg-rayado" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#f3f4f6" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#d1d5db" strokeWidth="2" />
        </pattern>
      </defs>
      {/* Edificio: el resto del piso en gris */}
      <rect x={0} y={0} width={largo} height={ancho} rx={3} fill="#f3f4f6" stroke="#cbd5e1" strokeWidth={1.2} />
      {/* Circulación central (palieres y ascensores) */}
      <line x1={8} y1={ancho / 2} x2={largo - 8} y2={ancho / 2} stroke="#e2e8f0" strokeWidth={6} strokeLinecap="round" />
      {unidades.map((u) => {
        const [x0, y0, x1, y1] = u.rect
        const w = x1 - x0
        const h = y1 - y0
        const activa = u.id === activaId
        const vendida = u.estado === 'vendida'
        const chica = w < 90 || h < 60
        return (
          <g
            key={u.id}
            role="button"
            tabIndex={0}
            aria-pressed={activa}
            aria-label={`Unidad ${u.codigo}, ${u.nombre}${vendida ? ', vendida' : ''}`}
            onClick={() => onElegir(u.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onElegir(u.id))}
            className="cursor-pointer outline-none"
          >
            {activa && !vendida && (
              <rect x={x0 + 1} y={y0 + 1} width={w - 2} height={h - 2} rx={4} fill="none" stroke={VERDE} strokeWidth={3} className="dg-pulso" />
            )}
            <rect
              x={x0 + 1.5}
              y={y0 + 1.5}
              width={w - 3}
              height={h - 3}
              rx={3}
              fill={vendida ? 'url(#dg-rayado)' : activa ? VERDE : '#dcebe1'}
              stroke={vendida ? '#cbd5e1' : VERDE}
              strokeWidth={activa ? 0 : 1.4}
              className="transition-colors duration-300"
            />
            <text
              x={x0 + w / 2}
              y={y0 + h / 2 - (chica ? 2 : 5)}
              textAnchor="middle"
              className="font-numeric"
              style={{ fontSize: chica ? 11 : 14, fontWeight: 800, fill: vendida ? '#9ca3af' : activa ? '#fff' : VERDE }}
            >
              {u.codigo}
            </text>
            <text
              x={x0 + w / 2}
              y={y0 + h / 2 + (chica ? 11 : 13)}
              textAnchor="middle"
              style={{ fontSize: chica ? 8.5 : 10, fontWeight: 600, fill: vendida ? '#9ca3af' : activa ? 'rgba(255,255,255,.85)' : '#4b5563' }}
            >
              {vendida ? 'Vendida' : u.nombre}
            </text>
          </g>
        )
      })}
      {/* Orientación: la punta derecha mira al bosque y al arroyo Ludueña */}
      <text x={largo} y={ancho + 18} textAnchor="end" className="fill-gray-400" style={{ fontSize: 10, fontWeight: 600 }}>
        lado bosque y arroyo Ludueña →
      </text>
      <text x={0} y={ancho + 18} className="fill-gray-400" style={{ fontSize: 10, fontWeight: 600 }}>
        Torre 2 · vista desde arriba
      </text>
    </svg>
  )
}

/** Mini plano del conjunto: cuál de los 4 edificios es la Torre 2. */
function Conjunto() {
  return (
    <svg viewBox="0 0 780 830" className="h-auto w-full" aria-label="Ubicación de la Torre 2 dentro del conjunto">
      <path d="M 90 828 Q 430 420 776 226 L 776 10 L 10 10 L 10 828 Z" fill="#f8faf8" />
      <path d="M 90 828 Q 430 420 776 226" fill="none" stroke="#9fc5ad" strokeWidth={8} strokeDasharray="22 14" />
      <path d="M 120 828 Q 470 450 780 270 L 780 830 Z" fill="#e3efe6" />
      {ETAPAS_CONJUNTO.map((e) => (
        <g key={e.n}>
          <rect x={e.x} y={e.y} width={e.w} height={e.h} rx={10} fill={e.n === 2 ? VERDE : '#d1d5db'} />
          <text x={e.x + e.w / 2} y={e.y + e.h / 2 + 26} textAnchor="middle" style={{ fontSize: 74, fontWeight: 800, fill: e.n === 2 ? '#fff' : '#6b7280' }}>
            {e.n}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ── Componente principal ──────────────────────────────────────────────────

export default function ElegiTuUnidad({
  unidades,
  contenedor,
  whatsapp,
}: {
  unidades: UnidadExplorador[]
  contenedor: string
  whatsapp: string
}) {
  const disponibles = useMemo(() => {
    const m: Record<number, number> = {}
    for (const u of unidades) if (u.estado === 'disponible') m[u.piso] = (m[u.piso] ?? 0) + 1
    return m
  }, [unidades])

  const primerPiso = (NIVELES.find((n) => (disponibles[n.piso] ?? 0) > 0)?.piso ?? 1) as number
  const [piso, setPiso] = useState<number>(primerPiso)
  const delPiso = unidades.filter((u) => u.piso === piso)
  const primeraDisponible = (p: number) =>
    unidades.find((u) => u.piso === p && u.estado === 'disponible')?.id ?? unidades.find((u) => u.piso === p)?.id ?? null
  const [activaId, setActivaId] = useState<string | null>(primeraDisponible(primerPiso))
  const [viewer, setViewer] = useState<Viewer | null>(null)

  const elegirPiso = (p: number) => {
    setPiso(p)
    setActivaId(primeraDisponible(p))
  }

  const u = unidades.find((x) => x.id === activaId) ?? null
  const recorridos = u ? RECORRIDOS_360.filter((r) => r.tipologia === u.tipologia) : []
  const totalDisp = unidades.filter((x) => x.estado === 'disponible').length

  if (unidades.length === 0) return null

  const mensaje = u
    ? `Hola! Me interesa la unidad ${u.codigo} de Dock Garden (${etiquetaPiso(u.piso)}, unidad ${u.unidad}, ${u.nombre}). ¿Me pasás más información?`
    : 'Hola! Quiero información sobre las unidades de Dock Garden'

  return (
    <section id="elegi-tu-unidad" className="scroll-mt-20 bg-gray-50 py-14 md:py-20">
      {/* Pulso de la unidad elegida (respeta "reducir movimiento") */}
      <style>{`@keyframes dg-pulso{0%{opacity:.9;stroke-width:3}70%{opacity:0;stroke-width:14}100%{opacity:0}}@keyframes dg-entrada{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:no-preference){.dg-pulso{animation:dg-pulso 1.8s ease-out infinite}.dg-entrada{animation:dg-entrada .35s ease-out}}`}</style>
      <div className={contenedor}>
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#1A5C38]">Unidades en venta</p>
        <h2 className="mt-3 text-balance text-[clamp(28px,3.6vw,48px)] font-black leading-[1.05] tracking-[-0.02em] text-gray-900">
          Elegí tu departamento
        </h2>
        <p className="mt-4 max-w-[65ch] text-pretty text-base leading-relaxed text-gray-600 md:text-[17px]">
          Tocá un piso de la Torre 2 y después la unidad: te mostramos dónde está, cómo es y cuánto sale.{' '}
          <span className="font-semibold text-gray-900">
            <span className="font-numeric">{totalDisp}</span> disponibles
          </span>{' '}
          hoy.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
          {/* 1 · El edificio (queda a la vista mientras se recorre la unidad) */}
          <div className="self-start rounded-3xl border border-gray-200 bg-white p-5 sm:p-7 lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
              <span className="font-numeric">1</span> · Elegí el piso
            </p>
            <div className="mt-5">
              <Torre pisoActivo={piso} disponibles={disponibles} onElegir={elegirPiso} />
            </div>
            {/* Los pisos también como botones, de arriba hacia abajo como en el edificio */}
            <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[...NIVELES].reverse().filter((n) => n.piso > 0).map((n) => {
                  const hay = disponibles[n.piso] ?? 0
                  const activo = n.piso === piso
                  return (
                    <li key={n.piso}>
                      <button
                        type="button"
                        onClick={() => elegirPiso(n.piso)}
                        aria-pressed={activo}
                        className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          activo ? 'border-[#1A5C38] bg-[#1A5C38] text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="block whitespace-nowrap text-sm font-bold">{n.label}</span>
                        <span className={`block whitespace-nowrap text-xs ${activo ? 'text-white/80' : hay > 0 ? 'text-[#1A5C38]' : 'text-gray-400'}`}>
                          {hay > 0 ? (
                            <>
                              <span className="font-numeric">{hay}</span> disponible{hay === 1 ? '' : 's'}
                            </>
                          ) : (
                            'Sin unidades en venta'
                          )}
                        </span>
                      </button>
                    </li>
                  )
                })}
            </ul>
            <p className="mt-2 text-xs text-gray-400">Planta baja: cocheras y paseo comercial.</p>

            <div className="mt-6 flex items-center gap-4 border-t border-gray-100 pt-5">
              <div className="w-28 shrink-0 sm:w-36">
                <Conjunto />
              </div>
              <p className="text-sm leading-relaxed text-gray-600">
                Dock Garden son <span className="font-numeric">4</span> edificios de baja altura. Las unidades en venta
                están en la <span className="font-bold text-gray-900">Torre <span className="font-numeric">2</span></span>,
                la del medio, con una punta hacia el bosque y el arroyo.
              </p>
            </div>
          </div>

          {/* 2 · La planta y 3 · la unidad */}
          <div className="flex min-w-0 flex-col gap-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-7">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                  <span className="font-numeric">2</span> · Elegí la unidad
                </p>
                <p className="text-sm font-bold text-gray-900">{etiquetaPiso(piso)}</p>
              </div>
              <div className="mt-4">
                <Planta unidades={delPiso} activaId={activaId} onElegir={setActivaId} />
              </div>
              {delPiso.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {delPiso.map((x) => (
                    <button
                      key={x.id}
                      type="button"
                      onClick={() => setActivaId(x.id)}
                      aria-pressed={x.id === activaId}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                        x.id === activaId ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="font-numeric">{x.codigo}</span> · {x.nombre}
                      {x.estado === 'vendida' && ' · vendida'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {u && (
              <article key={u.id} className="dg-entrada overflow-hidden rounded-3xl border border-gray-200 bg-white">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-900 px-3 py-1 font-numeric text-xs font-bold text-white">U-{u.codigo}</span>
                    {u.estado === 'disponible' && (
                      <span className="rounded-full bg-[#1A5C38]/10 px-3 py-1 text-xs font-bold text-[#1A5C38]">Disponible</span>
                    )}
                    {u.estado === 'reservada' && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Reservada</span>}
                    {u.estado === 'vendida' && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">Vendida</span>}
                    {u.preferencial && u.estado !== 'vendida' && (
                      <span className="rounded-full bg-[#F40009]/10 px-3 py-1 text-xs font-bold text-[#F40009]">Valor preferencial</span>
                    )}
                  </div>
                  <div className="mt-3 grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,230px)] sm:items-end">
                    <div>
                      <h3 className="text-2xl font-black tracking-[-0.01em] text-gray-900">
                        {etiquetaPiso(u.piso)} · Unidad <span className="font-numeric">{u.unidad}</span>
                      </h3>
                      <p className="text-sm text-gray-500">
                        {u.nombre} · Torre <span className="font-numeric">2</span>
                      </p>
                      {u.estado !== 'vendida' && (
                        <p className={`mt-3 font-numeric text-[30px] font-bold leading-none ${u.preferencial ? 'text-[#F40009]' : 'text-gray-900'}`}>
                          {usd(u.precio)}
                        </p>
                      )}
                    </div>
                    <dl className="space-y-1.5 rounded-2xl bg-gray-50 p-3.5 text-sm">
                      {u.superficies.map((x) => (
                        <div key={x.label} className="flex justify-between gap-3">
                          <dt className="text-gray-500">{x.label}</dt>
                          <dd className="font-numeric font-semibold text-gray-900">{x.m2} m²</dd>
                        </div>
                      ))}
                      <div className="flex justify-between gap-3 border-t border-gray-200 pt-1.5">
                        <dt className="font-bold text-gray-900">Total</dt>
                        <dd className="font-numeric font-bold text-[#1A5C38]">{u.total} m²</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Lámina oficial a todo el ancho: plano + ubicación en el conjunto */}
                <button
                  type="button"
                  onClick={() => setViewer({ kind: 'images', title: `Dock Garden — Unidad ${u.codigo}`, urls: [u.lamina] })}
                  className="group relative block w-full border-y border-gray-100 bg-white"
                  aria-label={`Ver la lámina de la unidad ${u.codigo} en grande`}
                >
                  <Image
                    src={u.lamina}
                    alt={`Plano oficial de la unidad ${u.codigo} de Dock Garden`}
                    width={1600}
                    height={1131}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="h-auto w-full"
                  />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-gray-900/80 px-3 py-1.5 text-xs font-bold text-white">
                    <Maximize2 className="h-3.5 w-3.5" aria-hidden /> Ver plano grande
                  </span>
                </button>

                {recorridos.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 px-5 pt-4 sm:px-6">
                    <span className="text-sm font-bold text-gray-900">
                      Recorrela en <span className="font-numeric">360°</span>:
                    </span>
                    {recorridos.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setViewer({ kind: 'tour', title: `Dock Garden — ${u.nombre} · ${r.ambiente} en 360°`, urls: [urlRecorrido(r.id)] })}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <Rotate3d className="h-3.5 w-3.5 text-[#1A5C38]" aria-hidden />
                        {r.ambiente}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2.5 p-5 sm:flex-row sm:px-6">
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#1ea952]"
                  >
                    <MessageCircle className="h-5 w-5" aria-hidden />
                    {u.estado === 'vendida' ? 'Consultar por una similar' : 'Consultar por esta unidad'}
                  </a>
                  {u.ficha && u.estado !== 'vendida' && (
                    <a
                      href={`/propiedades/${u.ficha}-unidad`}
                      className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full border-2 border-gray-200 px-5 text-[15px] font-bold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Ver ficha completa
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </a>
                  )}
                </div>
              </article>
            )}

            <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-gray-500">
              <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-[#1A5C38]" aria-hidden />
              Ubicaciones según las láminas oficiales de VERS Arquitectos. Precios y disponibilidad actualizados con la lista
              del desarrollador.
            </p>
          </div>
        </div>
      </div>

      {viewer && <ViewerModal viewer={viewer} onClose={() => setViewer(null)} />}
    </section>
  )
}
