'use client'

// "Avisame si baja": card comprimida verde con input (WhatsApp o email) y un
// botón BLANCO (no dorado). Sin login. Captura un lead anónimo. El canal se
// detecta solo: si tiene "@" es email, si no se trata como WhatsApp.

import { useState } from 'react'

const POPPINS = "'Poppins', system-ui, sans-serif"
const RALEWAY = "'Raleway', system-ui, sans-serif"
const GREEN = '#1A5C38'
const GREEN_DARK = '#0F3F26'

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
    if (!v || status === 'sending') return
    setStatus('sending')
    fetch('/api/feedback/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, contacto: v, canal: detectCanal(v), valuacion }),
      credentials: 'same-origin',
    })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        setStatus('done')
      })
      .catch(() => setStatus('error'))
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: GREEN }}>
      <p style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 17, color: '#fff', margin: '0 0 2px' }}>
        ¿Te interesa pero el precio te frena?
      </p>
      <p style={{ fontFamily: RALEWAY, fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '0 0 14px' }}>
        Dejanos tu WhatsApp o email y te avisamos si baja.
      </p>

      {status === 'done' ? (
        <div
          className="rounded-xl px-4 py-3 text-center"
          style={{ background: GREEN_DARK, fontFamily: POPPINS, fontSize: 14, fontWeight: 600, color: '#fff' }}
        >
          ¡Listo! Te avisamos si baja. ✅
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            inputMode="text"
            value={contacto}
            onChange={(e) => {
              setContacto(e.target.value)
              if (status === 'error') setStatus('idle')
            }}
            placeholder="WhatsApp o email"
            aria-label="WhatsApp o email"
            className="flex-1 rounded-xl px-4 py-3 outline-none"
            style={{ fontFamily: POPPINS, fontSize: 14, border: 'none' }}
          />
          <button
            type="submit"
            disabled={status === 'sending' || !contacto.trim()}
            className="rounded-xl px-5 py-3 font-bold transition-opacity disabled:opacity-60"
            style={{ fontFamily: POPPINS, fontSize: 14, background: '#fff', color: GREEN }}
          >
            {status === 'sending' ? 'Enviando…' : 'Avisame'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p style={{ fontFamily: RALEWAY, fontSize: 12, color: '#FAF7F2', margin: '8px 0 0' }}>
          Revisá el dato e intentá de nuevo.
        </p>
      )}
    </div>
  )
}
