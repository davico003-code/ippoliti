'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { parsePropertyLabel, getTimeLeft, buildWhatsAppMessage } from '@/lib/seleccion'
import type { MapaProp } from './SeleccionMapa'

// El mapa es client-only (Leaflet toca window): dynamic sin SSR.
const SeleccionMapa = dynamic(() => import('./SeleccionMapa'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse" style={{ background: '#eef1ee' }} />,
})

interface ExternaSnapshot {
  title: string; image: string | null; location: string
  price: string | null; rooms: number; baths: number; area: number
  lat?: number | null; lng?: number | null
}
interface Property { id: string; url: string; note: string; source?: 'externa'; snapshot?: ExternaSnapshot }
interface Reaction { liked?: boolean | null; wantVisit?: boolean; comment?: string }
interface Session {
  clientName: string; agent: string; agentName?: string; note: string; expiresAt: string
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

const WA_PHONE = '5493412101694'

function extractTokkoId(url: string): string | null {
  const m = /\/(\d{6,8})[-\/]/.exec(url)
  if (m) return m[1]
  const m2 = /(\d{6,8})/.exec(url)
  return m2 ? m2[1] : null
}

function isValidNote(note: string | undefined | null): boolean {
  return !!note && note.trim().length > 3
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

// Tipo de propiedad derivado del título (para los filtros de la vista Lista).
type TipoKey = 'casas' | 'departamentos' | 'quintas' | 'lotes' | 'otros'
const TIPO_LABELS: Record<TipoKey, string> = {
  casas: 'Casas', departamentos: 'Departamentos', quintas: 'Quintas', lotes: 'Lotes', otros: 'Otras',
}
function tipoDe(titulo: string): TipoKey {
  const t = (titulo || '').toLowerCase()
  if (/casa\s*quinta|quinta/.test(t)) return 'quintas'
  if (/departamento|depto|monoambiente|\bph\b/.test(t)) return 'departamentos'
  if (/lote|terreno/.test(t)) return 'lotes'
  if (/casa|d[úu]plex|chalet/.test(t)) return 'casas'
  return 'otros'
}

/* ── SVGs ── */
const IcBed = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6B62" strokeWidth="1.8"><path d="M3 9V19M21 9V19M3 15H21M3 9C3 7.9 3.9 7 5 7H19C20.1 7 21 7.9 21 9"/><path d="M7 7V5C7 4.4 7.4 4 8 4H16C16.6 4 17 4.4 17 5V7"/></svg>
const IcBath = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6B62" strokeWidth="1.8"><path d="M4 12H20V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V12Z"/><path d="M4 12V6C4 4.9 4.9 4 6 4C7.1 4 8 4.9 8 6V8"/><path d="M8 8H20"/></svg>
const IcArea = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6B62" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9H21M9 3V21"/></svg>
const IcWA = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
const IcMail = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></svg>
const IcGrid = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
const IcPin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
const BtnHeart = ({ filled }: { filled?: boolean }) => <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const BtnX = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const BtnCal = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const BtnCheck = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
const BtnPencil = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>

const btn = 'flex items-center justify-center gap-1.5 w-full font-semibold text-[13px] transition-all active:scale-[0.97] rounded-[11px]'

type Vista = 'mapa' | 'grilla'

export default function ClientShortlist({
  session, initialReactions, token,
}: { session: Session; initialReactions: Record<string, Reaction>; token: string }) {
  const [reactions, setReactions] = useState<Record<string, Reaction>>(initialReactions)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [commentSaved, setCommentSaved] = useState<string | null>(null)
  const [propInfo, setPropInfo] = useState<Record<string, { loading: boolean; info: PropInfo | null }>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [ayudaVisible, setAyudaVisible] = useState(true)
  const [vista, setVista] = useState<Vista>('mapa')
  const [tipoFiltro, setTipoFiltro] = useState<'todas' | TipoKey>('todas')
  const [descartadasOpen, setDescartadasOpen] = useState(false)
  const userToggled = useRef(false)
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

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

  function saveComment(propId: string) {
    patchReaction(propId, { comment: commentDraft })
    setEditingComment(null)
    setCommentSaved(propId)
    setTimeout(() => setCommentSaved(null), 2000)
  }

  // Pines del mapa: las propiedades que ya resolvieron coords.
  const mapaProps: MapaProp[] = useMemo(() => {
    const out: MapaProp[] = []
    session.properties.forEach((p, idx) => {
      const info = propInfo[p.id]?.info
      if (info?.lat != null && info?.lng != null) {
        out.push({ id: p.id, num: idx + 1, lat: info.lat, lng: info.lng, title: info.title, liked: reactions[p.id]?.liked })
      }
    })
    return out
  }, [session.properties, propInfo, reactions])

  // Si terminó de cargar y NINGUNA propiedad tiene pin, la vista Lista es la
  // que sirve — cambiamos solos (salvo que el cliente ya haya elegido vista).
  useEffect(() => {
    if (userToggled.current) return
    const cargando = session.properties.some(p => propInfo[p.id]?.loading)
    if (!cargando && Object.keys(propInfo).length > 0 && mapaProps.length === 0) setVista('grilla')
  }, [propInfo, mapaProps, session.properties])

  function elegirVista(v: Vista) {
    userToggled.current = true
    setVista(v)
  }

  function seleccionar(id: string) {
    setSelectedId(id)
    cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => setSelectedId((cur) => (cur === id ? null : cur)), 2200)
  }

  const etiqueta = useCallback(
    (p: Property) => propInfo[p.id]?.info?.title || parsePropertyLabel(p.url),
    [propInfo],
  )

  const stats = {
    liked: session.properties.filter(p => reactions[p.id]?.liked === true).length,
    wantVisit: session.properties.filter(p => reactions[p.id]?.wantVisit).length,
  }
  const likedLabels = session.properties.filter(p => reactions[p.id]?.liked === true).map(etiqueta)
  const visitLabels = session.properties.filter(p => reactions[p.id]?.wantVisit).map(etiqueta)
  const waMsg = encodeURIComponent(buildWhatsAppMessage(session, reactions))
  const waAlertas = encodeURIComponent(
    `Hola! Soy ${session.clientName}. Quiero recibir por WhatsApp nuevas propiedades como las de mi selección.`,
  )

  // Chips de tipo (vista Lista): solo los tipos presentes en la selección.
  const chips = useMemo<TipoKey[]>(() => {
    const counts = new Map<TipoKey, number>()
    for (const p of session.properties) {
      const t = tipoDe(etiqueta(p))
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
    return Array.from(counts.keys())
  }, [session.properties, etiqueta])

  const filasGrilla = useMemo(() => {
    const all = session.properties.map((p, idx) => ({ p, idx }))
    if (tipoFiltro === 'todas') return all
    return all.filter(({ p }) => tipoDe(etiqueta(p)) === tipoFiltro)
  }, [session.properties, tipoFiltro, etiqueta])

  // ── Acciones de una propiedad (compartidas por las dos vistas). Es una
  // función de render (NO un componente): definirla como componente adentro
  // remontaría el subárbol en cada render y el textarea perdería el foco.
  function renderAcciones(prop: Property) {
    const r = reactions[prop.id] || {}
    return (
      <>
        <div className="mt-2.5 space-y-1.5">
          <div className="flex gap-1.5">
            <button onClick={() => patchReaction(prop.id, { liked: r.liked === true ? null : true })} className={btn}
              style={{ padding: '8px 0', background: r.liked === true ? '#e8f5ee' : 'white', color: r.liked === true ? '#1A5C38' : '#5B6B62', border: r.liked === true ? '2px solid #1A5C38' : '1.5px solid #e0e0e0' }}>
              <BtnHeart filled={r.liked === true} /> Me gusta
            </button>
            <button onClick={() => patchReaction(prop.id, { liked: r.liked === false ? null : false })} className={btn}
              style={{ padding: '8px 0', background: r.liked === false ? '#fff0f0' : 'white', color: r.liked === false ? '#FF3B30' : '#5B6B62', border: r.liked === false ? '2px solid #FF3B30' : '1.5px solid #e0e0e0' }}>
              <BtnX /> No
            </button>
          </div>
          <button onClick={() => patchReaction(prop.id, { wantVisit: !r.wantVisit })} className={btn}
            style={{ padding: '9px 12px', background: r.wantVisit ? '#0f4a2c' : '#1A5C38', color: 'white', boxShadow: '0 2px 8px rgba(26,92,56,0.25)' }}>
            {r.wantVisit ? <BtnCheck /> : <BtnCal />} {r.wantVisit ? 'Visita solicitada' : 'Quiero visitarla'}
          </button>
          <button onClick={() => { setEditingComment(editingComment === prop.id ? null : prop.id); setCommentDraft(r.comment || '') }} className={btn}
            style={{ padding: '9px 12px', background: 'white', color: r.comment ? '#C7902F' : '#5B6B62', border: r.comment ? '1.5px solid #C7902F' : '1.5px solid #e0e0e0' }}>
            {r.comment ? <BtnCheck /> : <BtnPencil />} {r.comment ? 'Nota guardada' : 'Agregar nota'}
          </button>
        </div>

        {editingComment === prop.id && (
          <div className="mt-2 space-y-1.5">
            <textarea value={commentDraft} onChange={e => setCommentDraft(e.target.value)} placeholder="Escribí tu opinión…" rows={2}
              className="w-full resize-none rounded-xl border-2 border-gray-200 px-3 py-2 text-[13.5px] leading-[1.5] text-[#1C2620] outline-none focus:border-[#1A5C38]" />
            <div className="flex gap-1.5">
              <button onClick={() => saveComment(prop.id)} className="flex-1 rounded-xl bg-[#1A5C38] py-2 text-[13px] font-semibold text-white">Guardar</button>
              <button onClick={() => setEditingComment(null)} className="rounded-xl bg-[#F2F2F7] px-4 py-2 text-[13px] font-semibold text-[#5B6B62]">Cancelar</button>
            </div>
          </div>
        )}
        {commentSaved === prop.id && <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-[#1A5C38]"><BtnCheck /> Guardado</p>}
        {r.comment && editingComment !== prop.id && commentSaved !== prop.id && <p className="mt-1.5 text-[12.5px] italic leading-[1.4] text-[#5B6B62]">&ldquo;{r.comment}&rdquo;</p>}

        <a href={prop.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#1A5C38] hover:underline">Ver propiedad →</a>
      </>
    )
  }

  // Descartada = el cliente marcó "No me gusta". Se apaga en gris y baja a la
  // sección "Descartadas" para que arriba queden solo las que le interesan.
  const esDescartada = (id: string) => reactions[id]?.liked === false

  // Card compacta (vista Mapa, listado derecho).
  function renderCardListado(prop: Property, idx: number) {
    const r = reactions[prop.id] || {}
    const pi = propInfo[prop.id]
    const info = pi?.info
    const loading = pi?.loading
    const title = etiqueta(prop)
    const activo = selectedId === prop.id
    return (
      <div
        key={prop.id}
        ref={(el) => { cardRefs.current[prop.id] = el }}
        className="rounded-[14px] border p-2.5 transition-all"
        style={{
          borderColor: activo ? '#1A5C38' : r.liked === true ? '#bfe0cc' : r.liked === false ? '#f5c6c3' : '#E4E9E5',
          background: activo ? '#f3faf6' : 'white',
          boxShadow: activo ? '0 4px 16px rgba(26,92,56,0.14)' : 'none',
        }}
      >
        <div className="flex gap-3">
          <div className="relative h-[76px] w-[92px] shrink-0 overflow-hidden rounded-[10px] bg-[#eef1ee]">
            {loading ? (
              <div className="h-full w-full animate-pulse bg-[#e6ebe7]" />
            ) : info?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={info.image} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9bb0a4" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
            )}
            <span className="absolute left-1.5 top-1.5 rounded-full bg-white/92 px-2 py-0.5 text-[11px] font-bold text-[#123f27]">#{idx + 1}</span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <h3 className="text-[13.5px] font-semibold leading-[1.3] text-[#1C2620]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</h3>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px] text-[#5B6B62]">
              {info && info.rooms > 0 && <span className="flex items-center gap-1"><IcBed /> {info.rooms}</span>}
              {info && info.baths > 0 && <span className="flex items-center gap-1"><IcBath /> {info.baths}</span>}
              {info && info.area > 0 && <span className="flex items-center gap-1"><IcArea /> {info.area} m²</span>}
            </div>
            {info?.price && <div className="text-[13.5px] font-bold text-[#1A5C38]">{info.price}</div>}
          </div>
        </div>
        {isValidNote(prop.note) && <p className="mt-1.5 text-[12.5px] italic leading-[1.4] text-[#5B6B62]">&ldquo;{prop.note}&rdquo;</p>}
        {renderAcciones(prop)}
      </div>
    )
  }

  // Card grande (vista Lista, grilla).
  function renderCardGrilla(prop: Property, idx: number) {
    const r = reactions[prop.id] || {}
    const pi = propInfo[prop.id]
    const info = pi?.info
    const loading = pi?.loading
    const title = etiqueta(prop)
    return (
      <div key={prop.id} className="flex flex-col overflow-hidden rounded-2xl border bg-white"
        style={{ borderColor: r.liked === true ? '#bfe0cc' : r.liked === false ? '#f5c6c3' : '#E4E9E5', boxShadow: '0 2px 12px rgba(20,50,35,0.05)' }}>
        <div className="relative h-[170px] shrink-0 bg-[#eef1ee]">
          {loading ? (
            <div className="h-full w-full animate-pulse bg-[#e6ebe7]" />
          ) : info?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={info.image} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#9bb0a4" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
          )}
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-bold text-[#123f27]" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.14)' }}>#{idx + 1}</span>
          <button type="button" aria-label="Me gusta"
            onClick={() => patchReaction(prop.id, { liked: r.liked === true ? null : true })}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 transition active:scale-90"
            style={{ color: r.liked === true ? '#1A5C38' : '#5B6B62', boxShadow: '0 1px 6px rgba(0,0,0,0.14)' }}>
            <BtnHeart filled={r.liked === true} />
          </button>
        </div>
        <div className="flex flex-1 flex-col p-3.5">
          <h3 className="text-[15px] font-bold leading-[1.35] text-[#1C2620]" style={{ fontFamily: 'Raleway, sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</h3>
          {info?.location && <p className="mt-0.5 text-[12px] text-[#5B6B62]">{info.location}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px] text-[#5B6B62]">
            {info && info.rooms > 0 && <span className="flex items-center gap-1"><IcBed /> {info.rooms} dorm.</span>}
            {info && info.baths > 0 && <span className="flex items-center gap-1"><IcBath /> {info.baths} baño{info.baths > 1 ? 's' : ''}</span>}
            {info && info.area > 0 && <span className="flex items-center gap-1"><IcArea /> {info.area} m²</span>}
          </div>
          {info?.price && <div className="mt-1.5 text-[15px] font-extrabold text-[#1A5C38]">{info.price}</div>}
          {isValidNote(prop.note) && <p className="mt-1.5 text-[12.5px] italic leading-[1.4] text-[#5B6B62]">&ldquo;{prop.note}&rdquo;</p>}
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

  // ── Sidebar (compartido; el bloque de abajo cambia según la vista) ──
  const sidebar = (
    <aside className="flex flex-col gap-6 border-b border-[#E4E9E5] bg-white p-7 lg:border-b-0 lg:border-r">
      <div>
        <div className="text-[12.5px] font-semibold tracking-[0.3px] text-[#1A5C38]" style={{ fontFamily: 'Raleway, sans-serif' }}>SI INMOBILIARIA</div>
        <h1 className="mt-2 text-[26px] font-bold leading-[1.25]" style={{ fontFamily: 'Raleway, sans-serif' }}>
          Selección para:<br />
          <span className="relative inline-block text-[#1A5C38] after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded-sm after:bg-[#1A5C38] after:content-['']">{session.clientName}</span>
        </h1>
      </div>
      <p className="text-[14px] leading-[1.55] text-[#5B6B62]">Propiedades seleccionadas especialmente para vos, según lo que estuviste buscando.</p>

      {/* Resumen EN VIVO: se arma solo a medida que el cliente reacciona */}
      <div className="flex flex-col gap-2.5 rounded-2xl bg-[#1A5C38] p-4 text-white">
        <h3 className="text-[14px] font-extrabold tracking-[0.2px]">Tu resumen</h3>
        <div className="flex gap-4">
          <div className="flex flex-col">
            <b className="text-[22px] font-extrabold leading-none">{stats.liked}</b>
            <span className="mt-0.5 text-[11.5px] opacity-85">Me gustan</span>
          </div>
          <div className="flex flex-col">
            <b className="text-[22px] font-extrabold leading-none">{stats.wantVisit}</b>
            <span className="mt-0.5 text-[11.5px] opacity-85">Para visitar</span>
          </div>
        </div>
        {stats.liked + stats.wantVisit > 0 ? (
          <div className="border-t border-white/20 pt-2.5 text-[12px] leading-[1.5]">
            {likedLabels.length > 0 && <div className="mb-1"><b>Te gustan:</b> {likedLabels.join(', ')}</div>}
            {visitLabels.length > 0 && <div><b>Querés visitar:</b> {visitLabels.join(', ')}</div>}
          </div>
        ) : (
          <p className="text-[12.5px] leading-[1.5] opacity-80">A medida que marques lo que te gusta y pidas visitas, tu resumen se arma acá.</p>
        )}
        <a href={`https://wa.me/${WA_PHONE}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
          className="mt-1 flex items-center justify-center gap-2 rounded-[11px] bg-white py-2.5 text-[13.5px] font-bold text-[#1A5C38]">
          <IcWA /> Enviar mi resumen
        </a>
      </div>

      {vista === 'mapa' && isValidNote(session.note) && (
        <div className="mt-auto flex flex-col gap-3.5 rounded-2xl bg-[#EAF3EE] p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white" style={{ background: 'linear-gradient(135deg,#DD7349,#C7902F)', fontFamily: 'Raleway, sans-serif' }}>{iniciales(agentName)}</span>
            <p className="text-[13.5px] leading-[1.55]"><b className="text-[#123f27]">{agentName}:</b> {session.note}</p>
          </div>
        </div>
      )}

      {vista === 'grilla' && (
        <div className="mt-auto flex flex-col gap-2.5 rounded-2xl bg-[#EAF3EE] p-5">
          <span className="text-[#1A5C38]"><IcMail /></span>
          <p className="text-[14.5px] font-bold leading-[1.4] text-[#123f27]">¿Querés recibir nuevas propiedades como estas?</p>
          <p className="text-[13px] leading-[1.5] text-[#5B6B62]">Te avisamos por WhatsApp apenas ingresen.</p>
          <a href={`https://wa.me/${WA_PHONE}?text=${waAlertas}`} target="_blank" rel="noopener noreferrer"
            className="mt-1 flex items-center justify-center gap-2 rounded-[11px] bg-[#1A5C38] py-2.5 text-[13.5px] font-bold text-white">
            <IcWA /> Activar alertas
          </a>
        </div>
      )}
    </aside>
  )

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFAF8] text-[#1C2620]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-[60] flex items-center justify-between border-b border-[#E4E9E5] bg-white px-5 py-3 md:px-10">
        <a href="https://siinmobiliaria.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1A5C38] text-[15px] font-extrabold text-white" style={{ fontFamily: 'Raleway, sans-serif' }}>SI</span>
          <span className="text-[15px] font-bold tracking-[0.4px]" style={{ fontFamily: 'Raleway, sans-serif' }}>SI <span className="text-[#1A5C38]">INMOBILIARIA</span></span>
        </a>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${days <= 3 ? 'bg-red-50 text-red-500' : 'bg-[#EAF3EE] text-[#1A5C38]'}`}>
            Válida por {days} día{days !== 1 ? 's' : ''} más
          </span>
          <button type="button" onClick={() => setAyudaVisible(v => !v)} aria-label="¿Cómo funciona?"
            className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-[#E4E9E5] bg-white text-[15px] font-extrabold text-[#1A5C38]">?</button>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A5C38] text-[13px] font-bold text-white" style={{ fontFamily: 'Raleway, sans-serif' }}>{iniciales(agentName)}</span>
        </div>
      </header>

      {/* Ayuda: POP-UP flotante (no una barra fija). Arranca abierto la 1ª vez,
          se cierra con la ✕ o tocando afuera, y se reabre con el "?". */}
      {ayudaVisible && (
        <>
          <button type="button" aria-label="Cerrar ayuda" onClick={() => setAyudaVisible(false)}
            className="fixed inset-0 z-[70] cursor-default bg-black/10" />
          <div role="dialog" aria-label="Cómo funciona"
            className="fixed right-3 top-[62px] z-[80] w-[300px] max-w-[calc(100vw-24px)] rounded-2xl border border-[#d3e6da] bg-white p-4 md:right-8"
            style={{ boxShadow: '0 12px 32px rgba(20,50,35,0.18)' }}>
            <div className="mb-2.5 flex items-center justify-between">
              <b className="text-[14px] text-[#123f27]">¿Cómo funciona?</b>
              <button type="button" onClick={() => setAyudaVisible(false)} aria-label="Cerrar" className="text-[16px] text-[#8A968E] hover:text-[#123f27]">✕</button>
            </div>
            <div className="flex flex-col gap-2.5 text-[13px] text-[#1C2620]">
              <span className="flex items-center gap-2.5"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF3EE] text-[#1A5C38]"><BtnHeart /></span> Marcá las que te gusten</span>
              <span className="flex items-center gap-2.5"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF3EE] text-[#1A5C38]"><BtnCal /></span> Pedí una visita</span>
              <span className="flex items-center gap-2.5"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF3EE] text-[#1A5C38]"><BtnPencil /></span> Dejanos una nota</span>
            </div>
            <p className="mt-2.5 border-t border-[#EAF3EE] pt-2.5 text-[12.5px] leading-[1.5] text-[#5B6B62]">Tu resumen se arma solo y te contactamos.</p>
          </div>
        </>
      )}

      {/* Barra de vista: filtros por tipo (en Lista) + toggle Lista/Mapa */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E4E9E5] bg-white px-5 py-2.5 md:px-10">
        {vista === 'grilla' && chips.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={() => setTipoFiltro('todas')}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${tipoFiltro === 'todas' ? 'bg-[#1A5C38] text-white' : 'border border-[#E4E9E5] bg-white text-[#5B6B62]'}`}>
              Todas
            </button>
            {chips.map(k => (
              <button key={k} type="button" onClick={() => setTipoFiltro(k)}
                className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${tipoFiltro === k ? 'bg-[#1A5C38] text-white' : 'border border-[#E4E9E5] bg-white text-[#5B6B62]'}`}>
                {TIPO_LABELS[k]}
              </button>
            ))}
          </div>
        )}
        <div className="ml-auto flex rounded-full border border-[#E4E9E5] bg-white p-0.5">
          <button type="button" onClick={() => elegirVista('grilla')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${vista === 'grilla' ? 'bg-[#1A5C38] text-white' : 'text-[#5B6B62]'}`}>
            <IcGrid /> Lista
          </button>
          <button type="button" onClick={() => elegirVista('mapa')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${vista === 'mapa' ? 'bg-[#1A5C38] text-white' : 'text-[#5B6B62]'}`}>
            <IcPin /> Mapa
          </button>
        </div>
      </div>

      {vista === 'mapa' ? (
        /* ══ VISTA MAPA: sidebar / mapa / listado ══ */
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-[300px_1fr_380px]">
          {sidebar}

          <section className="relative min-h-[380px] bg-[#eef1ee] lg:min-h-[560px]">
            {mapaProps.length > 0 ? (
              <SeleccionMapa props={mapaProps} onSelect={seleccionar} />
            ) : (
              <div className="flex h-full min-h-[380px] items-center justify-center px-8 text-center">
                <p className="text-[14px] text-[#5B6B62]">{session.properties.some(p => propInfo[p.id]?.loading) ? 'Ubicando las propiedades en el mapa…' : 'Las propiedades de esta selección todavía no tienen ubicación en el mapa. Podés verlas en la vista Lista.'}</p>
              </div>
            )}
          </section>

          <aside className="flex max-h-[calc(100vh-61px)] flex-col border-t border-[#E4E9E5] bg-white p-5 lg:border-t-0 lg:border-l">
            <div className="flex flex-col gap-3.5 overflow-y-auto pb-4 pr-1">
              {session.properties.map((prop, idx) => (esDescartada(prop.id) ? null : renderCardListado(prop, idx)))}
              {(() => {
                const desc = session.properties.map((prop, idx) => ({ prop, idx })).filter(x => esDescartada(x.prop.id))
                if (!desc.length) return null
                return (
                  <div className="mt-1 space-y-2.5">
                    {headerDescartadas(desc.length)}
                    {descartadasOpen && desc.map(({ prop, idx }) => (
                      <div key={prop.id} style={{ filter: 'grayscale(1)', opacity: 0.6 }}>{renderCardListado(prop, idx)}</div>
                    ))}
                  </div>
                )
              })()}
            </div>

            <a href={`https://wa.me/${WA_PHONE}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-2.5 rounded-xl bg-[#1A5C38] py-3.5 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#123f27]">
              <IcWA /> Escribir por WhatsApp
            </a>
          </aside>
        </div>
      ) : (
        /* ══ VISTA LISTA: sidebar / grilla de cards grandes ══ */
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-[300px_1fr]">
          {sidebar}

          <section className="p-5 md:p-7">
            {filasGrilla.length === 0 ? (
              <p className="px-4 py-16 text-center text-[14px] text-[#5B6B62]">No hay propiedades de este tipo en tu selección.</p>
            ) : (() => {
              const activas = filasGrilla.filter(({ p }) => !esDescartada(p.id))
              const desc = filasGrilla.filter(({ p }) => esDescartada(p.id))
              return (
                <>
                  {activas.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {activas.map(({ p: prop, idx }) => renderCardGrilla(prop, idx))}
                    </div>
                  )}
                  {desc.length > 0 && (
                    <div className="mt-5 space-y-4">
                      {headerDescartadas(desc.length)}
                      {descartadasOpen && (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                          {desc.map(({ p: prop, idx }) => (
                            <div key={prop.id} style={{ filter: 'grayscale(1)', opacity: 0.6 }}>{renderCardGrilla(prop, idx)}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )
            })()}
          </section>
        </div>
      )}
    </div>
  )
}
