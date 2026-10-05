'use client'

// INSTRUCTIVO (David 4-oct: "un instructivo sencillo para insinuar cómo se
// maneja"): la primera vez en este celu, la tarjeta se mueve sola a la
// derecha (ME GUSTA) y a la izquierda (PASO) y un cartel lo dice en pocos
// renglones. Se va con "¡Entendido!" o tocando en cualquier lado.

import { useEffect, useState } from 'react'
import { Star, X } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import type { OrigenTinder } from '@/lib/tinder-contador'
import { AZUL_VISITA, CORAZON, Corazon, ROJO_PASO, VERDE } from './marca-mazo'

/** El instructivo se muestra una vez por navegador. */
const CLAVE_GUIA = 'si-mazo-guia-v2'

/** `mostrar` = el mazo abrió en una tarjeta (no directo en el final). Solo cuenta al abrir. */
export function useGuiaMazo(mostrar: boolean, origen: OrigenTinder) {
  const [guia, setGuia] = useState(false)
  const [guiaDx, setGuiaDx] = useState<number | null>(null)
  useEffect(() => {
    let vista = true
    try {
      vista = window.localStorage.getItem(CLAVE_GUIA) === '1'
    } catch {
      vista = false
    }
    if (vista || !mostrar) return
    setGuia(true)
    const pasos: [number, number | null][] = [[700, 90], [1500, -90], [2300, null], [3300, 90], [4100, -90], [4900, null]]
    const timers = pasos.map(([t, dx]) => window.setTimeout(() => setGuiaDx(dx), t))
    return () => timers.forEach((t) => window.clearTimeout(t))
    // Solo al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const cerrarGuia = () => {
    setGuia(false)
    setGuiaDx(null)
    try {
      window.localStorage.setItem(CLAVE_GUIA, '1')
    } catch {
      /* sin almacenamiento: se vuelve a mostrar la próxima vez */
    }
    trackEvent('feed_en_red_guia', { origen })
  }
  return { guia, guiaDx, cerrarGuia }
}

/** El cartel "Así de fácil". Se va con "¡Entendido!" o tocando en cualquier lado. */
export default function GuiaMazo({ onCerrar }: { onCerrar: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex items-end bg-black/20" onClick={onCerrar} role="presentation">
      <div
        className="w-full bg-white rounded-t-3xl px-5 pt-5 [@media(max-height:720px)]:pt-4 pb-[max(22px,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Cómo se usa"
      >
        <p className="text-xl font-black text-gray-900 font-raleway">Así de fácil</p>
        <ul className="mt-3 space-y-3 [@media(max-height:720px)]:mt-2 [@media(max-height:720px)]:space-y-2 text-[16px] text-gray-800">
          <li className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full grid place-items-center flex-none" style={{ background: '#E7F2EC', color: CORAZON }} aria-hidden="true">
              <Corazon lleno className="w-5 h-5" />
            </span>
            <span>
              <strong>Deslizá a la derecha</strong> la que te gusta
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full grid place-items-center flex-none" style={{ background: '#FDECEC', color: ROJO_PASO }} aria-hidden="true">
              <X className="w-5 h-5" strokeWidth={3} />
            </span>
            <span>
              <strong>A la izquierda</strong> para pasar a otra
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full grid place-items-center flex-none" style={{ background: '#E8F1FF', color: AZUL_VISITA }} aria-hidden="true">
              <Star className="w-5 h-5" fill="currentColor" strokeWidth={1.5} />
            </span>
            <span>
              <strong>Hacia arriba o ★</strong> si querés ir a verla
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full grid place-items-center flex-none bg-gray-100 text-gray-600" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M10 9l3 3-3 3" />
              </svg>
            </span>
            <span>
              <strong>Tocá el costado de la foto</strong> para ver más; tocá el precio para los detalles
            </span>
          </li>
        </ul>
        <p className="mt-3 text-[15px] text-gray-600 [@media(max-height:720px)]:hidden">Las que te gusten te las mandamos por WhatsApp.</p>
        <button type="button" onClick={onCerrar} className="mt-4 w-full h-12 rounded-2xl text-white font-bold text-[16px]" style={{ background: VERDE }} autoFocus>
          ¡Entendido!
        </button>
      </div>
    </div>
  )
}
