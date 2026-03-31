'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, FileText, BarChart3, Users, BookOpen } from 'lucide-react'

const MODULES = [
  { title: 'Contratos y modelos', icon: FileText, color: '#1A5C38',
    image: 'https://images.pexels.com/photos/7843979/pexels-photo-7843979.jpeg?auto=compress&cs=tinysrgb&w=800', badge: false },
  { title: 'Análisis de mercado', icon: BarChart3, color: '#2563eb',
    image: 'https://images.pexels.com/photos/7681091/pexels-photo-7681091.jpeg?auto=compress&cs=tinysrgb&w=800', badge: true },
  { title: 'Guías para asesores', icon: Users, color: '#ea580c',
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800', badge: false },
  { title: 'Capacitación', icon: BookOpen, color: '#7c3aed',
    image: 'https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=800', badge: true },
]

interface Props {
  agentId: string
  agentName: string
  agentRole: 'admin' | 'agent'
}

export default function AgentDashboard({ agentName, agentRole }: Props) {
  const [seleccionCount, setSeleccionCount] = useState(0)
  const [vencenPronto, setVencenPronto] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/seleccion')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return
        const activas = data.filter((s: { expiresAt: string }) => new Date(s.expiresAt) > new Date())
        setSeleccionCount(activas.length)
        setVencenPronto(activas.filter((s: { expiresAt: string }) => {
          const d = Math.ceil((new Date(s.expiresAt).getTime() - Date.now()) / 86400000)
          return d <= 2
        }).length)
      })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/agentes/logout', { method: 'POST' })
    router.push('/agentes/login')
    router.refresh()
  }

  const firstName = agentName.split(' ')[0]

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero */}
      <div className="bg-[#1A5C38] px-4 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">SI</span>
              </div>
              <div>
                <span className="text-white font-bold block text-sm">SI School</span>
                <span className="text-white/40 text-xs">{agentRole === 'admin' ? 'Admin' : 'Agente'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-sm hidden sm:block">{agentName}</span>
              <button onClick={handleLogout} className="text-white/40 hover:text-white transition-colors" title="Salir">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Hola, {firstName} 👋
          </h1>
          <p className="text-white/60 mb-8">Recursos, capacitación y herramientas</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Módulos', value: '4' },
              { label: 'Recursos', value: '15' },
              { label: 'Selecciones', value: String(seleccionCount) },
              { label: 'Progreso', value: '100%' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                <span className="text-2xl font-bold text-white font-numeric block">{s.value}</span>
                <span className="text-xs text-white/50">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Selecciones card */}
        <Link href="/agentes/seleccion" className="block group">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#1A5C38]/20 hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1A5C38]/7 rounded-xl flex items-center justify-center text-xl">
                🔗
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Selecciones activas</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {seleccionCount} activa{seleccionCount !== 1 ? 's' : ''}
                  </span>
                  {vencenPronto > 0 && (
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                      {vencenPronto} vence{vencenPronto !== 1 ? 'n' : ''} pronto
                    </span>
                  )}
                </div>
              </div>
            </div>
            <span className="text-gray-300 group-hover:text-[#1A5C38] transition-colors text-xl">&rarr;</span>
          </div>
        </Link>

        {/* Modules grid */}
        <h2 className="text-lg font-bold text-gray-900 pt-2">Módulos de capacitación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MODULES.map(mod => (
            <Link key={mod.title} href="/school" className="group block">
              <div className="relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mod.image} alt={mod.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${mod.color}dd 0%, ${mod.color}88 100%)` }} />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  {mod.badge && (
                    <span className="absolute top-4 right-4 text-[9px] font-bold bg-white text-gray-900 px-2 py-0.5 rounded-full uppercase">Nuevo</span>
                  )}
                  <mod.icon className="w-6 h-6 text-white/70 mb-2" />
                  <h3 className="text-lg font-bold text-white">{mod.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
