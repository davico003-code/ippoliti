'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { parsePropertyLabel, getTimeLeft } from '@/lib/seleccion'
import { displayImageUrl } from '@/lib/external-images'

interface ExternaSnapshot {
  title: string; image: string | null; location: string
  price: string | null; rooms: number; baths: number; area: number
  lat?: number | null; lng?: number | null
}

type PortalLogo = { name: string; logo: string }

const PORTALES: PortalLogo[] = [
  { name: 'Zonaprop', logo: '/portal-logos/zonaprop.jpg' },
  { name: 'Argenprop', logo: '/portal-logos/argenprop.jpg' },
  { name: 'Mercado Libre', logo: '/portal-logos/mercadolibre.png' },
  { name: 'SI INMOBILIARIA', logo: '/portal-logos/si-inmobiliaria.png' },
]
interface Property { id: string; url: string; note: string; source?: 'externa'; snapshot?: ExternaSnapshot }
type ReactKey = 'encanta' | 'no'
interface Reaction { liked?: boolean | null; wantVisit?: boolean; comment?: string; reaction?: ReactKey | null }
interface Session {
  clientName: string; agent: string; agentName?: string; note: string; expiresAt: string
  permanent?: boolean
  properties: Property[]
}

interface PropInfo {
  title: string
  image: string | null
  location: string
  rooms: number
  baths: number
  area: number
  price: string | null
  isColega: boolean
  lat: number | null
  lng: number | null
}

function extractTokkoId(url: string): string | null {
  const m = /\/(\d{6,8})[-\/]/.exec(url)
  if (m) return m[1]
  const m2 = /(\d{6,8})/.exec(url)
  return m2 ? m2[1] : null
}

function isValidNote(note: string | undefined | null): boolean {
  return !!note && note.trim().length > 3
}

function logoDePortal(url: string): PortalLogo | null {
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (host.includes('zonaprop.com')) return PORTALES[0]
    if (host.includes('argenprop.com')) return PORTALES[1]
    if (host.includes('mercadolibre.com') || host.includes('mercadolibre')) return PORTALES[2]
    if (host.includes('siinmobiliaria.com')) return PORTALES[3]
    return null
  } catch {
    return null
  }
}

function previewUrlInterna(url: string): string | null {
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://siinmobiliaria.com')
    const host = u.hostname.toLowerCase()
    if (host.includes('verficha.casa')) {
      const slug = u.pathname.split('/').filter(Boolean)[0]
      return slug ? `/v/${slug}?embed=1` : null
    }
    if (u.pathname.startsWith('/v/')) {
      return `${u.pathname}?embed=1`
    }
    return null
  } catch {
    return null
  }
}

// Offset de privacidad (±30-50m) sobre las coords reales, como en las fichas.
function offsetCoord(lat: number, lng: number): { lat: number; lng: number } {
  const angle = Math.random() * 2 * Math.PI
  const distM = 30 + Math.random() * 20
  return {
    lat: lat + (distM * Math.cos(angle)) / 111000,
    lng: lng + (distM * Math.sin(angle)) / (111000 * Math.cos((lat * Math.PI) / 180)),
  }
}

function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/).filter(Boolean)
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase() || nombre.slice(0, 2).toUpperCase()
}

/* ── SVGs ── */
const IcBed = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6B62" strokeWidth="1.8"><path d="M3 9V19M21 9V19M3 15H21M3 9C3 7.9 3.9 7 5 7H19C20.1 7 21 7.9 21 9"/><path d="M7 7V5C7 4.4 7.4 4 8 4H16C16.6 4 17 4.4 17 5V7"/></svg>
const IcBath = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6B62" strokeWidth="1.8"><path d="M4 12H20V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V12Z"/><path d="M4 12V6C4 4.9 4.9 4 6 4C7.1 4 8 4.9 8 6V8"/><path d="M8 8H20"/></svg>
const IcArea = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6B62" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9H21M9 3V21"/></svg>
const BtnHeart = ({ filled }: { filled?: boolean }) => <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const BtnX = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const BtnCal = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const BtnCheck = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
const ExternalLinkIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M7 17L17 7"/><path d="M9 7h8v8"/><path d="M19 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/></svg>

export default function ClientShortlist({
  session, initialReactions, token, agentPhoto,
}: { session: Session; initialReactions: Record<string, Reaction>; token: string; agentPhoto?: string | null }) {
  const [reactions, setReactions] = useState<Record<string, Reaction>>(initialReactions)
  const [propInfo, setPropInfo] = useState<Record<string, { loading: boolean; info: PropInfo | null }>>({})
  const [previewPropId, setPreviewPropId] = useState<string | null>(null)
  const [descartadasOpen, setDescartadasOpen] = useState(false)
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const { days } = getTimeLeft(session.expiresAt)
  const agentName = session.agentName || session.agent

  // Fetch de datos por propiedad (Tokko para propias, snapshot/Microlink para
  // externas). También capturamos lat/lng (de Tokko) para el mapa.
  useEffect(() => {
    const initial: Record<string, { loading: boolean; info: PropInfo | null }> = {}
    for (const p of session.properties) {
      initial[p.id] = p.snapshot
        ? { loading: false, info: { ...p.snapshot, isColega: true, lat: p.snapshot.lat ?? null, lng: p.snapshot.lng ?? null } }
        : { loading: true, info: null }
    }
    setPropInfo(initial)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    Promise.allSettled(
      session.properties.filter(p => !p.snapshot).map(async (p): Promise<{ id: string; info: PropInfo }> => {
        const tokkoId = extractTokkoId(p.url)
        if (tokkoId) {
          const res = await fetch(`/api/propiedades/${tokkoId}`, { signal: controller.signal })
          if (res.ok) {
            const d = await res.json()
            const photos = (d.photos || []).filter((ph: { is_blueprint?: boolean }) => !ph.is_blueprint)
            const cover = photos.find((ph: { is_front_cover?: boolean }) => ph.is_front_cover) || photos[0]
            const pr = d.operations?.[0]?.prices?.[0]
            const rawLat = d.geo_lat ? parseFloat(d.geo_lat) : NaN
            const rawLng = d.geo_long ? parseFloat(d.geo_long) : NaN
            const coords = Number.isFinite(rawLat) && Number.isFinite(rawLng) ? offsetCoord(rawLat, rawLng) : null
            return {
              id: p.id,
              info: {
                title: d.publication_title || d.address || d.fake_address || parsePropertyLabel(p.url),
                image: cover?.image || cover?.thumb || null,
                location: d.location?.short_location || d.location?.name || '',
                rooms: d.suite_amount || d.room_amount || 0,
                baths: d.bathroom_amount || 0,
                area: parseFloat(d.roofed_surface || d.total_surface || d.surface || '0') || 0,
                price: pr?.price ? `${pr.currency || 'USD'} ${pr.price.toLocaleString('es-AR')}` : null,
                isColega: false,
                lat: coords?.lat ?? null,
                lng: coords?.lng ?? null,
              },
            }
          }
        }
        const res = await fetch(`/api/seleccion/preview?url=${encodeURIComponent(p.url)}`, { signal: controller.signal })
        if (res.ok) {
          const d = await res.json()
          return {
            id: p.id,
            info: { title: d.title || parsePropertyLabel(p.url), image: d.image || null, location: '', rooms: 0, baths: 0, area: 0, price: null, isColega: true, lat: null, lng: null },
          }
        }
        throw new Error('fail')
      })
    ).then(results => {
      setPropInfo(prev => {
        const next = { ...prev }
        for (const r of results) if (r.status === 'fulfilled') next[r.value.id] = { loading: false, info: r.value.info }
        for (const p of session.properties) if (next[p.id]?.loading) next[p.id] = { loading: false, info: null }
        return next
      })
    })

    return () => { clearTimeout(timeout) }
  }, [session.properties])

  const patchReaction = useCallback((propertyId: string, patch: Partial<Reaction>) => {
    setReactions(prev => {
      const updated = { ...prev, [propertyId]: { ...prev[propertyId], ...patch } }
      clearTimeout(debounceRef.current[propertyId])
      debounceRef.current[propertyId] = setTimeout(() => {
        fetch(`/api/seleccion/${token}/reaccion`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId, ...updated[propertyId] }),
        }).catch(() => {})
      }, 800)
      return updated
    })
  }, [token])

  useEffect(() => {
    if (!previewPropId) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewPropId(null)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [previewPropId])

  // Elegir/alternar una reacción simple. Mapea a `liked` para el resumen y
  // para mover abajo las descartadas.
  function setReaction(propId: string, key: ReactKey) {
    const actual = reactions[propId]?.reaction
    const next = actual === key ? null : key
    patchReaction(propId, {
      reaction: next,
      liked: next === 'encanta' ? true : next === 'no' ? false : null,
    })
  }

  const etiqueta = useCallback(
    (p: Property) => propInfo[p.id]?.info?.title || parsePropertyLabel(p.url),
    [propInfo],
  )

  const porReaccion = (k: ReactKey) => session.properties.filter(p => reactions[p.id]?.reaction === k)
  const stats = {
    encanta: porReaccion('encanta').length,
    no: porReaccion('no').length,
    wantVisit: session.properties.filter(p => reactions[p.id]?.wantVisit).length,
  }
  const totalReacc = stats.encanta + stats.no + stats.wantVisit
  const filasGrilla = session.properties.map((p, idx) => ({ p, idx }))

  // ── Acciones de una propiedad (compartidas por las dos vistas). Es una
  // función de render (NO un componente): definirla como componente adentro
  // remontaría el subárbol en cada render y el textarea perdería el foco.
  function renderAcciones(prop: Property) {
    const r = reactions[prop.id] || {}
    const react = r.reaction
    const feedbackLabel = react === 'encanta'
      ? 'Qué te gustó o qué querés consultar?'
      : react === 'no'
        ? 'Contanos qué no cerró'
        : 'Dejanos una nota'
    const feedbackPlaceholder = react === 'encanta'
      ? 'Ej: me gusta la zona, quiero saber horarios de visita...'
      : react === 'no'
        ? 'Ej: buscaba otra zona / algo más chico / la veo cara...'
        : 'Escribí una duda o comentario...'

    return (
      <>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setReaction(prop.id, 'encanta')}
            className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-[12.5px] font-extrabold transition ${react === 'encanta' ? 'border-[#1A5C38] bg-[#EAF3EE] text-[#1A5C38]' : 'border-[#E4E9E5] bg-white text-[#5B6B62] hover:bg-[#F7FAF8]'}`}>
            <BtnHeart filled={react === 'encanta'} /> Me gusta
          </button>
          <button type="button" onClick={() => setReaction(prop.id, 'no')}
            className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-[12.5px] font-extrabold transition ${react === 'no' ? 'border-[#d85b52] bg-[#fff1f0] text-[#b9433d]' : 'border-[#E4E9E5] bg-white text-[#5B6B62] hover:bg-[#F7FAF8]'}`}>
            <BtnX /> No me interesa
          </button>
        </div>

        {(react || r.comment) && (
          <div className="mt-2.5 rounded-xl bg-[#F7FAF8] p-2.5">
            <p className="mb-1.5 text-[12px] font-bold text-[#5B6B62]">{feedbackLabel}</p>
            <textarea value={r.comment || ''} onChange={e => patchReaction(prop.id, { comment: e.target.value })} rows={2} placeholder={feedbackPlaceholder}
              className="w-full resize-none rounded-lg border-[1.5px] border-[#E4E9E5] px-2.5 py-2 text-[13px] leading-[1.4] text-[#1C2620] outline-none focus:border-[#1A5C38]" />
          </div>
        )}

        <button type="button" onClick={() => patchReaction(prop.id, { wantVisit: !r.wantVisit })}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-[13px] font-extrabold transition active:scale-[0.98]"
          style={r.wantVisit ? { borderColor: '#1A5C38', background: '#EAF3EE', color: '#1A5C38' } : { borderColor: '#D8E5DC', background: 'white', color: '#1A5C38' }}>
          {r.wantVisit ? <BtnCheck /> : <BtnCal />} {r.wantVisit ? 'Visita solicitada' : 'Quiero coordinar visita'}
        </button>
      </>
    )
  }

  // Descartada = el cliente marcó "No me gusta". Se apaga en gris y baja a la
  // sección "Descartadas" para que arriba queden solo las que le interesan.
  const esDescartada = (id: string) => reactions[id]?.liked === false

  // Card grande (vista Lista, grilla).
  function renderCardGrilla(prop: Property, idx: number) {
    const r = reactions[prop.id] || {}
    const pi = propInfo[prop.id]
    const info = pi?.info
    const loading = pi?.loading
    const title = etiqueta(prop)
    const portal = logoDePortal(prop.url)
    return (
      <div key={prop.id} className="flex flex-col overflow-hidden rounded-2xl border bg-white"
        style={{ borderColor: r.liked === true ? '#bfe0cc' : r.liked === false ? '#f5c6c3' : '#E4E9E5', boxShadow: '0 2px 12px rgba(20,50,35,0.05)' }}>
        <div className="relative aspect-[16/11] shrink-0 bg-[#eef1ee]">
          {loading ? (
            <div className="h-full w-full animate-pulse bg-[#e6ebe7]" />
          ) : info?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayImageUrl(info.image)} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#9bb0a4" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
          )}
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-bold text-[#123f27]" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.14)' }}>#{idx + 1}</span>
          {portal && (
            <span className="absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/95 p-1 shadow-sm" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.14)' }}>
              <Image src={portal.logo} alt={portal.name} width={24} height={24} className="h-6 w-auto" />
            </span>
          )}
          <button type="button" aria-label="Me encanta"
            onClick={() => setReaction(prop.id, 'encanta')}
            className="absolute right-2.5 bottom-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 transition active:scale-90"
            style={{ color: r.reaction === 'encanta' ? '#1A5C38' : '#5B6B62', boxShadow: '0 1px 6px rgba(0,0,0,0.14)' }}>
            <BtnHeart filled={r.reaction === 'encanta'} />
          </button>
        </div>
        <div className="flex flex-1 flex-col p-3.5">
          <h3 className="text-[15px] font-bold leading-[1.35] text-[#1C2620]" style={{ fontFamily: 'Raleway, sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</h3>
          {info?.location && <p className="mt-0.5 text-[12px] text-[#5B6B62]">{info.location}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-[#5B6B62]">
            {info && info.rooms > 0 && <span className="flex items-center gap-1"><IcBed /> {info.rooms} dorm.</span>}
            {info && info.baths > 0 && <span className="flex items-center gap-1"><IcBath /> {info.baths} baño{info.baths > 1 ? 's' : ''}</span>}
            {info && info.area > 0 && <span className="flex items-center gap-1"><IcArea /> {info.area} m²</span>}
          </div>
          {info?.price && <div className="mt-2 text-[15px] font-extrabold text-[#1A5C38]">{info.price}</div>}
          {isValidNote(prop.note) && <p className="mt-1.5 text-[12.5px] italic leading-[1.4] text-[#5B6B62]">&ldquo;{prop.note}&rdquo;</p>}
          <button type="button" onClick={() => setPreviewPropId(prop.id)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-[13px] font-extrabold transition active:scale-[0.98]"
            style={{ borderColor: '#B8C8E6', background: '#F1F6FF', color: '#244A86' }}>
            <ExternalLinkIcon /> Ver ficha
          </button>
          <div className="flex-1" />
          {renderAcciones(prop)}
        </div>
      </div>
    )
  }

  // Encabezado plegable de "Descartadas" (compartido por las dos vistas).
  function headerDescartadas(n: number) {
    return (
      <button type="button" onClick={() => setDescartadasOpen(o => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-[#E4E9E5] bg-[#FBFAF8] px-3.5 py-2.5 text-[13px] font-bold text-[#5B6B62]">
        <span className="flex items-center gap-2"><BtnX /> Descartadas ({n})</span>
        <span className="text-[#9aa39c]">{descartadasOpen ? '▴' : '▾'}</span>
      </button>
    )
  }

  const previewProp = previewPropId ? session.properties.find(p => p.id === previewPropId) ?? null : null
  const previewTitle = previewProp ? etiqueta(previewProp) : ''
  const previewSrc = previewProp ? previewUrlInterna(previewProp.url) : null
  const activas = filasGrilla.filter(({ p }) => !esDescartada(p.id))
  const desc = filasGrilla.filter(({ p }) => esDescartada(p.id))

  return (
    <div className="min-h-screen bg-[#F4F6F5] text-[#1C2620]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <main className="mx-auto grid min-h-screen w-full max-w-[1400px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-7">
        <aside className="lg:sticky lg:top-5 lg:h-[calc(100vh-40px)]">
          <section className="flex h-full flex-col rounded-2xl border border-[#E4E9E5] bg-white p-4 sm:p-5" style={{ boxShadow: '0 8px 28px rgba(20,50,35,0.06)' }}>
            <div className="flex items-center gap-3">
              {agentPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={agentPhoto} alt={agentName} className="h-14 w-14 rounded-full object-cover ring-4 ring-[#EAF3EE]" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF3EE] text-[16px] font-extrabold text-[#1A5C38]">{iniciales(agentName)}</span>
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#1A5C38]" style={{ fontFamily: 'Raleway, sans-serif' }}>Tu asesor</p>
                <h2 className="truncate text-[17px] font-extrabold text-[#123f27]" style={{ fontFamily: 'Raleway, sans-serif' }}>{agentName}</h2>
              </div>
            </div>

            <div className="relative mt-5 rounded-2xl border border-[#DDE8E2] bg-[#F8FBF9] p-4">
              <span className="absolute -top-2 left-7 h-4 w-4 rotate-45 border-l border-t border-[#DDE8E2] bg-[#F8FBF9]" />
              <p className="text-[13.5px] leading-[1.55] text-[#425248]">
                {isValidNote(session.note)
                  ? session.note
                  : `Hola ${session.clientName}. Te preparé esta búsqueda especialmente para vos. Mirá las fichas tranquilo y marcame cuáles te gustan.`}
              </p>
            </div>

            <div className="mt-5 rounded-xl bg-[#F1F6FF] p-3 text-[#244A86]">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.08em]">Selección para</p>
              <h1 className="mt-0.5 text-[22px] font-extrabold leading-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>{session.clientName}</h1>
              <p className="mt-1 text-[12.5px]">{session.permanent ? 'Activa y disponible para actualizar' : `${days} día${days !== 1 ? 's' : ''} disponible`}</p>
            </div>

            <div className="mt-4 rounded-xl border border-[#E4E9E5] p-3 text-[13px] leading-[1.5] text-[#5B6B62]">
              <b className="text-[#123f27]">Resumen:</b>{' '}
              {totalReacc === 0 ? 'todavía no marcaste ninguna propiedad.' : `${stats.encanta} me gusta · ${stats.no} descartadas · ${stats.wantVisit} visita${stats.wantVisit !== 1 ? 's' : ''}`}
              <p className="mt-1 text-[12px] text-[#7C8A81]">Tus respuestas se guardan automáticamente.</p>
            </div>
          </section>
        </aside>

        <section className="min-w-0">
          {activas.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {activas.map(({ p: prop, idx }) => renderCardGrilla(prop, idx))}
            </div>
          ) : (
            <p className="rounded-2xl border border-[#E4E9E5] bg-white px-4 py-16 text-center text-[14px] text-[#5B6B62]">No hay propiedades activas en esta selección.</p>
          )}

          {desc.length > 0 && (
            <div className="mt-5 space-y-4">
              {headerDescartadas(desc.length)}
              {descartadasOpen && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {desc.map(({ p: prop, idx }) => (
                    <div key={prop.id} style={{ filter: 'grayscale(1)', opacity: 0.62 }}>{renderCardGrilla(prop, idx)}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {previewProp && (
        <div className="fixed inset-0 z-[100] bg-[#0f1f16]/70 p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Preview de propiedad">
          <div className="mx-auto flex h-full max-w-[1180px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-[#E4E9E5] px-3 py-2.5 sm:px-4">
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#1A5C38]">Vista rápida</p>
                <h2 className="truncate text-[14px] font-extrabold text-[#123f27] sm:text-[16px]">{previewTitle}</h2>
              </div>
              <button type="button" onClick={() => setPreviewPropId(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E4E9E5] bg-white text-[#123f27] transition hover:bg-[#F4F6F5]"
                aria-label="Cerrar preview">
                <BtnX />
              </button>
            </div>
            <div className="relative flex-1 bg-[#eef1ee]">
              {previewSrc ? (
                <iframe src={previewSrc} title={previewTitle} className="h-full w-full border-0" />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center">
                  <div className="max-w-[420px] rounded-2xl bg-white p-6 shadow-sm">
                    <p className="text-[18px] font-extrabold text-[#123f27]" style={{ fontFamily: 'Raleway, sans-serif' }}>Vista interna no disponible</p>
                    <p className="mt-2 text-[14px] leading-[1.55] text-[#5B6B62]">
                      Esta propiedad pertenece a una selección creada antes del preview interno. Pedí una actualización de la selección para verla completa dentro de este panel.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
