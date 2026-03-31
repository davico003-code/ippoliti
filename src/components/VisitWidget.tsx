'use client'

import { useState, useMemo } from 'react'
import { Clock, Check, ChevronRight, ChevronDown, Calendar } from 'lucide-react'

interface Props {
  propertyId: number
  propertyTitle: string
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

const HOURS = Array.from({ length: 9 }, (_, i) => `${9 + i}:00 hs`)
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function VisitWidget({ propertyId, propertyTitle }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedHour, setSelectedHour] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const days = useMemo(() => getNextBusinessDays(7), [])

  const canContinue = selectedDay !== null && selectedHour !== ''
  const canSubmit = nombre.trim() !== '' && telefono.trim() !== ''

  const selectedDate = selectedDay !== null ? days[selectedDay] : null
  const dateLabel = selectedDate
    ? `${DAY_NAMES[selectedDate.getDay()]} ${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`
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
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          email: email.trim() || null,
          fecha_preferida: fechaStr,
          horario: selectedHour,
          propiedad_id: propertyId,
          propiedad_titulo: propertyTitle,
          tipo: 'venta',
        }),
      })
    } catch {}

    const msg = encodeURIComponent(
      `Hola, quiero agendar una visita el ${dateLabel} a las ${selectedHour}. Soy ${nombre.trim()}, mi teléfono es ${telefono.trim()}.`
    )
    window.open(`https://wa.me/5493412101694?text=${msg}`, '_blank')

    setLoading(false)
    setStep(3)
  }

  return (
    <div className="bg-[#1A5C38] rounded-3xl p-6 text-white flex flex-col" style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto', scrollBehavior: 'smooth' }}>
      {/* Progress */}
      <div className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {step === 3 ? 'COMPLETADO' : `PASO ${step} DE 2`}
        </p>
        <div className="flex gap-1.5">
          <div className="flex-1 h-[2.5px] rounded-full bg-white" />
          <div className={`flex-1 h-[2.5px] rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/20'}`} />
        </div>
      </div>

      <h3 className="text-lg font-bold mb-5">
        {step === 3 ? '¡Visita solicitada!' : 'Solicitá una visita'}
      </h3>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div>
          {/* Day selector */}
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Elegí un día
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
            {days.map((d, i) => {
              const active = selectedDay === i
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  className={`flex-shrink-0 w-[50px] flex flex-col items-center gap-0.5 py-2.5 rounded-xl transition-all ${
                    active
                      ? 'bg-white text-[#1A5C38]'
                      : 'border border-white/20 hover:border-white/40'
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

          {/* Hour selector */}
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Horario preferido
          </p>
          <div className="relative mb-6">
            <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-[11px]" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <Clock className="w-4 h-4 text-white/60 flex-shrink-0" />
              <select
                value={selectedHour}
                onChange={e => setSelectedHour(e.target.value)}
                className="flex-1 bg-transparent text-sm font-semibold text-white appearance-none outline-none cursor-pointer"
                style={{ WebkitAppearance: 'none' }}
              >
                <option value="" disabled className="text-gray-900">Seleccioná un horario</option>
                {HOURS.map(h => (
                  <option key={h} value={h} className="text-gray-900">{h}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
            </div>
          </div>

          {/* Continue */}
          <div className="sticky bottom-0 pt-3 bg-[#1A5C38] mt-auto z-10 w-full">
            <button
              onClick={() => canContinue && setStep(2)}
              disabled={!canContinue}
              className={`w-full py-3 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
                canContinue
                  ? 'bg-white text-[#1A5C38] hover:bg-white/90'
                  : 'bg-white text-[#1A5C38] opacity-[0.35] cursor-not-allowed'
              }`}
            >
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div>
          <div className="space-y-3 mb-6">
            <input
              type="text"
              placeholder="Nombre *"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full rounded-xl px-3.5 py-3 text-sm font-medium text-white placeholder-white/40 outline-none"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            />
            <input
              type="tel"
              placeholder="Teléfono *"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              className="w-full rounded-xl px-3.5 py-3 text-sm font-medium text-white placeholder-white/40 outline-none"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            />
            <input
              type="email"
              placeholder="Email (opcional)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl px-3.5 py-3 text-sm font-medium text-white placeholder-white/40 outline-none"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className={`w-full py-3 rounded-full font-bold text-sm transition-all mb-3 ${
              canSubmit && !loading
                ? 'bg-white text-[#1A5C38] hover:bg-white/90'
                : 'bg-white text-[#1A5C38] opacity-[0.35] cursor-not-allowed'
            }`}
          >
            {loading ? 'Enviando...' : 'Confirmar visita'}
          </button>

          <button
            onClick={() => setStep(1)}
            className="w-full text-center text-sm font-medium py-1"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            &larr; Volver
          </button>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {step === 3 && (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Check className="w-7 h-7 text-white" />
          </div>
          <p className="text-[17px] font-bold mb-2">¡Visita solicitada!</p>
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Te confirmamos por WhatsApp en menos de 2hs.
          </p>
          <div className="rounded-xl p-4 text-left text-sm space-y-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <p><span className="text-white/50">Día:</span> <span className="font-semibold">{dateLabel}</span></p>
            <p><span className="text-white/50">Horario:</span> <span className="font-semibold font-numeric">{selectedHour}</span></p>
            <p><span className="text-white/50">Contacto:</span> <span className="font-semibold">{nombre}</span></p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Mobile trigger + bottom sheet ── */
export function VisitMobileTrigger({ propertyId, propertyTitle }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[60px] left-3 right-3 z-40 md:hidden py-3 bg-[#1A5C38] text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        Solicitá una visita
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden flex items-end"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="bg-[#1A5C38] rounded-t-3xl p-6 pb-24">
              <div className="w-10 h-1 rounded-full bg-white/30 mx-auto mb-4" />
              <button
                onClick={() => setOpen(false)}
                className="absolute top-5 right-5 text-white/50 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
              <VisitWidget propertyId={propertyId} propertyTitle={propertyTitle} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
