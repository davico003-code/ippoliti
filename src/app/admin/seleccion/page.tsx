'use client'

import { useState } from 'react'
import { Search, Plus, X, Link2, Check } from 'lucide-react'

interface Property {
  id: number
  publication_title: string
  address: string
  photos: { image: string; is_front_cover: boolean; is_blueprint: boolean }[]
  operations: { operation_type: string; prices: { currency: string; price: number }[] }[]
}

export default function SeleccionAdmin() {
  const [auth, setAuth] = useState(false)
  const [pass, setPass] = useState('')
  const [title, setTitle] = useState('')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Property[]>([])
  const [selected, setSelected] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [copied, setCopied] = useState(false)

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-sm w-full">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Admin · Selección</h1>
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pass === 'siadmin2024' && setAuth(true)}
            placeholder="Contraseña"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3"
          />
          <button
            onClick={() => pass === 'siadmin2024' && setAuth(true)}
            className="w-full py-3 bg-[#1A5C38] text-white rounded-xl font-semibold"
          >
            Ingresar
          </button>
        </div>
      </div>
    )
  }

  const doSearch = async () => {
    if (!search.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/propiedades?search=${encodeURIComponent(search)}&limit=10`)
      const data = await res.json()
      setResults(data.objects || [])
    } catch { setResults([]) }
    setLoading(false)
  }

  const addProperty = (p: Property) => {
    if (!selected.find(s => s.id === p.id)) setSelected([...selected, p])
  }

  const removeProperty = (id: number) => {
    setSelected(selected.filter(s => s.id !== id))
  }

  const generateLink = async () => {
    if (!title.trim() || selected.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/seleccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': 'siadmin2024' },
        body: JSON.stringify({ title, propertyIds: selected.map(s => s.id) }),
      })
      const data = await res.json()
      setGeneratedUrl(data.url)
    } catch {}
    setLoading(false)
  }

  const getThumb = (p: Property) => {
    const cover = p.photos?.find(ph => ph.is_front_cover && !ph.is_blueprint)
    const first = p.photos?.find(ph => !ph.is_blueprint)
    return (cover || first || p.photos?.[0])?.image || ''
  }

  const getPrice = (p: Property) => {
    const op = p.operations?.[0]
    const pr = op?.prices?.[0]
    if (!pr?.price) return 'Consultar'
    return `${pr.currency} ${pr.price.toLocaleString('es-AR')}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear selección de propiedades</h1>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título (ej: Opciones para María · Funes 3 dorm)"
          className="w-full px-4 py-3 border-0 bg-white rounded-xl shadow-sm text-base mb-4"
        />

        {/* Search */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="Buscar propiedad..."
              className="w-full pl-10 pr-4 py-3 border-0 bg-white rounded-xl shadow-sm text-sm"
            />
          </div>
          <button onClick={doSearch} className="px-4 py-3 bg-[#1A5C38] text-white rounded-xl text-sm font-semibold">
            Buscar
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm mb-6 divide-y divide-gray-50">
            {results.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3">
                {getThumb(p) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={getThumb(p)} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.publication_title || p.address}</p>
                  <p className="text-xs text-[#1A5C38] font-semibold">{getPrice(p)}</p>
                </div>
                <button
                  onClick={() => addProperty(p)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A5C38] text-white flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {loading && <p className="text-sm text-gray-400 mb-4">Cargando...</p>}

        {/* Selected */}
        {selected.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Seleccionadas ({selected.length})
            </p>
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-50">
              {selected.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3">
                  {getThumb(p) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getThumb(p)} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.publication_title || p.address}</p>
                    <p className="text-xs text-[#1A5C38] font-semibold">{getPrice(p)}</p>
                  </div>
                  <button
                    onClick={() => removeProperty(p.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate */}
        <button
          onClick={generateLink}
          disabled={!title.trim() || selected.length === 0 || loading}
          className="w-full py-4 bg-[#1A5C38] text-white rounded-xl font-semibold text-base disabled:opacity-40"
        >
          Generar link
        </button>

        {/* Generated URL */}
        {generatedUrl && (
          <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-2">Link generado:</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={generatedUrl}
                className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 truncate"
              />
              <button
                onClick={() => { navigator.clipboard.writeText(generatedUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                className="px-4 py-2 bg-[#1A5C38] text-white rounded-lg text-sm font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
