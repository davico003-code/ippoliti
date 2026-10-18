'use client'

import { useState } from 'react'
import { Lock, QrCode, Save, Plus, Copy, Check } from 'lucide-react'

// Panel de QR dinámicos: cada QR impreso apunta a siinmobiliaria.com/qr/<slug>.
// Desde acá se cambia a dónde manda cada uno (sin reimprimir ni redeploy) y se
// ven los escaneos. Clave = SI_TEAM_CODE, validada server-side en /api/admin/qr.

interface QrLink {
  slug: string
  nombre: string
  destino: string
  escaneos: number
  escaneosHoy: number
  enRedis: boolean
}

const BASE = 'https://siinmobiliaria.com/qr/'

export default function AdminQrPage() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [links, setLinks] = useState<QrLink[]>([])
  const [edits, setEdits] = useState<Record<string, { nombre: string; destino: string }>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [nuevo, setNuevo] = useState({ slug: '', nombre: '', destino: '' })

  const headers = { 'x-admin-password': pw, 'Content-Type': 'application/json' }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    setLoading(true)
    try {
      const r = await fetch('/api/admin/qr', { headers })
      if (!r.ok) { setError(true); setLoading(false); return }
      const data = await r.json()
      setLinks(data.links || [])
      setAuth(true)
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  const guardar = async (slug: string, nombre: string, destino: string) => {
    setSaving(slug)
    setMsg(null)
    try {
      const r = await fetch('/api/admin/qr', { method: 'POST', headers, body: JSON.stringify({ slug, nombre, destino }) })
      const data = await r.json()
      if (!r.ok) { setMsg(data.error || 'No se pudo guardar'); setSaving(null); return }
      setLinks(data.links || [])
      setEdits(prev => { const n = { ...prev }; delete n[slug]; return n })
      setMsg(`Listo: /qr/${slug} ahora manda a ${destino}`)
    } catch {
      setMsg('Error de red, probá de nuevo')
    }
    setSaving(null)
  }

  const crear = async (e: React.FormEvent) => {
    e.preventDefault()
    const slug = nuevo.slug.trim().toLowerCase()
    await guardar(slug, nuevo.nombre, nuevo.destino)
    setNuevo({ slug: '', nombre: '', destino: '' })
  }

  const copiar = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(BASE + slug)
      setCopied(slug)
      setTimeout(() => setCopied(null), 1500)
    } catch { /* sin clipboard, nada */ }
  }

  if (!auth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-[#1A5C38]" />
            <h1 className="text-lg font-bold font-poppins">QR dinámicos</h1>
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
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#1A5C38] text-white rounded-xl font-bold text-sm disabled:opacity-60">
              {loading ? 'Entrando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <QrCode className="w-6 h-6 text-[#1A5C38]" />
          <h1 className="text-2xl font-black font-poppins">QR dinámicos</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          El QR impreso siempre apunta a <span className="font-mono">{BASE}&lt;nombre&gt;</span>. Acá cambiás a dónde manda cada uno; el cambio es inmediato.
        </p>

        {msg && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-700">{msg}</div>
        )}

        <div className="space-y-4">
          {links.map(l => {
            const e = edits[l.slug] ?? { nombre: l.nombre, destino: l.destino }
            const cambiado = e.nombre !== l.nombre || e.destino !== l.destino
            return (
              <div key={l.slug} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-sm text-gray-500 truncate">{BASE}{l.slug}</span>
                    <button onClick={() => copiar(l.slug)} className="shrink-0 p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50" title="Copiar link">
                      {copied === l.slug ? <Check className="w-3.5 h-3.5 text-[#1A5C38]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-baseline gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-black font-poppins tabular-nums leading-none">{l.escaneos}</div>
                      <div className="text-[11px] uppercase tracking-wide text-gray-400">escaneos</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black font-poppins tabular-nums leading-none">{l.escaneosHoy}</div>
                      <div className="text-[11px] uppercase tracking-wide text-gray-400">hoy</div>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-[1fr_2fr_auto] gap-3">
                  <input
                    value={e.nombre}
                    onChange={ev => setEdits(prev => ({ ...prev, [l.slug]: { ...e, nombre: ev.target.value } }))}
                    placeholder="Nombre (para vos)"
                    className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
                  />
                  <input
                    value={e.destino}
                    onChange={ev => setEdits(prev => ({ ...prev, [l.slug]: { ...e, destino: ev.target.value } }))}
                    placeholder="https://… a dónde manda"
                    className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
                  />
                  <button
                    onClick={() => guardar(l.slug, e.nombre, e.destino)}
                    disabled={!cambiado || saving === l.slug}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 bg-[#1A5C38] text-white text-sm font-bold rounded-xl disabled:opacity-40"
                  >
                    <Save className="w-4 h-4" /> {saving === l.slug ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <form onSubmit={crear} className="mt-8 bg-white rounded-2xl border border-dashed border-gray-300 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4 text-[#1A5C38]" />
            <h2 className="font-bold font-poppins">Nuevo QR</h2>
          </div>
          <div className="grid md:grid-cols-[1fr_1fr_2fr_auto] gap-3">
            <input
              value={nuevo.slug}
              onChange={ev => setNuevo({ ...nuevo, slug: ev.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              placeholder="nombre-corto (va en el link)"
              required
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
            />
            <input
              value={nuevo.nombre}
              onChange={ev => setNuevo({ ...nuevo, nombre: ev.target.value })}
              placeholder="Nombre (para vos)"
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
            />
            <input
              value={nuevo.destino}
              onChange={ev => setNuevo({ ...nuevo, destino: ev.target.value })}
              placeholder="https://… a dónde manda"
              required
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
            />
            <button type="submit" disabled={saving !== null} className="px-4 py-3 bg-[#1A5C38] text-white text-sm font-bold rounded-xl disabled:opacity-40">
              Crear
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Después generás el QR apuntando a {BASE}nombre-corto y lo imprimís una sola vez.</p>
        </form>
      </div>
    </div>
  )
}
