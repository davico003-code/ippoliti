'use client'

import { useState, useEffect, useRef } from 'react'
import { Lock, LogOut, FileText, Download, BookOpen, BarChart3, Users, GraduationCap, ChevronDown, Sparkles, Clock, FolderOpen } from 'lucide-react'

const USERNAME = 'user'
const PASSWORD = 'inmobiliaria123'
const STORAGE_KEY = 'si-school-auth'

interface Resource {
  title: string
  description: string
  url: string
  badge?: 'nuevo' | 'actualizado'
}

interface Module {
  title: string
  icon: typeof FileText
  color: string
  resources: Resource[]
}

const MODULES: Module[] = [
  {
    title: 'Contratos y modelos',
    icon: FileText,
    color: '#1A5C38',
    resources: [
      { title: 'Modelo de boleto de compraventa', description: 'Contrato est\u00e1ndar para operaciones de venta de inmuebles.', url: '#' },
      { title: 'Contrato de alquiler vivienda', description: 'Modelo actualizado seg\u00fan ley de alquileres vigente.', url: '#', badge: 'actualizado' },
      { title: 'Autorizaci\u00f3n de venta exclusiva', description: 'Documento de autorizaci\u00f3n para comercializar propiedades.', url: '#' },
      { title: 'Reserva de propiedad', description: 'Modelo de reserva con condiciones y plazos.', url: '#' },
    ],
  },
  {
    title: 'An\u00e1lisis de mercado',
    icon: BarChart3,
    color: '#2563eb',
    resources: [
      { title: 'Informe trimestral Rold\u00e1n Q1 2026', description: 'An\u00e1lisis de precios, oferta y demanda en Rold\u00e1n.', url: '#', badge: 'nuevo' },
      { title: 'Informe trimestral Funes Q1 2026', description: 'Tendencias del mercado inmobiliario en Funes.', url: '#', badge: 'nuevo' },
      { title: 'Comparativa precios por m\u00b2 zona oeste', description: 'Relevamiento de valores por barrio y tipolog\u00eda.', url: '#' },
    ],
  },
  {
    title: 'Gu\u00edas para asesores',
    icon: Users,
    color: '#ea580c',
    resources: [
      { title: 'Manual del asesor inmobiliario', description: 'Gu\u00eda completa de procesos, atenci\u00f3n al cliente y cierre.', url: '#' },
      { title: 'Gu\u00eda de tasaci\u00f3n residencial', description: 'Metodolog\u00eda y criterios para tasar propiedades.', url: '#' },
      { title: 'Protocolo de visitas y seguridad', description: 'Procedimientos para mostrar propiedades de forma segura.', url: '#', badge: 'actualizado' },
      { title: 'Check-list de documentaci\u00f3n', description: 'Documentos necesarios para cada tipo de operaci\u00f3n.', url: '#' },
    ],
  },
  {
    title: 'Materiales de capacitaci\u00f3n',
    icon: BookOpen,
    color: '#7c3aed',
    resources: [
      { title: 'Marketing digital inmobiliario', description: 'Estrategias de redes sociales, fotos y publicaciones.', url: '#', badge: 'nuevo' },
      { title: 'T\u00e9cnicas de negociaci\u00f3n', description: 'Herramientas y t\u00e1cticas para cerrar operaciones.', url: '#' },
      { title: 'Aspectos legales 2026', description: 'Actualizaci\u00f3n normativa: escrituras, impuestos, regulaciones.', url: '#', badge: 'actualizado' },
    ],
  },
]

const TOTAL_MATERIALS = MODULES.reduce((sum, m) => sum + m.resources.length, 0)

export default function SchoolPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(true)
  const [openModules, setOpenModules] = useState<Set<number>>(new Set([0]))
  const [mounted, setMounted] = useState(false)
  const moduleRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') setAuthenticated(true)
    setChecking(false)
    setTimeout(() => setMounted(true), 100)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === USERNAME && password === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true')
      setAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setAuthenticated(false)
    setUsername('')
    setPassword('')
  }

  const toggleModule = (idx: number) => {
    setOpenModules(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const scrollToModule = (idx: number) => {
    if (!openModules.has(idx)) {
      setOpenModules(prev => new Set(prev).add(idx))
    }
    setTimeout(() => {
      moduleRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1A5C38] rounded-full animate-spin" />
      </div>
    )
  }

  // ─── Login ───
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0d2e1a] to-gray-900 flex flex-col items-center justify-center px-4">
        <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 bg-[#1A5C38] rounded-2xl flex items-center justify-center shadow-lg shadow-[#1A5C38]/30">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white font-poppins">SI School</h1>
            <p className="text-white/40 text-sm mt-2 font-poppins">Capacitaci&oacute;n inmobiliaria para profesionales</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider font-poppins">Usuario</label>
                <input id="username" type="text" value={username}
                  onChange={e => { setUsername(e.target.value); setError(false) }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38] focus:border-transparent ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  autoFocus />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider font-poppins">Contrase&ntilde;a</label>
                <input id="password" type="password" value={password}
                  onChange={e => { setPassword(e.target.value); setError(false) }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38] focus:border-transparent ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
                {error && <p className="text-red-500 text-xs mt-1.5 font-medium">Credenciales incorrectas</p>}
              </div>
              <button type="submit" className="w-full py-3.5 bg-[#1A5C38] text-white rounded-xl font-bold text-sm hover:bg-[#15472c] transition-colors font-poppins flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Ingresar a SI School
              </button>
            </form>
          </div>
          <p className="text-white/20 text-xs text-center mt-6 font-poppins">SI Inmobiliaria &middot; Desde 1983</p>
        </div>
      </div>
    )
  }

  // ─── Dashboard ───
  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1A5C38] rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-black text-gray-900 font-poppins">SI School</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors font-poppins">
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className={`bg-gradient-to-r from-[#1A5C38] to-[#2d8a5e] rounded-2xl p-8 md:p-10 mb-8 text-white transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-white/60 text-sm font-poppins mb-1">Bienvenido de nuevo</p>
          <h1 className="text-2xl md:text-3xl font-black font-poppins mb-6">Hola, {USERNAME}</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <FolderOpen className="w-4 h-4 text-white/60" />
                <span className="text-xs text-white/60 font-poppins">Materiales</span>
              </div>
              <p className="text-2xl font-black font-numeric">{TOTAL_MATERIALS}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-white/60" />
                <span className="text-xs text-white/60 font-poppins">M&oacute;dulos</span>
              </div>
              <p className="text-2xl font-black font-numeric">{MODULES.length}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-white/60" />
                <span className="text-xs text-white/60 font-poppins">Nuevos</span>
              </div>
              <p className="text-2xl font-black font-numeric">
                {MODULES.reduce((s, m) => s + m.resources.filter(r => r.badge === 'nuevo').length, 0)}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-xs text-white/60 font-poppins">Actualizado</span>
              </div>
              <p className="text-lg font-bold font-poppins">Mar 2026</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-white/50 mb-2 font-poppins">
              <span>Progreso de la plataforma</span>
              <span>{TOTAL_MATERIALS} materiales cargados</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/40 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-20">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-poppins">M&oacute;dulos</p>
              <nav className="space-y-1">
                {MODULES.map((mod, idx) => {
                  const Icon = mod.icon
                  return (
                    <button key={idx} onClick={() => scrollToModule(idx)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900 font-poppins">
                      <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${mod.color}15` }}>
                        <Icon size={14} color={mod.color} />
                      </div>
                      <span className="truncate">{mod.title}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-5">
            {MODULES.map((mod, modIdx) => {
              const Icon = mod.icon
              const isOpen = openModules.has(modIdx)
              const num = String(modIdx + 1).padStart(2, '0')

              return (
                <div key={modIdx} ref={el => { moduleRefs.current[modIdx] = el }}
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{ transitionDelay: `${modIdx * 100}ms` }}>
                  {/* Module header */}
                  <button onClick={() => toggleModule(modIdx)}
                    className="w-full flex items-center gap-4 p-5 md:p-6 text-left hover:bg-gray-50/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${mod.color}12` }}>
                      <span className="text-lg font-black font-poppins" style={{ color: mod.color }}>{num}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={16} color={mod.color} />
                        <h2 className="text-base font-bold text-gray-900 font-poppins truncate">{mod.title}</h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-poppins">{mod.resources.length} materiales</span>
                        {/* Mini progress */}
                        <div className="flex-1 max-w-[120px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: '100%', background: mod.color }} />
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Module content */}
                  {isOpen && (
                    <div className="border-t border-gray-100 p-4 md:p-6 pt-4 space-y-3">
                      {mod.resources.map((res, resIdx) => {
                        const lessonNum = String(resIdx + 1).padStart(2, '0')
                        return (
                          <div key={resIdx}
                            className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
                            {/* Lesson number */}
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-50 group-hover:bg-gray-100 transition-colors">
                              <span className="text-sm font-black text-gray-300 font-poppins">{lessonNum}</span>
                            </div>
                            {/* Icon */}
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: `${mod.color}10` }}>
                              <FileText size={18} color={mod.color} />
                            </div>
                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-gray-900 truncate font-poppins">{res.title}</h3>
                                {res.badge && (
                                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full tracking-wide flex-shrink-0 ${
                                    res.badge === 'nuevo'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {res.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{res.description}</p>
                            </div>
                            {/* Download */}
                            <a href={res.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0 font-poppins hover:scale-105"
                              style={{ background: `${mod.color}10`, color: mod.color }}
                              onMouseEnter={e => { e.currentTarget.style.background = mod.color; e.currentTarget.style.color = '#fff' }}
                              onMouseLeave={e => { e.currentTarget.style.background = `${mod.color}10`; e.currentTarget.style.color = mod.color }}>
                              <Download size={13} />
                              Descargar
                            </a>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </main>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400 font-poppins">SI Inmobiliaria &middot; Material de uso interno &middot; Desde 1983</p>
        </div>
      </div>
    </div>
  )
}
