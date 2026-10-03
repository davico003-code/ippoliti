'use client'

// "Elegí tu departamento": la Torre 2 en 3D para elegir el piso, el PLANO REAL
// de ese piso (los PDF de AutoCAD de VERS) con cada unidad marcada con su forma
// exacta, y la ficha de la unidad elegida con su lámina, superficies, precio
// vivo de Brickfy, 360° y contacto. La idea es que nadie tenga que descifrar
// "Torre 2 · Piso 3 · Unidad 4": lo ve en el plano de verdad.

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Leaf, Maximize2, MessageCircle, Rotate3d, ZoomIn, ZoomOut } from 'lucide-react'
import {
  CONJUNTO,
  PLANTA,
  PLANTAS,
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
    <svg viewBox={`0 0 ${ancho + 16} ${base + 4}`} className="mx-auto h-auto w-full max-w-[320px] overflow-visible" role="group" aria-label="Torre 2 de Dock Garden: elegí un piso">
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

// ── Plano real del piso con las unidades marcadas ─────────────────────────
// El plano entero se ve encuadrado; al elegir una unidad (en celular, siempre)
// la cámara se acerca hasta ella con una animación. Las etiquetas mantienen su
// tamaño aunque el plano se agrande.

const pct = (v: number, total: number) => `${(v / total) * 100}%`
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

function PlanoPiso({
  piso,
  unidades,
  activaId,
  onElegir,
}: {
  piso: number
  unidades: UnidadExplorador[]
  activaId: string | null
  onElegir: (id: string) => void
}) {
  const caja = useRef<HTMLDivElement>(null)
  const [ancho, setAncho] = useState(0)
  useEffect(() => {
    const el = caja.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setAncho(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const celular = ancho > 0 && ancho < 640

  // Acercar: en celular cada vez que se elige una unidad; en compu, a pedido.
  const [cerca, setCerca] = useState(false)
  useEffect(() => {
    setCerca(celular)
  }, [activaId, celular])

  // Solo se baja el plano de los pisos que se miraron; el anterior queda
  // visible hasta que carga el nuevo (fundido sin parpadeo).
  const [visitados, setVisitados] = useState<number[]>([piso])
  const [listos, setListos] = useState<number[]>([])
  const ultimoListo = useRef(piso)
  useEffect(() => setVisitados((v) => (v.includes(piso) ? v : [...v, piso])), [piso])
  if (listos.includes(piso)) ultimoListo.current = piso
  const visible = listos.includes(piso) ? piso : ultimoListo.current

  const delPiso = unidades.filter((u) => u.piso === piso)
  const u = delPiso.find((x) => x.id === activaId) ?? null

  const k = ancho / PLANTA.w
  const altoEscena = PLANTA.h * k
  const altoCaja = celular ? Math.round(ancho * 0.82) : altoEscena
  let s = 1
  let tx = 0
  let ty = (altoCaja - altoEscena) / 2
  if (cerca && u && ancho > 0) {
    const xs = u.poligono.map((pt) => pt[0] * k)
    const ys = u.poligono.map((pt) => pt[1] * k)
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
    s = clamp(Math.min(ancho / ((x1 - x0) * 1.3), altoCaja / ((y1 - y0) * 1.3)), 1, 4.5)
    tx = clamp(ancho / 2 - ((x0 + x1) / 2) * s, ancho - ancho * s, 0)
    const alto = altoEscena * s
    ty = alto >= altoCaja ? clamp(altoCaja / 2 - ((y0 + y1) / 2) * s, altoCaja - alto, 0) : (altoCaja - alto) / 2
  }

  return (
    <div>
      <div
        ref={caja}
        className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100"
        style={{ height: ancho > 0 ? altoCaja : undefined, aspectRatio: ancho > 0 ? undefined : `${PLANTA.w} / ${PLANTA.h}` }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
          style={{ width: ancho || '100%', height: altoEscena || '100%', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}
        >
          {visitados.map((p) => (
            <Image
              key={p}
              src={PLANTAS[p]}
              alt={p === piso ? `Plano real del ${etiquetaPiso(p).toLowerCase()} de la Torre 2 de Dock Garden (VERS Arquitectos)` : ''}
              aria-hidden={p !== piso}
              fill
              sizes="(max-width: 640px) 400vw, 1100px"
              onLoad={() => setListos((l) => (l.includes(p) ? l : [...l, p]))}
              className={`object-contain transition-opacity duration-500 motion-reduce:transition-none ${p === visible ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}

          <svg viewBox={`0 0 ${PLANTA.w} ${PLANTA.h}`} className="absolute inset-0 h-full w-full" role="group" aria-label={`Unidades del ${etiquetaPiso(piso).toLowerCase()}`}>
            <defs>
              <pattern id="dg-vendida" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="26" height="26" fill="rgba(107,114,128,0.10)" />
                <line x1="0" y1="0" x2="0" y2="26" stroke="rgba(107,114,128,0.45)" strokeWidth="7" />
              </pattern>
            </defs>
            {delPiso.map((x) => {
              const activa = x.id === activaId
              const vendida = x.estado === 'vendida'
              const puntos = x.poligono.map((pt) => pt.join(',')).join(' ')
              return (
                <g
                  key={`${piso}-${x.id}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={activa}
                  aria-label={`Unidad ${x.codigo}, ${x.nombre}${vendida ? ', vendida' : `, ${usd(x.precio)}`}`}
                  onClick={() => onElegir(x.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onElegir(x.id))}
                  className="cursor-pointer outline-none"
                >
                  <polygon
                    points={puntos}
                    fill={vendida ? 'url(#dg-vendida)' : activa ? 'rgba(26,92,56,0.30)' : 'rgba(26,92,56,0.12)'}
                    className={vendida ? '' : 'transition-[fill] duration-300 hover:fill-[rgba(26,92,56,0.24)]'}
                  />
                  <polygon
                    points={puntos}
                    fill="none"
                    stroke={vendida ? '#9ca3af' : VERDE}
                    strokeWidth={(activa ? 16 : 9) / s}
                    strokeLinejoin="round"
                    pathLength={1}
                    className="dg-trazo"
                  />
                  {activa && !vendida && (
                    <polygon points={puntos} fill="none" stroke={VERDE} strokeWidth={14 / s} strokeLinejoin="round" className="dg-pulso" />
                  )}
                </g>
              )
            })}
          </svg>

          {/* Etiquetas en HTML (texto nítido), del mismo tamaño aunque se acerque */}
          {delPiso.map((x) => {
            const activa = x.id === activaId
            const vendida = x.estado === 'vendida'
            // En celular solo la elegida lleva la etiqueta completa: si no, se tapan.
            const compacta = celular && !(activa && cerca)
            // Que la etiqueta no quede cortada contra el borde del recuadro.
            const mitad = compacta ? 26 : 92
            const ax = tx + x.etiqueta[0] * k * s
            const corrimiento = ancho > 0 ? clamp(ax, mitad + 6, ancho - mitad - 6) - ax : 0
            return (
              <button
                key={`et-${piso}-${x.id}`}
                type="button"
                tabIndex={-1}
                onClick={() => onElegir(x.id)}
                className={`absolute whitespace-nowrap rounded-xl text-left shadow-sm ring-1 transition-[transform,background-color] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none ${
                  compacta ? 'px-1.5 py-0.5' : 'px-2.5 py-1.5'
                } ${
                  vendida
                    ? 'bg-white/90 text-gray-500 ring-gray-200'
                    : activa
                      ? 'bg-[#1A5C38] text-white ring-[#1A5C38]'
                      : 'bg-white/95 text-gray-900 ring-[#1A5C38]/30 hover:bg-white'
                }`}
                style={{
                  left: pct(x.etiqueta[0], PLANTA.w),
                  top: pct(x.etiqueta[1], PLANTA.h),
                  // Primero se des-escala (tamaño fijo en pantalla) y después se centra.
                  transformOrigin: '0 0',
                  transform: `scale(${1 / s}) translate(calc(-50% + ${corrimiento}px), -50%)`,
                }}
              >
                <span className={`block font-numeric font-bold leading-tight ${compacta ? 'text-[11px]' : 'text-[13px]'}`}>{x.codigo}</span>
                {!compacta && (
                  <span className={`block text-[11px] leading-tight ${activa && !vendida ? 'text-white/85' : 'text-gray-500'}`}>
                    {vendida ? 'Vendida' : <>{x.nombre} · <span className="font-numeric">{usd(x.precio)}</span></>}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Orientación (el dibujo no rota: la derecha es siempre el lado del bosque) */}
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-[#e3efe6]/95 px-2.5 py-1 text-[11px] font-semibold text-[#1A5C38]">
          Bosque y arroyo →
        </span>

        {/* Acercar / ver todo el piso */}
        {u && (
          <button
            type="button"
            onClick={() => setCerca((c) => !c)}
            className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-gray-900/85 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-gray-900"
          >
            {cerca ? <ZoomOut className="h-3.5 w-3.5" aria-hidden /> : <ZoomIn className="h-3.5 w-3.5" aria-hidden />}
            {cerca ? 'Ver todo el piso' : <>Acercar <span className="font-numeric">{u.codigo}</span></>}
          </button>
        )}
      </div>

      {/* Las unidades del piso también en fila: en celular es lo más cómodo de tocar */}
      <div className="-mx-1 mt-3 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
        {delPiso.map((x) => {
          const activa = x.id === activaId
          const vendida = x.estado === 'vendida'
          return (
            <button
              key={`chip-${x.id}`}
              type="button"
              onClick={() => onElegir(x.id)}
              aria-pressed={activa}
              className={`shrink-0 snap-start rounded-2xl border px-3.5 py-2 text-left transition-colors ${
                activa ? 'border-[#1A5C38] bg-[#1A5C38] text-white' : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="block font-numeric text-sm font-bold leading-tight">U-{x.codigo}</span>
              <span className={`block text-xs leading-tight ${activa ? 'text-white/80' : vendida ? 'text-gray-400' : 'text-gray-500'}`}>
                {vendida ? `${x.nombre} · vendida` : <>{x.nombre} · <span className="font-numeric">{usd(x.precio)}</span></>}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** El conjunto completo (plano real) con la Torre 2 resaltada. */
function Conjunto() {
  const [x0, y0, x1, y1] = CONJUNTO.torre2
  return (
    <div className="relative" style={{ aspectRatio: `${CONJUNTO.w} / ${CONJUNTO.h}` }}>
      <Image src={CONJUNTO.src} alt="Plano del conjunto Dock Garden: 4 edificios, la Torre 2 resaltada" fill sizes="340px" className="object-contain" />
      <svg viewBox={`0 0 ${CONJUNTO.w} ${CONJUNTO.h}`} className="absolute inset-0 h-full w-full" aria-hidden>
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={10} fill="rgba(26,92,56,0.18)" stroke={VERDE} strokeWidth={5} className="dg-pulso-suave" />
        <text x={(x0 + x1) / 2} y={y0 - 16} textAnchor="middle" style={{ fontSize: 34, fontWeight: 800, fill: VERDE }}>
          Torre 2
        </text>
      </svg>
    </div>
  )
}

// ── Ficha de la unidad ────────────────────────────────────────────────────

function FichaUnidad({
  u,
  whatsapp,
  onViewer,
}: {
  u: UnidadExplorador
  whatsapp: string
  onViewer: (v: Viewer) => void
}) {
  const setViewer = onViewer
  const recorridos = RECORRIDOS_360.filter((r) => r.tipologia === u.tipologia)
  const mensaje = `Hola! Me interesa la unidad ${u.codigo} de Dock Garden (${etiquetaPiso(u.piso)}, unidad ${u.unidad}, ${u.nombre}). ¿Me pasás más información?`
  return (
      <article key={u.id} className="dg-ficha min-w-0 overflow-hidden rounded-3xl border border-gray-200 bg-white">
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
  const primeraDisponible = (p: number) =>
    unidades.find((u) => u.piso === p && u.estado === 'disponible')?.id ?? unidades.find((u) => u.piso === p)?.id ?? null
  const [piso, setPiso] = useState<number>(primerPiso)
  const [activaId, setActivaId] = useState<string | null>(primeraDisponible(primerPiso))
  const [viewer, setViewer] = useState<Viewer | null>(null)

  const elegirPiso = (p: number) => {
    setPiso(p)
    setActivaId(primeraDisponible(p))
  }

  if (unidades.length === 0) return null
  const u = unidades.find((x) => x.id === activaId) ?? null
  const totalDisp = unidades.filter((x) => x.estado === 'disponible').length

  return (
    <section id="elegi-tu-unidad" className="scroll-mt-20 bg-gray-50 py-14 md:py-20">
      {/* Animaciones (respetan "reducir movimiento") */}
      <style>{`@keyframes dg-pulso{0%{opacity:.9;stroke-width:8}70%{opacity:0;stroke-width:34}100%{opacity:0}}@keyframes dg-pulso-suave{0%,100%{opacity:1}50%{opacity:.45}}@keyframes dg-trazo{from{stroke-dasharray:1;stroke-dashoffset:1}to{stroke-dasharray:1;stroke-dashoffset:0}}@keyframes dg-entrada{from{opacity:0;transform:translate(-50%,-40%)}to{opacity:1}}@keyframes dg-ficha{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:no-preference){.dg-pulso{animation:dg-pulso 1.8s ease-out infinite}.dg-pulso-suave{animation:dg-pulso-suave 2.4s ease-in-out infinite}.dg-trazo{animation:dg-trazo .9s ease-out both}.dg-entrada{animation:dg-entrada .4s ease-out both}.dg-ficha{animation:dg-ficha .35s ease-out}}`}</style>
      <div className={contenedor}>
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#1A5C38]">Unidades en venta</p>
        <h2 className="mt-3 text-balance text-[clamp(28px,3.6vw,48px)] font-black leading-[1.05] tracking-[-0.02em] text-gray-900">
          Elegí tu departamento
        </h2>
        <p className="mt-4 max-w-[68ch] text-pretty text-base leading-relaxed text-gray-600 md:text-[17px]">
          Es el plano real de la Torre <span className="font-numeric">2</span>, el de los arquitectos. Elegí un piso y
          tocá la unidad: te mostramos cuál es, cómo es y cuánto sale.{' '}
          <span className="font-semibold text-gray-900">
            <span className="font-numeric">{totalDisp}</span> disponibles
          </span>{' '}
          hoy.
        </p>

        <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
            {/* 1 · El piso */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                <span className="font-numeric">1</span> · Elegí el piso
              </p>
              <div className="mt-4 hidden sm:block">
                <Torre pisoActivo={piso} disponibles={disponibles} onElegir={elegirPiso} />
              </div>
              <ul className="mt-4 grid grid-cols-4 gap-2 lg:grid-cols-1">
                {[...NIVELES].reverse().filter((n) => n.piso > 0).map((n) => {
                  const hay = disponibles[n.piso] ?? 0
                  const activo = n.piso === piso
                  return (
                    <li key={n.piso}>
                      <button
                        type="button"
                        onClick={() => elegirPiso(n.piso)}
                        aria-pressed={activo}
                        className={`w-full rounded-xl border px-2.5 py-2 text-left transition-colors lg:px-3 ${
                          activo ? 'border-[#1A5C38] bg-[#1A5C38] text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="block text-[13px] font-bold leading-tight sm:text-sm">{n.piso === 4 ? <>Pisos <span className="font-numeric">4</span>-<span className="font-numeric">5</span></> : <>Piso <span className="font-numeric">{n.piso}</span></>}</span>
                        <span className={`block text-[11px] leading-tight sm:text-xs ${activo ? 'text-white/80' : hay > 0 ? 'text-[#1A5C38]' : 'text-gray-400'}`}>
                          {hay > 0 ? <><span className="font-numeric">{hay}</span> disp.</> : 'Sin disponibles'}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-2 hidden text-xs text-gray-400 lg:block">Planta baja: cocheras y paseo comercial.</p>
            </div>

            {/* 2 · El plano real */}
            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                  <span className="font-numeric">2</span> · Tocá la unidad
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {etiquetaPiso(piso)} · Torre <span className="font-numeric">2</span>
                </p>
              </div>
              <div className="mt-3">
                <PlanoPiso piso={piso} unidades={unidades} activaId={activaId} onElegir={setActivaId} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border-2 border-[#1A5C38] bg-[#1A5C38]/20" /> Disponible</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border-2 border-gray-400 bg-[repeating-linear-gradient(45deg,#e5e7eb_0_2px,transparent_2px_5px)]" /> Vendida</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-gray-300 bg-white" /> Resto del piso</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          {u && <FichaUnidad u={u} whatsapp={whatsapp} onViewer={setViewer} />}
          <aside className="self-start rounded-3xl border border-gray-200 bg-white p-5 lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">Dónde está la Torre 2</p>
            <div className="mt-3">
              <Conjunto />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Dock Garden son <span className="font-numeric">4</span> edificios de baja altura. La Torre{' '}
              <span className="font-numeric">2</span> es la que tiene la punta hacia el bosque y el arroyo; la línea punteada
              marca ese límite.
            </p>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-gray-500">
              <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-[#1A5C38]" aria-hidden />
              Planos de anteproyecto de VERS Arquitectos. Precios y disponibilidad al día con la lista del desarrollador.
            </p>
          </aside>
        </div>
      </div>

      {viewer && <ViewerModal viewer={viewer} onClose={() => setViewer(null)} />}
    </section>
  )
}
