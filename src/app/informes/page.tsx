import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const CacDolarChart = dynamic(() => import('@/components/CacDolarChart'), { ssr: false })
const InflationMiniChart = dynamic(() => import('@/components/InflationMiniChart'), { ssr: false })
const AlquilerCalculator = dynamic(() => import('@/components/AlquilerCalculator'), { ssr: false })

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Informes del Mercado Inmobiliario | SI Inmobiliaria',
  description: 'Datos actualizados del mercado inmobiliario: índice CAC, dólar blue, ICL alquileres, IPC inflación, costo de construcción por m².',
}

interface DolarResponse { compra: number; venta: number; fechaActualizacion: string }
interface IndecSeriesResponse { data: [string, number | null][] }

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch { return null }
}

function parseSeries(json: IndecSeriesResponse | null): { date: string; value: number }[] {
  if (!json) return []
  return (json.data || [])
    .filter((d): d is [string, number] => d[1] != null)
    .map(d => ({ date: d[0], value: d[1] }))
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
  const [dolarBlue, dolarOficial, cacRaw, dolarHistory, iclRaw, ipcRaw, cerRaw, uvaRaw] = await Promise.all([
    fetchJson<DolarResponse>('https://dolarapi.com/v1/dolares/blue'),
    fetchJson<DolarResponse>('https://dolarapi.com/v1/dolares/oficial'),
    fetchJson<IndecSeriesResponse>('https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_26&start_date=2024-01-01&limit=36&format=json'),
    fetchDolarBlueHistory(),
    fetchJson<IndecSeriesResponse>('https://apis.datos.gob.ar/series/api/series/?ids=144.3_INDCLABIN_DICI_M_19&start_date=2024-01-01&limit=36&format=json'),
    fetchJson<IndecSeriesResponse>('https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_33&start_date=2024-01-01&limit=36&format=json'),
    fetchJson<IndecSeriesResponse>('https://apis.datos.gob.ar/series/api/series/?ids=449.1_CERVam8J_DIA_0_0_16&collapse=month&collapse_aggregation=avg&start_date=2024-01-01&limit=36&format=json'),
    fetchJson<IndecSeriesResponse>('https://apis.datos.gob.ar/series/api/series/?ids=449.1_UVAUSD3Gk_DIA_0_0_26&collapse=month&collapse_aggregation=avg&start_date=2024-01-01&limit=36&format=json'),
  ])

  const cacSeries = parseSeries(cacRaw)
  const iclSeries = parseSeries(iclRaw)
  const ipcSeries = parseSeries(ipcRaw)
  const cerSeries = parseSeries(cerRaw)
  const uvaSeries = parseSeries(uvaRaw)

  const indicesData = {
    ICL: iclSeries.map(d => ({ date: d.date, value: d.value })),
    IPC: ipcSeries.map(d => ({ date: d.date, value: d.value })),
    CAC: cacSeries.map(d => ({ date: d.date, value: d.value })),
    CER: cerSeries.map(d => ({ date: d.date, value: d.value })),
    UVA: uvaSeries.map(d => ({ date: d.date, value: d.value })),
  }

  const blueVenta = dolarBlue?.venta || 1
  const brecha = dolarBlue && dolarOficial ? ((dolarBlue.venta - dolarOficial.venta) / dolarOficial.venta * 100) : null

  const latestCac = cacSeries.at(-1)
  const prevCac = cacSeries.at(-2)
  const cacChange = latestCac && prevCac ? ((latestCac.value - prevCac.value) / prevCac.value * 100) : null

  const cacBase = cacSeries[0]?.value || 1
  const dolarBase = dolarHistory[0]?.value || 1
  const dolarByMonth = new Map(dolarHistory.map(d => [d.date.slice(0, 7), d.value]))
  const chartData = cacSeries.map(d => {
    const dolarVal = dolarByMonth.get(d.date.slice(0, 7))
    return {
      label: formatMonth(d.date),
      cac: Math.round((d.value / cacBase) * 1000) / 10,
      dolar: dolarVal ? Math.round((dolarVal / dolarBase) * 1000) / 10 : null,
    }
  }).filter(d => d.cac > 0)

  const cacVal = latestCac?.value || 0
  const costos = [
    { cat: 'Categoría económica', mult: 0.0045 },
    { cat: 'Categoría media', mult: 0.0065 },
    { cat: 'Categoría premium', mult: 0.0095 },
    { cat: 'Premium Plus', mult: 0.014 },
  ].map(c => ({ ...c, usd: cacVal ? Math.round((cacVal * c.mult) / blueVenta) : null }))

  const ipcLatest = ipcSeries.at(-1)
  const ipcPrev = ipcSeries.at(-2)
  const ipcMonthly = ipcLatest && ipcPrev ? ((ipcLatest.value - ipcPrev.value) / ipcPrev.value * 100) : null
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

  const lastUpdated = dolarBlue?.fechaActualizacion
    ? new Date(dolarBlue.fechaActualizacion).toLocaleString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Hero — dark */}
      <div className="bg-[#0f0f0f] w-full">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <p className="text-[#4ADE80] text-xs font-bold tracking-widest uppercase mb-4">DATOS EN TIEMPO REAL</p>
          <h1 className="text-white" style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1, fontFamily: 'Raleway, sans-serif' }}>
            Mercado inmobiliario
          </h1>
          <p className="text-white/50 text-lg mt-3">Indicadores actualizados automáticamente</p>
          {lastUpdated && <p className="text-white/30 text-sm mt-2">{lastUpdated}</p>}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">

        <SectionDivider label="TIPO DE CAMBIO" />

        {/* Dólar cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Dólar Blue</p>
            {dolarBlue ? (
              <div className="flex items-baseline gap-6">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Compra</p>
                  <p className="text-3xl font-bold text-[#1A5C38] font-numeric">${dolarBlue.compra.toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Venta</p>
                  <p className="text-3xl font-bold text-[#1A5C38] font-numeric">${dolarBlue.venta.toLocaleString('es-AR')}</p>
                </div>
              </div>
            ) : <p className="text-gray-300 text-sm">No disponible</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Dólar Oficial</p>
            {dolarOficial ? (
              <div className="flex items-baseline gap-6">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Compra</p>
                  <p className="text-3xl font-bold text-gray-900 font-numeric">${dolarOficial.compra.toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Venta</p>
                  <p className="text-3xl font-bold text-gray-900 font-numeric">${dolarOficial.venta.toLocaleString('es-AR')}</p>
                </div>
              </div>
            ) : <p className="text-gray-300 text-sm">No disponible</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Brecha Blue vs Oficial</p>
            {brecha !== null ? (
              <p className={`text-5xl font-black font-numeric ${brecha < 20 ? 'text-green-600' : brecha < 50 ? 'text-amber-500' : 'text-red-500'}`}>
                {brecha.toFixed(1)}%
              </p>
            ) : <p className="text-gray-300 text-sm">—</p>}
          </div>
        </div>

        {/* CAC vs Dólar Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>Evolución CAC vs Dólar Blue — Base 100</h2>
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

        {/* CAC + Inflación cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Índice CAC</p>
              <SourceBadge text="INDEC" />
            </div>
            {latestCac ? (
              <div>
                <p className="text-4xl font-bold text-gray-900 font-numeric">{latestCac.value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
                {cacChange !== null && (
                  <p className={`text-sm font-semibold font-numeric mt-2 ${cacChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {cacChange >= 0 ? '+' : ''}{cacChange.toFixed(1)}% mensual
                  </p>
                )}
                <p className="text-xs text-gray-300 mt-1">{formatMonth(latestCac.date)}</p>
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
              <SourceBadge text="CAC / Blue" />
            </div>
            <p className="text-sm text-gray-400 mb-6">Valores orientativos según índice CAC y dólar blue actual</p>
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

        {/* Footer note */}
        <p className="text-[10px] text-gray-300 text-center mt-12">
          Fuentes: BCRA, INDEC, Bluelytics, DolarAPI — Datos orientativos, actualizados cada hora
        </p>
      </div>
    </div>
  )
}
