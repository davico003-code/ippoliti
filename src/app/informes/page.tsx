import type { Metadata } from 'next'
import Link from 'next/link'
import { TrendingUp, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Informes del Mercado Inmobiliario | SI Inmobiliaria',
  description: 'Datos actualizados del mercado inmobiliario de Funes, Roldán y Rosario: índice CAC, valor del m² en USD, tendencias y análisis.',
}

const CAC_DATA = [
  { mes: 'Oct 2025', valor: 285400, variacion: 3.2 },
  { mes: 'Nov 2025', valor: 294800, variacion: 3.3 },
  { mes: 'Dic 2025', valor: 305100, variacion: 3.5 },
  { mes: 'Ene 2026', valor: 314700, variacion: 3.1 },
  { mes: 'Feb 2026', valor: 323900, variacion: 2.9 },
  { mes: 'Mar 2026', valor: 332500, variacion: 2.7 },
]

const M2_USD = [
  { zona: 'Funes - Barrio cerrado', lote: 130, casa: 1650 },
  { zona: 'Funes - Barrio abierto', lote: 85, casa: 1350 },
  { zona: 'Roldán - Barrio cerrado', lote: 80, casa: 1250 },
  { zona: 'Roldán - Barrio abierto', lote: 45, casa: 1050 },
  { zona: 'Fisherton', lote: 180, casa: 1800 },
  { zona: 'Rosario centro', lote: null, casa: 1500 },
]

const TENDENCIAS = [
  { indicador: 'Precio m² USD casas Funes', valor: '+8%', trend: 'up', periodo: 'interanual' },
  { indicador: 'Precio m² USD lotes Roldán', valor: '+12%', trend: 'up', periodo: 'interanual' },
  { indicador: 'Renta bruta alquiler', valor: '5.2%', trend: 'stable', periodo: 'anual en USD' },
  { indicador: 'Escrituras zona oeste', valor: '+22%', trend: 'up', periodo: 'vs año anterior' },
  { indicador: 'CAC en USD', valor: '-3%', trend: 'down', periodo: 'último trimestre' },
  { indicador: 'Créditos hipotecarios', valor: '+45%', trend: 'up', periodo: 'solicitudes vs 2024' },
]

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-500" />
  if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-500" />
  return <Minus className="w-4 h-4 text-gray-400" />
}

export default function InformesPage() {
  const maxCAC = Math.max(...CAC_DATA.map(d => d.valor))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1A5C38]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-white/80" />
            <h1 className="text-3xl md:text-4xl font-black text-white font-poppins">Informes del Mercado</h1>
          </div>
          <p className="text-white/60 text-lg max-w-2xl font-poppins">
            Datos actualizados del mercado inmobiliario de Funes, Rold&aacute;n y Rosario.
            An&aacute;lisis propio de SI Inmobiliaria basado en operaciones reales.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Tendencias rápidas */}
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-5 font-poppins flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1A5C38]" />
            Tendencias clave
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TENDENCIAS.map((t, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendIcon trend={t.trend} />
                  <span className={`text-2xl font-black font-numeric ${
                    t.trend === 'up' ? 'text-green-600' : t.trend === 'down' ? 'text-red-500' : 'text-gray-600'
                  }`}>{t.valor}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{t.indicador}</p>
                <p className="text-xs text-gray-400 mt-1">{t.periodo}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CAC table + chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 mb-1 font-poppins">&Iacute;ndice CAC &mdash; Costo de Construcci&oacute;n</h2>
          <p className="text-sm text-gray-400 mb-6">&Uacute;ltimos 6 meses &middot; Pesos por m&sup2; de construcci&oacute;n</p>

          {/* Simple bar chart */}
          <div className="flex items-end gap-2 h-40 mb-6">
            {CAC_DATA.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 font-numeric">{(d.valor / 1000).toFixed(0)}K</span>
                <div
                  className="w-full bg-[#1A5C38] rounded-t-md transition-all hover:bg-[#2d8a5e]"
                  style={{ height: `${(d.valor / maxCAC) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-gray-500 font-poppins">{d.mes.split(' ')[0]}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="text-left py-2 px-3 font-bold text-gray-600">Mes</th>
                  <th className="text-right py-2 px-3 font-bold text-gray-600">Valor $/m&sup2;</th>
                  <th className="text-right py-2 px-3 font-bold text-gray-600">Var. mensual</th>
                </tr>
              </thead>
              <tbody>
                {CAC_DATA.map((d, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 px-3 font-medium">{d.mes}</td>
                    <td className="py-2.5 px-3 text-right font-numeric font-semibold">${d.valor.toLocaleString('es-AR')}</td>
                    <td className="py-2.5 px-3 text-right font-numeric text-green-600">+{d.variacion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Valor m² USD */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 mb-1 font-poppins flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#1A5C38]" />
            Valor del m&sup2; en USD por zona
          </h2>
          <p className="text-sm text-gray-400 mb-6">Valores de referencia basados en operaciones recientes &middot; Marzo 2026</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="text-left py-2 px-3 font-bold text-gray-600">Zona</th>
                  <th className="text-right py-2 px-3 font-bold text-gray-600">Lote USD/m&sup2;</th>
                  <th className="text-right py-2 px-3 font-bold text-gray-600">Casa USD/m&sup2;</th>
                </tr>
              </thead>
              <tbody>
                {M2_USD.map((d, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 px-3 font-medium">{d.zona}</td>
                    <td className="py-2.5 px-3 text-right font-numeric font-semibold text-[#1A5C38]">
                      {d.lote ? `U$S ${d.lote}` : '\u2014'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-numeric font-semibold text-[#1A5C38]">
                      U$S {d.casa}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#1A5C38] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-black text-white mb-3 font-poppins">&iquest;Quer&eacute;s un an&aacute;lisis personalizado?</h2>
          <p className="text-white/60 mb-6 font-poppins">Solicit&aacute; una tasaci&oacute;n gratuita o consult&aacute; por inversiones en la zona.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/tasaciones" className="px-6 py-3 bg-white text-[#1A5C38] rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors font-poppins">
              Solicitar tasaci&oacute;n
            </Link>
            <Link href="/propiedades" className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors font-poppins border border-white/20">
              Ver propiedades
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
