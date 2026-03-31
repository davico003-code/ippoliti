'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AgentLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/agentes/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.toLowerCase().trim(), password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error de autenticación')
        setLoading(false)
        return
      }

      router.push('/agentes')
      router.refresh()
    } catch {
      setError('Error de conexión')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-[20px] p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-[#1A5C38] font-extrabold text-2xl tracking-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
            SI Inmobiliaria
          </h2>
          <p className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Raleway, sans-serif', fontSize: '22px', fontWeight: 400, color: '#1a1a1a', marginTop: '8px' }}>
            Acceso agentes
          </p>
        </div>

        <div className="space-y-3 mb-4">
          <input
            placeholder="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase())}
            autoComplete="username"
            className="w-full px-4 py-3 bg-[#F2F2F7] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38] transition-colors"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full px-4 py-3 bg-[#F2F2F7] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38] transition-colors"
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs text-center mb-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full py-3 bg-[#1A5C38] text-white font-bold rounded-[14px] text-sm hover:bg-[#0F3A23] transition-colors disabled:opacity-50"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
