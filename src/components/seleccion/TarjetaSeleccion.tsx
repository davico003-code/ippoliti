'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { CalendarDays, Check, ChevronLeft, ChevronRight, Heart, MessageCircle, X } from 'lucide-react'
import type { SeleccionItem } from '@/lib/seleccion'
import { Foto, Specs, isValidNote, logoDePortal, type Reaction } from './seleccion-ui'

/**
 * Tarjeta de la grilla (compu, y la lista del celular después del mazo).
 * Foto grande con todas las fotos para pasar ahí mismo; dos botones redondos
 * (✕ / ❤); "Ver ficha" la abre adentro de la página. Visita y comentario
 * aparecen recién cuando le gusta: la tarjeta queda limpia.
 */
export default function TarjetaSeleccion({
  item, idx, reaction, onDecidir, onVisita, onComentario, onFicha,
}: {
  item: SeleccionItem
  idx: number
  reaction: Reaction
  onDecidir: (d: 'like' | 'nope') => void
  onVisita: () => void
  onComentario: (texto: string) => void
  onFicha: () => void
}) {
  const fotos = item.photos
  const [i, setI] = useState(0)
  // Monta la actual y sus vecinas: la flecha corre la foto al instante.
  const [montadas, setMontadas] = useState<number[]>([0])
  const [comentando, setComentando] = useState(false)
  const toque = useRef<number | null>(null)

  const ir = (n: number) => {
    const sig = (n + fotos.length) % fotos.length
    setI(sig)
    setMontadas((m) => Array.from(new Set([...m, sig, (sig + 1) % fotos.length])))
  }
  const portal = item.externa ? logoDePortal(item.url) : null
  const gusta = reaction.liked === true
  const nope = reaction.liked === false
  const puntoMax = Math.min(fotos.length, 5)
  const puntoActivo = fotos.length <= 5 ? i : Math.round((i / (fotos.length - 1)) * (puntoMax - 1))

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-[22px] bg-white transition-shadow duration-300 hover:shadow-[0_18px_40px_-18px_rgba(16,40,28,0.35)]"
      style={{ boxShadow: gusta ? `0 0 0 2px #1A5C38, 0 10px 30px -18px rgba(16,40,28,0.4)` : '0 1px 0 rgba(16,40,28,0.06), 0 10px 30px -20px rgba(16,40,28,0.35)' }}
    >
      <div
        className="group/foto relative aspect-[4/3] w-full overflow-hidden bg-[#EEF1EF]"
        onMouseEnter={() => fotos.length > 1 && setMontadas((m) => Array.from(new Set([...m, 1])))}
        onTouchStart={(e) => { toque.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          if (toque.current == null || fotos.length <= 1) return
          const dx = e.changedTouches[0].clientX - toque.current
          if (Math.abs(dx) > 40) ir(dx < 0 ? i + 1 : i - 1)
          toque.current = null
        }}
      >
        {fotos.length > 0 ? (
          <div className={`absolute inset-0 flex transition-transform duration-300 ease-out ${item.fichaUrl ? 'cursor-pointer' : ''}`}
            style={{ transform: `translateX(-${i * 100}%)` }} onClick={item.fichaUrl ? onFicha : undefined}>
            {fotos.map((src, n) => (
              <div key={src + n} className="relative h-full w-full flex-none">
                {montadas.includes(n) && (
                  <Foto src={src} alt={n === 0 ? item.title : `${item.title} — foto ${n + 1}`}
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <button type="button" onClick={onFicha} className="flex h-full w-full items-center justify-center text-[13px] text-[#8A968E]">
            Sin foto
          </button>
        )}

        {fotos.length > 1 && (
          <>
            <button type="button" aria-label="Foto anterior" onClick={() => ir(i - 1)}
              className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1C2620] opacity-0 shadow-md transition hover:bg-white focus-visible:opacity-100 group-hover/foto:opacity-100 md:flex">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Foto siguiente" onClick={() => ir(i + 1)}
              className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1C2620] opacity-0 shadow-md transition hover:bg-white focus-visible:opacity-100 group-hover/foto:opacity-100 md:flex">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
              {Array.from({ length: puntoMax }).map((_, n) => (
                <span key={n} className="block rounded-full bg-white transition-all duration-200"
                  style={{ width: n === puntoActivo ? 16 : 6, height: 6, opacity: n === puntoActivo ? 1 : 0.6, boxShadow: '0 0 4px rgba(0,0,0,0.35)' }} />
              ))}
            </div>
            <span className="font-numeric pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
              {i + 1}/{fotos.length}
            </span>
          </>
        )}

        <span className="font-numeric absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11.5px] font-semibold text-[#1C2620] shadow-sm">
          {item.sugerida ? 'Parecida' : `#${idx + 1}`}
        </span>
        {portal && (
          <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-sm">
            <Image src={portal.logo} alt={portal.name} width={24} height={24} className="h-6 w-auto" />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        {item.price && <p className="font-numeric text-[19px] font-semibold leading-tight tracking-[-0.01em] text-[#1A5C38]">{item.price}</p>}
        <h3 className="mt-1 text-[15px] font-semibold leading-snug text-[#111814]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.title}
        </h3>
        {item.location && <p className="mt-0.5 truncate text-[13px] text-[#66736B]">{item.location}</p>}
        <Specs item={item} className="mt-2 text-[12.5px] text-[#4F5C54]" />
        {isValidNote(item.note) && <p className="mt-2 text-[13px] italic leading-snug text-[#4F5C54]">&ldquo;{item.note}&rdquo;</p>}

        <div className="flex-1" />

        <div className="mt-4 flex items-center gap-2">
          {item.fichaUrl ? (
            <button type="button" onClick={onFicha}
              className="mr-auto rounded-full px-1 py-2 text-[13.5px] font-semibold text-[#1A5C38] underline-offset-4 hover:underline">
              Ver ficha
            </button>
          ) : <span className="mr-auto" />}
          <button type="button" aria-label="No me interesa" aria-pressed={nope} onClick={() => onDecidir('nope')}
            className="flex h-11 w-11 items-center justify-center rounded-full border transition active:scale-90"
            style={nope ? { background: '#F40009', borderColor: '#F40009', color: '#fff' } : { background: '#fff', borderColor: '#E3E7E4', color: '#F40009' }}>
            <X className="h-5 w-5" strokeWidth={2.6} />
          </button>
          <button type="button" aria-label="Me gusta" aria-pressed={gusta} onClick={() => onDecidir('like')}
            className="flex h-11 w-11 items-center justify-center rounded-full border transition active:scale-90"
            style={gusta ? { background: '#1A5C38', borderColor: '#1A5C38', color: '#fff' } : { background: '#fff', borderColor: '#E3E7E4', color: '#1A5C38' }}>
            <Heart className="h-5 w-5" strokeWidth={2.4} fill={gusta ? 'currentColor' : 'none'} />
          </button>
        </div>

        {gusta && (
          <div className="mt-3 border-t border-[#EEF1EF] pt-3">
            <div className="flex items-center gap-2">
              <button type="button" onClick={onVisita}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition active:scale-95"
                style={reaction.wantVisit ? { background: '#EAF3EE', borderColor: '#1A5C38', color: '#1A5C38' } : { background: '#fff', borderColor: '#E3E7E4', color: '#1C2620' }}>
                {reaction.wantVisit ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <CalendarDays className="h-3.5 w-3.5" />}
                {reaction.wantVisit ? 'Visita pedida' : 'Quiero visitarla'}
              </button>
              {!comentando && !reaction.comment && (
                <button type="button" onClick={() => setComentando(true)}
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[12.5px] font-semibold text-[#66736B] hover:text-[#1C2620]">
                  <MessageCircle className="h-3.5 w-3.5" /> Comentar
                </button>
              )}
            </div>
            {(comentando || !!reaction.comment) && (
              <textarea value={reaction.comment || ''} onChange={(e) => onComentario(e.target.value)} rows={2} autoFocus={comentando && !reaction.comment}
                placeholder="Ej: me gusta la zona, ¿se puede ver el sábado?"
                className="mt-2 w-full resize-none rounded-xl border border-[#E3E7E4] bg-[#FAFBFA] px-3 py-2 text-[13px] leading-snug text-[#1C2620] outline-none transition focus:border-[#1A5C38] focus:bg-white" />
            )}
          </div>
        )}
      </div>
    </article>
  )
}
