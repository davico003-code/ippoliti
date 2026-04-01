'use client'

import { useState, useEffect } from 'react'
import { getTimeLeft } from '@/lib/seleccion'

interface Session {
  token: string; clientName: string; clientPhone: string; agent: string
  properties: { id: string; url: string; note: string }[]
  createdAt: string; expiresAt: string; note: string
  resumen: { liked: number; disliked: number; wantVisit: number; hasComments: boolean }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function AgentSeleccionPanel({ initialSessions, agentId }: { initialSessions: Session[]; agentId: string }) {
  const [sessions, setSessions] = useState(initialSessions)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    clientName: '', clientPhone: '', agent: 'David Flores', days: 90, note: '',
    properties: [{ id: '', url: '', note: '' }],
  })
  const [createdUrl, setCreatedUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
    setFormData(d => ({ ...d, properties: [...d.properties, { id: '', url: '', note: '' }] }))
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
    if (!formData.clientName.trim() || !formData.properties.some(p => p.url.trim())) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/seleccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          properties: formData.properties.filter(p => p.url.trim()).map((p, i) => ({
            ...p,
            id: p.id || `prop-${i}`,
          })),
        }),
      })
      const data = await res.json()
      setCreatedUrl(`${window.location.origin}/seleccion/${data.token}`)

      // Refresh list
      const listRes = await fetch('/api/seleccion?agent=all')
      if (listRes.ok) setSessions(await listRes.json())
    } catch {}
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
              onClick={() => { setShowForm(false); setCreatedUrl(''); setFormData({ clientName: '', clientPhone: '', agent: 'David Flores', days: 90, note: '', properties: [{ id: '', url: '', note: '' }] }) }}
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
            {formData.properties.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder="URL de la propiedad *" value={p.url} onChange={e => updateProperty(i, 'url', e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38]" />
                <input placeholder="Nota" value={p.note} onChange={e => updateProperty(i, 'note', e.target.value)}
                  className="w-32 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1A5C38]" />
                {formData.properties.length > 1 && (
                  <button type="button" onClick={() => removeProperty(i)} className="px-2 text-red-400 hover:text-red-600 text-lg">&times;</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addProperty} className="text-sm text-[#1A5C38] font-semibold hover:underline">
              + Agregar propiedad
            </button>
          </div>

          <button type="submit" disabled={submitting} className="w-full py-3 bg-[#1A5C38] text-white font-bold rounded-xl text-sm disabled:opacity-50">
            {submitting ? 'Creando...' : 'Crear selección'}
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
