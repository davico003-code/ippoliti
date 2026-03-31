'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { parsePropertyLabel, getTimeLeft, buildWhatsAppMessage } from '@/lib/seleccion'

interface Property { id: string; url: string; note: string }
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

/* ── SVGs ── */
const IcBed = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="1.8"><path d="M3 9V19M21 9V19M3 15H21M3 9C3 7.9 3.9 7 5 7H19C20.1 7 21 7.9 21 9"/><path d="M7 7V5C7 4.4 7.4 4 8 4H16C16.6 4 17 4.4 17 5V7"/></svg>
const IcBath = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="1.8"><path d="M4 12H20V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V12Z"/><path d="M4 12V6C4 4.9 4.9 4 6 4C7.1 4 8 4.9 8 6V8"/><path d="M8 8H20"/></svg>
const IcArea = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9H21M9 3V21"/></svg>
const IcPrice = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
const IcHouse = () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IcWA = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>

// Button SVGs (16px, stroke)
const BtnHeart = ({ filled }: { filled?: boolean }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const BtnX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const BtnCal = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const BtnCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
const BtnPencil = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>

const btn = 'flex items-center justify-center gap-2 w-full font-semibold text-[14px] transition-all hover:opacity-85 hover:-translate-y-px active:scale-[0.97]'

export default function ClientShortlist({
  session, initialReactions, token,
}: { session: Session; initialReactions: Record<string, Reaction>; token: string }) {
  const [reactions, setReactions] = useState<Record<string, Reaction>>(initialReactions)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [commentSaved, setCommentSaved] = useState<string | null>(null)
  const [propInfo, setPropInfo] = useState<Record<string, { loading: boolean; info: PropInfo | null }>>({})
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const { days } = getTimeLeft(session.expiresAt)
  const agentName = session.agentName || session.agent

  // Fetch property data — Tokko for SI props, Microlink for external
  useEffect(() => {
    const initial: Record<string, { loading: boolean; info: PropInfo | null }> = {}
    for (const p of session.properties) initial[p.id] = { loading: true, info: null }
    setPropInfo(initial)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    Promise.allSettled(
      session.properties.map(async (p): Promise<{ id: string; info: PropInfo }> => {
        const tokkoId = extractTokkoId(p.url)

        if (tokkoId) {
          // SI / Tokko property
          const res = await fetch(`/api/propiedades/${tokkoId}`, { signal: controller.signal })
          if (res.ok) {
            const d = await res.json()
            const photos = (d.photos || []).filter((ph: { is_blueprint?: boolean }) => !ph.is_blueprint)
            const cover = photos.find((ph: { is_front_cover?: boolean }) => ph.is_front_cover) || photos[0]
            const pr = d.operations?.[0]?.prices?.[0]
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
              },
            }
          }
        }

        // External — use Microlink
        const res = await fetch(`/api/seleccion/preview?url=${encodeURIComponent(p.url)}`, { signal: controller.signal })
        if (res.ok) {
          const d = await res.json()
          return {
            id: p.id,
            info: {
              title: d.title || parsePropertyLabel(p.url),
              image: d.image || null,
              location: '',
              rooms: 0,
              baths: 0,
              area: 0,
              price: null,
              isColega: true,
            },
          }
        }
        throw new Error('fail')
      })
    ).then(results => {
      setPropInfo(prev => {
        const next = { ...prev }
        for (const r of results) {
          if (r.status === 'fulfilled') next[r.value.id] = { loading: false, info: r.value.info }
          else {
            // Find which prop failed
            for (const p of session.properties) {
              if (next[p.id]?.loading) next[p.id] = { loading: false, info: null }
            }
          }
        }
        // Clear any remaining loading
        for (const p of session.properties) {
          if (next[p.id]?.loading) next[p.id] = { loading: false, info: null }
        }
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
        })
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

  const stats = {
    liked: session.properties.filter(p => reactions[p.id]?.liked === true).length,
    wantVisit: session.properties.filter(p => reactions[p.id]?.wantVisit).length,
  }
  const hasReactions = stats.liked + stats.wantVisit > 0
  const waMsg = encodeURIComponent(buildWhatsAppMessage(session, reactions))

  return (
    <div className="min-h-screen bg-[#F2F2F7]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white" style={{ borderBottom: '0.5px solid rgba(60,60,67,0.12)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[#1A5C38] font-extrabold text-base" style={{ fontFamily: 'Raleway, sans-serif' }}>SI</span>
            <span className="text-[#6E6E73] text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>Inmobiliaria</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[15px] text-[#1C1C1E]">
              Selección para: <strong>{session.clientName}</strong>
            </p>
            <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
              days <= 3 ? 'bg-red-50 text-red-500' : 'bg-[#1A5C38]/8 text-[#1A5C38]'
            }`}>
              Válida por {days} día{days !== 1 ? 's' : ''} más
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-5 pb-44">
        {/* Agent note */}
        {isValidNote(session.note) && (
          <div className="bg-white rounded-2xl p-4 mb-5" style={{ border: '0.5px solid rgba(60,60,67,0.12)' }}>
            <p className="text-[13px] text-[#6E6E73] mb-1">Mensaje de {agentName}:</p>
            <p className="text-[15px] text-[#1C1C1E] leading-[1.5]">{session.note}</p>
          </div>
        )}

        {/* Summary */}
        {hasReactions && (
          <div className="bg-[#1A5C38] rounded-2xl px-4 py-3.5 flex items-center justify-between text-white mb-5">
            <p className="text-[14px] font-medium">
              {stats.liked > 0 && <>{stats.liked} te gustaron</>}
              {stats.liked > 0 && stats.wantVisit > 0 && ' · '}
              {stats.wantVisit > 0 && <>{stats.wantVisit} querés visitar</>}
            </p>
            <span className="text-[12px] text-white/50">{session.properties.length} propiedades</span>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {session.properties.map((prop, idx) => {
            const r = reactions[prop.id] || {}
            const pi = propInfo[prop.id]
            const info = pi?.info
            const loading = pi?.loading
            const title = info?.title || parsePropertyLabel(prop.url)
            const borderColor = r.liked === true ? '#1A5C38' : r.liked === false ? '#FF3B30' : 'rgba(0,0,0,0.06)'

            return (
              <div key={prop.id} className="bg-white rounded-2xl overflow-hidden flex flex-col" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: `1px solid ${borderColor}` }}>
                {/* Photo */}
                <div className="relative h-[160px] bg-[#F2F2F7] shrink-0">
                  {loading ? (
                    <div className="w-full h-full" style={{ background: 'linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                  ) : info?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={info.image} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><IcHouse /></div>
                  )}
                  {/* Number badge */}
                  <span className="absolute top-2.5 right-2.5 bg-white text-[#1A5C38] text-[13px] font-bold px-2.5 py-1 rounded-full font-numeric" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.15)' }}>
                    #{idx + 1}
                  </span>
                  {/* Colega badge */}
                  {info?.isColega && (
                    <span className="absolute top-2.5 left-2.5 bg-[#1A5C38] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Colega
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-3.5 flex-1 flex flex-col">
                  <h3 className="text-[15px] font-bold text-[#1C1C1E] leading-[1.35] mb-1" style={{ fontFamily: 'Raleway, sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {title}
                  </h3>
                  {info?.location && <p className="text-[12px] text-[#6E6E73] mb-1.5">{info.location}</p>}

                  {isValidNote(prop.note) && (
                    <p className="text-[13px] text-[#6E6E73] italic mb-2 leading-[1.4]">&ldquo;{prop.note}&rdquo;</p>
                  )}

                  {/* Specs */}
                  {info && (info.rooms > 0 || info.baths > 0 || info.area > 0 || info.price) && (
                    <div className="flex flex-wrap gap-x-2.5 gap-y-1 mb-2.5">
                      {info.rooms > 0 && <span className="flex items-center gap-1 text-[12px] text-[#6E6E73]"><IcBed /> {info.rooms} dorm.</span>}
                      {info.baths > 0 && <span className="flex items-center gap-1 text-[12px] text-[#6E6E73]"><IcBath /> {info.baths} baño{info.baths > 1 ? 's' : ''}</span>}
                      {info.area > 0 && <span className="flex items-center gap-1 text-[12px] text-[#6E6E73]"><IcArea /> {info.area} m²</span>}
                      {info.price && <span className="flex items-center gap-1 text-[12px] font-semibold text-[#1A5C38]"><IcPrice /> {info.price}</span>}
                    </div>
                  )}

                  <a href={prop.url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold text-[#1A5C38] hover:underline mb-2 inline-flex items-center gap-1">
                    Ver propiedad &rarr;
                  </a>

                  <div className="flex-1" />

                  {/* ── Buttons ── */}
                  <div className="pt-3 space-y-2" style={{ borderTop: '1px solid #f0f0f0' }}>
                    {/* Like / Dislike */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => patchReaction(prop.id, { liked: r.liked === true ? null : true })}
                        className={btn}
                        style={{
                          padding: '10px 0',
                          borderRadius: '12px',
                          background: r.liked === true ? '#e8f5ee' : 'white',
                          color: r.liked === true ? '#1A5C38' : '#6E6E73',
                          border: r.liked === true ? '2px solid #1A5C38' : '1.5px solid #e0e0e0',
                        }}
                        onMouseEnter={e => { if (r.liked !== true) { e.currentTarget.style.background = '#f0faf4'; e.currentTarget.style.borderColor = '#1A5C38'; e.currentTarget.style.color = '#1A5C38' } }}
                        onMouseLeave={e => { if (r.liked !== true) { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.color = '#6E6E73' } }}
                      >
                        <BtnHeart filled={r.liked === true} /> Me gusta
                      </button>
                      <button
                        onClick={() => patchReaction(prop.id, { liked: r.liked === false ? null : false })}
                        className={btn}
                        style={{
                          padding: '10px 0',
                          borderRadius: '12px',
                          background: r.liked === false ? '#fff0f0' : 'white',
                          color: r.liked === false ? '#FF3B30' : '#6E6E73',
                          border: r.liked === false ? '2px solid #FF3B30' : '1.5px solid #e0e0e0',
                        }}
                        onMouseEnter={e => { if (r.liked !== false) { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = '#FF3B30'; e.currentTarget.style.color = '#FF3B30' } }}
                        onMouseLeave={e => { if (r.liked !== false) { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.color = '#6E6E73' } }}
                      >
                        <BtnX /> No me gusta
                      </button>
                    </div>

                    {/* Visit — prominent */}
                    <button
                      onClick={() => patchReaction(prop.id, { wantVisit: !r.wantVisit })}
                      className={btn}
                      style={{
                        padding: '11px 16px',
                        borderRadius: '12px',
                        background: r.wantVisit ? '#0f4a2c' : '#1A5C38',
                        color: 'white',
                        boxShadow: r.wantVisit ? '0 2px 8px rgba(26,92,56,0.35)' : '0 2px 8px rgba(26,92,56,0.25)',
                      }}
                    >
                      {r.wantVisit ? <BtnCheck /> : <BtnCal />}
                      {r.wantVisit ? 'Visita solicitada' : 'Quiero visitarla'}
                    </button>

                    {/* Note */}
                    <button
                      onClick={() => { setEditingComment(editingComment === prop.id ? null : prop.id); setCommentDraft(r.comment || '') }}
                      className={btn}
                      style={{
                        padding: '11px 16px',
                        borderRadius: '12px',
                        background: 'white',
                        color: r.comment ? '#FF9500' : '#6E6E73',
                        border: r.comment ? '1.5px solid #FF9500' : '1.5px solid #e0e0e0',
                      }}
                    >
                      {r.comment ? <BtnCheck /> : <BtnPencil />}
                      {r.comment ? 'Nota guardada' : 'Agregar nota'}
                    </button>
                  </div>

                  {/* Comment editor */}
                  {editingComment === prop.id && (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={commentDraft}
                        onChange={e => setCommentDraft(e.target.value)}
                        placeholder="Escribí tu opinión sobre esta propiedad..."
                        rows={2}
                        className="w-full text-[14px] leading-[1.5] px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-[#1A5C38] resize-none text-[#1C1C1E]"
                      />
                      <div className="flex gap-1.5">
                        <button onClick={() => saveComment(prop.id)} className="flex-1 py-2.5 bg-[#1A5C38] text-white text-[13px] font-semibold rounded-xl">Guardar</button>
                        <button onClick={() => setEditingComment(null)} className="px-4 py-2.5 bg-[#F2F2F7] text-[#6E6E73] text-[13px] font-semibold rounded-xl">Cancelar</button>
                      </div>
                    </div>
                  )}

                  {commentSaved === prop.id && (
                    <p className="mt-1.5 text-[12px] text-[#1A5C38] font-medium flex items-center gap-1"><BtnCheck /> Guardado</p>
                  )}

                  {r.comment && editingComment !== prop.id && commentSaved !== prop.id && (
                    <p className="mt-1.5 text-[13px] text-[#6E6E73] italic leading-[1.4]">&ldquo;{r.comment}&rdquo;</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Summary section ── */}
        {hasReactions && (() => {
          const likedProps = session.properties.filter(p => reactions[p.id]?.liked === true)
          const visitProps = session.properties.filter(p => reactions[p.id]?.wantVisit)
          const getLabel = (p: Property) => propInfo[p.id]?.info?.title || parsePropertyLabel(p.url)
          const summaryMsg = encodeURIComponent(
            `Hola ${agentName}! Ya revisé todas las propiedades.\nMe gustaron: ${likedProps.length ? likedProps.map(getLabel).join(', ') : 'ninguna aún'}.\nQuiero visitar: ${visitProps.length ? visitProps.map(getLabel).join(', ') : 'a confirmar'}.\nEsperando tu contacto!`
          )
          return (
            <div className="mt-5 bg-white rounded-[20px] p-6" style={{ border: '2px solid #1A5C38' }}>
              <h3 className="text-[18px] font-bold text-[#1C1C1E] mb-4" style={{ fontFamily: 'Raleway, sans-serif' }}>Tu resumen</h3>

              {likedProps.length > 0 && (
                <div className="mb-4">
                  <p className="text-[14px] font-semibold text-[#1A5C38] flex items-center gap-1.5 mb-1.5">
                    <BtnHeart filled /> Te gustaron ({likedProps.length}):
                  </p>
                  <ul className="pl-4 space-y-0.5">
                    {likedProps.map(p => (
                      <li key={p.id} className="text-[14px] text-[#1C1C1E] before:content-['·'] before:mr-2 before:text-[#1A5C38] before:font-bold">
                        {getLabel(p)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {visitProps.length > 0 && (
                <div className="mb-4">
                  <p className="text-[14px] font-semibold text-[#1A5C38] flex items-center gap-1.5 mb-1.5">
                    <BtnCal /> Querés visitar ({visitProps.length}):
                  </p>
                  <ul className="pl-4 space-y-0.5">
                    {visitProps.map(p => (
                      <li key={p.id} className="text-[14px] text-[#1C1C1E] before:content-['·'] before:mr-2 before:text-[#1A5C38] before:font-bold">
                        {getLabel(p)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <a
                href={`https://wa.me/5493412101694?text=${summaryMsg}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#25D366] hover:bg-[#1ea952] text-white text-[15px] font-bold rounded-xl transition-colors"
              >
                <IcWA /> Enviar resumen por WhatsApp
              </a>
            </div>
          )
        })()}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white" style={{ borderTop: '0.5px solid rgba(60,60,67,0.12)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-[15px] font-semibold text-[#1C1C1E]">¿Tenés alguna pregunta?</p>
              <p className="text-[13px] text-[#6E6E73]">Respondemos en minutos</p>
            </div>
            <a
              href={`https://wa.me/5493412101694?text=${waMsg}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full sm:w-auto py-3.5 px-6 bg-[#25D366] hover:bg-[#1ea952] text-white text-[15px] font-bold rounded-2xl transition-colors"
            >
              <IcWA /> Escribir por WhatsApp
            </a>
          </div>
        </div>
      </div>

      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </div>
  )
}
