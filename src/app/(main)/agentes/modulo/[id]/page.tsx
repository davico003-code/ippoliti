'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Material {
  name: string
  type: string
  updated?: boolean
}

const MODULES: Record<string, { title: string; accent: string; image: string; materials: Material[] }> = {
  contratos: {
    title: 'Contratos y modelos',
    accent: '#1A5C38',
    image: 'https://images.pexels.com/photos/7843979/pexels-photo-7843979.jpeg?auto=compress&cs=tinysrgb&w=800',
    materials: [
      { name: 'Modelo boleto de compraventa', type: 'Contrato' },
      { name: 'Contrato alquiler vivienda', type: 'Contrato', updated: true },
      { name: 'Autorización de venta exclusiva', type: 'Documento' },
      { name: 'Reserva de propiedad', type: 'Documento' },
    ],
  },
  mercado: {
    title: 'Análisis de mercado',
    accent: '#185FA5',
    image: 'https://images.pexels.com/photos/7681091/pexels-photo-7681091.jpeg?auto=compress&cs=tinysrgb&w=800',
    materials: [
      { name: 'Reporte Funes Q1 2026', type: 'Reporte', updated: true },
      { name: 'Comparativa CAC vs dólar', type: 'Análisis' },
      { name: 'Evolución precios Roldán', type: 'Reporte' },
    ],
  },
  guias: {
    title: 'Guías para asesores',
    accent: '#854F0B',
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
    materials: [
      { name: 'Guía primera entrevista', type: 'Guía' },
      { name: 'Manual seguimiento clientes', type: 'Manual', updated: true },
      { name: 'Proceso de tasación', type: 'Guía' },
      { name: 'Checklist de cierre', type: 'Checklist' },
      { name: 'Manejo de objeciones', type: 'Guía' },
    ],
  },
  capacitacion: {
    title: 'Capacitación',
    accent: '#533AB7',
    image: 'https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=800',
    materials: [
      { name: 'Plan 20 horas', type: 'Plan', updated: true },
      { name: 'Evaluación módulo 1', type: 'Evaluación' },
    ],
  },
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Contrato:   { bg: '#1A5C38/10', text: '#1A5C38' },
  Documento:  { bg: '#185FA5/10', text: '#185FA5' },
  Reporte:    { bg: '#854F0B/10', text: '#854F0B' },
  Análisis:   { bg: '#533AB7/10', text: '#533AB7' },
  Guía:       { bg: '#854F0B/10', text: '#854F0B' },
  Manual:     { bg: '#185FA5/10', text: '#185FA5' },
  Checklist:  { bg: '#1A5C38/10', text: '#1A5C38' },
  Plan:       { bg: '#533AB7/10', text: '#533AB7' },
  Evaluación: { bg: '#FF9500/15', text: '#CC7700' },
}

export default function ModuloPage() {
  const params = useParams()
  const id = params.id as string
  const mod = MODULES[id]

  if (!mod) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-[#6E6E73]">Módulo no encontrado</p>
        <Link href="/agentes" className="text-[#1A5C38] font-semibold text-sm mt-4 inline-block">&larr; Volver al inicio</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <style>{`
        @keyframes up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        .anim-up { animation: up 0.5s ease both; }
      `}</style>

      {/* Back */}
      <Link
        href="/agentes"
        className="inline-flex items-center gap-1.5 text-sm text-[#6E6E73] hover:text-[#1C1C1E] transition-colors bg-[#F2F2F7] px-3 py-1.5 rounded-lg"
      >
        &larr; Volver
      </Link>

      {/* Cover */}
      <div className="relative h-[200px] rounded-3xl overflow-hidden anim-up">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mod.image} alt={mod.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${mod.accent}ee 0%, ${mod.accent}55 50%, transparent 100%)` }} />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Raleway, sans-serif' }}>
            {mod.title}
          </h1>
          <p className="text-white/60 text-sm mt-1">{mod.materials.length} materiales</p>
        </div>
      </div>

      {/* Materials list */}
      <div className="bg-white rounded-[20px] overflow-hidden anim-up" style={{ animationDelay: '0.1s' }}>
        {mod.materials.map((mat, i) => {
          const typeStyle = TYPE_COLORS[mat.type] || { bg: '#6E6E73/10', text: '#6E6E73' }
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-[14px]"
              style={{ borderBottom: i < mod.materials.length - 1 ? '0.5px solid rgba(60,60,67,0.12)' : 'none' }}
            >
              <div
                className="w-[38px] h-[38px] rounded-xl flex items-center justify-center text-sm shrink-0"
                style={{ background: `${mod.accent}12` }}
              >
                {mod.title.startsWith('Contrato') ? '📋' : mod.title.startsWith('Análisis') ? '📊' : mod.title.startsWith('Guía') ? '🧭' : '🎓'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#1C1C1E] truncate">{mat.name}</span>
                  {mat.updated && (
                    <span className="text-[9px] font-bold bg-[#FF9500]/15 text-[#FF9500] px-1.5 py-0.5 rounded-full uppercase shrink-0">
                      Actualizado
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] font-semibold mt-0.5 inline-block px-1.5 py-0.5 rounded"
                  style={{ background: `${typeStyle.bg.replace('/10', '')}18`, color: typeStyle.text }}
                >
                  {mat.type}
                </span>
              </div>
              <button
                className="text-[12px] font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
                style={{ background: `${mod.accent}12`, color: mod.accent }}
              >
                ↓ Descargar
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
