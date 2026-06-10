'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Lock, Trash2, RotateCcw, ImageUp, RefreshCw, AlertTriangle, X } from 'lucide-react'

const VERDE = '#1f6b3f'
const TEAM_KEY = 'si_team_access'

interface NotaAdminItem {
  slug: string
  titulo: string
  fecha: string
  categoria: string | null
  image: string
  tipo: 'estatica' | 'dinamica'
  eliminada: boolean
  programada: boolean
  destino: string | null
  dupGroup: number | null
}

// Limpieza sugerida — destinos confirmados por David (02-jun-2026).
const LIMPIEZA_SUGERIDA: { slug: string; destino: string }[] = [
  { slug: 'usados-vs-nuevos-rosario-precios-desalineados-zona-oeste', destino: '/blog/usados-vs-nuevos-brecha-precios-zona-oeste' },
  { slug: 'usados-vs-nuevos-precios-desalineados-zona-oeste-3', destino: '/blog/usados-vs-nuevos-brecha-precios-zona-oeste' },
  { slug: 'usados-vs-nuevos-precios-desalineados-zona-oeste-2', destino: '/blog/usados-vs-nuevos-brecha-precios-zona-oeste' },
  { slug: 'usados-vs-nuevos-precios-desalineados-zona-oeste', destino: '/blog/usados-vs-nuevos-brecha-precios-zona-oeste' },
  { slug: 'crecimiento-demografico-roldan-desarrollo-inmobiliario', destino: '/blog/roldan-crecimiento-demografico-desarrollo-inmobiliario-2' },
  { slug: 'roldan-crecimiento-demografico-desarrollo-inmobiliario', destino: '/blog/roldan-crecimiento-demografico-desarrollo-inmobiliario-2' },
  { slug: 'inmobiliarias-en-roldan', destino: '/blog/inmobiliarias-roldan-como-elegir-la-mejor' },
]

export default function AdminNotasPage() {
  const [code, setCode] = useState('')
  const [auth, setAuth] = useState(false)
  const [items, setItems] = useState<NotaAdminItem[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [working, setWorking] = useState(false)
  const [delTarget, setDelTarget] = useState<NotaAdminItem | null>(null)
  const [delDestino, setDelDestino] = useState('')
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(TEAM_KEY) : null
    if (saved) {
      setCode(saved)
      setAuth(true)
    }
  }, [])

  const authHeaders = useCallback((): Record<string, string> => ({ 'x-team-code': code }), [code])

  const cargar = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch('/api/admin/notas/list', { headers: authHeaders() })
      if (res.status === 401) {
        setErr('Código incorrecto')
        setAuth(false)
        localStorage.removeItem(TEAM_KEY)
        return
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setErr(d.error ?? `HTTP ${res.status}`)
        return
      }
      const d = await res.json()
      setItems(d.items ?? [])
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'error de red')
    } finally {
      setLoading(false)
    }
  }, [authHeaders])

  useEffect(() => {
    if (auth) cargar()
  }, [auth, cargar])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    localStorage.setItem(TEAM_KEY, code.trim())
    setAuth(true)
  }

  const eliminar = async (slug: string, destino: string) =>
    fetch('/api/admin/notas/eliminar', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, destino, accion: 'eliminar' }),
    })

  const confirmarBorrado = async () => {
    if (!delTarget) return
    setWorking(true)
    setErr(null)
    setMsg(null)
    try {
      const res = await eliminar(delTarget.slug, delDestino.trim())
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setErr(d.error ?? 'no se pudo borrar')
        return
      }
      setMsg(`Eliminada: ${delTarget.slug} → ${delDestino.trim()}`)
      setDelTarget(null)
      setDelDestino('')
      await cargar()
    } finally {
      setWorking(false)
    }
  }

  const restaurar = async (slug: string) => {
    setWorking(true)
    try {
      await fetch('/api/admin/notas/eliminar', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, accion: 'restaurar' }),
      })
      setMsg(`Restaurada: ${slug}`)
      await cargar()
    } finally {
      setWorking(false)
    }
  }

  const aplicarLimpieza = async () => {
    if (!confirm(`Vas a eliminar ${LIMPIEZA_SUGERIDA.length} notas duplicadas (soft-delete + 301 a su versión canónica). Es reversible. ¿Confirmás?`)) return
    setWorking(true)
    setErr(null)
    try {
      for (const s of LIMPIEZA_SUGERIDA) await eliminar(s.slug, s.destino)
      setMsg('Limpieza sugerida aplicada.')
      await cargar()
    } finally {
      setWorking(false)
    }
  }

  const subirImagen = async (slug: string, file: File) => {
    setWorking(true)
    setErr(null)
    try {
      const fd = new FormData()
      fd.append('slug', slug)
      fd.append('file', file)
      const res = await fetch('/api/admin/notas/imagen', { method: 'POST', headers: authHeaders(), body: fd })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setErr(d.error ?? 'no se pudo subir')
        return
      }
      setMsg(`Imagen actualizada: ${slug}`)
      await cargar()
    } finally {
      setWorking(false)
    }
  }

  // ── Gate ──
  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] px-4 font-raleway">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-5" style={{ color: VERDE }}>
            <Lock className="w-5 h-5" />
            <h1 className="font-bold text-lg">Admin · Notas del blog</h1>
          </div>
          <input
            type="password"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Código del equipo"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1f6b3f]"
          />
          <button type="submit" className="mt-3 w-full rounded-lg py-2.5 font-bold text-white text-sm" style={{ background: VERDE }}>
            Entrar
          </button>
          {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        </form>
      </div>
    )
  }

  // ── Panel ──
  return (
    <div className="min-h-screen bg-[#FAFAF7] font-raleway" style={{ color: '#1C1C1E' }}>
      <div className="max-w-[1000px] mx-auto px-5 py-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-black text-2xl tracking-tight">Notas del blog</h1>
            <p className="text-sm text-gray-500 font-poppins tabular-nums">
              {items.length} notas · {items.filter(i => i.eliminada).length} eliminadas
            </p>
          </div>
          <button
            onClick={cargar}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Recargar
          </button>
        </header>

        {msg && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-800">{msg}</div>}
        {err && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">{err}</div>}

        {/* Limpieza sugerida */}
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-1 text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            <h2 className="font-bold text-sm uppercase tracking-wide">Limpieza sugerida</h2>
          </div>
          <p className="text-sm text-amber-900/80 mb-3">
            {LIMPIEZA_SUGERIDA.length} duplicadas confirmadas → 301 a su versión canónica. Soft-delete reversible.
          </p>
          <button
            onClick={aplicarLimpieza}
            disabled={working}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            style={{ background: VERDE }}
          >
            <Trash2 className="w-4 h-4" /> Aplicar limpieza sugerida
          </button>
        </div>

        {/* Lista */}
        <div className="space-y-2.5">
          {items.map(n => (
            <div
              key={`${n.tipo}-${n.slug}`}
              className="flex items-center gap-4 rounded-xl border bg-white p-3"
              style={{
                borderColor: n.dupGroup !== null ? '#f0b429' : '#e5e7eb',
                opacity: n.eliminada ? 0.55 : 1,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={n.image} alt="" className="w-20 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm leading-tight line-clamp-1">{n.titulo}</span>
                  {n.dupGroup !== null && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      DUP #{n.dupGroup + 1}
                    </span>
                  )}
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase">
                    {n.tipo}
                  </span>
                  {n.programada && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      Programada
                    </span>
                  )}
                  {n.categoria && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#eef5f0', color: VERDE }}>
                      {n.categoria}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 font-poppins tabular-nums">
                  {n.fecha} · /{n.slug}
                </div>
                {n.eliminada && <div className="text-xs text-red-600 mt-0.5">Eliminada → 301 a {n.destino}</div>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!n.eliminada ? (
                  <>
                    <input
                      ref={el => {
                        fileInputs.current[n.slug] = el
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) subirImagen(n.slug, f)
                        e.target.value = ''
                      }}
                    />
                    <button
                      title="Cambiar imagen"
                      onClick={() => fileInputs.current[n.slug]?.click()}
                      disabled={working}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      <ImageUp className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      title="Eliminar"
                      onClick={() => {
                        setDelTarget(n)
                        setDelDestino('/blog/')
                      }}
                      disabled={working}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    title="Restaurar"
                    onClick={() => restaurar(n.slug)}
                    disabled={working}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 h-9 text-sm font-semibold hover:bg-gray-50"
                  >
                    <RotateCcw className="w-4 h-4" /> Restaurar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de borrado */}
      {delTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setDelTarget(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Eliminar nota</h3>
              <button onClick={() => setDelTarget(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-1">{delTarget.titulo}</p>
            <p className="text-xs text-gray-400 mb-4 font-poppins">/{delTarget.slug}</p>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              URL destino del 301
            </label>
            <input
              value={delDestino}
              onChange={e => setDelDestino(e.target.value)}
              placeholder="/blog/slug-canonico"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1f6b3f] font-poppins"
            />
            <p className="text-xs text-gray-400 mt-2">
              Soft-delete reversible: no se borra el contenido, solo se oculta y redirige (301).
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => setDelTarget(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarBorrado}
                disabled={working || !delDestino.trim()}
                className="rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                style={{ background: '#dc2626' }}
              >
                Eliminar y redirigir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
