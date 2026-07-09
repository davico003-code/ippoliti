'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  CheckCircle2,
  CircleUser,
  ExternalLink,
  Loader2,
  Link2,
  Plus,
  MessageCircle,
  Search,
  X,
} from 'lucide-react'

interface ExternaSnapshot {
  title: string; image: string | null; location: string
  price: string | null; rooms: number; baths: number; area: number
}

const THEME = {
  text: '#111827',
  muted: '#6B7280',
  mutedStrong: '#4B5563',
  border: '#D1D5DB',
  borderStrong: '#B9C2CD',
  surface: '#F4F6F8',
  surfaceSoft: '#EAEEF3',
  accent: '#111827',
  accentPale: '#E6EAEE',
  accentText: '#111827',
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

type InitialContact = {
  contactId?: string
  contactSource?: string
  name?: string
  phone?: string
  email?: string
}

// URLs que deben terminar como ficha neutral en verficha.casa.
function isExternalUrl(url: string): boolean {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
    if (host.includes('verficha.casa')) return false
    if (host.includes('siinmobiliaria.com')) return u.pathname.includes('/propiedades/')
    return !!host
  } catch {
    return false
  }
}

function normalizePastedUrl(value: string): string {
  const clean = value.trim()
  const match = clean.match(/https?:\/\/[^\s"'<>]+/i)
  return (match?.[0] || clean).replace(/[),.;]+$/g, '')
}

function isFullUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim())
}

function isImportableUrl(url: string): boolean {
  return isFullUrl(url) && isExternalUrl(url)
}

// Accesos a los portales (paso 2): abren la búsqueda en otra pestaña.
const PORTALES: { name: string; url: string; logo: string }[] = [
  { name: 'Zonaprop', url: 'https://www.zonaprop.com.ar/', logo: '/portal-logos/zonaprop.jpg' },
  { name: 'Argenprop', url: 'https://www.argenprop.com/', logo: '/portal-logos/argenprop.jpg' },
  { name: 'Mercado Libre', url: 'https://inmuebles.mercadolibre.com.ar/', logo: '/portal-logos/mercadolibre.png' },
  { name: 'SI INMOBILIARIA', url: 'https://siinmobiliaria.com/propiedades', logo: '/portal-logos/si-inmobiliaria.png' },
]

export default function AgentSeleccionPanel({ initialContact }: { initialContact?: InitialContact }) {
  // days fijo (el link queda válido 1 año) — sacamos el selector de vencimiento.
  const [formData, setFormData] = useState({
    clientName: initialContact?.name || '',
    clientPhone: initialContact?.phone || '',
    clientEmail: initialContact?.email || '',
    contactId: initialContact?.contactId || '',
    contactSource: initialContact?.contactSource || '',
    agent: 'David Flores',
    days: 365,
    note: '',
    properties: [emptyProp()] as FormProperty[],
  })
  const [createdUrl, setCreatedUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [imports, setImports] = useState<Record<string, ImportState>>({})
  const [formError, setFormError] = useState('')
  const autoImportTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const importsRef = useRef(imports)
  // Carga MANUAL de externas (indexada por fila): pegás el link + armás la PLACA
  // con foto y datos (sin título — se deriva de la zona). No depende del scraping.
  type ManualForm = { open: boolean; precio: string; moneda: string; zona: string; foto: string; dorm: string; banos: string; m2: string; loading?: boolean; error?: string }
  const [manualForms, setManualForms] = useState<Record<number, ManualForm>>({})
  const MAX_PROPS = 6

  const setManual = useCallback((i: number, patch: Partial<ManualForm>) => {
    setManualForms(s => {
      const base: ManualForm = s[i] ?? { open: true, precio: '', moneda: 'USD', zona: '', foto: '', dorm: '', banos: '', m2: '' }
      return { ...s, [i]: { ...base, ...patch } }
    })
  }, [])

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
  useEffect(() => {
    importsRef.current = imports
  }, [imports])

  const importarExterna = useCallback(async (url: string) => {
    const u = normalizePastedUrl(url)
    if (!u || !isImportableUrl(u)) return null
    const existing = importsRef.current[u]
    if (existing?.loading || existing?.verfichaUrl) return existing
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
        return null
      }
      const next = { verfichaUrl: d.url, slug: d.slug, snapshot: d.snapshot, fotos: d.fotos }
      setImports(s => ({ ...s, [u]: next }))
      return next
    } catch {
      setImports(s => ({ ...s, [u]: { error: 'Error de red. Reintentá.' } }))
      return null
    }
  }, [])

  useEffect(() => {
    formData.properties.forEach((p, i) => {
      const u = normalizePastedUrl(p.url)
      clearTimeout(autoImportTimers.current[i])
      if (!isImportableUrl(u) || imports[u]?.loading || imports[u]?.verfichaUrl) return
      autoImportTimers.current[i] = setTimeout(() => {
        importarExterna(u)
      }, 650)
    })
    const timers = autoImportTimers.current
    return () => {
      Object.values(timers).forEach(clearTimeout)
    }
  }, [formData.properties, imports, importarExterna])

  function addProperty() {
    setFormData(d => (d.properties.length >= MAX_PROPS ? d : { ...d, properties: [...d.properties, emptyProp()] }))
  }

  function updateProperty(i: number, field: string, val: string) {
    const nextVal = field === 'url' ? normalizePastedUrl(val) : val
    setFormData(d => {
      const props = [...d.properties]
      props[i] = { ...props[i], [field]: nextVal }
      // Auto-generate id from url
      if (field === 'url') {
        try { props[i].id = new URL(nextVal).pathname.split('/').filter(Boolean).at(-1) || `prop-${i}` } catch { props[i].id = `prop-${i}` }
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

    const rows = formData.properties
      .map(p => ({ ...p, url: normalizePastedUrl(p.url) }))
      .filter(p => p.url.trim())

    const invalidRows = rows.filter(p => !isFullUrl(p.url))
    if (invalidRows.length > 0) {
      setFormError('Hay una fila que no es un link completo. Pegá la URL completa que empieza con https://.')
      setSubmitting(false)
      return
    }

    setSubmitting(true)
    try {
      const { clientName, clientPhone, clientEmail, contactId, contactSource, agent, days, note } = formData
      const pendingExternal = rows.filter(p => isImportableUrl(p.url) && !imports[p.url]?.verfichaUrl)
      const resolvedImports: Record<string, ImportState> = { ...imports }
      if (pendingExternal.length > 0) {
        const imported = await Promise.all(pendingExternal.map(async p => {
          const result = await importarExterna(p.url)
          if (result?.verfichaUrl) resolvedImports[p.url] = result
          return result
        }))
        if (imported.some(x => !x?.verfichaUrl)) {
          setFormError('Hay links externos que todavía no se pudieron convertir a ficha neutral. Reintentá o revisá que sean links completos de una propiedad.')
          setSubmitting(false)
          return
        }
      }

      const properties = rows.map((p, i) => {
        const base = { id: p.id || `prop-${i}`, url: p.url.trim(), note: p.note.trim() }
        const imp = resolvedImports[p.url.trim()]
        if (isImportableUrl(p.url) && imp?.verfichaUrl) {
          // La ficha propia ya se minteó (importar auto o carga manual): linkeamos a verficha.casa.
          return { ...base, url: imp.verfichaUrl, source: 'externa', snapshot: imp.snapshot }
        }
        return base
      })

      const res = await fetch('/api/seleccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientPhone,
          clientEmail,
          contactId,
          contactSource,
          agent,
          days,
          note,
          properties,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.token) {
        setFormError(data?.error || 'No se pudo crear la selección. Reintentá.')
        setSubmitting(false)
        return
      }
      const url = `${window.location.origin}/seleccion/${data.token}`
      setCreatedUrl(url)
      // Copiar el link y abrirlo en otra pestaña para que el agente revise.
      navigator.clipboard.writeText(url).catch(() => {})
      window.open(url, '_blank', 'noopener')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Algo salió mal. Reintentá.')
      setSubmitting(false)
      return
    }
    setSubmitting(false)
  }

  function copyUrl() {
    navigator.clipboard.writeText(createdUrl)
  }

  // ── Vista de éxito o formulario ──
    if (createdUrl) {
      return (
        <div className="mx-auto max-w-[600px]">
          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm" style={{ borderColor: THEME.border }}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: THEME.surface }}>
              <CheckCircle2 className="h-6 w-6" style={{ color: THEME.accent }} />
            </div>
            <h3 className="mb-1.5 text-xl font-bold" style={{ color: THEME.text }}>¡Selección lista!</h3>
            <p className="mb-4 text-sm" style={{ color: THEME.muted }}>La abrimos en otra pestaña para que <b>revises que esté todo ok</b>. Si vino desde una ficha o consulta, queda como selección activa permanente de ese contacto.</p>
            <div className="mb-4 flex items-center gap-2 rounded-xl p-3" style={{ backgroundColor: THEME.surface }}>
              <input readOnly value={createdUrl} className="min-w-0 flex-1 truncate bg-transparent text-sm outline-none" style={{ color: THEME.text }} />
              <button onClick={copyUrl} className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ backgroundColor: THEME.accent }}>
                Copiar
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={createdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl py-3 text-sm font-bold"
                style={{ border: `1px solid ${THEME.border}`, color: THEME.accent }}
              >
                Abrir de nuevo para revisar
              </a>
              <button
                onClick={() => { setCreatedUrl(''); setImports({}); setManualForms({}); setFormData({ clientName: '', clientPhone: '', clientEmail: '', contactId: '', contactSource: '', agent: 'David Flores', days: 365, note: '', properties: [emptyProp()] }) }}
                className="py-2 text-sm text-gray-400 hover:text-gray-600"
              >
                Crear otra selección
              </button>
            </div>
          </div>
        </div>
      )
    }

    const numDone = formData.properties.filter(p => p.url.trim()).length

    const stepLabel = (n: number, icon: React.ReactNode, title: string, desc: string) => (
      <div className="relative mb-9 flex items-start gap-3">
        <span
          className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold text-white"
          style={{
            backgroundColor: n === 1 ? THEME.accent : THEME.accentPale,
            color: n === 1 ? '#fff' : THEME.mutedStrong,
            boxShadow: n === 1 ? '0 4px 10px rgba(17,24,39,.25)' : 'none',
          }}
        >
          {n}
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-white text-[16px]" style={{ borderColor: THEME.border }}>
          {icon}
        </span>
        <div className="pt-0.5">
          <div className="text-[15px] font-extrabold leading-tight" style={{ color: THEME.text }}>{title}</div>
          <div className="mt-1 text-[12.5px] leading-[1.5]" style={{ color: THEME.muted }}>{desc}</div>
        </div>
      </div>
    )
    const panelHead = (icon: React.ReactNode, title: string, right?: React.ReactNode, sub?: string) => (
      <div className="mb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: THEME.surface, color: THEME.text }}>{icon}</span>
          <h3 className="text-[15.5px] font-extrabold" style={{ color: THEME.text }}>{title}</h3>
          {right && <span className="ml-auto text-[12px] font-bold" style={{ color: THEME.muted }}>{right}</span>}
        </div>
        {sub && <p className="mt-1 pl-[42px] text-[12.5px]" style={{ color: THEME.muted }}>{sub}</p>}
      </div>
    )
    const IcPersona = <CircleUser className="w-[17px] h-[17px]" />
    const IcBuscar = <Search className="w-[17px] h-[17px]" />
    const IcLink = <Link2 className="w-[17px] h-[17px]" />
    const IcChat = <MessageCircle className="w-[17px] h-[17px]" />

    return (
      <div className="mx-auto max-w-[1120px]" style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}>
        {/* Header + ilustración */}
        <div className="relative overflow-hidden">
          <h2 className="text-[28px] font-extrabold tracking-[-0.4px]" style={{ color: THEME.text }}>Nueva selección</h2>
          <p className="mt-1 text-[14px]" style={{ color: THEME.muted }}>En 3 pasos: cargás al cliente, buscás las propiedades y pegás los links.</p>
          {formData.contactId && (
            <div className="mt-4 inline-flex rounded-xl border px-3 py-2 text-[12.5px] font-bold" style={{ borderColor: THEME.border, backgroundColor: THEME.surface, color: THEME.text }}>
              Selección activa vinculada a este contacto
            </div>
          )}
          <svg className="pointer-events-none absolute right-0 top-[-16px] hidden h-[150px] w-[360px] lg:block" viewBox="0 0 360 150" fill="none" aria-hidden>
            <path d="M0 118 Q90 92 190 112 T360 104 V150 H0 Z" fill={THEME.surface} />
            <path d="M120 150 V96 L166 70 L212 96 V150 Z" fill="#fff" stroke={THEME.accent} strokeWidth="2" strokeLinejoin="round" />
            <path d="M166 70 L112 100 M166 70 L220 100" stroke={THEME.accent} strokeWidth="2" strokeLinecap="round" />
            <rect x="154" y="112" width="24" height="30" fill={THEME.surface} stroke={THEME.accent} strokeWidth="2" />
            <rect x="188" y="108" width="16" height="14" fill={THEME.surface} stroke={THEME.accent} strokeWidth="2" />
            <g stroke={THEME.borderStrong} strokeWidth="2" fill={THEME.surfaceSoft}>
              <path d="M262 150 V116" /><circle cx="262" cy="104" r="16" />
              <path d="M300 150 V124" /><circle cx="300" cy="114" r="12" />
              <path d="M92 150 V128" /><circle cx="92" cy="118" r="13" />
            </g>
          </svg>
        </div>

        <form onSubmit={handleSubmit} className="mt-7">
          <div className="grid gap-x-8 gap-y-5 lg:grid-cols-[248px_1fr]">
            {/* Rail de pasos (izquierda) */}
            <div className="relative hidden flex-col lg:flex">
              <span className="absolute left-[17px] top-5 bottom-[150px] w-0.5" style={{ backgroundColor: THEME.border }} />
              {stepLabel(1, IcPersona, 'Llená a tu cliente', 'Si viene desde una ficha o consulta, ya queda vinculado automáticamente.')}
              {stepLabel(2, IcBuscar, 'Buscá las propiedades', 'Abrí los sitios en otra pestaña, buscá lo que le sirve y copiá el link de cada aviso.')}
              {stepLabel(3, IcLink, 'Pegá los links que encontraste', 'Pueden ser de cualquiera de los sitios. Uno por fila.')}
              <div className="mt-auto flex flex-col gap-1.5 rounded-2xl p-4" style={{ backgroundColor: THEME.surface }}>
                <span className="text-[13px] font-extrabold" style={{ color: THEME.text }}>✦ Hasta {MAX_PROPS} propiedades</span>
                <span className="text-[12.5px] leading-[1.5]" style={{ color: THEME.muted }}>— más de eso marea al cliente.</span>
              </div>
            </div>

            {/* Paneles (derecha) */}
            <div className="flex flex-col gap-5">
              {/* PANEL 1 */}
              <div className="rounded-2xl border bg-white p-5" style={{ borderColor: THEME.border }}>
                {panelHead(IcPersona, '¿A quién le armamos la selección?')}
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <input required placeholder="Nombre del cliente" value={formData.clientName} onChange={e => setFormData(d => ({ ...d, clientName: e.target.value }))}
                    className="h-11 flex-1 rounded-xl border-[1.5px] bg-white px-3.5 text-sm outline-none placeholder:text-[#9ca3af]"
                    style={{ borderColor: THEME.border, color: THEME.text }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.accent }} />
                  <input placeholder="WhatsApp o teléfono" value={formData.clientPhone} onChange={e => setFormData(d => ({ ...d, clientPhone: e.target.value }))}
                    className="h-11 flex-1 rounded-xl border-[1.5px] bg-white px-3.5 text-sm outline-none placeholder:text-[#9ca3af]"
                    style={{ borderColor: THEME.border, color: THEME.text }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.accent }} />
                  <select value={formData.agent} onChange={e => setFormData(d => ({ ...d, agent: e.target.value }))}
                    className="h-11 flex-1 rounded-xl border-[1.5px] bg-white px-3 text-sm outline-none"
                    style={{ borderColor: THEME.border, color: THEME.text }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = THEME.accent }}>
                    <option>David Flores</option><option>Laura Flores</option><option>Susana Ippoliti</option>
                    <option>Aldana Ruiz</option><option>Carolina Echen</option><option>Gino Pecchenino</option>
                    <option>Gisela Ramallo</option><option>Leticia Alexenicer</option><option>Lucia Wilson</option>
                    <option>Maria Jose Espilocin</option><option>Mariana Orlate</option><option>Mauro Matteucci</option>
                    <option>Micaela Gonzalez</option><option>Julian Ruschneider</option>
                  </select>
                </div>
              </div>

              {/* PANEL 2 */}
              <div className="rounded-2xl border bg-white p-5" style={{ borderColor: THEME.border }}>
                {panelHead(IcBuscar, 'Elegí dónde buscar', undefined, 'Abrí los sitios en otra pestaña para buscar y copiar los links.')}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {PORTALES.map(pt => (
                    <a key={pt.name} href={pt.url} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-2.5 rounded-xl border-[1.5px] bg-white px-3 py-2.5 text-[13.5px] font-bold transition duration-150"
                      style={{ borderColor: THEME.border, color: THEME.text }}
                    >
                      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg overflow-hidden border bg-white" style={{ borderColor: THEME.border }}>
                        <Image
                          src={pt.logo}
                          alt={`${pt.name} logo`}
                          width={20}
                          height={20}
                          className="h-5 w-auto object-contain"
                          style={{ filter: pt.name === 'Mercado Libre' ? 'brightness(0.95)' : undefined }}
                        />
                      </span>
                      <span className="flex-1 leading-tight">{pt.name}</span>
                      <span style={{ color: THEME.muted }}>
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* PANEL 3 */}
              <div className="rounded-2xl border bg-white p-5" style={{ borderColor: THEME.border }}>
                {panelHead(IcLink, 'Pegá los links que encontraste', `${numDone}/${MAX_PROPS}`, 'Pueden ser de cualquiera de los sitios. Uno por fila.')}

            {formData.properties.map((p, i) => {
              const normalizedUrl = normalizePastedUrl(p.url)
              const externa = isImportableUrl(normalizedUrl)
              const imp = imports[normalizedUrl]
              const mf = manualForms[i] ?? { open: false, precio: '', moneda: 'USD', zona: '', foto: '', dorm: '', banos: '', m2: '' }
                  return (
                <div key={i}>
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg text-[12.5px] font-extrabold" style={{ backgroundColor: THEME.surface, color: THEME.accent }}>{i + 1}</span>
                    <input placeholder={i === 0 ? 'https://www.zonaprop.com.ar/…-casa-en-funes-51234567.html' : 'Pegá otro link…'}
                      value={p.url} onChange={e => updateProperty(i, 'url', e.target.value)}
                      onBlur={() => { if (isImportableUrl(normalizedUrl) && !imports[normalizedUrl]) importarExterna(normalizedUrl) }}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (isImportableUrl(normalizedUrl) && !imports[normalizedUrl]) importarExterna(normalizedUrl) } }}
                      className="h-11 flex-1 rounded-xl border-[1.5px] bg-white px-3.5 text-sm italic outline-none placeholder:not-italic"
                      style={{ borderColor: THEME.border, color: THEME.text, ...(p.url ? { fontStyle: 'normal' } : undefined) }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = THEME.accent }} />
                    {formData.properties.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProperty(i)}
                        className="shrink-0 rounded-lg border border-transparent p-2 text-[#c3ccc5] hover:bg-[#fee2e2] hover:text-red-500"
                        style={{ color: THEME.muted }}
                        aria-label={`Quitar propiedad ${i + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {externa && (
                    <div className="mb-2.5 ml-[35px] rounded-xl bg-white p-3" style={{ border: `1px solid ${THEME.borderStrong}` }}>
                      {imp?.verfichaUrl ? (
                        <div className="flex items-center gap-3">
                          {imp.snapshot?.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imp.snapshot.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-bold text-gray-900">{imp.snapshot?.title || 'Placa lista'}</p>
                            <p className="truncate text-[12px]" style={{ color: THEME.accent }}>
                              <CheckCircle2 className="mr-1 inline h-3 w-3" /> {imp.snapshot?.price ? `${imp.snapshot.price} · ` : ''}{imp.fotos || 0} fotos · verficha.casa/{imp.slug}
                            </p>
                          </div>
                          <a href={imp.verfichaUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[11px] font-bold hover:underline" style={{ color: THEME.accent }}>Ver</a>
                        </div>
                      ) : imp?.loading ? (
                        <div className="flex items-center gap-2.5 text-[13px] font-semibold" style={{ color: THEME.text }}>
                          <Loader2 className="h-4 w-4 animate-spin" style={{ color: THEME.accent }} />
                          Leyendo los datos del portal…
                        </div>
                      ) : mf.open ? (
                        // Fallback manual (solo si el portal no dejó leer).
                        <div className="space-y-2">
                          <p className="text-[12px]" style={{ color: THEME.muted }}>El portal no dejó leer. Cargá los datos a mano:</p>
                          <input placeholder="Link de la foto" value={mf.foto} onChange={e => setManual(i, { foto: e.target.value })}
                            className="w-full rounded-lg border-[1.5px] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-[#9ca3af]"
                            style={{ borderColor: THEME.border }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = THEME.accent }} />
                          <div className="flex gap-2">
                            <input placeholder="Precio (ej: 420000)" value={mf.precio} onChange={e => setManual(i, { precio: e.target.value })}
                              className="flex-1 rounded-lg border-[1.5px] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-[#9ca3af]"
                              style={{ borderColor: THEME.border }}
                              onFocus={(e) => { e.currentTarget.style.borderColor = THEME.accent }} />
                            <select value={mf.moneda} onChange={e => setManual(i, { moneda: e.target.value })}
                              className="w-[80px] rounded-lg border-[1.5px] bg-white px-2 py-2 text-[13px] outline-none"
                              style={{ borderColor: THEME.border }}
                              onFocus={(e) => { e.currentTarget.style.borderColor = THEME.accent }}>
                              <option value="USD">USD</option><option value="ARS">ARS</option>
                            </select>
                          </div>
                          <input placeholder="Zona / barrio (ubica el pin del mapa)" value={mf.zona} onChange={e => setManual(i, { zona: e.target.value })}
                            className="w-full rounded-lg border-[1.5px] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-[#9ca3af]"
                            style={{ borderColor: THEME.border }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = THEME.accent }} />
                          <div className="flex gap-2">
                            <input placeholder="Dorm." value={mf.dorm} onChange={e => setManual(i, { dorm: e.target.value })}
                              className="flex-1 rounded-lg border-[1.5px] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-[#9ca3af]"
                              style={{ borderColor: THEME.border }}
                              onFocus={(e) => { e.currentTarget.style.borderColor = THEME.accent }} />
                            <input placeholder="Baños" value={mf.banos} onChange={e => setManual(i, { banos: e.target.value })}
                              className="flex-1 rounded-lg border-[1.5px] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-[#9ca3af]"
                              style={{ borderColor: THEME.border }}
                              onFocus={(e) => { e.currentTarget.style.borderColor = THEME.accent }} />
                            <input placeholder="m²" value={mf.m2} onChange={e => setManual(i, { m2: e.target.value })}
                              className="flex-1 rounded-lg border-[1.5px] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-[#9ca3af]"
                              style={{ borderColor: THEME.border }}
                              onFocus={(e) => { e.currentTarget.style.borderColor = THEME.accent }} />
                          </div>
                          {mf.error && <p className="text-[12px] text-red-600">{mf.error}</p>}
                          <button type="button" onClick={() => crearFichaManual(i, p.url)} disabled={mf.loading}
                            className="rounded-lg px-3.5 py-1.5 text-[12px] font-bold text-white disabled:opacity-50"
                            style={{ background: THEME.accent }}
                          >
                            {mf.loading ? 'Creando…' : 'Crear placa'}
                          </button>
                        </div>
                      ) : imp?.error ? (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[12px] text-red-600">{imp.error || 'No se pudo leer el aviso automáticamente.'}</p>
                          <div className="flex shrink-0 gap-2">
                            <button type="button" onClick={() => importarExterna(normalizedUrl)}
                              className="rounded-lg px-3 py-1.5 text-[12px] font-bold text-white"
                              style={{ background: THEME.accent }}
                            >
                              Reintentar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[12px]" style={{ color: THEME.muted }}>Al pegar el link leemos los datos solos. Tocá afuera o Enter si no arrancó.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {formData.properties.length < MAX_PROPS && (
              <button type="button" onClick={addProperty} className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed bg-white py-2.5 text-[13.5px] font-bold text-gray-600" style={{ borderColor: THEME.borderStrong, color: THEME.text }}>
                <Plus className="h-4 w-4" style={{ color: THEME.accent }} /> Agregar otra
              </button>
            )}
          </div>

              {/* PANEL Mensaje */}
              <div className="rounded-2xl border bg-white p-5" style={{ borderColor: THEME.border }}>
                {panelHead(IcChat, 'Mensaje al cliente (opcional)', `${formData.note.length}/250`)}
                <button type="button"
                  onClick={() => { const name = formData.clientName.trim() || 'nombre'; setFormData(d => ({ ...d, note: `Hola ${name}! Te preparé una selección de propiedades pensando en lo que buscás. Entrá al link, mirá las fotos y avisame cuáles te gustan o querés visitar.`.slice(0, 250) })) }}
                  className="mb-2.5 inline-flex items-center gap-1.5 rounded-lg border border-dashed px-2.5 py-1 text-[12px] font-bold"
                  style={{ borderColor: THEME.borderStrong, backgroundColor: THEME.surface, color: THEME.accent }}
                >
                  ✨ Usar mensaje sugerido
                </button>
                <textarea placeholder="Escribile algo corto y cálido. Si lo dejás vacío, mandamos uno lindo por defecto." value={formData.note} maxLength={250} onChange={e => setFormData(d => ({ ...d, note: e.target.value }))}
                  className="w-full resize-none rounded-xl border-[1.5px] bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-[#9ca3af]"
                  style={{ borderColor: THEME.border }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = THEME.accent }} rows={3} />
              </div>
            </div>
          </div>

          {formError && <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[13px] text-red-600">{formError}</p>}

          <button type="submit" disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-[15.5px] font-extrabold text-white disabled:opacity-50"
            style={{ backgroundColor: THEME.accent, boxShadow: '0 8px 20px rgba(17,24,39,.25)' }}
          >
            {!submitting && <ExternalLink className="h-4 w-4" />}
            {submitting ? 'Creando…' : 'Crear, copiar link y abrir para revisar'}
          </button>
          <p className="mt-2.5 text-center text-[12.5px]" style={{ color: THEME.muted }}>Se abre en otra pestaña — revisá que esté todo ok antes de mandárselo al cliente.</p>
        </form>
      </div>
    )
}
