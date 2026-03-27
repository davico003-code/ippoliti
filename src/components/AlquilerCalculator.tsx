'use client'

import { useState, useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'

type IndexKey = 'ICL' | 'IPC' | 'CAC' | 'CER' | 'UVA'

interface IndexEntry { date: string; value: number }
interface Props {
  indices: Record<IndexKey, IndexEntry[]>
}

const INDEX_META: Record<IndexKey, { label: string; color: string; desc: string }> = {
  ICL:  { label: 'ICL',  color: '#ec4899', desc: 'Contratos Ley 27.551' },
  IPC:  { label: 'IPC',  color: '#06b6d4', desc: 'Índice Precios Consumidor' },
  CAC:  { label: 'CAC',  color: '#1A5C38', desc: 'Costo Argentino Construcción' },
  CER:  { label: 'CER',  color: '#8b5cf6', desc: 'Coeficiente Estabilización' },
  UVA:  { label: 'UVA',  color: '#f59e0b', desc: 'Unidad de Valor Adquisitivo' },
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function formatMonth(dateStr: string): string {
  const [y, m] = dateStr.split('-')
  return `${MONTHS[parseInt(m, 10) - 1]} ${y.slice(2)}`
}

function getLatestChange(data: IndexEntry[]): { pct: number; date: string } | null {
  if (data.length < 2) return null
  const last = data[data.length - 1]
  const prev = data[data.length - 2]
  return { pct: ((last.value - prev.value) / prev.value) * 100, date: last.date }
}

export default function AlquilerCalculator({ indices }: Props) {
  const [monto, setMonto] = useState('')
  const [selectedIndex, setSelectedIndex] = useState<IndexKey>('ICL')
  const [fromMonth, setFromMonth] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 6)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [visibleLines, setVisibleLines] = useState<Set<IndexKey>>(() => new Set<IndexKey>(['ICL', 'IPC', 'CAC']))

  // Stats cards
  const stats = (['ICL', 'IPC', 'CAC', 'UVA'] as IndexKey[]).map(key => {
    const change = getLatestChange(indices[key])
    return { key, ...INDEX_META[key], change }
  })

  // Calculator result
  const result = useMemo(() => {
    const amount = parseFloat(monto)
    if (!amount || amount <= 0) return null
    const data = indices[selectedIndex]
    if (data.length < 2) return null

    const fromEntry = data.find(d => d.date.startsWith(fromMonth))
    const lastEntry = data[data.length - 1]
    if (!fromEntry || !lastEntry) return null

    const ratio = lastEntry.value / fromEntry.value
    const newAmount = Math.round(amount * ratio)
    const diff = newAmount - amount
    const pct = ((ratio - 1) * 100)

    // Next adjustment: 6 months for ICL, 3 months for others
    const periodMonths = selectedIndex === 'ICL' ? 6 : 3
    const fromDate = new Date(fromMonth + '-01')
    fromDate.setMonth(fromDate.getMonth() + periodMonths)
    const nextAdj = `${MONTHS[fromDate.getMonth()]} ${fromDate.getFullYear()}`

    return { newAmount, diff, pct, nextAdj }
  }, [monto, selectedIndex, fromMonth, indices])

  // Chart data: rebase all to 100
  const chartData = useMemo(() => {
    const allKeys = Object.keys(indices) as IndexKey[]
    const bases: Partial<Record<IndexKey, number>> = {}
    for (const k of allKeys) {
      if (indices[k].length > 0) bases[k] = indices[k][0].value
    }

    // Use ICL dates as reference (longest series typically)
    const refKey = allKeys.reduce((a, b) => indices[a].length >= indices[b].length ? a : b)
    const refData = indices[refKey]

    return refData.map(d => {
      const month = d.date.slice(0, 7)
      const point: Record<string, string | number | null> = { label: formatMonth(d.date) }
      for (const k of allKeys) {
        const entry = indices[k].find(e => e.date.startsWith(month))
        const base = bases[k]
        point[k] = entry && base ? Math.round((entry.value / base) * 1000) / 10 : null
      }
      return point
    })
  }, [indices])

  const toggleLine = (key: IndexKey) => {
    setVisibleLines(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Generate month options for selector
  const monthOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = []
    const now = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      if (d.getFullYear() < 2024) break
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      opts.push({ value: val, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` })
    }
    return opts
  }, [])

  return (
    <div className="space-y-8">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{s.label}</p>
            </div>
            {s.change ? (
              <>
                <p className="text-xl font-bold text-gray-900 font-numeric">{s.change.pct >= 0 ? '+' : ''}{s.change.pct.toFixed(1)}%</p>
                <p className="text-[10px] text-gray-400">{formatMonth(s.change.date)}</p>
              </>
            ) : <p className="text-gray-300 text-sm">—</p>}
          </div>
        ))}
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>
          Calculá tu ajuste de alquiler
        </h2>
        <p className="text-sm text-gray-400 mb-6">Usá el índice oficial según tu contrato</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Monto */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Alquiler actual</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
              <input
                type="number"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                placeholder="350.000"
                className="w-full border-0 bg-gray-50 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-gray-900 font-numeric focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Último ajuste</label>
            <select
              value={fromMonth}
              onChange={e => setFromMonth(e.target.value)}
              className="w-full border-0 bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/20 focus:bg-white transition-all"
            >
              {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Index pills */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Índice</label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(INDEX_META) as IndexKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => setSelectedIndex(key)}
                  className="px-3 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: selectedIndex === key ? INDEX_META[key].color : '#f3f4f6',
                    color: selectedIndex === key ? 'white' : '#6b7280',
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">Nuevo alquiler</p>
                <p className="text-3xl font-bold text-[#1A5C38] font-numeric">${result.newAmount.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Aumento</p>
                <p className="text-lg font-semibold text-gray-600 font-numeric">
                  ${result.diff.toLocaleString('es-AR')} <span className="text-sm">({result.pct >= 0 ? '+' : ''}{result.pct.toFixed(1)}%)</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Próximo ajuste</p>
                <p className="text-lg font-semibold text-gray-600">{result.nextAdj}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Index evolution chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Evolución de índices — Base 100
          </h2>
          <span className="text-[10px] font-medium text-gray-300 bg-gray-50 px-2 py-0.5 rounded">BCRA / INDEC</span>
        </div>
        <p className="text-sm text-gray-400 mb-4">Desde enero 2024</p>

        {/* Toggle pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(INDEX_META) as IndexKey[]).map(key => {
            const active = visibleLines.has(key)
            return (
              <button
                key={key}
                onClick={() => toggleLine(key)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all border"
                style={{
                  background: active ? INDEX_META[key].color : 'transparent',
                  color: active ? 'white' : INDEX_META[key].color,
                  borderColor: INDEX_META[key].color,
                  opacity: active ? 1 : 0.5,
                }}
              >
                {INDEX_META[key].label}
              </button>
            )
          })}
        </div>

        {chartData.length > 0 && (
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                  formatter={(value, name) => [
                    value != null ? `${Number(value).toFixed(1)}` : '—',
                    INDEX_META[name as IndexKey]?.label || name,
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(value: string) => INDEX_META[value as IndexKey]?.label || value}
                />
                {(Object.keys(INDEX_META) as IndexKey[]).map(key => (
                  visibleLines.has(key) && (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={INDEX_META[key].color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3, fill: INDEX_META[key].color }}
                      connectNulls
                    />
                  )
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <p className="text-[10px] text-gray-300 mt-4 text-center">
          Fuente: BCRA, INDEC — Datos orientativos, actualizados cada hora
        </p>
      </div>
    </div>
  )
}
