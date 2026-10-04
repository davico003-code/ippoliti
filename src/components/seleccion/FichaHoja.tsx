'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, Heart, X } from 'lucide-react'
import type { SeleccionItem } from '@/lib/seleccion'
import type { Reaction } from './seleccion-ui'

/**
 * La ficha completa ADENTRO de la selección (celular y compu): el cliente la
 * recorre y decide ahí mismo, sin irse a otra pestaña. Es la ficha real de la
 * web servida bajo /seleccion/ficha/… (sin menú ni pie).
 */
export default function FichaHoja({
  item, reaction, onCerrar, onDecidir,
}: {
  item: SeleccionItem
  reaction: Reaction
  onCerrar: () => void
  onDecidir: (d: 'like' | 'nope') => void
}) {
  const [cargando, setCargando] = useState(true)
  const gusta = reaction.liked === true
  const nope = reaction.liked === false

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar() }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onCerrar])

  if (!item.fichaUrl) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/50 md:p-5" role="dialog" aria-modal="true" aria-label={`Ficha: ${item.title}`}
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar() }}>
      <div className="si-hoja-entra mx-auto flex h-full w-full max-w-[1320px] flex-col overflow-hidden bg-white md:rounded-[24px] md:shadow-2xl">
        <header className="flex items-center gap-2 border-b border-[#EEF1EF] px-2 py-2 md:px-4" style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
          <button type="button" onClick={onCerrar}
            className="flex items-center gap-0.5 rounded-full py-2 pl-1.5 pr-3 text-[14px] font-semibold text-[#1C2620] hover:bg-[#F4F6F5]">
            <ChevronLeft className="h-5 w-5" /> <span>Volver</span>
          </button>
          <p className="min-w-0 flex-1 truncate text-center text-[14px] font-semibold text-[#111814] md:text-left">{item.title}</p>
          {/* En la compu se decide desde acá; en el celular, desde la barra de abajo. */}
          <div className="hidden items-center gap-2 md:flex">
            <BotonDecision tipo="nope" activo={nope} onClick={() => onDecidir('nope')} />
            <BotonDecision tipo="like" activo={gusta} onClick={() => onDecidir('like')} />
          </div>
          <span className="w-[72px] md:hidden" aria-hidden />
        </header>

        <div className="relative min-h-0 flex-1 bg-[#F4F6F5]">
          {cargando && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#D5DDD8] border-t-[#1A5C38]" />
            </div>
          )}
          <iframe src={item.fichaUrl} title={item.title} onLoad={() => setCargando(false)}
            className="h-full w-full border-0 bg-white" style={{ opacity: cargando ? 0 : 1, transition: 'opacity 200ms' }} />
        </div>

        <footer className="grid grid-cols-2 gap-2 border-t border-[#EEF1EF] px-3 pt-2.5 md:hidden" style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
          <BotonDecision tipo="nope" activo={nope} ancho onClick={() => onDecidir('nope')} />
          <BotonDecision tipo="like" activo={gusta} ancho onClick={() => onDecidir('like')} />
        </footer>
      </div>
    </div>
  )
}

function BotonDecision({ tipo, activo, ancho, onClick }: { tipo: 'like' | 'nope'; activo: boolean; ancho?: boolean; onClick: () => void }) {
  const like = tipo === 'like'
  const color = like ? '#1A5C38' : '#F40009'
  return (
    <button type="button" onClick={onClick} aria-pressed={activo}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border text-[14px] font-semibold transition active:scale-95 ${ancho ? 'py-3' : 'px-4 py-2'}`}
      style={activo ? { background: color, borderColor: color, color: '#fff' } : { background: '#fff', borderColor: '#E3E7E4', color }}>
      {like ? <Heart className="h-4 w-4" strokeWidth={2.6} fill={activo ? 'currentColor' : 'none'} /> : <X className="h-4 w-4" strokeWidth={3} />}
      {like ? 'Me gusta' : 'No me interesa'}
    </button>
  )
}
