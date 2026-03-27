import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const CacDolarChart = dynamic(() => import('@/components/CacDolarChart'), { ssr: false })

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Informes del Mercado Inmobiliario | SI Inmobiliaria',
  description: 'Datos actualizados del mercado inmobiliario: índice CAC, dólar blue, costo de construcción por m².',
}

interface DolarResponse {
  compra: number
  venta: number
  fechaActualizacion: string
}

interface CacSeriesResponse {
  data: [string, number | null][]
}

async function fetchDolarBlue(): Promise<DolarResponse | null> {
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/blue', { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

async function fetchDolarOficial(): Promise<DolarResponse | null> {
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/oficial', { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

async function fetchCacSeries(): Promise<{ date: string; value: number }[]> {
  try {
    const res = await fetch(
      'https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_26&start_date=2024-01-01&limit=36&format=json',
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const json = await res.json() as CacSeriesResponse
    return (json.data || [])
      .filter((d): d is [string, number] => d[1] != null)
      .map(d => ({ date: d[0], value: d[1] }))
  } catch { return [] }
}

interface BluelyticsEntry {
  date: string
  value_sell: number
  source: string
}

async function fetchDolarBlueHistory(): Promise<{ date: string; value: number }[]> {
  try {
    const res = await fetch('https://api.bluelytics.com.ar/v2/evolution.json', { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = await res.json() as BluelyticsEntry[]
    const blueOnly = json.filter(e => e.source === 'Blue' && e.date >= '2024-01-01')
    // Group by month (YYYY-MM), take last entry per month
    const byMonth = new Map<string, number>()
    for (const entry of blueOnly) {
      const month = entry.date.slice(0, 7)
      byMonth.set(month, entry.value_sell)
    }
    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date: date + '-01', value }))
  } catch { return [] }
}

function formatMonth(dateStr: string): string {
  const [y, m] = dateStr.split('-')
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${months[parseInt(m, 10) - 1]} ${y.slice(2)}`
}

export default async function InformesPage() {
  const [dolarBlue, dolarOficial, cacSeries, dolarHistory] = await Promise.all([
    fetchDolarBlue(),
    fetchDolarOficial(),
    fetchCacSeries(),
    fetchDolarBlueHistory(),
  ])

  const latestCac = cacSeries.length > 0 ? cacSeries[cacSeries.length - 1] : null
  const prevCac = cacSeries.length > 1 ? cacSeries[cacSeries.length - 2] : null
  const cacChange = latestCac && prevCac ? ((latestCac.value - prevCac.value) / prevCac.value * 100) : null

  // Build chart: rebase both to 100 from first data point (Jan 2024)
  const cacBase = cacSeries.length > 0 ? cacSeries[0].value : 1
  const dolarBase = dolarHistory.length > 0 ? dolarHistory[0].value : 1

  // Build dolar lookup by month
  const dolarByMonth = new Map<string, number>()
  for (const d of dolarHistory) {
    dolarByMonth.set(d.date.slice(0, 7), d.value)
  }

  const chartData = cacSeries.map(d => {
    const month = d.date.slice(0, 7)
    const cacRebased = (d.value / cacBase) * 100
    const dolarVal = dolarByMonth.get(month)
    const dolarRebased = dolarVal ? (dolarVal / dolarBase) * 100 : null
    return {
      label: formatMonth(d.date),
      cac: Math.round(cacRebased * 10) / 10,
      dolar: dolarRebased ? Math.round(dolarRebased * 10) / 10 : null,
    }
  }).filter(d => d.cac > 0)

  // Construction cost per m² in USD (based on CAC / dolar blue)
  const blueVenta = dolarBlue?.venta || 1
  const cacUsd = latestCac ? latestCac.value / blueVenta : null
  const costoEconomico = cacUsd ? Math.round(cacUsd * 0.55) : null
  const costoMedio = cacUsd ? Math.round(cacUsd * 0.75) : null
  const costoPremium = cacUsd ? Math.round(cacUsd * 1.05) : null

  const lastUpdated = dolarBlue?.fechaActualizacion
    ? new Date(dolarBlue.fechaActualizacion).toLocaleString('es-AR', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <h1
          className="text-gray-900"
          style={{ fontSize: 48, fontWeight: 800, letterSpacing: -1, fontFamily: 'Raleway, sans-serif' }}
        >
          Informes del mercado
        </h1>
        <p className="text-gray-400 text-base mt-3">
          Datos actualizados automáticamente de fuentes oficiales
        </p>
        {lastUpdated && (
          <p className="text-gray-300 text-xs mt-2">
            Última actualización: {lastUpdated}
          </p>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-12">
        {/* Live rates strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Dólar Blue */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Dólar Blue</p>
            {dolarBlue ? (
              <div className="flex items-baseline gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Compra</p>
                  <p className="text-2xl font-bold text-[#1A5C38] font-numeric">${dolarBlue.compra.toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Venta</p>
                  <p className="text-2xl font-bold text-[#1A5C38] font-numeric">${dolarBlue.venta.toLocaleString('es-AR')}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-300 text-sm">No disponible</p>
            )}
          </div>

          {/* Dólar Oficial */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Dólar Oficial</p>
            {dolarOficial ? (
              <div className="flex items-baseline gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Compra</p>
                  <p className="text-2xl font-bold text-gray-900 font-numeric">${dolarOficial.compra.toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Venta</p>
                  <p className="text-2xl font-bold text-gray-900 font-numeric">${dolarOficial.venta.toLocaleString('es-AR')}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-300 text-sm">No disponible</p>
            )}
          </div>

          {/* CAC hoy */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Índice CAC</p>
            {latestCac ? (
              <div>
                <p className="text-2xl font-bold text-gray-900 font-numeric">
                  {latestCac.value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                {cacChange !== null && (
                  <p className={`text-sm font-semibold font-numeric mt-1 ${cacChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {cacChange >= 0 ? '+' : ''}{cacChange.toFixed(1)}% vs mes anterior
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-300 text-sm">No disponible</p>
            )}
          </div>
        </div>

        {/* CAC vs Dólar Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Evolución CAC vs Dólar Blue — Base 100
            </h2>
            <p className="text-sm text-gray-400 mb-6">Últimos {chartData.length} meses</p>
            <CacDolarChart data={chartData} />
          </div>
        )}

        {/* Costo de construcción */}
        {costoEconomico && costoMedio && costoPremium && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>
              ¿Cuánto cuesta construir hoy?
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Valores estimados en USD según índice CAC y dólar blue actual
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Categoría económica</p>
                <p className="text-3xl font-bold text-[#1A5C38] font-numeric">~USD {costoEconomico}</p>
                <p className="text-xs text-gray-400 mt-1">por m²</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Categoría media</p>
                <p className="text-3xl font-bold text-[#1A5C38] font-numeric">~USD {costoMedio}</p>
                <p className="text-xs text-gray-400 mt-1">por m²</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Categoría premium</p>
                <p className="text-3xl font-bold text-[#1A5C38] font-numeric">~USD {costoPremium}</p>
                <p className="text-xs text-gray-400 mt-1">por m²</p>
              </div>
            </div>
            <p className="text-xs text-gray-300 text-center mt-4">
              Valores estimados según índice CAC. Consultar con profesional para presupuesto preciso.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
