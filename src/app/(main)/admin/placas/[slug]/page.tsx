'use client'

import { useCallback, useEffect, useState } from 'react'
import { Lock, RefreshCw, Check, Download, ExternalLink } from 'lucide-react'
import type { CarruselPublicado } from '@/agents/placas/types'

const PASSWORD = 'siadmin2024'

export default function PlacasAdminPage({
  params,
}: {
  params: { slug: string }
}) {
  const slug = params.slug
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)

  const [registro, setRegistro] = useState<CarruselPublicado | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [aprobando, setAprobando] = useState(false)
  const [regenerando, setRegenerando] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch(`/api/admin/placas/${slug}`, {
        headers: { 'x-admin-password': PASSWORD },
      })
      if (res.status === 404) {
        setErr('Todavía no hay placas generadas para esta nota.')
        setRegistro(null)
      } else if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErr(data.error ?? `HTTP ${res.status}`)
      } else {
        const data = await res.json()
        setRegistro(data.registro)
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'error de red')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (!auth) return
    cargar()
  }, [auth, cargar])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw === PASSWORD) {
      setAuth(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  const aprobar = async () => {
    setAprobando(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/admin/placas/${slug}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-password': PASSWORD,
        },
        body: JSON.stringify({ action: 'approve' }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'error')
      setMsg('Carrusel aprobado.')
      await cargar()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'error aprobando')
    } finally {
      setAprobando(false)
    }
  }

  const regenerar = async () => {
    if (!confirm('Regenerar todo el carrusel vuelve a correr el extractor (~45s) y reemplaza las 5 placas. ¿Seguir?')) return
    setRegenerando(true)
    setMsg(null)
    setErr(null)
    try {
      const res = await fetch(`/api/admin/placas/${slug}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-password': PASSWORD,
        },
        body: JSON.stringify({ action: 'regenerate' }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error ?? 'error')
      setMsg(`Regenerado — ${data.total} placas en ${Math.round(data.ms_total / 1000)}s`)
      await cargar()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'error regenerando')
    } finally {
      setRegenerando(false)
    }
  }

  // ── Login gate ─────────────────────────────────────────────────────────
  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f5f0e6]">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <Lock size={20} className="text-[#1A5C38]" />
            <h1 className="text-lg font-semibold">Admin · Placas</h1>
          </div>
          <input
            autoFocus
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="contraseña"
            className="w-full px-4 py-3 border-0 bg-[#f5f0e6] rounded-xl outline-none"
          />
          {pwError && (
            <p className="text-xs text-[#E63946] mt-2">contraseña incorrecta</p>
          )}
          <button
            type="submit"
            className="w-full mt-4 bg-[#1A5C38] text-white rounded-xl py-3 text-sm font-medium"
          >
            Entrar
          </button>
        </form>
      </div>
    )
  }

  // ── Contenido principal ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f0e6] py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <a
            href={registro?.nota_url ?? `https://siinmobiliaria.com/blog/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#1A5C38] mb-2 hover:underline"
          >
            Ver nota en el blog <ExternalLink size={12} />
          </a>
          <h1 className="text-2xl font-semibold text-[#131313]">
            {registro?.nota_titulo ?? slug}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            slug: <code className="text-[#1A5C38]">{slug}</code>
          </p>
        </div>

        {/* Estado + acciones */}
        {registro && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6 flex flex-wrap items-center gap-3">
            <EstadoBadge
              estado={registro.aprobado_global ? 'aprobada' : 'pendiente'}
            />
            <span className="text-xs text-gray-500">
              Generado: {new Date(registro.generado_en).toLocaleString()}
            </span>
            <div className="flex-1" />
            <button
              onClick={regenerar}
              disabled={regenerando || aprobando}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#1A5C38] text-[#1A5C38] text-sm disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={regenerando ? 'animate-spin' : ''}
              />
              {regenerando ? 'Regenerando…' : 'Regenerar carrusel'}
            </button>
            <a
              href={`/api/placas/download/${slug}?token=${PASSWORD}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm"
            >
              <Download size={14} />
              ZIP
            </a>
            <button
              onClick={aprobar}
              disabled={aprobando || regenerando || registro.aprobado_global}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A5C38] text-white text-sm disabled:opacity-50"
            >
              <Check size={14} />
              {registro.aprobado_global ? 'Aprobado' : aprobando ? 'Aprobando…' : 'Aprobar'}
            </button>
          </div>
        )}

        {msg && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-[#E8F2ED] text-[#1A5C38] text-sm">
            {msg}
          </div>
        )}
        {err && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-[#E63946] text-sm">
            {err}
          </div>
        )}

        {/* Estado vacío */}
        {loading && !registro && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-sm text-gray-500">
            Cargando…
          </div>
        )}
        {!loading && !registro && !err && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-sm text-gray-500">
            Sin registro. Ejecutá el cron o el endpoint /api/cron/placas-generator?slug={slug}.
          </div>
        )}

        {/* Grid de placas */}
        {registro && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {registro.placas.map(p => (
              <div
                key={p.numero}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="aspect-[1080/1350] bg-[#131313]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url_png}
                    alt={`Placa ${p.numero}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#1A5C38] text-white text-[10px] font-semibold">
                      {String(p.numero).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-gray-600 truncate">
                      {p.placa.nombre ?? '—'}
                    </span>
                  </div>
                  <EstadoBadge estado={p.estado} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    pendiente: { bg: '#fef3c7', fg: '#92400e', label: 'Pendiente' },
    aprobada: { bg: '#E8F2ED', fg: '#1A5C38', label: 'Aprobada' },
    regenerada: { bg: '#e0e7ff', fg: '#3730a3', label: 'Regenerada' },
  }
  const c = map[estado] ?? { bg: '#f3f4f6', fg: '#4b5563', label: estado }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {c.label}
    </span>
  )
}
