'use client'

// Explorador del Stock de Colegas: filtros combinables sobre el feed ya
// deduplicado por el motor. Todo client-side (≈600 propiedades) → instantáneo.
// Pensado para responder una búsqueda de cliente en <1 minuto y para leer
// señales de negociación (días reales, republicaciones, precios dispares).

import { useMemo, useState } from 'react'
import type { StockFeed, StockPropiedad, SyncMeta } from '@/lib/stock-colegas'

const BARRIOS = [
  'Vida',
  'Vida Club de Campo',
  'Vida Lagoon',
  'San Sebastián',
  'Miraflores',
  'Cadaqués',
  'Kentucky',
  'Funes Lakes',
  'Los Troncos',
]

const ORDENES = [
  { id: 'percentil', label: 'Más baratas del barrio (percentil)' },
  { id: 'pct_bench', label: 'Más % bajo benchmark' },
  { id: 'precio_asc', label: 'Precio ↑' },
  { id: 'precio_desc', label: 'Precio ↓' },
  { id: 'dias', label: 'Más días en mercado' },
  { id: 'nuevas', label: 'Detectadas más recién' },
] as const

type OrdenId = (typeof ORDENES)[number]['id']

const FLAG_LABEL: Record<string, string> = {
  republicada: 'Republicada',
  multi_aviso: 'Multi-aviso',
  multi_inmobiliaria: 'Varias inmobiliarias',
  precio_dispar: 'Precios distintos',
  bajo_precio: 'Bajó de precio',
  estancada_30d: 'Estancada 30d+',
  sin_m2_cubierto: 'Sin m² cub.',
  posible_duplicado: 'Posible duplicado',
}

const FRESCURA_BADGE: Record<string, { label: string; cls: string }> = {
  verificada_hoy: { label: 'Verificada hoy', cls: 'bg-brand-50 text-brand-700 border-brand-200' },
  reciente_7d: { label: 'Vista esta semana', cls: 'bg-navy-50 text-navy-600 border-navy-200' },
  a_confirmar: { label: 'A confirmar', cls: 'bg-gold-50 text-gold-700 border-gold-300' },
  cerrada: { label: 'Ya no publicada', cls: 'bg-accent-50 text-accent-600 border-accent-200' },
}

function usd(n: number | null | undefined): string {
  if (n == null) return '—'
  return 'USD ' + n.toLocaleString('es-AR')
}

export default function StockColegasExplorer({
  feed,
  meta,
  fotos,
}: {
  feed: StockFeed
  meta: SyncMeta | null
  fotos: Record<string, string>
}) {
  const [tipo, setTipo] = useState<'todos' | 'Terreno' | 'Casa'>('todos')
  const [barrio, setBarrio] = useState<string>('todos')
  const [estado, setEstado] = useState<'activa' | 'a_confirmar' | 'cerrada' | 'todas'>('activa')
  const [precioMax, setPrecioMax] = useState<string>('')
  const [supMin, setSupMin] = useState<string>('')
  const [dormMin, setDormMin] = useState<string>('')
  const [q, setQ] = useState('')
  const [soloOpp, setSoloOpp] = useState(false)
  const [soloBajoBench, setSoloBajoBench] = useState(false)
  const [conFlags, setConFlags] = useState<string[]>([])
  const [orden, setOrden] = useState<OrdenId>('percentil')
  const [abierta, setAbierta] = useState<string | null>(null)

  const filtradas = useMemo(() => {
    const pmax = Number(precioMax) || Infinity
    const smin = Number(supMin) || 0
    const dmin = Number(dormMin) || 0
    const texto = q.trim().toLowerCase()

    const out = feed.propiedades.filter((p) => {
      if (tipo !== 'todos' && p.tipo !== tipo) return false
      if (barrio !== 'todos' && p.barrio !== barrio) return false
      if (estado !== 'todas' && p.estado !== estado) return false
      if (p.precio_usd > pmax) return false
      if (smin && (p.sup_total_m2 || 0) < smin) return false
      if (dmin && (p.dorm || 0) < dmin) return false
      if (soloOpp && !p.es_oportunidad) return false
      if (soloBajoBench && !(p.pct_vs_benchmark != null && p.pct_vs_benchmark < 0)) return false
      if (conFlags.length && !conFlags.every((f) => p.flags.includes(f))) return false
      if (texto) {
        const blob = `${p.titulo} ${p.direccion} ${p.barrio} ${p.stock_id} ${p.avisos
          .map((a) => a.id)
          .join(' ')}`.toLowerCase()
        if (!blob.includes(texto)) return false
      }
      return true
    })

    const val = (p: StockPropiedad): number => {
      switch (orden) {
        case 'percentil':
          return p.percentil_usd_m2 ?? p.percentil_precio ?? 101
        case 'pct_bench':
          return p.pct_vs_benchmark ?? 999
        case 'precio_asc':
          return p.precio_usd
        case 'precio_desc':
          return -p.precio_usd
        case 'dias':
          return -p.dias_en_mercado
        case 'nuevas':
          return -Date.parse(p.fecha_deteccion)
      }
    }
    out.sort((a, b) => val(a) - val(b))
    return out
  }, [feed, tipo, barrio, estado, precioMax, supMin, dormMin, q, soloOpp, soloBajoBench, conFlags, orden])

  const toggleFlag = (f: string) =>
    setConFlags((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Cabecera */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            Stock de Colegas <span className="text-gold-500">· MLS privado</span>
          </h1>
          <p className="mt-1 text-sm text-navy-400">
            {feed.total_propiedades} propiedades ({feed.activas} activas · {feed.a_confirmar} a
            confirmar · {feed.cerradas} cerradas) de {feed.total_avisos} avisos · feed del{' '}
            <strong>{feed.generado}</strong>
            {meta ? ` · sync ${new Date(meta.ultimo_sync).toLocaleString('es-AR')}` : ''}
            {feed.censo_completo_al ? ` · censo completo ${feed.censo_completo_al}` : ' · sin censo completo aún'}
          </p>
        </div>
        <div className="text-xs text-navy-300">
          Solo interno — el cliente ve lo curado vía ficha/selección
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-5 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <label className="block text-xs font-semibold text-navy-500">
            Tipo
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as typeof tipo)}
              className="mt-1 w-full rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy"
            >
              <option value="todos">Todos</option>
              <option value="Terreno">Terrenos</option>
              <option value="Casa">Casas</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-navy-500">
            Barrio
            <select
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy"
            >
              <option value="todos">Todos</option>
              {BARRIOS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-navy-500">
            Estado
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as typeof estado)}
              className="mt-1 w-full rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy"
            >
              <option value="activa">Activas</option>
              <option value="a_confirmar">A confirmar</option>
              <option value="cerrada">Cerradas (posibles ventas)</option>
              <option value="todas">Todas</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-navy-500">
            Precio máx (USD)
            <input
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              inputMode="numeric"
              placeholder="300000"
              className="mt-1 w-full rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy"
            />
          </label>
          <label className="block text-xs font-semibold text-navy-500">
            Sup. mín (m²)
            <input
              value={supMin}
              onChange={(e) => setSupMin(e.target.value)}
              inputMode="numeric"
              placeholder="500"
              className="mt-1 w-full rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy"
            />
          </label>
          <label className="block text-xs font-semibold text-navy-500">
            Dorm. mín
            <input
              value={dormMin}
              onChange={(e) => setDormMin(e.target.value)}
              inputMode="numeric"
              placeholder="3"
              className="mt-1 w-full rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por texto, dirección o id de aviso…"
            className="w-full max-w-sm rounded-lg border border-navy-100 px-3 py-1.5 text-sm text-navy"
          />
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as OrdenId)}
            className="rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy"
          >
            {ORDENES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSoloOpp((v) => !v)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              soloOpp
                ? 'border-accent-400 bg-accent-50 text-accent-600'
                : 'border-navy-100 text-navy-400'
            }`}
          >
            🍓 Solo oportunidades
          </button>
          <button
            onClick={() => setSoloBajoBench((v) => !v)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              soloBajoBench
                ? 'border-brand-400 bg-brand-50 text-brand-700'
                : 'border-navy-100 text-navy-400'
            }`}
          >
            Bajo benchmark
          </button>
          {['bajo_precio', 'estancada_30d', 'republicada', 'multi_inmobiliaria', 'precio_dispar'].map(
            (f) => (
              <button
                key={f}
                onClick={() => toggleFlag(f)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  conFlags.includes(f)
                    ? 'border-gold-400 bg-gold-50 text-gold-700'
                    : 'border-navy-100 text-navy-400'
                }`}
              >
                {FLAG_LABEL[f]}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Resultados */}
      <p className="mt-4 text-sm text-navy-400">
        <strong className="text-navy">{filtradas.length}</strong> resultado
        {filtradas.length === 1 ? '' : 's'}
      </p>

      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtradas.map((p) => {
          const foto = p.avisos.map((a) => fotos[`${a.portal}:${a.id}`]).find(Boolean)
          const fresc = FRESCURA_BADGE[p.frescura] || FRESCURA_BADGE.a_confirmar
          const abiertaEsta = abierta === p.stock_id
          const cambios = p.historial_precios.length - 1
          return (
            <div
              key={p.stock_id}
              className="flex flex-col rounded-2xl border border-navy-100 bg-white shadow-sm transition hover:shadow-md"
            >
              {foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={foto}
                  alt={p.titulo}
                  className="h-36 w-full rounded-t-2xl object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-16 items-center justify-center rounded-t-2xl bg-gradient-to-r from-navy-700 to-navy-500 text-xs tracking-wide text-navy-100">
                  {p.tipo === 'Casa' ? 'CASA' : 'LOTE'} · {p.barrio.toUpperCase()}
                </div>
              )}

              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold leading-tight text-navy">
                      {p.es_oportunidad ? '🍓 ' : ''}
                      {p.titulo}
                    </div>
                    <div className="text-xs text-navy-300">{p.direccion || p.barrio}</div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${fresc.cls}`}
                  >
                    {fresc.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-lg font-bold text-navy">{usd(p.precio_usd)}</span>
                  {p.precio_max_usd && (
                    <span className="text-xs text-accent-500">
                      hay avisos hasta {usd(p.precio_max_usd)}
                    </span>
                  )}
                  {p.usd_m2 != null && (
                    <span className="text-xs text-navy-400">
                      {p.usd_m2.toLocaleString('es-AR')} USD/m²
                      {p.tipo === 'Casa' ? ' cub.' : ''}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-500">
                  {p.sup_total_m2 && <span>Lote {p.sup_total_m2.toLocaleString('es-AR')} m²</span>}
                  {p.sup_cub_m2 && <span>Cub. {p.sup_cub_m2.toLocaleString('es-AR')} m²</span>}
                  {p.dorm && <span>{p.dorm} dorm</span>}
                  <span>
                    {p.dias_es_minimo ? '≥' : ''}
                    {p.dias_en_mercado} días publicada
                  </span>
                  {cambios > 0 && (
                    <span className="text-brand-700">
                      {cambios} cambio{cambios > 1 ? 's' : ''} de precio (
                      {usd(p.historial_precios[0].precio_usd)} →{' '}
                      {usd(p.historial_precios[cambios].precio_usd)})
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {p.pct_vs_benchmark != null && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        p.pct_vs_benchmark <= -15
                          ? 'bg-brand-100 text-brand-800'
                          : p.pct_vs_benchmark < 0
                            ? 'bg-brand-50 text-brand-700'
                            : 'bg-navy-50 text-navy-500'
                      }`}
                    >
                      {p.pct_vs_benchmark > 0 ? '+' : ''}
                      {p.pct_vs_benchmark}% vs barrio
                    </span>
                  )}
                  {p.percentil_usd_m2 != null && (
                    <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] text-navy-500">
                      p{p.percentil_usd_m2} USD/m²
                    </span>
                  )}
                  {p.percentil_precio != null && (
                    <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] text-navy-500">
                      p{p.percentil_precio} precio
                    </span>
                  )}
                  {p.flags.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-gold-50 px-2 py-0.5 text-[11px] text-gold-700"
                    >
                      {FLAG_LABEL[f] || f}
                    </span>
                  ))}
                  {p.veces_republicada > 0 && (
                    <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-semibold text-accent-600">
                      republicada ×{p.veces_republicada} — en mercado desde {p.fecha_deteccion}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                  {p.avisos.map((a) => (
                    <a
                      key={`${a.portal}:${a.id}`}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-600 hover:border-gold-400 hover:text-gold-700"
                    >
                      {a.portal} ↗{p.avisos.length > 1 ? ` ${usd(a.precio_usd)}` : ''}
                    </a>
                  ))}
                  <button
                    onClick={() => setAbierta(abiertaEsta ? null : p.stock_id)}
                    className="ml-auto text-xs text-navy-300 underline-offset-2 hover:text-navy-500 hover:underline"
                  >
                    {abiertaEsta ? 'menos' : 'detalle'}
                  </button>
                </div>

                {abiertaEsta && (
                  <div className="rounded-xl bg-navy-50/60 p-3 text-xs text-navy-600">
                    <div>
                      <strong>Detectada:</strong> {p.fecha_deteccion} · <strong>última vista:</strong>{' '}
                      {p.ultima_vista} · <strong>señal:</strong> {p.senal || '—'}
                    </div>
                    {p.historial_precios.length > 0 && (
                      <div className="mt-1">
                        <strong>Historial:</strong>{' '}
                        {p.historial_precios
                          .map((h) => `${h.fecha}: ${usd(h.precio_usd)}`)
                          .join(' · ')}
                      </div>
                    )}
                    {p.gemelos && p.gemelos.length > 0 && (
                      <div className="mt-1">
                        <strong>Posibles duplicados:</strong> {p.gemelos.join(', ')} (mismo
                        fingerprint — puede ser el mismo lote publicado distinto o gemelos del
                        desarrollador)
                      </div>
                    )}
                    {p.benchmark_usd_m2 && (
                      <div className="mt-1">
                        <strong>Benchmark {p.barrio}:</strong> {p.benchmark_usd_m2} USD/m² ·
                        confianza dedup: {p.dup_confianza}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filtradas.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-navy-200 p-10 text-center text-navy-300">
          Ningún resultado con esos filtros.
        </div>
      )}
    </div>
  )
}
