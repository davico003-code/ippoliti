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

// Fila de propiedad en el form. Para externas (Zonaprop) el agente solo pega la
// URL: al importar se mintea una ficha propia en verficha.casa y guardamos su
// slug acá. La selección termina linkeando a verficha, nunca al portal.
type FormProperty = { id: string; url: string; note: string }
const emptyProp = (): FormProperty => ({ id: '', url: '', note: '' })

// Estado de importación de una externa, indexado por URL del aviso.
type ImportState = {
  loading?: boolean
  error?: string
  verfichaUrl?: string   // https://verficha.casa/xxxx
  slug?: string
  snapshot?: ExternaSnapshot
  fotos?: number
}

// Externa = URL válida cuyo host no es siinmobiliaria.com.
function isExternalUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return !!host && !host.includes('siinmobiliaria.com')
  } catch {
    return false
  }
}

// Accesos a los portales (paso 2): abren la búsqueda en otra pestaña. Marcas
// simples en el color de cada portal.
const PORTALES: { name: string; url: string; bg: string; fg: string; mark: string }[] = [
  { name: 'Zonaprop', url: 'https://www.zonaprop.com.ar/', bg: '#FDEAE2', fg: '#F0531C',
    mark: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a4 4 0 0 0-1.2 7.81V13H9v2h1.8v1.6H9v2h1.8V21H13V9.81A4 4 0 0 0 12 2zm0 2.1a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8z"/></svg>' },
  { name: 'Argenprop', url: 'https://www.argenprop.com/', bg: '#2E7D32', fg: '#ffffff',
    mark: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-6 8 6"/><path d="M6 10v9h12v-9"/></svg>' },
  { name: 'Mercado Libre', url: 'https://inmuebles.mercadolibre.com.ar/', bg: '#FFE600', fg: '#2D3277',
    mark: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13l3-2 3 2 2-1 2 1 3-2 3 2"/><path d="M7 11l2-2 2 1 2-1 2 2"/></svg>' },
  { name: 'SI Inmobiliaria', url: 'https://siinmobiliaria.com/propiedades', bg: '#1A5C38', fg: '#ffffff',
    mark: '<span style="font-weight:800;font-size:12px">SI</span>' },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function AgentSeleccionPanel({ initialSessions, agentId }: { initialSessions: Session[]; agentId: string }) {
  const [sessions, setSessions] = useState(initialSessions)
  const [showForm, setShowForm] = useState(false)
  // days fijo (el link queda válido 1 año) — sacamos el selector de vencimiento.
  const [formData, setFormData] = useState({
    clientName: '', clientPhone: '', agent: 'David Flores', days: 365, note: '',
    properties: [emptyProp()] as FormProperty[],
  })
  const [createdUrl, setCreatedUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [imports, setImports] = useState<Record<string, ImportState>>({})
  const [formError, setFormError] = useState('')
  // Carga MANUAL de externas (indexada por fila): pegás el link + armás la PLACA
  // con foto y datos (sin título — se deriva de la zona). No depende del scraping.
  type ManualForm = { open: boolean; precio: string; moneda: string; zona: string; foto: string; dorm: string; banos: string; m2: string; loading?: boolean; error?: string }
  const [manualForms, setManualForms] = useState<Record<number, ManualForm>>({})
  const [notaOpen, setNotaOpen] = useState(false)
  const MAX_PROPS = 6

  function setManual(i: number, patch: Partial<ManualForm>) {
    setManualForms(s => {
      const base: ManualForm = s[i] ?? { open: true, precio: '', moneda: 'USD', zona: '', foto: '', dorm: '', banos: '', m2: '' }
      return { ...s, [i]: { ...base, ...patch } }
    })
  }

  // Crear la ficha con los datos cargados A MANO (mintea en verficha.casa igual que
  // el importar automático, pero sin scraping — usa los overrides manuales).
  async function crearFichaManual(i: number, url: string) {
    const u = url.trim()
    const m = manualForms[i]
    if (!m || (!m.foto.trim() && !m.precio.trim() && !m.zona.trim())) {
      setManual(i, { error: 'Cargá al menos la foto, el precio o la zona' }); return
    }
    setManual(i, { loading: true, error: undefined })
    try {
      const res = await fetch('/api/fichas/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: u,
          manual: {
            precioRaw: m.precio.trim() || undefined,
            moneda: m.moneda || 'USD',
            zona: m.zona.trim() || undefined,
            fotos: m.foto.trim() ? [m.foto.trim()] : undefined,
            dormitorios: m.dorm.trim() || undefined,
            banos: m.banos.trim() || undefined,
            m2cubiertos: m.m2.trim() || undefined,
          },
        }),
      })
      const d = await res.json()
      if (!res.ok) { setManual(i, { loading: false, error: d.error || 'No se pudo crear' }); return }
      setImports(s => ({ ...s, [u]: { verfichaUrl: d.url, slug: d.slug, snapshot: d.snapshot, fotos: d.fotos } }))
      setManual(i, { loading: false, open: false })
    } catch {
      setManual(i, { loading: false, error: 'Error de red. Reintentá.' })
    }
  }

  // Importar automático: pega URL de Zonaprop → mintea ficha propia en
  // verficha.casa (scraping vía Microlink en el server) → devuelve el link limpio.
  async function importarExterna(url: string) {
    const u = url.trim()
    if (!u || !isExternalUrl(u)) return
    setImports(s => ({ ...s, [u]: { loading: true } }))
    try {
      const res = await fetch('/api/fichas/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: u }),
      })
      const d = await res.json()
      if (!res.ok) {
        setImports(s => ({ ...s, [u]: { error: d.error || 'No se pudo importar' } }))
        return
      }
      setImports(s => ({
        ...s,
        [u]: { verfichaUrl: d.url, slug: d.slug, snapshot: d.snapshot, fotos: d.fotos },
      }))
    } catch {
      setImports(s => ({ ...s, [u]: { error: 'Error de red. Reintentá.' } }))
    }
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
    setFormData(d => (d.properties.length >= MAX_PROPS ? d : { ...d, properties: [...d.properties, emptyProp()] }))
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

    setSubmitting(true)
    try {
      const { clientName, clientPhone, agent, days, note } = formData
      const properties = rows.map((p, i) => {
        const base = { id: p.id || `prop-${i}`, url: p.url.trim(), note: p.note.trim() }
        const imp = imports[p.url.trim()]
        if (isExternalUrl(p.url) && imp?.verfichaUrl) {
          // La ficha propia ya se minteó (importar auto o carga manual): linkeamos a verficha.casa.
          return { ...base, url: imp.verfichaUrl, source: 'externa', snapshot: imp.snapshot }
        }
        if (isExternalUrl(p.url)) {
          // Externa SIN importar ni cargar a mano: va con el link al portal y una
          // ficha mínima (el cliente igual la ve, con "Ver propiedad").
          return { ...base, source: 'externa', snapshot: { title: 'Propiedad', image: null, location: '', price: null, rooms: 0, baths: 0, area: 0 } }
        }
        return base
      })

      const res = await fetch('/api/seleccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, clientPhone, agent, days, note, properties }),
      })
      const data = await res.json()
      if (!res.ok || !data?.token) {
        setFormError(data?.error || 'No se pudo crear la selección. Reintentá.')
        return
      }
      const url = `${window.location.origin}/seleccion/${data.token}`
      setCreatedUrl(url)
      // Copiar el link y abrirlo en otra pestaña para que el agente revise.
      navigator.clipboard.writeText(url).catch(() => {})
      window.open(url, '_blank', 'noopener')

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

  // ── Form view ──
  if (showForm) {
    if (createdUrl) {
      return (
        <div className="mx-auto max-w-[600px]">
          <div className="rounded-2xl border border-[#E7ECE8] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f5ee]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h3 className="mb-1.5 text-xl font-bold text-gray-900">¡Selección creada!</h3>
            <p className="mb-4 text-sm text-gray-500">La abrimos en otra pestaña para que <b>revises que esté todo ok</b>. El link ya está copiado.</p>
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-gray-50 p-3">
              <input readOnly value={createdUrl} className="min-w-0 flex-1 truncate bg-transparent text-sm text-gray-700 outline-none" />
              <button onClick={copyUrl} className="shrink-0 rounded-lg bg-[#1A5C38] px-3 py-1.5 text-xs font-bold text-white">Copiar</button>
            </div>
            <div className="flex flex-col gap-2">
              <a href={createdUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#E7ECE8] py-3 text-sm font-bold text-[#1A5C38]">Abrir de nuevo para revisar</a>
              <button
                onClick={() => { setShowForm(false); setCreatedUrl(''); setImports({}); setManualForms({}); setFormData({ clientName: '', clientPhone: '', agent: 'David Flores', days: 365, note: '', properties: [emptyProp()] }) }}
                className="py-2 text-sm text-gray-400 hover:text-gray-600"
              >
                ← Volver al panel
              </button>
            </div>
          </div>
        </div>
      )
    }

    const numDone = formData.properties.filter(p => p.url.trim()).length

    return (
      <div className="mx-auto max-w-[600px]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
        <button onClick={() => setShowForm(false)} className="mb-3 text-sm font-semibold text-[#9aa39c] hover:text-gray-600">← Volver</button>
        <h2 className="text-[23px] font-extrabold tracking-[-0.3px] text-[#1C2620]">Nueva selección</h2>
        <p className="mb-6 mt-0.5 text-[13.5px] text-[#5B6B62]">En 3 pasos: cargás al cliente, buscás las propiedades y pegás los links.</p>

        <form onSubmit={handleSubmit}>
          {/* PASO 1 */}
          <div className="relative pb-6 pl-[52px]">
            <div className="absolute left-[17px] top-[38px] bottom-1.5 w-0.5 bg-[#E7ECE8]" />
            <div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#1A5C38] text-[17px] font-extrabold text-white shadow-[0_4px_10px_rgba(26,92,56,.22)]">1</div>
            <div className="text-[16px] font-extrabold text-[#1C2620]">Llená a tu cliente</div>
            <div className="mb-3 text-[13px] text-[#5B6B62]">Su nombre es lo único que necesitás.</div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input required placeholder="Nombre del cliente *" value={formData.clientName} onChange={e => setFormData(d => ({ ...d, clientName: e.target.value }))}
                className="h-11 flex-1 rounded-xl border-[1.5px] border-[#E7ECE8] px-3.5 text-sm outline-none focus:border-[#1A5C38]" />
              <select value={formData.agent} onChange={e => setFormData(d => ({ ...d, agent: e.target.value }))}
                className="h-11 flex-1 rounded-xl border-[1.5px] border-[#E7ECE8] px-3 text-sm outline-none focus:border-[#1A5C38]">
                <option>David Flores</option><option>Laura Flores</option><option>Susana Ippoliti</option>
                <option>Aldana Ruiz</option><option>Carolina Echen</option><option>Gino Pecchenino</option>
                <option>Gisela Ramallo</option><option>Leticia Alexenicer</option><option>Lucia Wilson</option>
                <option>Maria Jose Espilocin</option><option>Mariana Orlate</option><option>Mauro Matteucci</option>
                <option>Micaela Gonzalez</option><option>Julian Ruschneider</option>
              </select>
            </div>
          </div>

          {/* PASO 2 */}
          <div className="relative pb-6 pl-[52px]">
            <div className="absolute left-[17px] top-[38px] bottom-1.5 w-0.5 bg-[#E7ECE8]" />
            <div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#1A5C38] text-[17px] font-extrabold text-white shadow-[0_4px_10px_rgba(26,92,56,.22)]">2</div>
            <div className="text-[16px] font-extrabold text-[#1C2620]">Buscá las propiedades</div>
            <div className="mb-3 text-[13px] text-[#5B6B62]">Abrí los sitios en otra pestaña, buscá lo que le sirve y copiá el link de cada aviso.</div>
            <div className="grid grid-cols-2 gap-2.5">
              {PORTALES.map(pt => (
                <a key={pt.name} href={pt.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-[#E7ECE8] bg-white px-3 py-2.5 text-[13.5px] font-bold text-[#1C2620] transition hover:border-[#d3e6da] hover:shadow-sm">
                  <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg" style={{ background: pt.bg, color: pt.fg }} dangerouslySetInnerHTML={{ __html: pt.mark }} />
                  <span className="flex-1 leading-tight">{pt.name}</span>
                  <span className="text-[#9aa39c]">↗</span>
                </a>
              ))}
            </div>
          </div>

          {/* PASO 3 */}
          <div className="relative pb-2 pl-[52px]">
            <div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#1A5C38] text-[17px] font-extrabold text-white shadow-[0_4px_10px_rgba(26,92,56,.22)]">3</div>
            <div className="text-[16px] font-extrabold text-[#1C2620]">Pegá los links que encontraste</div>
            <div className="mb-3 text-[13px] text-[#5B6B62]">Pueden ser de cualquiera de los sitios. Uno por fila.</div>
            <div className="mb-3 flex items-center gap-2 rounded-[10px] border border-[#d3e6da] bg-[#EAF3EE] px-3 py-2 text-[12.5px] font-semibold text-[#123f27]">
              💡 Hasta {MAX_PROPS} propiedades — más de eso marea al cliente. {numDone > 0 && <span className="ml-auto opacity-70">{numDone}/{MAX_PROPS}</span>}
            </div>

            {formData.properties.map((p, i) => {
              const externa = isExternalUrl(p.url)
              const imp = imports[p.url.trim()]
              const mf = manualForms[i] ?? { open: false, precio: '', moneda: 'USD', zona: '', foto: '', dorm: '', banos: '', m2: '' }
              return (
                <div key={i}>
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-[#EAF3EE] text-[12.5px] font-extrabold text-[#1A5C38]">{i + 1}</span>
                    <input placeholder={i === 0 ? 'https://www.zonaprop.com.ar/…-casa-en-funes-51234567.html' : 'Pegá otro link…'}
                      value={p.url} onChange={e => updateProperty(i, 'url', e.target.value)}
                      onBlur={() => { const u = p.url.trim(); if (isExternalUrl(u) && !imports[u]) importarExterna(u) }}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const u = p.url.trim(); if (isExternalUrl(u) && !imports[u]) importarExterna(u) } }}
                      className="h-11 flex-1 rounded-xl border-[1.5px] border-[#E7ECE8] px-3.5 text-sm italic text-[#1C2620] outline-none placeholder:not-italic placeholder:text-[#c8d1ca] focus:border-[#1A5C38]"
                      style={p.url ? { fontStyle: 'normal' } : undefined} />
                    {formData.properties.length > 1 && (
                      <button type="button" onClick={() => removeProperty(i)} className="shrink-0 rounded-lg px-2 text-lg text-[#c3ccc5] hover:bg-[#fdeceb] hover:text-red-500">×</button>
                    )}
                  </div>

                  {externa && (
                    <div className="mb-2.5 ml-[35px] rounded-xl border border-[#d3e6da] bg-white p-3">
                      {imp?.verfichaUrl ? (
                        <div className="flex items-center gap-3">
                          {imp.snapshot?.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imp.snapshot.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-bold text-gray-900">{imp.snapshot?.title || 'Placa lista'}</p>
                            <p className="truncate text-[12px] text-[#1A5C38]">✓ {imp.snapshot?.price ? `${imp.snapshot.price} · ` : ''}{imp.fotos || 0} fotos · verficha.casa/{imp.slug}</p>
                          </div>
                          <a href={imp.verfichaUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[11px] font-bold text-[#1A5C38] hover:underline">Ver</a>
                        </div>
                      ) : imp?.loading ? (
                        <div className="flex items-center gap-2.5 text-[13px] font-semibold text-[#1A5C38]">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d3e6da] border-t-[#1A5C38]" /> Leyendo los datos del portal…
                        </div>
                      ) : mf.open ? (
                        // Fallback manual (solo si el portal no dejó leer).
                        <div className="space-y-2">
                          <p className="text-[12px] text-[#9aa39c]">El portal no dejó leer. Cargá los datos a mano:</p>
                          <input placeholder="Link de la foto" value={mf.foto} onChange={e => setManual(i, { foto: e.target.value })}
                            className="w-full rounded-lg border-[1.5px] border-[#E7ECE8] px-3 py-2 text-[13px] outline-none focus:border-[#1A5C38]" />
                          <div className="flex gap-2">
                            <input placeholder="Precio (ej: 420000)" value={mf.precio} onChange={e => setManual(i, { precio: e.target.value })}
                              className="flex-1 rounded-lg border-[1.5px] border-[#E7ECE8] px-3 py-2 text-[13px] outline-none focus:border-[#1A5C38]" />
                            <select value={mf.moneda} onChange={e => setManual(i, { moneda: e.target.value })}
                              className="w-[80px] rounded-lg border-[1.5px] border-[#E7ECE8] px-2 py-2 text-[13px] outline-none focus:border-[#1A5C38]">
                              <option value="USD">USD</option><option value="ARS">ARS</option>
                            </select>
                          </div>
                          <input placeholder="Zona / barrio (ubica el pin del mapa)" value={mf.zona} onChange={e => setManual(i, { zona: e.target.value })}
                            className="w-full rounded-lg border-[1.5px] border-[#E7ECE8] px-3 py-2 text-[13px] outline-none focus:border-[#1A5C38]" />
                          <div className="flex gap-2">
                            <input placeholder="Dorm." value={mf.dorm} onChange={e => setManual(i, { dorm: e.target.value })}
                              className="flex-1 rounded-lg border-[1.5px] border-[#E7ECE8] px-3 py-2 text-[13px] outline-none focus:border-[#1A5C38]" />
                            <input placeholder="Baños" value={mf.banos} onChange={e => setManual(i, { banos: e.target.value })}
                              className="flex-1 rounded-lg border-[1.5px] border-[#E7ECE8] px-3 py-2 text-[13px] outline-none focus:border-[#1A5C38]" />
                            <input placeholder="m²" value={mf.m2} onChange={e => setManual(i, { m2: e.target.value })}
                              className="flex-1 rounded-lg border-[1.5px] border-[#E7ECE8] px-3 py-2 text-[13px] outline-none focus:border-[#1A5C38]" />
                          </div>
                          {mf.error && <p className="text-[12px] text-red-600">{mf.error}</p>}
                          <button type="button" onClick={() => crearFichaManual(i, p.url)} disabled={mf.loading}
                            className="rounded-lg px-3.5 py-1.5 text-[12px] font-bold text-white disabled:opacity-50" style={{ background: '#1A5C38' }}>
                            {mf.loading ? 'Creando…' : 'Crear placa'}
                          </button>
                        </div>
                      ) : imp?.error ? (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[12px] text-red-600">No se pudo leer el aviso. Reintentá o cargalo a mano.</p>
                          <div className="flex shrink-0 gap-2">
                            <button type="button" onClick={() => importarExterna(p.url)} className="rounded-lg px-3 py-1.5 text-[12px] font-bold text-white" style={{ background: '#1A5C38' }}>Reintentar</button>
                            <button type="button" onClick={() => setManual(i, { open: true })} className="rounded-lg border px-3 py-1.5 text-[12px] font-bold" style={{ borderColor: '#1A5C38', color: '#1A5C38' }}>Cargar a mano</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[12px] text-[#9aa39c]">Al pegar el link leemos los datos solos. Tocá afuera o Enter si no arrancó.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {formData.properties.length < MAX_PROPS && (
              <button type="button" onClick={addProperty} className="mt-1 w-full rounded-xl border-[1.5px] border-dashed border-[#d3e6da] bg-white py-2.5 text-[13.5px] font-bold text-[#1A5C38]">+ Agregar otra</button>
            )}
          </div>

          {/* Mensaje opcional (plegado) */}
          <div className="mt-2 overflow-hidden rounded-2xl border border-[#E7ECE8] bg-white">
            <button type="button" onClick={() => setNotaOpen(o => !o)} className="flex w-full items-center justify-between px-4 py-3 text-[13.5px] font-bold">
              <span>Mensaje al cliente <span className="ml-1 rounded-full border border-[#E7ECE8] bg-[#FBFAF8] px-2 py-0.5 text-[11px] font-semibold text-[#9aa39c]">opcional</span></span>
              <span className="text-[#9aa39c]">{notaOpen ? '▴' : '▾'}</span>
            </button>
            {notaOpen && (
              <div className="px-4 pb-4">
                <button type="button"
                  onClick={() => { const name = formData.clientName.trim() || 'nombre'; setFormData(d => ({ ...d, note: `Hola ${name}! Te preparé una selección de propiedades pensando en lo que buscás. Entrá al link, mirá las fotos y avisame cuáles te gustan o querés visitar.` })) }}
                  className="mb-2 inline-block rounded-lg border border-dashed border-[#d3e6da] bg-[#EAF3EE] px-2.5 py-1 text-[12px] font-bold text-[#1A5C38]">✨ Usar mensaje sugerido</button>
                <textarea placeholder="Hola! Te preparé unas opciones…" value={formData.note} onChange={e => setFormData(d => ({ ...d, note: e.target.value }))}
                  className="w-full resize-none rounded-xl border-[1.5px] border-[#E7ECE8] px-3.5 py-2.5 text-sm outline-none focus:border-[#1A5C38]" rows={2} />
              </div>
            )}
          </div>

          {formError && <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[13px] text-red-600">{formError}</p>}

          <button type="submit" disabled={submitting}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#1A5C38] py-4 text-[15.5px] font-extrabold text-white shadow-[0_8px_20px_rgba(26,92,56,.24)] disabled:opacity-50">
            {!submitting && <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" /></svg>}
            {submitting ? 'Creando…' : 'Crear, copiar link y abrir para revisar'}
          </button>
          <p className="mt-2.5 text-center text-[12.5px] text-[#5B6B62]">Se abre en otra pestaña — revisá que esté todo ok antes de mandárselo al cliente.</p>
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
            const initials = s.clientName.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?'
            const r = s.resumen
            const hasReactions = r.liked > 0 || r.disliked > 0 || r.wantVisit > 0 || r.hasComments
            return (
              <div
                key={s.token}
                className={`group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${expired ? 'opacity-60' : ''}`}
              >
                {/* Encabezado: avatar + nombre + plazo + borrar */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{
                      background: expired ? '#F2F2F7' : '#e8f5ee',
                      color: expired ? '#AEAEB2' : '#1A5C38',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-[15px] truncate">{s.clientName}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${expired ? 'bg-gray-100 text-gray-400' : d <= 2 ? 'bg-amber-100 text-amber-600' : 'bg-[#e8f5ee] text-[#1A5C38]'}`}>
                        {expired ? 'Expirada' : `${d} días`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {s.properties.length} {s.properties.length === 1 ? 'propiedad' : 'propiedades'} · {s.agent}
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      if (!window.confirm(`¿Eliminar la selección de ${s.clientName}? Esta acción no se puede deshacer.`)) return
                      const res = await fetch(`/api/seleccion/${s.token}`, { method: 'DELETE' })
                      if (res.ok) setSessions(prev => prev.filter(x => x.token !== s.token))
                    }}
                    className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Eliminar selección"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>

                {/* Reacciones del cliente */}
                {hasReactions && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {r.liked > 0 && <span className="text-[11px] font-medium bg-[#e8f5ee] text-[#1A5C38] px-2.5 py-1 rounded-full">❤️ {r.liked} me gusta</span>}
                    {r.wantVisit > 0 && <span className="text-[11px] font-medium bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">✅ {r.wantVisit} {r.wantVisit === 1 ? 'visita' : 'visitas'}</span>}
                    {r.disliked > 0 && <span className="text-[11px] font-medium bg-red-50 text-red-500 px-2.5 py-1 rounded-full">👎 {r.disliked}</span>}
                    {r.hasComments && <span className="text-[11px] font-medium bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">✏️ Comentó</span>}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 mt-3">
                  <a
                    href={`/seleccion/${s.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-2.5 bg-gray-50 text-gray-700 text-[13px] font-semibold rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    Ver selección &rarr;
                  </a>
                  <a
                    href={`https://wa.me/54${s.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${s.clientName}! ¿Pudiste ver la selección de propiedades que te preparamos? ${window?.location?.origin || 'https://siinmobiliaria.com'}/seleccion/${s.token}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#25D366] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1ea952] transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.01c-.24.68-1.42 1.31-1.95 1.36-.5.05-.96.24-3.23-.67-2.73-1.08-4.45-3.86-4.58-4.04-.13-.18-1.1-1.46-1.1-2.79 0-1.33.7-1.98.94-2.25.24-.27.53-.34.71-.34.18 0 .35 0 .51.01.16.01.38-.06.6.46.24.55.79 1.9.86 2.04.07.14.12.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.53 1.9 1.05.93 1.94 1.22 2.21 1.36.27.14.43.12.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.6-.14.24.09 1.55.73 1.81.86.27.14.45.2.51.31.07.11.07.64-.17 1.32z"/></svg>
                    WhatsApp
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
