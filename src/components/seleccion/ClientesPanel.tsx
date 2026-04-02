'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Cliente { name: string; slug: string; description: string; createdAt: string }
interface Edificio { id: string; nombre: string; descripcion: string; orden: number }
interface SearchResult { id: number; publication_title: string; address: string; operations?: { prices?: { price: number; currency: string }[] }[] }

export default function ClientesPanel() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selected, setSelected] = useState<Cliente | null>(null)
  const [edificios, setEdificios] = useState<Edificio[]>([])
  const [propsSueltas, setPropsSueltas] = useState<string[]>([])
  const [propsByEd, setPropsByEd] = useState<Record<string, string[]>>({})
  const [expandedEd, setExpandedEd] = useState<string | null>(null)
  const [showNewCliente, setShowNewCliente] = useState(false)
  const [showNewEdificio, setShowNewEdificio] = useState(false)
  const [assignMode, setAssignMode] = useState<{ tipo: 'edificio' | 'suelta'; edId?: string } | null>(null)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newEdNombre, setNewEdNombre] = useState('')
  const [newEdDesc, setNewEdDesc] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Load clientes
  const loadClientes = useCallback(async () => {
    const res = await fetch('/api/clientes')
    if (res.ok) setClientes(await res.json())
  }, [])

  useEffect(() => { loadClientes() }, [loadClientes])

  // Load client detail
  async function selectCliente(c: Cliente) {
    setSelected(c)
    setExpandedEd(null)
    setAssignMode(null)

    const [edRes, sueltasRes] = await Promise.all([
      fetch(`/api/clientes/${c.slug}/edificios`),
      fetch(`/api/clientes/${c.slug}/sueltas`),
    ])
    const eds: Edificio[] = edRes.ok ? await edRes.json() : []
    const sueltas: string[] = sueltasRes.ok ? await sueltasRes.json() : []
    setEdificios(eds)
    setPropsSueltas(sueltas)

    // Load props for each edificio
    const propsMap: Record<string, string[]> = {}
    await Promise.all(eds.map(async ed => {
      const r = await fetch(`/api/clientes/${c.slug}/edificios/${ed.id}/propiedades`)
      propsMap[ed.id] = r.ok ? await r.json() : []
    }))
    setPropsByEd(propsMap)
  }

  // Search Tokko
  useEffect(() => {
    if (!search.trim() || !assignMode) { setSearchResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const r = await fetch(`/api/propiedades?search=${encodeURIComponent(search)}&limit=8`)
        if (r.ok) { const d = await r.json(); setSearchResults(d.objects || []) }
      } catch {}
      setSearching(false)
    }, 300)
  }, [search, assignMode])

  // Create cliente
  async function createCliente() {
    if (!newName.trim()) return
    const slug = newName.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), slug, description: newDesc.trim() }),
    })
    if (res.ok) {
      setNewName(''); setNewDesc(''); setShowNewCliente(false)
      loadClientes()
    }
  }

  // Delete cliente
  async function deleteCliente(slug: string) {
    if (!window.confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')) return
    await fetch(`/api/clientes?slug=${slug}`, { method: 'DELETE' })
    setSelected(null)
    loadClientes()
  }

  // Create edificio
  async function createEdificio() {
    if (!selected || !newEdNombre.trim()) return
    const res = await fetch(`/api/clientes/${selected.slug}/edificios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: newEdNombre.trim(), descripcion: newEdDesc.trim() }),
    })
    if (res.ok) {
      setNewEdNombre(''); setNewEdDesc(''); setShowNewEdificio(false)
      selectCliente(selected)
    }
  }

  // Delete edificio
  async function deleteEdificio(edId: string) {
    if (!selected || !window.confirm('¿Eliminar este edificio?')) return
    await fetch(`/api/clientes/${selected.slug}/edificios?edId=${edId}`, { method: 'DELETE' })
    selectCliente(selected)
  }

  // Assign property
  async function assignProp(tokkoId: number) {
    if (!selected || !assignMode) return
    const id = String(tokkoId)
    if (assignMode.tipo === 'edificio' && assignMode.edId) {
      await fetch(`/api/clientes/${selected.slug}/edificios/${assignMode.edId}/propiedades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokkoId: id, action: 'add' }),
      })
    } else {
      await fetch(`/api/clientes/${selected.slug}/sueltas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokkoId: id, action: 'add' }),
      })
    }
    setSearch(''); setSearchResults([]); setAssignMode(null)
    selectCliente(selected)
  }

  // Remove property
  async function removeProp(tokkoId: string, tipo: 'edificio' | 'suelta', edId?: string) {
    if (!selected) return
    if (tipo === 'edificio' && edId) {
      await fetch(`/api/clientes/${selected.slug}/edificios/${edId}/propiedades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokkoId, action: 'remove' }),
      })
    } else {
      await fetch(`/api/clientes/${selected.slug}/sueltas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokkoId, action: 'remove' }),
      })
    }
    selectCliente(selected)
  }

  function getPrice(r: SearchResult) {
    const p = r.operations?.[0]?.prices?.[0]
    return p?.price ? `${p.currency || 'USD'} ${p.price.toLocaleString('es-AR')}` : ''
  }

  // ── LIST VIEW ──
  if (!selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Clientes</h2>
          <button onClick={() => setShowNewCliente(true)} className="px-4 py-2 bg-[#1A5C38] text-white text-sm font-bold rounded-xl">+ Nuevo</button>
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
          <p className="text-gray-400 text-sm text-center py-8">No hay clientes todavía</p>
        ) : (
          <div className="space-y-2">
            {clientes.map(c => (
              <button key={c.slug} onClick={() => selectCliente(c)} className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{c.name}</p>
                  {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
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
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => setSelected(null)} className="text-sm text-gray-400 hover:text-gray-600">&larr; Volver</button>
        <button onClick={() => deleteCliente(selected.slug)} className="text-xs text-red-400 hover:text-red-600">Eliminar cliente</button>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
        {selected.description && <p className="text-sm text-gray-500 mt-1">{selected.description}</p>}
      </div>

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

        {edificios.map(ed => (
          <div key={ed.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-2 overflow-hidden">
            <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedEd(expandedEd === ed.id ? null : ed.id)}>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">{expandedEd === ed.id ? '▼' : '►'}</span>
                <span className="font-bold text-sm text-gray-900">{ed.nombre}</span>
                <span className="text-[10px] text-gray-400 font-numeric">{(propsByEd[ed.id] || []).length}</span>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteEdificio(ed.id) }} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
            </div>

            {expandedEd === ed.id && (
              <div className="px-4 pb-4 space-y-1.5">
                {(propsByEd[ed.id] || []).map(tokkoId => (
                  <div key={tokkoId} className="flex items-center justify-between py-1.5 text-sm text-gray-700">
                    <span className="font-numeric">ID {tokkoId}</span>
                    <button onClick={() => removeProp(tokkoId, 'edificio', ed.id)} className="text-red-300 hover:text-red-500 text-xs">✕</button>
                  </div>
                ))}
                <button onClick={() => { setAssignMode({ tipo: 'edificio', edId: ed.id }); setSearch('') }} className="text-xs text-[#1A5C38] font-semibold mt-1">+ Asignar unidad</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Propiedades sueltas */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Propiedades sueltas</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-1.5">
          {propsSueltas.map(tokkoId => (
            <div key={tokkoId} className="flex items-center justify-between py-1.5 text-sm text-gray-700">
              <span className="font-numeric">ID {tokkoId}</span>
              <button onClick={() => removeProp(tokkoId, 'suelta')} className="text-red-300 hover:text-red-500 text-xs">✕</button>
            </div>
          ))}
          {propsSueltas.length === 0 && <p className="text-xs text-gray-300">Sin propiedades sueltas</p>}
          <button onClick={() => { setAssignMode({ tipo: 'suelta' }); setSearch('') }} className="text-xs text-[#1A5C38] font-semibold mt-1">+ Agregar suelta</button>
        </div>
      </div>

      {/* Search modal */}
      {assignMode && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setAssignMode(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto p-5" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-bold text-gray-900 mb-3">
              Buscar propiedad {assignMode.tipo === 'edificio' ? 'para edificio' : 'suelta'}
            </p>
            <input autoFocus placeholder="Buscar por dirección..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38] mb-3" />

            {searching && <p className="text-xs text-gray-400">Buscando...</p>}

            <div className="space-y-2">
              {searchResults.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.publication_title || r.address}</p>
                    {getPrice(r) && <p className="text-xs text-[#1A5C38] font-semibold font-numeric">{getPrice(r)}</p>}
                  </div>
                  <button onClick={() => assignProp(r.id)} className="ml-2 px-3 py-1.5 bg-[#1A5C38] text-white text-xs font-bold rounded-lg shrink-0">Asignar</button>
                </div>
              ))}
            </div>

            <button onClick={() => setAssignMode(null)} className="w-full mt-3 py-2 text-sm text-gray-400 text-center">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}
