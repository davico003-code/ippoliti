'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AgentLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 60% 40%, #1e4d30 0%, #0d2b1a 50%, #071a10 100%)' }}
    >
      <form onSubmit={handleSubmit} className="bg-white rounded-[20px] p-8 w-full max-w-[420px] shadow-2xl">
        <div className="text-center mb-8">
          {/* Logo SI */}
          <div className="w-14 h-14 bg-[#1A5C38] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-extrabold text-xl" style={{ fontFamily: 'Raleway, sans-serif' }}>SI</span>
          </div>
          <h2 className="text-[22px] font-bold text-[#1C1C1E]" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Acceso Agentes
          </h2>
          <p className="text-[14px] text-[#6E6E73] mt-1">
            Panel exclusivo para el equipo SI
          </p>
        </div>

        <div className="space-y-3 mb-4">
          <input
            placeholder="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase())}
            autoComplete="username"
            className="w-full px-4 py-3.5 bg-[#F2F2F7] border border-gray-200 rounded-xl text-[15px] outline-none focus:border-[#1A5C38] transition-colors"
          />
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-3.5 bg-[#F2F2F7] border border-gray-200 rounded-xl text-[15px] outline-none focus:border-[#1A5C38] transition-colors pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1C1C1E] transition-colors p-1"
            >
              {showPass ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-[13px] text-center mb-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full py-3.5 bg-[#1A5C38] text-white font-bold rounded-[14px] text-[15px] hover:bg-[#0F3A23] transition-colors disabled:opacity-50"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
