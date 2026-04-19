'use client'

import { useEffect, useState } from 'react'

type Registro = {
  nombre: string
  email: string
  whatsapp: string | null
  fecha: string
  ip: string | null
  userAgent: string | null
}

const TOKEN_STORAGE_KEY = 'si_admin_export_token'

export default function GuiaRegistrosAdminPage() {
  const [token, setToken] = useState<string>('')
  const [inputToken, setInputToken] = useState<string>('')
  const [items, setItems] = useState<Registro[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null
    if (saved) {
      setToken(saved)
      setInputToken(saved)
    }
  }, [])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError(null)
    fetch('/api/admin/guia-registros/list', { headers: { 'x-admin-token': token } })
      .then(async r => {
        if (r.status === 401) throw new Error('Token inválido')
        if (!r.ok) throw new Error(`Error ${r.status}`)
        return r.json()
      })
      .then((data: { total: number; items: Registro[] }) => {
        setTotal(data.total)
        setItems(data.items)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const t = inputToken.trim()
    if (!t) return
    localStorage.setItem(TOKEN_STORAGE_KEY, t)
    setToken(t)
  }

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken('')
    setInputToken('')
    setItems([])
    setTotal(0)
    setError(null)
  }

  const downloadExcel = () => {
    const url = `/api/admin/guia-registros/export?token=${encodeURIComponent(token)}`
    window.location.href = url
  }

  // Token gate
  if (!token) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <h1 className="text-xl font-bold text-gray-900 mb-1">Acceso admin</h1>
          <p className="text-sm text-gray-500 mb-6">Ingresá el token para ver los registros de la guía.</p>
          <input
            type="password"
            value={inputToken}
            onChange={e => setInputToken(e.target.value)}
            placeholder="ADMIN_EXPORT_TOKEN"
            autoComplete="off"
            className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 focus:border-[#1A5C38] text-sm mb-4"
          />
          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-[#1A5C38] text-white text-sm font-semibold hover:bg-[#0F3A23] transition-colors"
          >
            Entrar
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fafafa] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Registros Guía</h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? 'Cargando…' : `${total} registro${total === 1 ? '' : 's'} total${total === 1 ? '' : 'es'}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadExcel}
              disabled={loading || total === 0}
              className="px-5 h-11 rounded-lg bg-[#1A5C38] text-white text-sm font-semibold hover:bg-[#0F3A23] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Descargar Excel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 h-11 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
            >
              Salir
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
            {error.includes('Token') && (
              <button onClick={handleLogout} className="ml-3 underline">
                Reingresar token
              </button>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Nombre</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 10).map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(r.fecha).toLocaleString('es-AR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3 text-gray-900 font-medium">{r.nombre}</td>
                    <td className="px-5 py-3 text-gray-600">{r.email}</td>
                    <td className="px-5 py-3 text-gray-600 font-numeric">{r.whatsapp ?? '—'}</td>
                  </tr>
                ))}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-gray-400">
                      No hay registros todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {items.length > 10 && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 text-center">
              Mostrando los 10 registros más recientes. Descargá el Excel para ver todos.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
