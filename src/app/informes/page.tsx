import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { redis } from '@/lib/redis'

const CacDolarChart = dynamic(() => import('@/components/CacDolarChart'), { ssr: false })
const InflationMiniChart = dynamic(() => import('@/components/InflationMiniChart'), { ssr: false })
const AlquilerCalculator = dynamic(() => import('@/components/AlquilerCalculator'), { ssr: false })
const DolarLive = dynamic(() => import('@/components/DolarLive'), { ssr: false })

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Informes del Mercado Inmobiliario | SI Inmobiliaria',
  description: 'Datos actualizados del mercado inmobiliario: dólar blue en vivo, IPC inflación, CER, UVA, costo de construcción. Calculadora de ajuste de alquiler.',
}

interface IndexEntry { date: string; value: number }
interface DolarResponse { compra: number; venta: number; fechaActualizacion: string }

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch { return null }
}

interface BluelyticsEntry { date: string; value_sell: number; source: string }

async function fetchDolarBlueHistory(): Promise<{ date: string; value: number }[]> {
  try {
    const res = await fetch('https://api.bluelytics.com.ar/v2/evolution.json', { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = await res.json() as BluelyticsEntry[]
    const blueOnly = json.filter(e => e.source === 'Blue' && e.date >= '2024-01-01')
    const byMonth = new Map<string, number>()
    for (const entry of blueOnly) byMonth.set(entry.date.slice(0, 7), entry.value_sell)
    return Array.from(byMonth.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([d, v]) => ({ date: d + '-01', value: v }))
  } catch { return [] }
}

async function getRedisIndices(): Promise<Record<string, IndexEntry[]>> {
  const keys = ['IPC', 'IPC_NUCLEO', 'CER', 'UVA']
  const result: Record<string, IndexEntry[]> = {}
  for (const key of keys) {
    try {
      const raw = await redis.get(`indices:${key}`)
      if (raw) {
        result[key] = typeof raw === 'string' ? JSON.parse(raw) : raw as IndexEntry[]
      } else {
        result[key] = []
      }
    } catch {
      result[key] = []
    }
  }
  return result
}

interface IndecSeriesResponse { data: [string, number | null][] }

function parseSeries(json: IndecSeriesResponse | null): IndexEntry[] {
  if (!json) return []
  return (json.data || [])
    .filter((d): d is [string, number] => d[1] != null)
    .map(d => ({ date: d[0], value: d[1] }))
}

async function getFallbackIndices(): Promise<Record<string, IndexEntry[]>> {
  const [ipcRaw, cerRaw, uvaRaw] = await Promise.all([
    fetchJson<IndecSeriesResponse>('https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_26&start_date=2024-01-01&limit=36&format=json'),
    fetchJson<IndecSeriesResponse>('https://apis.datos.gob.ar/series/api/series/?ids=94.2_CD_D_0_0_10&collapse=month&collapse_aggregation=avg&start_date=2024-01-01&limit=36&format=json'),
    fetchJson<IndecSeriesResponse>('https://apis.datos.gob.ar/series/api/series/?ids=94.2_UVAD_D_0_0_10&collapse=month&collapse_aggregation=avg&start_date=2024-01-01&limit=36&format=json'),
  ])
  return {
    IPC: parseSeries(ipcRaw),
    CER: parseSeries(cerRaw),
    UVA: parseSeries(uvaRaw),
  }
}

function formatMonth(dateStr: string): string {
  const [y, m] = dateStr.split('-')
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${months[parseInt(m, 10) - 1]} ${y.slice(2)}`
}

function SourceBadge({ text }: { text: string }) {
  return <span className="text-[10px] font-medium text-gray-300 bg-gray-100 px-2 py-0.5 rounded ml-2">{text}</span>
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 my-12">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

export default async function InformesPage() {
  // Try Redis first, fallback to direct INDEC
  let indices: Record<string, IndexEntry[]> = {}
  let hasRedisData = false
  let lastUpdated: string | null = null

  try {
    indices = await getRedisIndices()
    hasRedisData = Object.values(indices).some(arr => arr.length > 0)
    if (hasRedisData) {
      lastUpdated = (await redis.get('indices:last_updated') as string | null)
    }
  } catch {
    hasRedisData = false
  }

  if (!hasRedisData) {
    indices = await getFallbackIndices()
  }

  const dolarBlue = await fetchJson<DolarResponse>('https://dolarapi.com/v1/dolares/blue')
  const dolarHistory = await fetchDolarBlueHistory()

  const ipcSeries = indices.IPC || []
  const cerSeries = indices.CER || []
  const uvaSeries = indices.UVA || []

  // Calculator data
  const indicesData = {
    IPC: ipcSeries.map(d => ({ date: d.date, value: d.value })),
    CER: cerSeries.map(d => ({ date: d.date, value: d.value })),
    UVA: uvaSeries.map(d => ({ date: d.date, value: d.value })),
  }

  const blueVenta = dolarBlue?.venta || 1

  // IPC stats
  const latestIpc = ipcSeries.at(-1)
  const prevIpc = ipcSeries.at(-2)
  const ipcChange = latestIpc && prevIpc ? ((latestIpc.value - prevIpc.value) / prevIpc.value * 100) : null

  // Chart: IPC vs Dolar Blue rebased to 100
  const ipcBase = ipcSeries[0]?.value || 1
  const dolarBase = dolarHistory[0]?.value || 1
  const dolarByMonth = new Map(dolarHistory.map(d => [d.date.slice(0, 7), d.value]))
  const chartData = ipcSeries.map(d => {
    const dolarVal = dolarByMonth.get(d.date.slice(0, 7))
    return {
      label: formatMonth(d.date),
      cac: Math.round((d.value / ipcBase) * 1000) / 10,
      dolar: dolarVal ? Math.round((dolarVal / dolarBase) * 1000) / 10 : null,
    }
  }).filter(d => d.cac > 0)

  // Construction cost
  const ipcVal = latestIpc?.value || 0
  const costos = [
    { cat: 'Categoría económica', mult: 0.0045 },
    { cat: 'Categoría media', mult: 0.0065 },
    { cat: 'Categoría premium', mult: 0.0095 },
    { cat: 'Premium Plus', mult: 0.014 },
  ].map(c => ({ ...c, usd: ipcVal ? Math.round((ipcVal * c.mult) / blueVenta) : null }))

  // IPC inflation mini chart
  const ipcMonthly = latestIpc && prevIpc ? ((latestIpc.value - prevIpc.value) / prevIpc.value * 100) : null
  const ipc12 = ipcSeries.length >= 13
    ? ipcSeries.slice(-13).reduce((acc, d, i, arr) => {
        if (i === 0) return acc
        return acc + ((d.value - arr[i - 1].value) / arr[i - 1].value * 100)
      }, 0)
    : null
  const ipcChartData = ipcSeries.slice(-7).map((d, i, arr) => ({
    label: formatMonth(d.date),
    value: i === 0 ? 0 : Math.round(((d.value - arr[i - 1].value) / arr[i - 1].value * 100) * 10) / 10,
  })).slice(1)

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Hero */}
      <div className="bg-[#0f0f0f] w-full">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <p className="text-[#4ADE80] text-xs font-bold tracking-widest uppercase mb-4">DATOS EN TIEMPO REAL</p>
          <h1 className="text-white" style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1, fontFamily: 'Raleway, sans-serif' }}>
            Mercado inmobiliario
          </h1>
          <p className="text-white/50 text-lg mt-3">Indicadores actualizados automáticamente</p>
          {lastUpdated && (
            <p className="text-white/30 text-sm mt-2">
              Índices actualizados: {new Date(lastUpdated).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">

        <SectionDivider label="DÓLAR EN TIEMPO REAL" />
        <DolarLive />

        {/* IPC vs Dólar Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-8">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>Evolución IPC vs Dólar Blue — Base 100</h2>
              <SourceBadge text="INDEC / Bluelytics" />
            </div>
            <p className="text-sm text-gray-400 mb-6">Desde enero 2024</p>
            <CacDolarChart data={chartData} />
          </div>
        )}

        <SectionDivider label="PARA PROPIETARIOS E INQUILINOS" />

        {/* Alquiler Calculator */}
        <AlquilerCalculator indices={indicesData} />

        <SectionDivider label="PARA CONSTRUCTORES" />

        {/* IPC + Inflation cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">IPC Nivel General</p>
              <SourceBadge text="INDEC" />
              {hasRedisData && <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">REDIS</span>}
            </div>
            {latestIpc ? (
              <div>
                <p className="text-4xl font-bold text-gray-900 font-numeric">{latestIpc.value.toLocaleString('es-AR', { maximumFractionDigits: 1 })}</p>
                {ipcChange !== null && (
                  <p className={`text-sm font-semibold font-numeric mt-2 ${ipcChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {ipcChange >= 0 ? '+' : ''}{ipcChange.toFixed(1)}% mensual
                  </p>
                )}
                <p className="text-xs text-gray-300 mt-1">{formatMonth(latestIpc.date)}</p>
              </div>
            ) : <p className="text-gray-300 text-sm">No disponible</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Inflación (IPC)</p>
              <SourceBadge text="INDEC" />
            </div>
            <div className="flex items-baseline gap-8 mb-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Último mes</p>
                {ipcMonthly !== null ? (
                  <p className="text-3xl font-bold text-orange-500 font-numeric">{ipcMonthly.toFixed(1)}%</p>
                ) : <p className="text-gray-300">—</p>}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">12 meses</p>
                {ipc12 !== null ? (
                  <p className="text-3xl font-bold text-orange-500 font-numeric">{ipc12.toFixed(1)}%</p>
                ) : <p className="text-gray-300">—</p>}
              </div>
            </div>
            {ipcChartData.length > 0 && <InflationMiniChart data={ipcChartData} />}
          </div>
        </div>

        {/* Costo de construcción USD */}
        {costos[0].usd && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>Costo de construcción en USD</h2>
              <SourceBadge text="IPC / Blue" />
            </div>
            <p className="text-sm text-gray-400 mb-6">Valores orientativos según índice IPC y dólar blue actual</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {costos.map(c => (
                <div key={c.cat} className="bg-[#f8f7f4] rounded-2xl p-5 text-center">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{c.cat}</p>
                  <p className="text-2xl font-bold text-[#1A5C38] font-numeric">~USD {c.usd}</p>
                  <p className="text-xs text-gray-400 mt-1">por m²</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-300 text-center mt-4">
              Incluye materiales y mano de obra. Sin honorarios profesionales. Consultar con profesional.
            </p>
          </div>
        )}

        <p className="text-[10px] text-gray-300 text-center mt-12">
          Fuentes: BCRA, INDEC, Bluelytics, DolarAPI · {hasRedisData ? 'Cache Redis activo' : 'Datos directos INDEC'} · Dólar en tiempo real
        </p>
      </div>
    </div>
  )
}
