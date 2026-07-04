'use client'

import { useMemo, useState } from 'react'
import { Calendar, Check, ChevronLeft, ChevronRight, Clock, MessageCircle, X } from 'lucide-react'

interface Props {
  propertyId: number
  propertyTitle: string
  /** URL pública de la ficha (siinmobiliaria.com/propiedades/{slug}).
   *  Si se pasa, se incluye en el mensaje de WhatsApp al agente. */
  propertyUrl?: string
  /** De dónde viene el lead (para tracking interno). */
  source?: 'mobile-sticky' | 'desktop-sidebar' | 'emprendimiento' | 'otro'
  /** Si se pasa, muestra la X de cerrar (ej. bottom-sheet mobile). */
  onClose?: () => void
}

function getNextBusinessDays(count: number): Date[] {
  const days: Date[] = []
  const d = new Date()
  d.setDate(d.getDate() + 1)
  while (days.length < count) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

// Horarios en slots de 30 min (09:00–18:30).
const HOURS = (() => {
  const out: string[] = []
  for (let h = 9; h <= 18; h++) {
    out.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 18) out.push(`${String(h).padStart(2, '0')}:30`)
  }
  return out
})()

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const GREEN = '#1A5C38'
const DAY_WIN = 3
const HOUR_WIN = 3

// Diseño: header con ícono + fecha/horario en ventanas de 3 con flechas, y el
// verde solo en el botón. Al agendar, registra el lead y abre WhatsApp al agente
// (el contacto queda por el WhatsApp del cliente).
export default function VisitWidget({
  propertyId,
  propertyTitle,
  propertyUrl,
  source = 'otro',
  onClose,
}: Props) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedHour, setSelectedHour] = useState('')
  const [dayStart, setDayStart] = useState(0)
  const [hourStart, setHourStart] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const days = useMemo(() => getNextBusinessDays(7), [])

  const selectedDate = selectedDay !== null ? days[selectedDay] : null
  const dateLabel = selectedDate
    ? `${DAY_NAMES[selectedDate.getDay()]} ${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`
    : ''
  const canSubmit = selectedDay !== null && selectedHour !== ''

  // Link de WhatsApp con el pedido pre-cargado. Se reusa en el submit y en la
  // confirmación (por si el popup se bloqueó o el cliente no llegó a enviarlo).
  const waHref = selectedDate
    ? `https://wa.me/5493412101694?text=${encodeURIComponent(
        [
          `Hola! 👋 Vengo de la propiedad "${propertyTitle}"${propertyUrl ? `:\n${propertyUrl}` : '.'}`,
          ``,
          `Me gustaría coordinar una visita el ${dateLabel} a las ${selectedHour} hs.`,
        ].join('\n'),
      )}`
    : ''

  async function handleSubmit() {
    if (!canSubmit || !selectedDate) return
    setLoading(true)

    const fechaStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`

    try {
      await fetch('/api/agendar-visita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: null,
          telefono: null,
          email: null,
          fecha_preferida: fechaStr,
          horario: `${selectedHour} hs`,
          propiedad_id: propertyId,
          propiedad_titulo: propertyTitle,
          propiedad_url: propertyUrl,
          tipo: 'venta',
          source,
        }),
      })
    } catch {}

    if (waHref) window.open(waHref, '_blank')

    setLoading(false)
    setSent(true)
  }

  const CARD = 'bg-white rounded-3xl p-6 border border-gray-200 shadow-sm'

  // ── Confirmación ──
  if (sent) {
    return (
      <div className={`${CARD} text-center`}>
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#E8F1ED' }}>
          <Check className="w-7 h-7" style={{ color: GREEN }} />
        </div>
        <p className="text-[17px] font-bold text-gray-900 mb-1.5">¡Casi listo!</p>
        <p className="text-sm text-gray-500 mb-4">
          Te abrimos WhatsApp con tu pedido. Enviá el mensaje y te confirmamos la visita en menos de 2 hs.
        </p>
        <div className="rounded-xl p-3.5 text-left text-sm space-y-1 bg-gray-50 mb-4">
          <p><span className="text-gray-400">Día:</span> <span className="font-semibold text-gray-900">{dateLabel}</span></p>
          <p><span className="text-gray-400">Horario:</span> <span className="font-semibold font-numeric text-gray-900">{selectedHour} hs</span></p>
        </div>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white"
          style={{ background: '#25D366' }}
        >
          <MessageCircle className="w-4 h-4" />
          Enviar por WhatsApp
        </a>
      </div>
    )
  }

  const arrowBtn = 'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500 transition-colors enabled:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed'
  const label = 'text-[15px] font-bold text-gray-900 mb-3'

  return (
    <div className={CARD}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#E8F1ED' }}>
          <Calendar className="w-5 h-5" style={{ color: GREEN }} />
        </span>
        <h3 className="text-xl font-bold text-gray-900">Agendar visita</h3>
        {onClose && (
          <button onClick={onClose} aria-label="Cerrar" className="ml-auto text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <p className="text-[13px] text-gray-500 mb-5 pl-[52px]">Seleccioná la fecha y hora</p>

      {/* Fecha */}
      <p className={label}>Elegí un día</p>
      <div className="flex items-stretch gap-2 mb-6">
        <button
          className={arrowBtn}
          onClick={() => setDayStart(s => Math.max(0, s - 1))}
          disabled={dayStart === 0}
          aria-label="Días anteriores"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 grid grid-cols-3 gap-2">
          {days.slice(dayStart, dayStart + DAY_WIN).map((d) => {
            const i = days.indexOf(d)
            const active = selectedDay === i
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                aria-pressed={active}
                className="flex flex-col items-center justify-center gap-0.5 py-3 rounded-xl transition-all"
                style={active ? { border: `2px solid ${GREEN}`, background: '#F4F8F5' } : { border: '1px solid #e5e7eb' }}
              >
                <span className="text-[11px] font-semibold" style={{ color: active ? GREEN : '#9ca3af' }}>{DAY_NAMES[d.getDay()]}</span>
                <span className="text-2xl font-bold font-numeric leading-none" style={{ color: active ? GREEN : '#111' }}>{d.getDate()}</span>
                <span className="text-[11px] font-medium" style={{ color: active ? GREEN : '#9ca3af' }}>{MONTH_NAMES[d.getMonth()]}</span>
              </button>
            )
          })}
        </div>
        <button
          className={arrowBtn}
          onClick={() => setDayStart(s => Math.min(days.length - DAY_WIN, s + 1))}
          disabled={dayStart + DAY_WIN >= days.length}
          aria-label="Días siguientes"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horario */}
      <p className={label}>Elegí un horario</p>
      <div className="flex items-stretch gap-2 mb-6">
        <button
          className={arrowBtn}
          onClick={() => setHourStart(s => Math.max(0, s - 1))}
          disabled={hourStart === 0}
          aria-label="Horarios anteriores"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 grid grid-cols-3 gap-2">
          {HOURS.slice(hourStart, hourStart + HOUR_WIN).map((h) => {
            const active = selectedHour === h
            return (
              <button
                key={h}
                onClick={() => setSelectedHour(h)}
                aria-pressed={active}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold font-numeric transition-all"
                style={active ? { border: `2px solid ${GREEN}`, background: '#F4F8F5', color: GREEN } : { border: '1px solid #e5e7eb', color: '#374151' }}
              >
                <Clock className="w-3.5 h-3.5" style={{ color: active ? GREEN : '#9ca3af' }} />
                {h}
              </button>
            )
          })}
        </div>
        <button
          className={arrowBtn}
          onClick={() => setHourStart(s => Math.min(HOURS.length - HOUR_WIN, s + 1))}
          disabled={hourStart + HOUR_WIN >= HOURS.length}
          aria-label="Horarios siguientes"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="border-t border-gray-100 mb-5" />

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: GREEN }}
      >
        <Calendar className="w-4 h-4" />
        {loading ? 'Enviando…' : 'Agendar visita'}
      </button>
    </div>
  )
}
