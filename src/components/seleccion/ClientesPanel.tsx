'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import BuscadorPropiedades from '@/components/clientes/BuscadorPropiedades'

interface Cliente { name: string; slug: string; description: string; coverImage: string; createdAt: string }
interface Edificio { id: string; nombre: string; descripcion: string; orden: number }

export default function ClientesPanel() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selected, setSelected] = useState<Cliente | null>(null)
  const [edificios, setEdificios] = useState<Edificio[]>([])
  const [propsSueltas, setPropsSueltas] = useState<string[]>([])
  const [propsByEd, setPropsByEd] = useState<Record<string, string[]>>({})
  const [expandedEd, setExpandedEd] = useState<string | null>(null)
  const [showSueltaBuscador, setShowSueltaBuscador] = useState(false)
  const [showNewCliente, setShowNewCliente] = useState(false)
  const [showNewEdificio, setShowNewEdificio] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newEdNombre, setNewEdNombre] = useState('')
  const [newEdDesc, setNewEdDesc] = useState('')
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [syncInfo, setSyncInfo] = useState<{ total: number; timestamp: string | null } | null>(null)
  const [syncing, setSyncing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadClientes = useCallback(async () => {
    try {
      const res = await fetch('/api/clientes')
      if (res.ok) setClientes(await res.json())
    } catch {}
  }, [])

  useEffect(() => { loadClientes() }, [loadClientes])

  useEffect(() => {
    fetch('/api/clientes/sync').then(r => r.json()).then(setSyncInfo).catch(() => {})
  }, [])

  async function doSync() {
    setSyncing(true)
    try {
      const r = await fetch('/api/clientes/sync', { method: 'POST' })
      if (r.ok) setSyncInfo(await r.json())
    } catch {}
    setSyncing(false)
  }

  async function selectCliente(c: Cliente) {
    setSelected(c)
    setExpandedEd(null)
    setShowSueltaBuscador(false)
    try {
      const [edRes, sueltasRes] = await Promise.all([
        fetch(`/api/clientes/${c.slug}/edificios`),
        fetch(`/api/clientes/${c.slug}/sueltas`),
      ])
      const eds: Edificio[] = edRes.ok ? await edRes.json() : []
      const sueltas: string[] = sueltasRes.ok ? await sueltasRes.json() : []
      setEdificios(eds)
      setPropsSueltas(sueltas)
      const propsMap: Record<string, string[]> = {}
      await Promise.all(eds.map(async ed => {
        const r = await fetch(`/api/clientes/${c.slug}/edificios/${ed.id}/propiedades`)
        propsMap[ed.id] = r.ok ? await r.json() : []
      }))
      setPropsByEd(propsMap)
    } catch {}
  }

  async function createCliente() {
    if (!newName.trim()) return
    const slug = newName.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    await fetch('/api/clientes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), slug, description: newDesc.trim(), coverImage: '' }),
    })
    setNewName(''); setNewDesc(''); setShowNewCliente(false)
    loadClientes()
  }

  async function deleteCliente(slug: string) {
    if (!window.confirm(`¿Eliminar a ${selected?.name}? Esto no se puede deshacer.`)) return
    await fetch(`/api/clientes?slug=${slug}`, { method: 'DELETE' })
    setSelected(null); loadClientes()
  }

  async function createEdificio() {
    if (!selected || !newEdNombre.trim()) return
    await fetch(`/api/clientes/${selected.slug}/edificios`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: newEdNombre.trim(), descripcion: newEdDesc.trim() }),
    })
    setNewEdNombre(''); setNewEdDesc(''); setShowNewEdificio(false)
    selectCliente(selected)
  }

  async function deleteEdificio(edId: string) {
    if (!selected || !window.confirm('¿Eliminar este edificio? Las propiedades no se borran, solo se desvinculan.')) return
    await fetch(`/api/clientes/${selected.slug}/edificios?edId=${edId}`, { method: 'DELETE' })
    selectCliente(selected)
  }

  async function moveEdificio(edId: string, dir: 'up' | 'down') {
    if (!selected) return
    const idx = edificios.findIndex(e => e.id === edId)
    const swap = dir === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= edificios.length) return
    const order = edificios.map(e => e.id)
    ;[order[idx], order[swap]] = [order[swap], order[idx]]
    await fetch(`/api/clientes/${selected.slug}/edificios`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    })
    selectCliente(selected)
  }

  async function toggleEdProp(edId: string, tokkoId: string, action: 'add' | 'remove') {
    if (!selected) return
    await fetch(`/api/clientes/${selected.slug}/edificios/${edId}/propiedades`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokkoId, action }),
    })
    selectCliente(selected)
  }

  async function toggleSuelta(tokkoId: string, action: 'add' | 'remove') {
    if (!selected) return
    await fetch(`/api/clientes/${selected.slug}/sueltas`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokkoId, action }),
    })
    selectCliente(selected)
  }

  async function uploadCover(file: File) {
    if (!selected) return
    if (file.size > 5 * 1024 * 1024) { alert('La imagen es muy grande, máximo 5MB'); return }
    setCoverPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/clientes/upload', { method: 'POST', body: form })
      if (res.ok) {
        const { url } = await res.json()
        // Update client in Redis
        const updated = { ...selected, coverImage: url }
        await fetch('/api/clientes', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch(() => {})
        // Direct Redis update via a simple endpoint
        setSelected(updated)
      }
    } catch {}
    setUploading(false)
  }

  function copyLink() {
    if (!selected) return
    navigator.clipboard.writeText(`https://siinmobiliaria.com/emprendimientos/${selected.slug}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  // ── LIST VIEW ──
  if (!selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Clientes</h2>
          <button onClick={() => setShowNewCliente(true)} className="px-4 py-2 bg-[#1A5C38] text-white text-sm font-bold rounded-xl">+ Nuevo</button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span>Base de datos: {syncInfo?.total || 0} propiedades</span>
          <button onClick={doSync} disabled={syncing} className="flex items-center gap-1 text-[#1A5C38] hover:underline disabled:opacity-50">
            <svg className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
            {syncing ? 'Sincronizando...' : 'Actualizar'}
          </button>
        </div>

        {showNewCliente && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <input placeholder="Nombre del cliente *" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38]" />
            <input placeholder="Descripción (opcional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38]" />
            <div className="flex gap-2">
              <button onClick={createCliente} className="flex-1 py-2.5 bg-[#1A5C38] text-white text-sm font-bold rounded-xl">Guardar</button>
              <button onClick={() => { setShowNewCliente(false); setNewName(''); setNewDesc('') }} className="px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl">Cancelar</button>
            </div>
          </div>
        )}

        {clientes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <p className="text-sm text-gray-400">No hay clientes todavía</p>
          </div>
        ) : (
          <div className="space-y-2">
            {clientes.map(c => (
              <button key={c.slug} onClick={() => selectCliente(c)} className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow flex items-center gap-3">
                {c.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.coverImage} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#1A5C38]/5 flex items-center justify-center shrink-0">
                    <span className="text-[#1A5C38] font-bold text-sm">{c.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{c.name}</p>
                  {c.description && <p className="text-xs text-gray-400 truncate">{c.description}</p>}
                </div>
                <span className="text-gray-300">&rarr;</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── DETAIL VIEW ──
  const coverUrl = coverPreview || selected.coverImage
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => { setSelected(null); setCoverPreview(null) }} className="text-sm text-gray-400 hover:text-gray-600">&larr; Volver</button>
        <div className="flex gap-2">
          <a href={`/emprendimientos/${selected.slug}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Ver</a>
          <button onClick={copyLink} className={`px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors ${copied ? 'bg-[#1A5C38] text-white border-[#1A5C38]' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            {copied ? '¡Copiado!' : 'Link'}
          </button>
          <button onClick={() => deleteCliente(selected.slug)} className="px-3 py-1.5 text-xs text-red-400 border border-red-200 rounded-lg hover:bg-red-50">Eliminar</button>
        </div>
      </div>

      {/* Cover image */}
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer group"
        onClick={() => fileRef.current?.click()}
        style={{ minHeight: coverUrl ? 'auto' : '120px' }}
      >
        {coverUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt={selected.name} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-semibold">Cambiar foto</span>
            </div>
          </>
        ) : (
          <div className="w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#1A5C38] transition-colors">
            <span className="text-2xl">📷</span>
            <span className="text-xs text-gray-400">Tocá para subir foto de portada</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="w-5 h-5 border-2 border-gray-200 border-t-[#1A5C38] rounded-full animate-spin" />
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(f) }} />
      </div>

      <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
      {selected.description && <p className="text-sm text-gray-500 -mt-2">{selected.description}</p>}

      {/* Edificios */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Edificios</p>
          <button onClick={() => setShowNewEdificio(true)} className="text-xs text-[#1A5C38] font-bold">+ Edificio</button>
        </div>

        {showNewEdificio && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2 mb-3">
            <input placeholder="Nombre del edificio *" value={newEdNombre} onChange={e => setNewEdNombre(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38]" />
            <input placeholder="Descripción" value={newEdDesc} onChange={e => setNewEdDesc(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38]" />
            <div className="flex gap-2">
              <button onClick={createEdificio} className="flex-1 py-2 bg-[#1A5C38] text-white text-sm font-bold rounded-xl">Guardar</button>
              <button onClick={() => { setShowNewEdificio(false); setNewEdNombre(''); setNewEdDesc('') }} className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-xl">Cancelar</button>
            </div>
          </div>
        )}

        {edificios.map((ed, idx) => {
          const edProps = propsByEd[ed.id] || []
          const isExpanded = expandedEd === ed.id
          return (
            <div key={ed.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-2 overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <button onClick={() => { setExpandedEd(isExpanded ? null : ed.id); setShowSueltaBuscador(false) }} className="flex items-center gap-2 flex-1 text-left">
                  <span className="text-sm">{isExpanded ? '▼' : '►'}</span>
                  <span className="font-bold text-sm text-gray-900">{ed.nombre}</span>
                  <span className="text-[10px] text-gray-400 font-numeric bg-gray-100 px-1.5 py-0.5 rounded">{edProps.length}</span>
                </button>
                <div className="flex items-center gap-1">
                  {idx > 0 && <button onClick={() => moveEdificio(ed.id, 'up')} className="text-gray-300 hover:text-gray-500 text-xs px-1">↑</button>}
                  {idx < edificios.length - 1 && <button onClick={() => moveEdificio(ed.id, 'down')} className="text-gray-300 hover:text-gray-500 text-xs px-1">↓</button>}
                  <button onClick={() => deleteEdificio(ed.id)} className="text-gray-300 hover:text-red-400 text-xs ml-1">✕</button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <BuscadorPropiedades
                    asignados={edProps}
                    onToggle={(id, action) => toggleEdProp(ed.id, id, action)}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Otras propiedades */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Otras propiedades</p>
          <button onClick={() => { setShowSueltaBuscador(!showSueltaBuscador); setExpandedEd(null) }} className="text-xs text-[#1A5C38] font-bold">
            {showSueltaBuscador ? 'Cerrar' : '+ Agregar'}
          </button>
        </div>

        {showSueltaBuscador && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3">
            <BuscadorPropiedades
              asignados={propsSueltas}
              onToggle={toggleSuelta}
            />
          </div>
        )}

        {!showSueltaBuscador && propsSueltas.length === 0 && (
          <p className="text-xs text-gray-300 text-center py-4">Todavía no hay propiedades sueltas</p>
        )}

        {!showSueltaBuscador && propsSueltas.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-2">{propsSueltas.length} propiedad{propsSueltas.length !== 1 ? 'es' : ''}</p>
            <div className="flex flex-wrap gap-1.5">
              {propsSueltas.map(id => (
                <span key={id} className="flex items-center gap-1 text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-lg font-numeric">
                  {id}
                  <button onClick={() => toggleSuelta(id, 'remove')} className="text-red-300 hover:text-red-500 ml-0.5">✕</button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
