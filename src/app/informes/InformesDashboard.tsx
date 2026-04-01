'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

interface DatoSerie { fecha: string; valor: number }
interface DolarEntry { compra: number; venta: number; nombre: string; fechaActualizacion: string }
interface InformesData {
  dolar?: { oficial?: DolarEntry; blue?: DolarEntry; mep?: DolarEntry; fetchedAt: string }
  ipc?: { datos: DatoSerie[]; fetchedAt: string }
  icl?: { datos: DatoSerie[]; fetchedAt: string }
  cac?: { datos: DatoSerie[]; fetchedAt: string }
}

function fmtMonth(fecha: string) {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const d = new Date(fecha)
  return `${meses[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}

function pct(a: number, b: number) { return b ? ((a - b) / b * 100) : 0 }

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
}

function DolarCard({ title, data, color }: { title: string; data?: DolarEntry; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      {data ? (
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-400 mb-0.5">Compra</p>
            <p className="text-2xl font-bold font-numeric text-gray-900">${data.compra?.toLocaleString('es-AR')}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 mb-0.5">Venta</p>
            <p className="text-2xl font-bold font-numeric" style={{ color }}>${data.venta?.toLocaleString('es-AR')}</p>
          </div>
        </div>
      ) : <Skeleton className="h-12 w-full" />}
    </div>
  )
}

export default function InformesDashboard() {
  const [data, setData] = useState<InformesData | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/informes')
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(res => {
        const parsed = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
        setData(parsed)
        setLastUpdate(res.lastUpdate)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // IPC calculations
  const ipcDatos = data?.ipc?.datos || []
  const ipcLast = ipcDatos.at(-1)
  const ipcPrev = ipcDatos.at(-2)
  const ipcMonthly = ipcLast && ipcPrev ? pct(ipcLast.valor, ipcPrev.valor) : null
  const ipc12 = ipcDatos.length >= 13 ? pct(ipcDatos.at(-1)!.valor, ipcDatos.at(-13)!.valor) : null
  const ipcChart = ipcDatos.slice(-12).map((d, i, arr) => ({
    label: fmtMonth(d.fecha),
    value: i === 0 ? 0 : Math.round(pct(d.valor, arr[i - 1].valor) * 10) / 10,
  })).slice(1)

  // ICL calculations
  const iclDatos = data?.icl?.datos || []
  const iclLast = iclDatos.at(-1)
  const icl12Ago = iclDatos.at(-13)
  const iclAnual = iclLast && icl12Ago ? pct(iclLast.valor, icl12Ago.valor) : null
  const iclChart = iclDatos.slice(-12).map(d => ({ label: fmtMonth(d.fecha), value: d.valor }))
  const iclTable = iclDatos.slice(-6).map((d, i, arr) => ({
    mes: fmtMonth(d.fecha),
    valor: d.valor,
    var: i === 0 ? null : pct(d.valor, arr[i - 1].valor),
  }))

  // CAC calculations
  const cacDatos = data?.cac?.datos || []
  const cacLast = cacDatos.at(-1)
  const cacPrev = cacDatos.at(-2)
  const cac12Ago = cacDatos.at(-13)
  const cacMensual = cacLast && cacPrev ? pct(cacLast.valor, cacPrev.valor) : null
  const cacAnual = cacLast && cac12Ago ? pct(cacLast.valor, cac12Ago.valor) : null
  const cacChart = cacDatos.slice(-12).map(d => ({ label: fmtMonth(d.fecha), value: d.valor }))

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm max-w-md">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6E6E73" strokeWidth="1.5" className="mx-auto mb-4">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Datos en actualización</h2>
          <p className="text-sm text-gray-500">Volvé en unos minutos. Los indicadores se actualizan cada lunes.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Hero */}
      <div className="bg-[#0f0f0f] w-full">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 text-center">
          <p className="text-[#4ADE80] text-xs font-bold tracking-widest uppercase mb-4">Datos actualizados semanalmente</p>
          <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Mercado inmobiliario
          </h1>
          <p className="text-white/50 text-base mt-3">Indicadores oficiales para Funes y Roldán</p>
          {lastUpdate && (
            <p className="text-white/25 text-xs mt-3">
              Última actualización: {new Date(lastUpdate as string).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 space-y-6">

        {/* ── DÓLAR ── */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dólar</p>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DolarCard title="Dólar Oficial" data={data?.dolar?.oficial} color="#1A5C38" />
              <DolarCard title="Dólar Blue" data={data?.dolar?.blue} color="#1A5C38" />
              <DolarCard title="Dólar MEP" data={data?.dolar?.mep} color="#1A5C38" />
            </div>
          )}
        </div>

        {/* ── IPC + ICL ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* IPC — 2/3 */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">IPC — Inflación</p>
                <p className="text-[10px] text-gray-300 mt-0.5">Fuente: BCRA / INDEC</p>
              </div>
              {ipcMonthly !== null && (
                <div className="text-right">
                  <p className="text-3xl font-bold text-orange-500 font-numeric">{ipcMonthly.toFixed(1)}%</p>
                  <p className="text-[10px] text-gray-400">último mes</p>
                </div>
              )}
            </div>
            {loading ? <Skeleton className="h-48 w-full" /> : ipcChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ipcChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#999' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#999' }} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Inflación']} labelStyle={{ fontWeight: 600 }} />
                  <Bar dataKey="value" fill="#1A5C38" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-300">Sin datos</p>}
            {ipc12 !== null && (
              <p className="text-sm text-gray-500 mt-3">Acumulada 12 meses: <span className="font-bold text-orange-500 font-numeric">{ipc12.toFixed(1)}%</span></p>
            )}
          </div>

          {/* ICL — 1/3 */}
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">ICL — Alquileres</p>
            <p className="text-[10px] text-gray-300 mb-4">Índice Contratos de Locación</p>
            {loading ? <Skeleton className="h-16 w-full mb-4" /> : iclLast ? (
              <div className="mb-4">
                <p className="text-3xl font-bold text-[#1A5C38] font-numeric">{iclLast.valor.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</p>
                {iclAnual !== null && (
                  <p className="text-sm text-gray-500 mt-1">vs 12 meses: <span className="font-bold font-numeric text-[#1A5C38]">+{iclAnual.toFixed(1)}%</span></p>
                )}
              </div>
            ) : <p className="text-sm text-gray-300">Sin datos</p>}

            {iclChart.length > 0 && (
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={iclChart}>
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#999' }} />
                  <Tooltip formatter={(v) => [Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }), 'ICL']} />
                  <Line type="monotone" dataKey="value" stroke="#1A5C38" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}

            <p className="text-[10px] text-gray-300 mt-3 mb-3">Este índice determina cuánto sube tu alquiler</p>

            {/* Mini table */}
            {iclTable.length > 0 && (
              <div className="text-[11px]">
                <div className="flex text-gray-400 font-semibold border-b border-gray-100 pb-1 mb-1">
                  <span className="flex-1">Mes</span>
                  <span className="w-16 text-right">Valor</span>
                  <span className="w-14 text-right">Var.</span>
                </div>
                {iclTable.map(r => (
                  <div key={r.mes} className="flex py-0.5 text-gray-600">
                    <span className="flex-1">{r.mes}</span>
                    <span className="w-16 text-right font-numeric">{r.valor.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                    <span className="w-14 text-right font-numeric">{r.var !== null ? `${r.var >= 0 ? '+' : ''}${r.var.toFixed(1)}%` : '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CAC ── */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">CAC — Costo de Construcción</p>
              <p className="text-[10px] text-gray-300 mt-0.5">Cámara Argentina de la Construcción</p>
            </div>
            {cacLast && (
              <p className="text-3xl font-bold text-amber-600 font-numeric">{cacLast.valor.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</p>
            )}
          </div>

          {loading ? <Skeleton className="h-48 w-full" /> : cacChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={cacChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#999' }} />
                <YAxis tick={{ fontSize: 11, fill: '#999' }} />
                <Tooltip formatter={(v) => [Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 }), 'CAC']} />
                <Line type="monotone" dataKey="value" stroke="#d97706" strokeWidth={2.5} dot={{ r: 3, fill: '#d97706' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-300">Sin datos</p>}

          {(cacMensual !== null || cacAnual !== null) && (
            <div className="flex gap-6 mt-4">
              {cacMensual !== null && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Var. mensual</p>
                  <p className="text-lg font-bold text-amber-600 font-numeric">{cacMensual >= 0 ? '+' : ''}{cacMensual.toFixed(1)}%</p>
                </div>
              )}
              {cacAnual !== null && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Var. anual</p>
                  <p className="text-lg font-bold text-amber-600 font-numeric">{cacAnual >= 0 ? '+' : ''}{cacAnual.toFixed(1)}%</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-[10px] text-gray-300 text-center pt-6">
          Fuentes: BCRA, INDEC, DolarAPI · Datos cacheados en Redis, actualizados cada lunes
        </p>
      </div>
    </div>
  )
}
