'use client'

import { useState, useEffect } from 'react'
import { Lock, LogOut, FileText, BarChart3, Users, BookOpen, LinkIcon } from 'lucide-react'
import Link from 'next/link'

const USERNAME = 'user'
const PASSWORD = 'inmobiliaria123'
const STORAGE_KEY = 'si-school-auth'

const MODULES = [
  {
    title: 'Contratos y modelos',
    icon: FileText,
    color: '#1A5C38',
    image: 'https://images.pexels.com/photos/7843979/pexels-photo-7843979.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: false,
    href: '/school',
  },
  {
    title: 'Análisis de mercado',
    icon: BarChart3,
    color: '#2563eb',
    image: 'https://images.pexels.com/photos/7681091/pexels-photo-7681091.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: true,
    href: '/school',
  },
  {
    title: 'Guías para asesores',
    icon: Users,
    color: '#ea580c',
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: false,
    href: '/school',
  },
  {
    title: 'Capacitación',
    icon: BookOpen,
    color: '#7c3aed',
    image: 'https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: true,
    href: '/school',
  },
]

export default function AgentesPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(true)
  const [seleccionCount, setSeleccionCount] = useState(0)

  useEffect(() => {
    try { if (localStorage.getItem(STORAGE_KEY) === '1') setAuthenticated(true) } catch {}
    setChecking(false)
  }, [])

  useEffect(() => {
    if (!authenticated) return
    fetch('/api/seleccion?agent=all')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSeleccionCount(data.filter((s: { expiresAt: string }) => new Date(s.expiresAt) > new Date()).length) })
      .catch(() => {})
  }, [authenticated])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (username === USERNAME && password === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, '1')
      setAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY)
    setAuthenticated(false)
  }

  if (checking) return <div className="min-h-screen bg-[#fafafa]" />

  // ── Login ──
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-sm">
          <div className="w-14 h-14 bg-[#1A5C38] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-center text-gray-900 mb-1">SI School</h1>
          <p className="text-sm text-gray-400 text-center mb-6">Panel interno de agentes</p>

          <input placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3 outline-none focus:border-[#1A5C38]" />
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-4 outline-none focus:border-[#1A5C38]" />

          {error && <p className="text-red-500 text-xs mb-3 text-center">Credenciales incorrectas</p>}

          <button type="submit" className="w-full py-3 bg-[#1A5C38] text-white font-bold rounded-xl text-sm hover:bg-[#0F3A23] transition-colors">
            Ingresar
          </button>
        </form>
      </div>
    )
  }

  // ── Dashboard ──
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero banner */}
      <div className="bg-[#1A5C38] px-4 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">SI</span>
              </div>
              <span className="text-white font-bold">SI School</span>
            </div>
            <button onClick={handleLogout} className="text-white/50 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Panel de agentes</h1>
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
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Selecciones card */}
        <Link href="/agentes/seleccion" className="block group">
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-l-[#1A5C38] hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#e8f5ee] rounded-xl flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-[#1A5C38]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Selecciones</h3>
                <p className="text-xs text-gray-400">
                  {seleccionCount} activa{seleccionCount !== 1 ? 's' : ''} · Crear y gestionar selecciones para clientes
                </p>
              </div>
            </div>
            <span className="text-gray-300 group-hover:text-[#1A5C38] transition-colors text-xl">&rarr;</span>
          </div>
        </Link>

        {/* Modules grid */}
        <h2 className="text-lg font-bold text-gray-900 pt-2">Módulos de capacitación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MODULES.map(mod => (
            <Link key={mod.title} href={mod.href} className="group block">
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
