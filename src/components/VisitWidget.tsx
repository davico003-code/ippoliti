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

// Modelo compacto (inspirado en mob): una sola vista — fecha, horario, nombre y
// teléfono, con un único botón. Sin pasos ni scroll interno, así no queda
// "a medio mostrar" en el sidebar.
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

  // ── Confirmación ──
  if (sent) {
    return (
      <div className="bg-[#1A5C38] rounded-3xl p-6 text-white text-center">
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <Check className="w-7 h-7 text-white" />
        </div>
        <p className="text-[17px] font-bold mb-1.5">¡Visita solicitada!</p>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Te confirmamos por WhatsApp en menos de 2 hs.
        </p>
        <div className="rounded-xl p-3.5 text-left text-sm space-y-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <p><span className="text-white/50">Día:</span> <span className="font-semibold">{dateLabel}</span></p>
          <p><span className="text-white/50">Horario:</span> <span className="font-semibold font-numeric">{selectedHour} hs</span></p>
          <p><span className="text-white/50">Contacto:</span> <span className="font-semibold">{nombre}</span></p>
        </div>
      </div>
    )
  }

  const labelCls = 'text-[10px] font-bold uppercase tracking-[0.12em] mb-2'
  const labelStyle = { color: 'rgba(255,255,255,0.5)' }
  const inputCls = 'w-full rounded-xl px-3.5 py-3 text-sm font-medium text-white placeholder-white/40 outline-none'
  const inputStyle = { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }

  return (
    <div className="bg-[#1A5C38] rounded-3xl p-6 text-white">
      <h3 className="text-lg font-bold mb-1">Agendá una visita</h3>
      <p className="text-[13px] mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
        Elegí el día y horario que te quede mejor.
      </p>

      {/* Fecha */}
      <p className={labelCls} style={labelStyle}>Fecha</p>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {days.map((d, i) => {
          const active = selectedDay === i
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              aria-pressed={active}
              className={`flex-shrink-0 w-[50px] flex flex-col items-center gap-0.5 py-2.5 rounded-xl transition-all ${
                active ? 'bg-white text-[#1A5C38]' : 'border border-white/20 hover:border-white/40'
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase ${active ? 'text-[#1A5C38]/60' : 'text-white/50'}`}>
                {DAY_NAMES[d.getDay()]}
              </span>
              <span className={`text-xl font-bold font-numeric ${active ? 'text-[#1A5C38]' : 'text-white'}`}>
                {d.getDate()}
              </span>
              <span className={`text-[9px] font-medium ${active ? 'text-[#1A5C38]/60' : 'text-white/40'}`}>
                {MONTH_NAMES[d.getMonth()]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Horario */}
      <p className={labelCls} style={labelStyle}>Horario</p>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {HOURS.map(h => {
          const active = selectedHour === h
          return (
            <button
              key={h}
              onClick={() => setSelectedHour(h)}
              aria-pressed={active}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-sm font-semibold font-numeric transition-all ${
                active ? 'bg-white text-[#1A5C38]' : 'border border-white/20 text-white hover:border-white/40'
              }`}
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
          style={inputStyle}
        />
        <input
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          className={inputCls}
          style={inputStyle}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        className={`w-full py-3.5 rounded-full font-bold text-sm transition-all ${
          canSubmit && !loading
            ? 'bg-white text-[#1A5C38] hover:bg-white/90'
            : 'bg-white text-[#1A5C38] opacity-[0.35] cursor-not-allowed'
        }`}
      >
        {loading ? 'Enviando…' : 'Agendar visita'}
      </button>
    </div>
  )
}
