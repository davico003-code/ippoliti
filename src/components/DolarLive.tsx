'use client'

import { useState, useEffect } from 'react'

interface DolarData {
  compra: number
  venta: number
  fechaActualizacion: string
}

export default function DolarLive() {
  const [blue, setBlue] = useState<DolarData | null>(null)
  const [oficial, setOficial] = useState<DolarData | null>(null)

  useEffect(() => {
    const fetchDolar = async () => {
      try {
        const [b, o] = await Promise.all([
          fetch('https://dolarapi.com/v1/dolares/blue').then(r => r.json()),
          fetch('https://dolarapi.com/v1/dolares/oficial').then(r => r.json()),
        ])
        setBlue(b)
        setOficial(o)
      } catch {}
    }
    fetchDolar()
    const interval = setInterval(fetchDolar, 300000) // 5 min
    return () => clearInterval(interval)
  }, [])

  const brecha = blue && oficial ? ((blue.venta - oficial.venta) / oficial.venta * 100) : null
  const lastUpdated = blue?.fechaActualizacion
    ? new Date(blue.fechaActualizacion).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Dólar Blue</p>
          <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">EN VIVO</span>
        </div>
        {blue ? (
          <div className="flex items-baseline gap-6">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Compra</p>
              <p className="text-3xl font-bold text-[#1A5C38] font-numeric">${blue.compra.toLocaleString('es-AR')}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Venta</p>
              <p className="text-3xl font-bold text-[#1A5C38] font-numeric">${blue.venta.toLocaleString('es-AR')}</p>
            </div>
          </div>
        ) : <div className="h-12 bg-gray-50 rounded-lg animate-pulse" />}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Dólar Oficial</p>
          <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">EN VIVO</span>
        </div>
        {oficial ? (
          <div className="flex items-baseline gap-6">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Compra</p>
              <p className="text-3xl font-bold text-gray-900 font-numeric">${oficial.compra.toLocaleString('es-AR')}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Venta</p>
              <p className="text-3xl font-bold text-gray-900 font-numeric">${oficial.venta.toLocaleString('es-AR')}</p>
            </div>
          </div>
        ) : <div className="h-12 bg-gray-50 rounded-lg animate-pulse" />}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Brecha Blue vs Oficial</p>
        {brecha !== null ? (
          <p className={`text-5xl font-black font-numeric ${brecha < 20 ? 'text-green-600' : brecha < 50 ? 'text-amber-500' : 'text-red-500'}`}>
            {brecha.toFixed(1)}%
          </p>
        ) : <div className="h-12 w-24 bg-gray-50 rounded-lg animate-pulse" />}
      </div>

      {lastUpdated && (
        <p className="col-span-full text-[10px] text-gray-300 text-right">
          Fuente: dolarapi.com · Actualizado {lastUpdated} · Se refresca cada 5 min
        </p>
      )}
    </div>
  )
}
