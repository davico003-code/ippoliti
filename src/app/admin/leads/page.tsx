'use client'

import { useState, useEffect } from 'react'
import { Lock, Trash2, Download } from 'lucide-react'

const PASSWORD = 'siadmin2024'

interface Lead {
  nombre: string
  email: string
  tipo: string
  date: string
}

export default function LeadsPage() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])

  useEffect(() => {
    if (auth) {
      const data = JSON.parse(localStorage.getItem('si-leads') || '[]')
      setLeads(data.reverse())
    }
  }, [auth])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw === PASSWORD) { setAuth(true); setError(false) }
    else setError(true)
  }

  const clearLeads = () => {
    if (confirm('Eliminar todos los leads?')) {
      localStorage.setItem('si-leads', '[]')
      setLeads([])
    }
  }

  const exportCSV = () => {
    const csv = 'Nombre,Email,Tipo,Fecha\n' + leads.map(l =>
      `"${l.nombre}","${l.email}","${l.tipo}","${l.date}"`
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'leads-si.csv'; a.click()
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
            <input type="password" value={pw}
              onChange={e => { setPw(e.target.value); setError(false) }}
              placeholder="Contrase&ntilde;a" autoFocus
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black font-poppins">Leads capturados ({leads.length})</h1>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-4 py-2 bg-[#1A5C38] text-white text-xs font-bold rounded-lg">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button onClick={clearLeads} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg">
              <Trash2 className="w-3.5 h-3.5" /> Limpiar
            </button>
          </div>
        </div>
        {leads.length === 0 ? (
          <p className="text-gray-400 text-center py-20">No hay leads todav&iacute;a</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">{l.nombre || '-'}</td>
                    <td className="px-4 py-3 font-medium text-[#1A5C38]">{l.email}</td>
                    <td className="px-4 py-3">{l.tipo}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(l.date).toLocaleDateString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
