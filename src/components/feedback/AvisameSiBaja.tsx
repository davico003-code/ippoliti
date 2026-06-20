'use client'

// D — "Avisame si baja" (diseño v4 FINAL). Card gradiente verde con ícono 🔔
// + fila de input (WhatsApp o email) y botón BLANCO. Sin login. Captura un lead
// anónimo. El canal se detecta solo: si tiene "@" es email, si no WhatsApp.
//
// Specs (_referencias/feedback/…, sección D):
//   alert-card gradiente 135deg verde→verde-oscuro · ico 38px · h3 Raleway 13.5
//   "¿Te frena el precio?" + p "Te avisamos si baja o si entra algo parecido."
//   alert-row: input "Tu WhatsApp o email" + botón blanco "Avisame"
//   note italic "Sin spam · sin crear cuenta · cancelás cuando quieras."

import { useState } from 'react'

const POPPINS = "'Poppins', system-ui, sans-serif"
const RALEWAY = "'Raleway', system-ui, sans-serif"
const VERDE = '#1A5C38'
const VERDE_OSCURO = '#0F3F26'
const GRIS = '#7C8488'
const CARBON = '#24292B'

function detectCanal(v: string): 'whatsapp' | 'email' {
  return v.includes('@') ? 'email' : 'whatsapp'
}

export default function AvisameSiBaja({
  propertyId,
  valuacion = null,
}: {
  propertyId: number
  /** Valor actual del slider de valuación (si lo movió), para guardar con el lead. */
  valuacion?: number | null
}) {
  const [contacto, setContacto] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = contacto.trim()
    if (!v) {
      setStatus('error')
      return
    }
    if (status === 'sending') return
    setStatus('sending')
    fetch('/api/feedback/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, contacto: v, canal: detectCanal(v), valuacion }),
      credentials: 'same-origin',
    })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        setContacto('')
        setStatus('done')
      })
      .catch(() => setStatus('error'))
  }

  return (
    <div>
      {/* Card gradiente con ícono + texto */}
      <div
        className="flex items-center"
        style={{
          background: `linear-gradient(135deg, ${VERDE}, ${VERDE_OSCURO})`,
          color: '#fff',
          borderRadius: 14,
          padding: '15px 16px',
          gap: 13,
        }}
      >
        <div
          className="grid place-items-center flex-none"
          style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,.15)', fontSize: 18 }}
        >
          🔔
        </div>
        <div>
          <h3 style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 13.5, color: '#fff', lineHeight: 1.25 }}>
            ¿Te frena el precio?
          </h3>
          <p style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
            Te avisamos si baja o si entra algo parecido.
          </p>
        </div>
      </div>

      {/* Fila input + botón */}
      <form onSubmit={submit} className="flex" style={{ gap: 7, marginTop: 11 }}>
        <input
          type="text"
          value={contacto}
          onChange={(e) => {
            setContacto(e.target.value)
            if (status === 'error' || status === 'done') setStatus('idle')
          }}
          placeholder={status === 'done' ? '✓ Listo, te avisamos' : 'Tu WhatsApp o email'}
          aria-label="Tu WhatsApp o email"
          className="flex-1 border-0"
          style={{ borderRadius: 9, padding: '10px 12px', fontFamily: POPPINS, fontSize: 12.5, color: CARBON }}
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="cursor-pointer border-0"
          style={{
            background: '#fff',
            color: VERDE,
            borderRadius: 9,
            padding: '0 16px',
            fontFamily: RALEWAY,
            fontWeight: 700,
            fontSize: 12.5,
          }}
        >
          {status === 'sending' ? '…' : 'Avisame'}
        </button>
      </form>

      <p
        style={{
          fontSize: 11,
          color: status === 'done' ? VERDE : GRIS,
          textAlign: 'center',
          marginTop: 9,
          fontStyle: 'italic',
          lineHeight: 1.5,
        }}
      >
        {status === 'done'
          ? '✓ Te vamos a escribir. ¡Gracias!'
          : status === 'error'
            ? 'Escribí tu WhatsApp o email para activarlo.'
            : 'Sin spam · sin crear cuenta · cancelás cuando quieras.'}
      </p>
    </div>
  )
}
