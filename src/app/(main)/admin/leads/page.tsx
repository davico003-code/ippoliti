'use client'

import { useState, useEffect, useMemo } from 'react'
import { Lock, Download, MessageCircle, Filter } from 'lucide-react'

const PASSWORD = 'siadmin2024'

interface Lead {
  nombre: string
  email: string
  whatsapp?: string
  origen?: string
  fecha?: string
  tipo?: string
  date?: string
}

type Tab = 'todos' | 'guia'

export default function LeadsPage() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<Tab>('todos')

  useEffect(() => {
    if (!auth) return
    setLoading(true)
    fetch('/api/admin/leads', { headers: { 'x-admin-password': PASSWORD } })
      .then(r => r.json())
      .then(data => {
        if (data.leads) setLeads(data.leads)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [auth])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw === PASSWORD) { setAuth(true); setError(false) }
    else setError(true)
  }

  const filtered = useMemo(() => {
    if (tab === 'guia') return leads.filter(l => l.origen === 'guia-comprador')
    return leads
  }, [leads, tab])

  const guiaCount30d = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    return leads.filter(l => {
      if (l.origen !== 'guia-comprador') return false
      const d = l.fecha ? new Date(l.fecha).getTime() : 0
      return d > thirtyDaysAgo
    }).length
  }, [leads])

  const exportCSV = () => {
    const rows = filtered.map(l =>
      `"${l.nombre || ''}","${l.email || ''}","${l.whatsapp || ''}","${l.origen || l.tipo || ''}","${l.fecha || l.date || ''}"`
    )
    const csv = 'Nombre,Email,WhatsApp,Origen,Fecha\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${tab === 'guia' ? 'guia' : 'todos'}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const openWhatsApp = (lead: Lead) => {
    const nombre = lead.nombre || 'usuario'
    const phone = lead.whatsapp ? `54${lead.whatsapp.replace(/\D/g, '')}` : '5493412101694'
    const msg = encodeURIComponent(
      `Hola ${nombre}, soy David de SI INMOBILIARIA. Vi que descargaste la guía, ¿te puedo ayudar con algo específico?`
    )
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  if (!auth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-[#1A5C38]" />
            <h1 className="text-lg font-bold font-poppins">Admin Leads</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false) }}
              placeholder="Contraseña"
              autoFocus
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38] ${error ? 'border-red-300' : 'border-gray-200'}`}
            />
            {error && <p className="text-red-500 text-xs">Incorrecta</p>}
            <button type="submit" className="w-full py-3 bg-[#1A5C38] text-white rounded-xl font-bold text-sm">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black font-poppins">
              Leads {tab === 'guia' ? 'de la Guía' : 'capturados'} ({filtered.length})
            </h1>
            {tab === 'guia' && (
              <p className="text-sm text-gray-500 mt-1">
                {guiaCount30d} leads de la guía en los últimos 30 días
              </p>
            )}
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1A5C38] text-white text-xs font-bold rounded-lg"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('todos')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === 'todos'
                ? 'bg-[#1A5C38] text-white'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> Todos ({leads.length})
          </button>
          <button
            onClick={() => setTab('guia')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === 'guia'
                ? 'bg-[#1A5C38] text-white'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            📖 Guía ({leads.filter(l => l.origen === 'guia-comprador').length})
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando leads...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No hay leads</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600">WhatsApp</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600">Origen</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => {
                  const fecha = l.fecha || l.date || ''
                  const fechaStr = fecha ? new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
                  return (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{l.nombre || '-'}</td>
                      <td className="px-4 py-3 text-[#1A5C38] font-medium">{l.email || '-'}</td>
                      <td className="px-4 py-3 text-gray-500" style={{ fontVariantNumeric: 'tabular-nums' }}>{l.whatsapp || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          l.origen === 'guia-comprador'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {l.origen || l.tipo || 'web'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{fechaStr}</td>
                      <td className="px-4 py-3">
                        {(l.whatsapp || l.origen === 'guia-comprador') && (
                          <button
                            onClick={() => openWhatsApp(l)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#25D366] text-white text-[11px] font-bold rounded-lg hover:bg-[#1ea952] transition"
                            title="Abrir WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" /> WA
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
