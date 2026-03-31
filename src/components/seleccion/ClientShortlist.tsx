'use client'

import { useState, useCallback, useRef } from 'react'
import { parsePropertyLabel, getTimeLeft, buildWhatsAppMessage } from '@/lib/seleccion'

interface Property { id: string; url: string; note: string }
interface Reaction { liked?: boolean | null; wantVisit?: boolean; comment?: string }
interface Session {
  clientName: string; agent: string; agentName?: string; note: string; expiresAt: string
  properties: Property[]
}

export default function ClientShortlist({
  session, initialReactions, token,
}: { session: Session; initialReactions: Record<string, Reaction>; token: string }) {
  const [reactions, setReactions] = useState<Record<string, Reaction>>(initialReactions)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const { days } = getTimeLeft(session.expiresAt)

  const patchReaction = useCallback((propertyId: string, patch: Partial<Reaction>) => {
    setReactions(prev => {
      const updated = { ...prev, [propertyId]: { ...prev[propertyId], ...patch } }
      // Debounced save
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

  const stats = {
    liked: session.properties.filter(p => reactions[p.id]?.liked === true).length,
    disliked: session.properties.filter(p => reactions[p.id]?.liked === false).length,
    wantVisit: session.properties.filter(p => reactions[p.id]?.wantVisit).length,
  }
  const hasReactions = stats.liked + stats.disliked + stats.wantVisit > 0

  const waMsg = encodeURIComponent(buildWhatsAppMessage(session, reactions))

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-black/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1A5C38] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">SI</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">Selección</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{session.clientName}</span>
            <span className="text-[10px] font-semibold bg-[#e8f5ee] text-[#1A5C38] px-2 py-0.5 rounded-full">
              {days}d
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-4">
        {/* Intro */}
        {session.note && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#1A5C38] uppercase tracking-wide mb-1">
              Mensaje de {session.agentName || session.agent}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">{session.note}</p>
          </div>
        )}

        {/* Summary bar */}
        {hasReactions && (
          <div className="bg-[#1A5C38] rounded-2xl p-4 flex items-center justify-between text-white">
            <div className="flex gap-4 text-sm">
              {stats.liked > 0 && <span>❤️ {stats.liked}</span>}
              {stats.disliked > 0 && <span>👎 {stats.disliked}</span>}
              {stats.wantVisit > 0 && <span>✅ {stats.wantVisit}</span>}
            </div>
            <span className="text-xs text-white/60">{session.properties.length} propiedades</span>
          </div>
        )}

        {/* Property cards */}
        {session.properties.map(prop => {
          const r = reactions[prop.id] || {}
          const label = parsePropertyLabel(prop.url)
          const isSI = prop.url.includes('siinmobiliaria.com')
          const borderColor = r.liked === true ? 'border-l-[#1A5C38]' : r.liked === false ? 'border-l-red-400' : 'border-l-transparent'

          return (
            <div key={prop.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${borderColor} transition-all`}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isSI && (
                        <span className="text-[9px] font-bold bg-[#1A5C38] text-white px-1.5 py-0.5 rounded">SI</span>
                      )}
                      <h3 className="text-sm font-bold text-gray-900 truncate">{label}</h3>
                    </div>
                    <a href={prop.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1A5C38] hover:underline truncate block">
                      Ver propiedad &rarr;
                    </a>
                  </div>
                </div>

                {prop.note && (
                  <p className="text-xs text-gray-400 italic mb-3">&ldquo;{prop.note}&rdquo;</p>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => patchReaction(prop.id, { liked: r.liked === true ? null : true })}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                      r.liked === true ? 'bg-[#1A5C38] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ❤️ Me gusta
                  </button>
                  <button
                    onClick={() => patchReaction(prop.id, { liked: r.liked === false ? null : false })}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                      r.liked === false ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    👎 No es
                  </button>
                  <button
                    onClick={() => patchReaction(prop.id, { wantVisit: !r.wantVisit })}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                      r.wantVisit ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ✅ Visitar
                  </button>
                  <button
                    onClick={() => { setEditingComment(editingComment === prop.id ? null : prop.id); setCommentDraft(r.comment || '') }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      r.comment ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ✏️
                  </button>
                </div>

                {/* Status chips */}
                {(r.liked !== undefined || r.wantVisit || r.comment) && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {r.liked === true && <span className="text-[10px] bg-[#e8f5ee] text-[#1A5C38] px-2 py-0.5 rounded-full font-medium">Le gusta</span>}
                    {r.liked === false && <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">Descartada</span>}
                    {r.wantVisit && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Quiere visitar</span>}
                    {r.comment && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">Con nota</span>}
                  </div>
                )}

                {/* Comment editor */}
                {editingComment === prop.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={commentDraft}
                      onChange={e => setCommentDraft(e.target.value)}
                      placeholder="Tu comentario..."
                      className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#1A5C38]"
                    />
                    <button
                      onClick={() => { patchReaction(prop.id, { comment: commentDraft }); setEditingComment(null) }}
                      className="px-3 py-2 bg-[#1A5C38] text-white text-xs font-bold rounded-xl"
                    >
                      OK
                    </button>
                  </div>
                )}

                {r.comment && editingComment !== prop.id && (
                  <p className="mt-2 text-xs text-gray-500 italic">&ldquo;{r.comment}&rdquo;</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-black/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">{session.agentName || session.agent} · SI Inmobiliaria</span>
          <a
            href={`https://wa.me/5493412101694?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#25D366] text-white text-sm font-bold rounded-full hover:bg-[#1ea952] transition-colors"
          >
            Responder por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
