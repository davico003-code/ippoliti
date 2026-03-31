'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { parsePropertyLabel, getTimeLeft, buildWhatsAppMessage } from '@/lib/seleccion'

interface Property { id: string; url: string; note: string }
interface Reaction { liked?: boolean | null; wantVisit?: boolean; comment?: string }
interface Session {
  clientName: string; agent: string; agentName?: string; note: string; expiresAt: string
  properties: Property[]
}

interface TokkoData {
  publication_title?: string
  address?: string
  fake_address?: string
  suite_amount?: number
  room_amount?: number
  bathroom_amount?: number
  total_surface?: string
  roofed_surface?: string
  surface?: string
  location?: { name?: string; short_location?: string }
  photos?: { image?: string; thumb?: string; is_front_cover?: boolean; is_blueprint?: boolean }[]
  operations?: { operation_type?: string; prices?: { currency?: string; price?: number }[] }[]
}

function extractTokkoId(url: string): string | null {
  const m = /(\d{6,8})/.exec(url)
  return m ? m[1] : null
}

function getPhoto(data: TokkoData): string | null {
  const photos = (data.photos || []).filter(p => !p.is_blueprint)
  const cover = photos.find(p => p.is_front_cover)
  const first = cover || photos[0]
  return first?.image || first?.thumb || null
}

function getTitle(data: TokkoData): string {
  return data.publication_title || data.address || data.fake_address || ''
}

function getLocation(data: TokkoData): string {
  return data.location?.short_location || data.location?.name || ''
}

function getRooms(data: TokkoData): number {
  return data.suite_amount || data.room_amount || 0
}

function getArea(data: TokkoData): number {
  return parseFloat(data.roofed_surface || data.total_surface || data.surface || '0') || 0
}

function getPrice(data: TokkoData): { amount: number; currency: string } | null {
  const p = data.operations?.[0]?.prices?.[0]
  if (!p?.price) return null
  return { amount: p.price, currency: p.currency || 'USD' }
}

function formatPriceShort(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString('es-AR')}`
}

/* ── SVG Icons ── */
const IconBed = ({ className = '' }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M3 9V19M21 9V19M3 15H21M3 9C3 7.9 3.9 7 5 7H19C20.1 7 21 7.9 21 9"/>
    <path d="M7 7V5C7 4.4 7.4 4 8 4H16C16.6 4 17 4.4 17 5V7"/>
  </svg>
)

const IconBath = ({ className = '' }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M4 12H20V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V12Z"/>
    <path d="M4 12V6C4 4.9 4.9 4 6 4C7.1 4 8 4.9 8 6V8"/>
    <path d="M8 8H20"/>
  </svg>
)

const IconArea = ({ className = '' }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9H21M9 3V21"/>
  </svg>
)

const IconPrice = ({ className = '' }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M6 12H6.01M18 12H18.01"/>
  </svg>
)

const IconHeart = ({ filled, className = '' }: { filled?: boolean; className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

const IconThumbDown = ({ className = '' }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
  </svg>
)

const IconCalendar = ({ className = '' }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const IconPencil = ({ className = '' }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const IconWhatsApp = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const IconHouse = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="1.5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

/* ── Component ── */
export default function ClientShortlist({
  session, initialReactions, token,
}: { session: Session; initialReactions: Record<string, Reaction>; token: string }) {
  const [reactions, setReactions] = useState<Record<string, Reaction>>(initialReactions)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [commentSaved, setCommentSaved] = useState<string | null>(null)
  const [propData, setPropData] = useState<Record<string, { loading: boolean; data: TokkoData | null }>>({})
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const { days } = getTimeLeft(session.expiresAt)
  const agentName = session.agentName || session.agent

  // Fetch property data from Tokko
  useEffect(() => {
    const entries = session.properties.map(p => ({ id: p.id, tokkoId: extractTokkoId(p.url) }))
    const toFetch = entries.filter(e => e.tokkoId)

    // Set loading
    const initial: Record<string, { loading: boolean; data: TokkoData | null }> = {}
    for (const e of entries) initial[e.id] = { loading: !!e.tokkoId, data: null }
    setPropData(initial)

    if (toFetch.length === 0) return

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    Promise.allSettled(
      toFetch.map(async e => {
        const res = await fetch(`/api/propiedades/${e.tokkoId}`, { signal: controller.signal })
        if (!res.ok) throw new Error('fail')
        const data = await res.json()
        return { propId: e.id, data }
      })
    ).then(results => {
      setPropData(prev => {
        const next = { ...prev }
        for (const r of results) {
          if (r.status === 'fulfilled') {
            next[r.value.propId] = { loading: false, data: r.value.data }
          }
        }
        // Stop loading for failed ones
        for (const e of toFetch) {
          if (next[e.id]?.loading) next[e.id] = { loading: false, data: null }
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
        <div className="max-w-2xl mx-auto px-4 py-3.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#1A5C38] font-extrabold text-base" style={{ fontFamily: 'Raleway, sans-serif' }}>SI</span>
            <span className="text-[#6E6E73] text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>Inmobiliaria</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[16px] text-[#1C1C1E]">
              Selección preparada para: <strong>{session.clientName}</strong>
            </p>
            <span className="text-[13px] font-medium text-[#1A5C38] bg-[#1A5C38]/8 px-3 py-1 rounded-full whitespace-nowrap">
              Válida por {days} día{days !== 1 ? 's' : ''} más
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-40 space-y-5">
        {/* Agent note */}
        {session.note && (
          <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid rgba(60,60,67,0.12)' }}>
            <p className="text-[14px] text-[#6E6E73] mb-1">Mensaje de {agentName}:</p>
            <p className="text-[16px] text-[#1C1C1E] leading-[1.6]">{session.note}</p>
          </div>
        )}

        {/* Summary */}
        {hasReactions && (
          <div className="bg-[#1A5C38] rounded-2xl px-5 py-4 flex items-center justify-between text-white">
            <p className="text-[15px] font-medium">
              {stats.liked > 0 && <>{stats.liked} te gustaron</>}
              {stats.liked > 0 && stats.wantVisit > 0 && ' · '}
              {stats.wantVisit > 0 && <>{stats.wantVisit} querés visitar</>}
            </p>
            <span className="text-[13px] text-white/50">{session.properties.length} propiedades</span>
          </div>
        )}

        {/* Property cards */}
        {session.properties.map((prop, idx) => {
          const r = reactions[prop.id] || {}
          const pd = propData[prop.id]
          const data = pd?.data
          const loading = pd?.loading
          const title = data ? getTitle(data) : parsePropertyLabel(prop.url)
          const location = data ? getLocation(data) : ''
          const photo = data ? getPhoto(data) : null
          const rooms = data ? getRooms(data) : 0
          const baths = data?.bathroom_amount || 0
          const area = data ? getArea(data) : 0
          const price = data ? getPrice(data) : null
          const borderColor = r.liked === true ? '#1A5C38' : r.liked === false ? '#FF3B30' : 'transparent'

          return (
            <div
              key={prop.id}
              className="bg-white rounded-[20px] overflow-hidden transition-all"
              style={{ border: '0.5px solid rgba(60,60,67,0.12)', borderLeftWidth: '4px', borderLeftColor: borderColor }}
            >
              {/* Photo */}
              <div className="relative h-[200px] bg-[#e8f0eb]">
                {loading ? (
                  <div className="w-full h-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                ) : photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconHouse />
                  </div>
                )}
                {/* Number badge */}
                <div className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center">
                  <span className="text-[14px] font-bold text-[#1A5C38] font-numeric" style={{ fontFamily: 'Raleway, sans-serif' }}>
                    #{idx + 1}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-[18px] font-bold text-[#1C1C1E] leading-[1.4] line-clamp-2 mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  {title}
                </h3>
                {location && (
                  <p className="text-[14px] text-[#6E6E73] mb-3">{location}</p>
                )}

                {/* Specs */}
                {(rooms > 0 || baths > 0 || area > 0 || price) && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {rooms > 0 && (
                      <span className="flex items-center gap-1.5 text-[14px] font-medium text-[#1C1C1E]">
                        <IconBed className="text-[#1A5C38]" /> {rooms} dorm.
                      </span>
                    )}
                    {baths > 0 && (
                      <span className="flex items-center gap-1.5 text-[14px] font-medium text-[#1C1C1E]">
                        <IconBath className="text-[#1A5C38]" /> {baths} baño{baths > 1 ? 's' : ''}
                      </span>
                    )}
                    {area > 0 && (
                      <span className="flex items-center gap-1.5 text-[14px] font-medium text-[#1C1C1E]">
                        <IconArea className="text-[#1A5C38]" /> {area} m²
                      </span>
                    )}
                    {price && (
                      <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[#1A5C38]">
                        <IconPrice className="text-[#1A5C38]" /> {formatPriceShort(price.amount, price.currency)}
                      </span>
                    )}
                  </div>
                )}

                {/* Agent note */}
                {prop.note && (
                  <p className="text-[14px] text-[#6E6E73] italic mb-3 leading-[1.5]">
                    Nota del agente: &ldquo;{prop.note}&rdquo;
                  </p>
                )}

                {/* Link */}
                <a
                  href={prop.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[14px] font-semibold text-[#1A5C38] hover:underline mb-4"
                >
                  Ver todos los detalles &rarr;
                </a>

                {/* Divider */}
                <div className="h-px bg-[rgba(60,60,67,0.12)] mb-4" />

                {/* Reaction buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <button
                    onClick={() => patchReaction(prop.id, { liked: r.liked === true ? null : true })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[15px] font-semibold transition-all active:scale-[0.96] ${
                      r.liked === true ? 'bg-[#1A5C38] text-white' : 'bg-[#F2F2F7] text-[#6E6E73] hover:bg-[#e8e8ed]'
                    }`}
                  >
                    <IconHeart filled={r.liked === true} /> Me gusta
                  </button>
                  <button
                    onClick={() => patchReaction(prop.id, { liked: r.liked === false ? null : false })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[15px] font-semibold transition-all active:scale-[0.96] ${
                      r.liked === false ? 'bg-[#FF3B30] text-white' : 'bg-[#F2F2F7] text-[#6E6E73] hover:bg-[#e8e8ed]'
                    }`}
                  >
                    <IconThumbDown /> No me gusta
                  </button>
                </div>

                {/* Visit button — larger, more prominent */}
                <button
                  onClick={() => patchReaction(prop.id, { wantVisit: !r.wantVisit })}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-[16px] font-bold transition-all active:scale-[0.96] mb-2 ${
                    r.wantVisit ? 'bg-[#007AFF] text-white' : 'bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#e8e8ed]'
                  }`}
                >
                  <IconCalendar /> Quiero visitarla
                </button>

                {/* Comment button */}
                <button
                  onClick={() => { setEditingComment(editingComment === prop.id ? null : prop.id); setCommentDraft(r.comment || '') }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[14px] font-semibold transition-all ${
                    r.comment ? 'bg-[#FF9500]/10 text-[#FF9500]' : 'bg-[#F2F2F7] text-[#6E6E73] hover:bg-[#e8e8ed]'
                  }`}
                >
                  <IconPencil /> {r.comment ? 'Ver mi nota' : 'Agregar nota'}
                </button>

                {/* Comment editor */}
                {editingComment === prop.id && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={commentDraft}
                      onChange={e => setCommentDraft(e.target.value)}
                      placeholder="Escribí tu opinión sobre esta propiedad. Por ejemplo: me gusta la ubicación pero el precio es alto."
                      rows={3}
                      className="w-full text-[16px] leading-[1.5] px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#1A5C38] resize-none text-[#1C1C1E] placeholder-[#6E6E73]/50"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveComment(prop.id)}
                        className="flex-1 py-2.5 bg-[#1A5C38] text-white text-[15px] font-semibold rounded-xl"
                      >
                        Guardar comentario
                      </button>
                      <button
                        onClick={() => setEditingComment(null)}
                        className="px-4 py-2.5 bg-[#F2F2F7] text-[#6E6E73] text-[15px] font-semibold rounded-xl"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Saved confirmation */}
                {commentSaved === prop.id && (
                  <p className="mt-2 text-[14px] text-[#1A5C38] font-medium flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A5C38" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Tu comentario fue guardado
                  </p>
                )}

                {/* Display saved comment */}
                {r.comment && editingComment !== prop.id && commentSaved !== prop.id && (
                  <p className="mt-2 text-[14px] text-[#6E6E73] italic leading-[1.5]">&ldquo;{r.comment}&rdquo;</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom contact bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white" style={{ borderTop: '0.5px solid rgba(60,60,67,0.12)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <p className="text-[16px] font-semibold text-[#1C1C1E] mb-0.5">¿Tenés alguna pregunta?</p>
          <p className="text-[14px] text-[#6E6E73] mb-3">Escribinos directamente — respondemos en minutos</p>
          <a
            href={`https://wa.me/5493412101694?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-4 px-6 bg-[#25D366] hover:bg-[#1ea952] text-white text-[16px] font-bold rounded-2xl transition-colors"
          >
            <IconWhatsApp />
            Escribir por WhatsApp
          </a>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
