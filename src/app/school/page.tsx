'use client'

import { useState, useEffect } from 'react'
import { Lock, LogOut, FileText, Download, BookOpen, BarChart3, Users, GraduationCap } from 'lucide-react'

const PASSWORD = 'sischool2024'
const STORAGE_KEY = 'si-school-auth'

interface Resource {
  title: string
  description: string
  url: string
}

interface Section {
  title: string
  icon: typeof FileText
  color: string
  resources: Resource[]
}

const SECTIONS: Section[] = [
  {
    title: 'Contratos y modelos',
    icon: FileText,
    color: '#1A5C38',
    resources: [
      { title: 'Modelo de boleto de compraventa', description: 'Contrato estándar para operaciones de venta de inmuebles.', url: '#' },
      { title: 'Contrato de alquiler vivienda', description: 'Modelo actualizado según ley de alquileres vigente.', url: '#' },
      { title: 'Autorización de venta exclusiva', description: 'Documento de autorización para comercializar propiedades.', url: '#' },
      { title: 'Reserva de propiedad', description: 'Modelo de reserva con condiciones y plazos.', url: '#' },
    ],
  },
  {
    title: 'Análisis de mercado',
    icon: BarChart3,
    color: '#2563eb',
    resources: [
      { title: 'Informe trimestral Roldán Q1 2026', description: 'Análisis de precios, oferta y demanda en Roldán.', url: '#' },
      { title: 'Informe trimestral Funes Q1 2026', description: 'Tendencias del mercado inmobiliario en Funes.', url: '#' },
      { title: 'Comparativa precios por m² zona oeste', description: 'Relevamiento de valores por barrio y tipología.', url: '#' },
    ],
  },
  {
    title: 'Guías para asesores',
    icon: Users,
    color: '#ea580c',
    resources: [
      { title: 'Manual del asesor inmobiliario', description: 'Guía completa de procesos, atención al cliente y cierre.', url: '#' },
      { title: 'Guía de tasación residencial', description: 'Metodología y criterios para tasar propiedades.', url: '#' },
      { title: 'Protocolo de visitas y seguridad', description: 'Procedimientos para mostrar propiedades de forma segura.', url: '#' },
      { title: 'Check-list de documentación', description: 'Documentos necesarios para cada tipo de operación.', url: '#' },
    ],
  },
  {
    title: 'Materiales de capacitación',
    icon: BookOpen,
    color: '#7c3aed',
    resources: [
      { title: 'Marketing digital inmobiliario', description: 'Estrategias de redes sociales, fotos y publicaciones.', url: '#' },
      { title: 'Técnicas de negociación', description: 'Herramientas y tácticas para cerrar operaciones.', url: '#' },
      { title: 'Aspectos legales 2026', description: 'Actualización normativa: escrituras, impuestos, regulaciones.', url: '#' },
    ],
  },
]

export default function SchoolPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') setAuthenticated(true)
    setChecking(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === PASSWORD) {
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
    setPassword('')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1A5C38] rounded-full animate-spin" />
      </div>
    )
  }

  // ─── Login screen ───
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-[#1A5C38]">
          <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-[#1A5C38]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white font-poppins">SI School</h1>
            </div>
            <p className="text-white/70 text-lg max-w-xl mx-auto font-poppins">
              Capacitaci&oacute;n inmobiliaria para profesionales.
              Contratos, an&aacute;lisis de mercado, gu&iacute;as y materiales de formaci&oacute;n.
            </p>
          </div>
        </div>

        {/* Login form */}
        <div className="flex-1 flex items-start justify-center px-4 -mt-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#1A5C38]/10 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#1A5C38]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-poppins">Acceso restringido</h2>
                <p className="text-sm text-gray-500">Ingres&aacute; la contrase&ntilde;a para acceder</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5 font-poppins">
                  Contrase&ntilde;a
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(false) }}
                  placeholder="Ingres&aacute; la contrase&ntilde;a"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38] focus:border-transparent transition-all ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                  autoFocus
                />
                {error && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">Contrase&ntilde;a incorrecta</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#1A5C38] text-white rounded-xl font-bold text-sm hover:bg-[#15472c] transition-colors font-poppins"
              >
                Ingresar
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-6 font-poppins">
              SI Inmobiliaria &middot; Material exclusivo para el equipo
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Authenticated panel ───
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1A5C38]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-[#1A5C38]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white font-poppins">SI School</h1>
                <p className="text-white/60 text-sm font-poppins">Panel de recursos</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors font-poppins"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesi&oacute;n
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-10">
          {SECTIONS.map(section => {
            const Icon = section.icon
            return (
              <div key={section.title}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${section.color}15` }}>
                    <Icon size={20} color={section.color} strokeWidth={2} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 font-poppins">{section.title}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {section.resources.map((res, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${section.color}10` }}>
                          <FileText size={16} color={section.color} />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 leading-tight font-poppins">{res.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">{res.description}</p>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors font-poppins"
                        style={{ background: `${section.color}10`, color: section.color }}
                        onMouseEnter={e => { e.currentTarget.style.background = section.color; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = `${section.color}10`; e.currentTarget.style.color = section.color }}
                      >
                        <Download size={14} />
                        Descargar PDF
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-400 font-poppins">
            SI Inmobiliaria &middot; Material de uso interno &middot; Desde 1983
          </p>
        </div>
      </div>
    </div>
  )
}
