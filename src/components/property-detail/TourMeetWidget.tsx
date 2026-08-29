'use client'

import { Check, Sparkles, Video } from 'lucide-react'
import { events } from '@/lib/analytics'

const R = "'Raleway', system-ui, sans-serif"
const GREEN = '#1A5C38'
const AGENT_PHONE = '5493412101694'

interface Props {
  propertyId: number
  propertyTitle: string
  propertyPrice: string
  propertyUrl: string
}

export default function TourMeetWidget({
  propertyId,
  propertyTitle,
  propertyPrice,
  propertyUrl,
}: Props) {
  const handleClick = () => {
    const text = `Hola! Me interesa la propiedad de ${propertyTitle} (${propertyUrl}). Quiero coordinar un tour virtual por Google Meet. ¿Qué horarios tienen disponibles?`
    const waUrl = `https://wa.me/${AGENT_PHONE}?text=${encodeURIComponent(text)}`

    // El píxel va ANTES del fetch y del window.open: en mobile el salto a
    // WhatsApp puede congelar el tab y un .then() posterior se pierde.
    events.tourMeetLead(propertyTitle)

    // Tracking no bloqueante. keepalive permite que el fetch sobreviva al
    // navigation que dispara window.open en algunos browsers.
    try {
      fetch('/api/leads/tour-meet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          propertyId,
          propertyTitle,
          propertyPrice,
          propertyUrl,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        }),
      }).catch(() => {})
    } catch {}

    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <span
        className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
        style={{ background: GREEN, color: '#fff', fontFamily: R }}
      >
        <Sparkles className="w-3 h-3" />
        Premium
      </span>

      <h3
        className="pr-20 mb-2"
        style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: GREEN, lineHeight: 1.25 }}
      >
        Tour virtual por Meet
      </h3>
      <p
        className="text-sm text-gray-600 mb-4"
        style={{ fontFamily: R, lineHeight: 1.55 }}
      >
        Recorré la propiedad desde donde estés. Coordiná una videollamada con un asesor que te muestra cada ambiente en vivo.
      </p>

      <ul className="space-y-2 mb-5" style={{ fontFamily: R }}>
        {[
          'Sin moverte de tu casa',
          'Recorrido guiado por un asesor',
          'Resolvemos tus dudas en tiempo real',
        ].map(item => (
          <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-colors"
        style={{ background: GREEN, color: '#fff', fontFamily: R }}
        onMouseEnter={e => { e.currentTarget.style.background = '#144a2c' }}
        onMouseLeave={e => { e.currentTarget.style.background = GREEN }}
      >
        <Video className="w-4 h-4" />
        Coordinar tour por Meet
      </button>
    </div>
  )
}
