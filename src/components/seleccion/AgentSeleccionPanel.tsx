'use client'

import { useState, useEffect } from 'react'
import { getTimeLeft } from '@/lib/seleccion'

interface ExternaSnapshot {
  title: string; image: string | null; location: string
  price: string | null; rooms: number; baths: number; area: number
}
interface Session {
  token: string; clientName: string; clientPhone: string; agent: string
  properties: { id: string; url: string; note: string; source?: 'externa'; snapshot?: ExternaSnapshot }[]
  createdAt: string; expiresAt: string; note: string
  resumen: { liked: number; disliked: number; wantVisit: number; hasComments: boolean }
}

// Fila de propiedad en el form. Los campos manuales solo se usan cuando la URL
// es externa (Zonaprop / colega): con ellos se mintea una ficha propia en
// verficha.casa. En propiedades SI quedan vacíos.
type FormProperty = {
  id: string; url: string; note: string
  title: string; descripcion: string; operacion: string; tipo: string; moneda: string
  price: string; rooms: string; baths: string; ambientes: string; area: string; terreno: string
  location: string; image: string; fotosExtra: string
}
const emptyProp = (): FormProperty => ({
  id: '', url: '', note: '', title: '', descripcion: '', operacion: 'Venta', tipo: 'Casa', moneda: 'USD',
  price: '', rooms: '', baths: '', ambientes: '', area: '', terreno: '', location: '', image: '', fotosExtra: '',
})

const TIPOS = ['Casa', 'Departamento', 'PH', 'Lote', 'Local', 'Oficina', 'Quinta', 'Galpón', 'Campo']

// Externa = URL válida cuyo host no es siinmobiliaria.com.
function isExternalUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return !!host && !host.includes('siinmobiliaria.com')
  } catch {
    return false
  }
}
// Parse numérico tolerante: "USD 180.000" → 180000, "1053 m2" → 1053, "" → 0.
const toNum = (v: string): number => {
  const n = parseInt(String(v).replace(/[^\d]/g, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : 0
}
const httpsOnly = (v: string): string | null => {
  const t = (v || '').trim()
  return t.startsWith('https://') ? t : null
}
// Saca el nombre del portal del título prellenado por Microlink (lo limpio
// también en server, pero así el agente ya lo ve limpio para editar).
const stripPortalClient = (s: string): string =>
  (s || '').replace(/\s*[-|·]?\s*\b(zonaprop|argenprop|mercado\s?libre|properati|navent)\b/gi, '')
    .replace(/\s*[-,]\s*Santa Fe\b/gi, '').replace(/\s{2,}/g, ' ').trim()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function AgentSeleccionPanel({ initialSessions, agentId }: { initialSessions: Session[]; agentId: string }) {
  const [sessions, setSessions] = useState(initialSessions)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    clientName: '', clientPhone: '', agent: 'David Flores', days: 90, note: '',
    properties: [emptyProp()] as FormProperty[],
  })
  const [createdUrl, setCreatedUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [prefetching, setPrefetching] = useState<Record<number, boolean>>({})
  const [formError, setFormError] = useState('')

  // "Traer datos" — prellena título / foto / descripción desde Microlink (que sí
  // pasa el Cloudflare de Zonaprop). El agente completa precio, m², etc.
  async function prefetchExterna(i: number) {
    const url = formData.properties[i]?.url.trim()
    if (!url || !isExternalUrl(url)) return
    setPrefetching(s => ({ ...s, [i]: true }))
    try {
      const res = await fetch(`/api/seleccion/preview?url=${encodeURIComponent(url)}`)
      const d = res.ok ? await res.json() : {}
      setFormData(fd => {
        const props = [...fd.properties]
        const p = props[i]
        if (!p) return fd
        props[i] = {
          ...p,
          title: p.title || stripPortalClient(d.title || ''),
          image: p.image || (httpsOnly(d.image || '') || ''),
          descripcion: p.descripcion || stripPortalClient(d.description || ''),
        }
        return { ...fd, properties: props }
      })
    } catch {
      /* sin prefill: el agente carga a mano */
    }
    setPrefetching(s => ({ ...s, [i]: false }))
  }

  // Auto-refresh
  useEffect(() => {
    const iv = setInterval(async () => {
      try {
        const res = await fetch('/api/seleccion?agent=all')
        if (res.ok) setSessions(await res.json())
      } catch {}
    }, 30000)
    return () => clearInterval(iv)
  }, [])

  const activas = sessions.filter(s => !getTimeLeft(s.expiresAt).expired)
  const visitasPedidas = sessions.reduce((n, s) => n + s.resumen.wantVisit, 0)
  const vencenPronto = activas.filter(s => getTimeLeft(s.expiresAt).days <= 2).length

  function addProperty() {
    setFormData(d => ({ ...d, properties: [...d.properties, emptyProp()] }))
  }

  function updateProperty(i: number, field: string, val: string) {
    setFormData(d => {
      const props = [...d.properties]
      props[i] = { ...props[i], [field]: val }
      // Auto-generate id from url
      if (field === 'url') {
        try { props[i].id = new URL(val).pathname.split('/').filter(Boolean).at(-1) || `prop-${i}` } catch { props[i].id = `prop-${i}` }
      }
      return { ...d, properties: props }
    })
  }

  function removeProperty(i: number) {
    if (formData.properties.length <= 1) return
    setFormData(d => ({ ...d, properties: d.properties.filter((_, j) => j !== i) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!formData.clientName.trim() || !formData.properties.some(p => p.url.trim())) return

    const rows = formData.properties.filter(p => p.url.trim())
    // Toda propiedad externa necesita al menos título para mintear su ficha propia.
    const sinDatos = rows.find(p => isExternalUrl(p.url) && !p.title.trim())
    if (sinDatos) {
      setFormError('Completá los datos de la propiedad externa (mínimo el título) o usá "Traer datos".')
      return
    }

    setSubmitting(true)
    try {
      const { clientName, clientPhone, agent, days, note } = formData
      const properties: Array<Record<string, unknown>> = []

      for (let i = 0; i < rows.length; i++) {
        const p = rows[i]
        const base = { id: p.id || `prop-${i}`, url: p.url.trim(), note: p.note.trim() }

        if (isExternalUrl(p.url) && p.title.trim()) {
          // Externa → minteamos una ficha PROPIA en verficha.casa y linkeamos a ESA.
          const fotos = [httpsOnly(p.image), ...p.fotosExtra.split('\n').map(s => httpsOnly(s))]
            .filter((u): u is string => !!u)
          const r = await fetch('/api/fichas/importar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceUrl: p.url.trim(),
              titulo: p.title.trim(),
              descripcion: p.descripcion.trim(),
              fotos,
              operacion: p.operacion,
              tipo: p.tipo,
              moneda: p.moneda,
              precioRaw: toNum(p.price),
              zona: p.location.trim(),
              m2cubiertos: toNum(p.area),
              m2terreno: toNum(p.terreno),
              ambientes: toNum(p.ambientes),
              dormitorios: toNum(p.rooms),
              banos: toNum(p.baths),
            }),
          })
          if (!r.ok) throw new Error('No se pudo crear la ficha de una propiedad externa. Revisá los datos y reintentá.')
          const data = await r.json()
          properties.push({ ...base, url: data.url, source: 'externa', snapshot: data.snapshot })
        } else {
          properties.push(base)
        }
      }

      const res = await fetch('/api/seleccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, clientPhone, agent, days, note, properties }),
      })
      const data = await res.json()
      setCreatedUrl(`${window.location.origin}/seleccion/${data.token}`)

      // Refresh list
      const listRes = await fetch('/api/seleccion?agent=all')
      if (listRes.ok) setSessions(await listRes.json())
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Algo salió mal. Reintentá.')
    }
    setSubmitting(false)
  }

  function copyUrl() {
    navigator.clipboard.writeText(createdUrl)
  }

  function sendWA() {
    const msg = encodeURIComponent(`Hola ${formData.clientName}! Te preparé una selección de propiedades. Mirá las opciones acá: ${createdUrl}`)
    window.open(`https://wa.me/54${formData.clientPhone.replace(/\D/g, '')}?text=${msg}`, '_blank')
  }

  // ── Form view ──
  if (showForm) {
    if (createdUrl) {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="w-14 h-14 bg-[#e8f5ee] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Selección creada</h3>
            <p className="text-sm text-gray-500 mb-4">Compartí este link con {formData.clientName}:</p>

            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 mb-4">
              <input readOnly value={createdUrl} className="flex-1 bg-transparent text-sm text-gray-700 outline-none truncate" />
              <button onClick={copyUrl} className="px-3 py-1.5 bg-[#1A5C38] text-white text-xs font-bold rounded-lg">Copiar</button>
            </div>

            {formData.clientPhone && (
              <button onClick={sendWA} className="w-full py-3 bg-[#25D366] text-white font-bold rounded-xl text-sm mb-3">
                Enviar por WhatsApp
              </button>
            )}

            <button
              onClick={() => { setShowForm(false); setCreatedUrl(''); setFormData({ clientName: '', clientPhone: '', agent: 'David Flores', days: 90, note: '', properties: [emptyProp()] }) }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              &larr; Volver al panel
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <button onClick={() => setShowForm(false)} className="text-sm text-gray-400 hover:text-gray-600 mb-2">&larr; Volver</button>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Nueva selección</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required placeholder="Nombre del cliente *" value={formData.clientName} onChange={e => setFormData(d => ({ ...d, clientName: e.target.value }))}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38]" />
            <input placeholder="Teléfono" value={formData.clientPhone} onChange={e => setFormData(d => ({ ...d, clientPhone: e.target.value }))}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={formData.agent} onChange={e => setFormData(d => ({ ...d, agent: e.target.value }))}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38]">
              <option>David Flores</option><option>Laura Flores</option><option>Susana Ippoliti</option>
              <option>Aldana Ruiz</option><option>Carolina Echen</option><option>Gino Pecchenino</option>
              <option>Gisela Ramallo</option><option>Leticia Alexenicer</option><option>Lucia Wilson</option>
              <option>Maria Jose Espilocin</option><option>Mariana Orlate</option><option>Mauro Matteucci</option>
              <option>Micaela Gonzalez</option><option>Julian Ruschneider</option>
            </select>
            <select value={formData.days} onChange={e => setFormData(d => ({ ...d, days: Number(e.target.value) }))}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38]">
              <option value={90}>3 meses</option><option value={180}>6 meses</option><option value={365}>12 meses</option>
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                const name = formData.clientName.trim() || '{{nombre}}'
                setFormData(d => ({ ...d, note: `Hola ${name}! 😊 Te preparé una selección de propiedades pensando en lo que me contaste.\nEntrá al link, mirá las fotos y avisame cuáles te gustan o cuáles querés visitar — con un solo click.\n¡Cualquier consulta estoy acá!` }))
              }}
              className="mb-2 text-[12px] font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer"
              style={{ background: 'rgba(26,92,56,0.08)', color: '#1A5C38', border: '1px dashed #1A5C38' }}
            >
              Usar mensaje sugerido
            </button>
            <textarea placeholder="Mensaje al cliente (opcional)" value={formData.note} onChange={e => setFormData(d => ({ ...d, note: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38] resize-none" rows={3} />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Propiedades</p>
            {formData.properties.map((p, i) => {
              const externa = isExternalUrl(p.url)
              return (
                <div key={i} className="space-y-2">
                  <div className="flex gap-2">
                    <input placeholder="URL de la propiedad *" value={p.url} onChange={e => updateProperty(i, 'url', e.target.value)}
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38]" />
                    <input placeholder="Nota" value={p.note} onChange={e => updateProperty(i, 'note', e.target.value)}
                      className="w-32 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38]" />
                    {formData.properties.length > 1 && (
                      <button type="button" onClick={() => removeProperty(i)} className="px-2 text-red-400 hover:text-red-600 text-lg">&times;</button>
                    )}
                  </div>

                  {externa && (
                    <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(26,92,56,0.04)', border: '1px dashed rgba(26,92,56,0.3)' }}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1A5C38]">
                          Propiedad externa → ficha propia
                        </p>
                        <button type="button" onClick={() => prefetchExterna(i)} disabled={prefetching[i]}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg disabled:opacity-50"
                          style={{ background: '#1A5C38', color: 'white' }}>
                          {prefetching[i] ? 'Trayendo…' : 'Traer datos'}
                        </button>
                      </div>
                      <input placeholder="Título (ej: Casa 3 dorm en Funes) *" value={p.title} onChange={e => updateProperty(i, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A5C38]" />
                      <div className="grid grid-cols-2 gap-2">
                        <select value={p.operacion} onChange={e => updateProperty(i, 'operacion', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A5C38] bg-white">
                          <option>Venta</option><option>Alquiler</option><option>Alquiler temporario</option>
                        </select>
                        <select value={p.tipo} onChange={e => updateProperty(i, 'tipo', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A5C38] bg-white">
                          {TIPOS.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <select value={p.moneda} onChange={e => updateProperty(i, 'moneda', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A5C38] bg-white">
                          <option>USD</option><option>ARS</option>
                        </select>
                        <input placeholder="Precio" inputMode="numeric" value={p.price} onChange={e => updateProperty(i, 'price', e.target.value)}
                          className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A5C38]" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <input placeholder="Amb." inputMode="numeric" value={p.ambientes} onChange={e => updateProperty(i, 'ambientes', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A5C38]" />
                        <input placeholder="Dorm." inputMode="numeric" value={p.rooms} onChange={e => updateProperty(i, 'rooms', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A5C38]" />
                        <input placeholder="Baños" inputMode="numeric" value={p.baths} onChange={e => updateProperty(i, 'baths', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A5C38]" />
                        <input placeholder="m² cub." inputMode="numeric" value={p.area} onChange={e => updateProperty(i, 'area', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A5C38]" />
                        <input placeholder="m² terr." inputMode="numeric" value={p.terreno} onChange={e => updateProperty(i, 'terreno', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A5C38]" />
                      </div>
                      <input placeholder="Ubicación (ej: Funes)" value={p.location} onChange={e => updateProperty(i, 'location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A5C38]" />
                      <textarea placeholder="Descripción (revisá que no tenga datos del colega)" value={p.descripcion} onChange={e => updateProperty(i, 'descripcion', e.target.value)}
                        rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A5C38] resize-none" />
                      <input placeholder="Foto principal (https://...)" value={p.image} onChange={e => updateProperty(i, 'image', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A5C38]" />
                      <textarea placeholder="Fotos adicionales — una URL https por línea (opcional)" value={p.fotosExtra} onChange={e => updateProperty(i, 'fotosExtra', e.target.value)}
                        rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A5C38] resize-none" />
                      <p className="text-[11px] text-gray-400">Se genera una ficha propia en verficha.casa. El cliente nunca ve el portal de origen.</p>
                    </div>
                  )}
                </div>
              )
            })}
            <button type="button" onClick={addProperty} className="text-sm text-[#1A5C38] font-semibold hover:underline">
              + Agregar propiedad
            </button>
          </div>

          {formError && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{formError}</p>
          )}

          <button type="submit" disabled={submitting} className="w-full py-3 bg-[#1A5C38] text-white font-bold rounded-xl text-sm disabled:opacity-50">
            {submitting ? 'Creando ficha y selección…' : 'Crear selección'}
          </button>
        </form>
      </div>
    )
  }

  // ── Main list view ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Selecciones</h2>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[#1A5C38] text-white text-sm font-bold rounded-xl hover:bg-[#0F3A23] transition-colors">
          + Nueva selección
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <span className="text-2xl font-bold text-[#1A5C38] font-numeric block">{activas.length}</span>
          <span className="text-xs text-gray-500">Activas</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <span className="text-2xl font-bold text-blue-600 font-numeric block">{visitasPedidas}</span>
          <span className="text-xs text-gray-500">Visitas pedidas</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <span className={`text-2xl font-bold font-numeric block ${vencenPronto > 0 ? 'text-amber-500' : 'text-gray-300'}`}>{vencenPronto}</span>
          <span className="text-xs text-gray-500">Vencen pronto</span>
        </div>
      </div>

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-gray-400 mb-4">No hay selecciones todavía</p>
          <button onClick={() => setShowForm(true)} className="text-sm text-[#1A5C38] font-bold hover:underline">Crear la primera</button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => {
            const { days: d, expired } = getTimeLeft(s.expiresAt)
            return (
              <div key={s.token} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 relative ${expired ? 'border-l-gray-200 opacity-60' : 'border-l-[#1A5C38]'}`}>
                {/* Delete button */}
                <button
                  onClick={async () => {
                    if (!window.confirm(`¿Eliminar la selección de ${s.clientName}? Esta acción no se puede deshacer.`)) return
                    const res = await fetch(`/api/seleccion/${s.token}`, { method: 'DELETE' })
                    if (res.ok) setSessions(prev => prev.filter(x => x.token !== s.token))
                  }}
                  className="absolute top-3 right-3 p-1 rounded-md transition-all"
                  style={{ color: '#AEAEB2' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#FF3B30'; e.currentTarget.style.background = 'rgba(255,59,48,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#AEAEB2'; e.currentTarget.style.background = 'none' }}
                  title="Eliminar selección"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
                <div className="flex items-start justify-between mb-2 pr-6">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{s.clientName}</h4>
                    <p className="text-xs text-gray-400">{s.agent} · {s.properties.length} propiedades</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${expired ? 'bg-gray-100 text-gray-400' : d <= 2 ? 'bg-amber-100 text-amber-600' : 'bg-[#e8f5ee] text-[#1A5C38]'}`}>
                    {expired ? 'Expirada' : `${d}d`}
                  </span>
                </div>

                {/* Reaction summary */}
                <div className="flex gap-2 mb-3">
                  {s.resumen.liked > 0 && <span className="text-[10px] bg-[#e8f5ee] text-[#1A5C38] px-2 py-0.5 rounded-full">❤️ {s.resumen.liked}</span>}
                  {s.resumen.disliked > 0 && <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full">👎 {s.resumen.disliked}</span>}
                  {s.resumen.wantVisit > 0 && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">✅ {s.resumen.wantVisit}</span>}
                  {s.resumen.hasComments && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">✏️</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a href={`/seleccion/${s.token}`} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                    Ver &rarr;
                  </a>
                  <a
                    href={`https://wa.me/54${s.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${s.clientName}! ¿Pudiste ver la selección de propiedades que te preparamos? ${window?.location?.origin || 'https://siinmobiliaria.com'}/seleccion/${s.token}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded-lg hover:bg-[#1ea952] transition-colors">
                    WA
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Próximamente */}
      <div style={{ marginTop: '32px' }}>
        <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: '#AEAEB2', letterSpacing: '0.06em' }}>
          Próximamente
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              title: 'Estado del lead',
              desc: 'Seguí cada selección: Enviada → Vista → Visita → Operación',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            },
            {
              title: 'Alertas en tiempo real',
              desc: 'Recibí un WhatsApp cuando el cliente reacciona',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
            },
            {
              title: 'Historial por cliente',
              desc: 'Todas las selecciones que le mandaste a cada persona',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
            },
          ].map(f => (
            <div key={f.title} className="p-4 rounded-[14px] cursor-not-allowed" style={{ background: '#F9F9F9', border: '0.5px solid #E5E5E5', filter: 'grayscale(1)', opacity: 0.6 }}>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mb-2" style={{ background: '#F2F2F7', color: '#AEAEB2' }}>Pronto</span>
              <div className="mb-2" style={{ color: '#AEAEB2' }}>{f.icon}</div>
              <h4 className="text-[14px] font-semibold mb-1.5" style={{ color: '#6E6E73' }}>{f.title}</h4>
              <p className="text-[12px] leading-[1.5]" style={{ color: '#AEAEB2' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
