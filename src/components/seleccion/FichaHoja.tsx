'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, Heart, X } from 'lucide-react'
import type { SeleccionItem } from '@/lib/seleccion'
import { ChipsRed, Foto, LINEA_EN_RED, Specs, type Reaction } from './seleccion-ui'

/**
 * La ficha completa ADENTRO de la selección (celular y compu): el cliente la
 * recorre y decide ahí mismo, sin irse a otra pestaña. Las nuestras = la ficha
 * real de la web bajo /seleccion/ficha/… (sin menú ni pie); las de colegas =
 * su ficha neutra (verficha). Una parecida En red todavía no tiene: la arma
 * HILO al abrirla (~0,5 s); si no puede, se ven sus fotos y datos igual.
 */
export default function FichaHoja({
  item, token, reaction, onCerrar, onDecidir,
}: {
  item: SeleccionItem
  token: string
  reaction: Reaction
  onCerrar: () => void
  onDecidir: (d: 'like' | 'nope') => void
}) {
  const [cargando, setCargando] = useState(true)
  const [url, setUrl] = useState<string | null>(item.fichaUrl)
  const [sinFicha, setSinFicha] = useState(false)

  useEffect(() => {
    if (item.fichaUrl || !item.redId) return
    let vivo = true
    fetch(`/api/seleccion/${token}/ficha-red?id=${encodeURIComponent(item.redId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { fichaUrl?: string } | null) => {
        if (!vivo) return
        if (d?.fichaUrl) setUrl(d.fichaUrl)
        else setSinFicha(true)
      })
      .catch(() => { if (vivo) setSinFicha(true) })
    return () => { vivo = false }
  }, [item.fichaUrl, item.redId, token])
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

  if (!item.fichaUrl && !item.redId) return null

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
          {cargando && !sinFicha && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#D5DDD8] border-t-[#1A5C38]" />
            </div>
          )}
          {url && (
            <iframe src={url} title={item.title} onLoad={() => setCargando(false)}
              className="h-full w-full border-0 bg-white" style={{ opacity: cargando ? 0 : 1, transition: 'opacity 200ms' }} />
          )}
          {sinFicha && <VistaRapida item={item} />}
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

/** Sin ficha neutra (HILO no respondió): las fotos grandes y los datos, igual se puede decidir. */
function VistaRapida({ item }: { item: SeleccionItem }) {
  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto max-w-[760px] px-4 pb-10 pt-4">
        <ChipsRed item={item} />
        {item.price && <p className="font-numeric mt-3 text-[26px] font-semibold tracking-[-0.01em] text-[#111814]">{item.price}</p>}
        <h2 className="mt-1 text-[19px] font-bold leading-snug text-[#111814]">{item.title}</h2>
        {item.location && <p className="mt-0.5 text-[14px] text-[#66736B]">{item.location}</p>}
        <Specs item={item} className="mt-2.5 text-[13.5px] text-[#4F5C54]" />
        {item.enRed && <p className="mt-3 text-[13px] leading-relaxed text-[#66736B]">{LINEA_EN_RED}</p>}
        <div className="mt-5 grid gap-3">
          {item.photos.map((src, n) => (
            <div key={src + n} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#EEF1EF]">
              <Foto src={src} alt={`${item.title} — foto ${n + 1}`} sizes="(max-width: 767px) 100vw, 760px" eager={n < 2} logo={item.logo} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
