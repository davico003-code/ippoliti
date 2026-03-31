'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const MODULES = [
  { id: 'contratos', title: 'Contratos y modelos', accent: '#1A5C38', count: 4, badge: false,
    image: 'https://images.pexels.com/photos/7843979/pexels-photo-7843979.jpeg?auto=compress&cs=tinysrgb&w=800',
    desc: 'Boletos, alquileres, autorizaciones' },
  { id: 'mercado', title: 'Análisis de mercado', accent: '#185FA5', count: 3, badge: true,
    image: 'https://images.pexels.com/photos/7681091/pexels-photo-7681091.jpeg?auto=compress&cs=tinysrgb&w=800',
    desc: 'Reportes, precios, tendencias' },
  { id: 'guias', title: 'Guías para asesores', accent: '#854F0B', count: 5, badge: false,
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
    desc: 'Entrevistas, tasaciones, cierre' },
  { id: 'capacitacion', title: 'Capacitación', accent: '#533AB7', count: 2, badge: true,
    image: 'https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=800',
    desc: 'Plan de formación, evaluaciones' },
]

interface Props {
  agentId: string
  agentName: string
  agentRole: 'admin' | 'agent'
}

export default function AgentDashboard({ agentName }: Props) {
  const [selCount, setSelCount] = useState(0)
  const [vencenPronto, setVencenPronto] = useState(0)

  useEffect(() => {
    fetch('/api/seleccion')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return
        const activas = data.filter((s: { expiresAt: string }) => new Date(s.expiresAt) > new Date())
        setSelCount(activas.length)
        setVencenPronto(activas.filter((s: { expiresAt: string }) => {
          const d = Math.ceil((new Date(s.expiresAt).getTime() - Date.now()) / 86400000)
          return d <= 2
        }).length)
      })
      .catch(() => {})
  }, [])

  const firstName = agentName.split(' ')[0]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <style>{`
        @keyframes up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .anim-up { animation: up 0.5s ease both; }
        .anim-d1 { animation-delay: 0.05s; }
        .anim-d2 { animation-delay: 0.10s; }
        .anim-d3 { animation-delay: 0.15s; }
        .anim-d4 { animation-delay: 0.20s; }
        .anim-d5 { animation-delay: 0.25s; }
      `}</style>

      {/* Hero banner */}
      <div
        className="rounded-3xl p-6 md:p-8 text-white anim-up overflow-hidden relative"
        style={{
          background: `radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 60%), #1A5C38`,
        }}
      >
        <p className="text-[13px] mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Bienvenido de nuevo</p>
        <h1 className="text-[32px] font-extrabold mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
          Hola, {firstName} 👋
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Materiales', value: '14' },
            { label: 'Módulos', value: '4' },
            { label: 'Nuevos', value: '3' },
            { label: 'Actualizado', value: 'Mar 2026' },
          ].map(s => (
            <div key={s.label} className="rounded-[14px] p-3 text-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <span className="text-xl font-bold font-numeric block">{s.value}</span>
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Progreso del equipo</span>
            <span className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>100%</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div className="h-full bg-white rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Selecciones card */}
      <Link href="/agentes/seleccion" className="block group anim-up anim-d1">
        <div
          className="bg-white rounded-[20px] p-[18px_20px] flex items-center gap-4 transition-transform duration-150 group-hover:-translate-y-0.5"
          style={{ border: '1.5px solid #1A5C38' }}
        >
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-xl shrink-0" style={{ background: 'rgba(26,92,56,0.07)' }}>
            🔗
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[16px] text-[#1C1C1E]" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Selecciones activas
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[11px] font-semibold bg-[#1A5C38]/10 text-[#1A5C38] px-2 py-0.5 rounded-full">
                {selCount} activa{selCount !== 1 ? 's' : ''}
              </span>
              {vencenPronto > 0 && (
                <span className="text-[11px] font-semibold bg-[#FF9500]/15 text-[#FF9500] px-2 py-0.5 rounded-full">
                  {vencenPronto} vence{vencenPronto !== 1 ? 'n' : ''} pronto
                </span>
              )}
            </div>
            <p className="text-[12px] text-[#6E6E73] mt-1">
              Microlanding personalizada por cliente · Reacciones en tiempo real
            </p>
          </div>
          <span className="text-[#6E6E73] group-hover:text-[#1A5C38] transition-colors text-xl shrink-0">&rarr;</span>
        </div>
      </Link>

      {/* Modules */}
      <div className="anim-up anim-d2">
        <p className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-[0.08em] mb-3 px-1">
          Módulos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MODULES.map((mod, i) => (
            <Link
              key={mod.id}
              href={`/agentes/modulo/${mod.id}`}
              className={`group block anim-up anim-d${i + 2}`}
            >
              <div
                className="bg-white rounded-[20px] overflow-hidden transition-all duration-200 group-hover:-translate-y-[3px] group-hover:shadow-lg"
                style={{ border: '0.5px solid rgba(60,60,67,0.12)' }}
              >
                {/* Cover */}
                <div className="relative h-[130px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mod.image} alt={mod.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${mod.accent}ee 0%, ${mod.accent}44 50%, transparent 100%)` }} />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-[14px] font-bold text-white" style={{ fontFamily: 'Raleway, sans-serif' }}>
                      {mod.title}
                    </h3>
                  </div>
                  {mod.badge && (
                    <span className="absolute top-3 right-3 text-[9px] font-bold bg-[#FF9500] text-white px-2 py-0.5 rounded-full uppercase">
                      Nuevo
                    </span>
                  )}
                </div>
                {/* Footer */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-[12px] text-[#6E6E73]">{mod.desc}</span>
                  <span className="text-[11px] font-semibold text-[#6E6E73]">{mod.count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
