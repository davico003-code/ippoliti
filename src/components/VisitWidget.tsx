'use client'

import { useState, useMemo } from 'react'
import { Check } from 'lucide-react'

interface Props {
  propertyId: number
  propertyTitle: string
  /** URL pública de la ficha (siinmobiliaria.com/propiedades/{slug}).
   *  Si se pasa, se incluye en el mensaje de WhatsApp al agente. */
  propertyUrl?: string
  /** De dónde viene el lead (para tracking interno). */
  source?: 'mobile-sticky' | 'desktop-sidebar' | 'emprendimiento' | 'otro'
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

const HOURS = Array.from({ length: 9 }, (_, i) => `${9 + i}:00`)
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const GREEN = '#1A5C38'

// Modelo compacto y sobrio (inspirado en mob): tarjeta blanca, una sola vista
// (fecha, horario, nombre, teléfono) y el verde solo en el botón. Sin pasos ni
// scroll interno → no queda "a medio mostrar" en el sidebar.
export default function VisitWidget({
  propertyId,
  propertyTitle,
  propertyUrl,
  source = 'otro',
}: Props) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedHour, setSelectedHour] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const days = useMemo(() => getNextBusinessDays(7), [])

  const selectedDate = selectedDay !== null ? days[selectedDay] : null
  const dateLabel = selectedDate
    ? `${DAY_NAMES[selectedDate.getDay()]} ${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`
    : ''

  const canSubmit =
    selectedDay !== null && selectedHour !== '' && nombre.trim() !== '' && telefono.trim() !== ''

  async function handleSubmit() {
    if (!canSubmit || !selectedDate) return
    setLoading(true)

    const fechaStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`

    try {
      await fetch('/api/agendar-visita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          telefono: telefono.trim(),
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

    const lineas = [
      `Hola! 👋 Vengo de la propiedad "${propertyTitle}"${propertyUrl ? `:\n${propertyUrl}` : '.'}`,
      ``,
      `Me gustaría coordinar una visita el ${dateLabel} a las ${selectedHour} hs.`,
      ``,
      `Soy ${nombre.trim()}, mi teléfono es ${telefono.trim()}.`,
    ]
    const msg = encodeURIComponent(lineas.join('\n'))
    window.open(`https://wa.me/5493412101694?text=${msg}`, '_blank')

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
        <p className="text-[17px] font-bold text-gray-900 mb-1.5">¡Visita solicitada!</p>
        <p className="text-sm text-gray-500 mb-4">Te confirmamos por WhatsApp en menos de 2 hs.</p>
        <div className="rounded-xl p-3.5 text-left text-sm space-y-1 bg-gray-50">
          <p><span className="text-gray-400">Día:</span> <span className="font-semibold text-gray-900">{dateLabel}</span></p>
          <p><span className="text-gray-400">Horario:</span> <span className="font-semibold font-numeric text-gray-900">{selectedHour} hs</span></p>
          <p><span className="text-gray-400">Contacto:</span> <span className="font-semibold text-gray-900">{nombre}</span></p>
        </div>
      </div>
    )
  }

  const labelCls = 'text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2'
  const inputCls = 'w-full rounded-xl px-3.5 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none bg-gray-50 border border-gray-200 focus:border-[#1A5C38] transition-colors'

  return (
    <div className={CARD}>
      <h3 className="text-lg font-bold text-gray-900 mb-1">Agendá una visita</h3>
      <p className="text-[13px] text-gray-500 mb-5">Elegí el día y horario que te quede mejor.</p>

      {/* Fecha */}
      <p className={labelCls}>Fecha</p>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {days.map((d, i) => {
          const active = selectedDay === i
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              aria-pressed={active}
              className="flex-shrink-0 w-[50px] flex flex-col items-center gap-0.5 py-2.5 rounded-xl transition-all"
              style={
                active
                  ? { border: `2px solid ${GREEN}`, background: '#F4F8F5' }
                  : { border: '1px solid #e5e7eb' }
              }
            >
              <span className="text-[10px] font-semibold uppercase" style={{ color: active ? GREEN : '#9ca3af' }}>
                {DAY_NAMES[d.getDay()]}
              </span>
              <span className="text-xl font-bold font-numeric" style={{ color: active ? GREEN : '#111' }}>
                {d.getDate()}
              </span>
              <span className="text-[9px] font-medium" style={{ color: active ? GREEN : '#9ca3af' }}>
                {MONTH_NAMES[d.getMonth()]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Horario */}
      <p className={labelCls}>Horario</p>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {HOURS.map(h => {
          const active = selectedHour === h
          return (
            <button
              key={h}
              onClick={() => setSelectedHour(h)}
              aria-pressed={active}
              className="flex-shrink-0 px-3.5 py-2 rounded-xl text-sm font-semibold font-numeric transition-all"
              style={
                active
                  ? { border: `2px solid ${GREEN}`, background: '#F4F8F5', color: GREEN }
                  : { border: '1px solid #e5e7eb', color: '#374151' }
              }
            >
              {h}
            </button>
          )
        })}
      </div>

      {/* Datos */}
      <div className="space-y-3 mb-5">
        <input
          type="text"
          placeholder="Nombre y apellido"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className={inputCls}
        />
        <input
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          className={inputCls}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        className="w-full py-3.5 rounded-full font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: GREEN }}
      >
        {loading ? 'Enviando…' : 'Agendar visita'}
      </button>
    </div>
  )
}
