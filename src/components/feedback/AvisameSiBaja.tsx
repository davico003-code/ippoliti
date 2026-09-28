'use client'

// D — "Avisame si baja", versión compacta: una línea discreta con campanita
// que al tocarla se abre en input (WhatsApp o email) + botón. Sin login.
// Captura un lead anónimo. El canal se detecta solo: con "@" es email, si no
// WhatsApp.

import { useState } from 'react'
import { Bell, Check } from 'lucide-react'

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
  const [open, setOpen] = useState(false)
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

  if (status === 'done') {
    return (
      <p className="flex items-center gap-1.5 py-3 text-[12.5px] font-medium text-[#1A5C38]">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        Listo, te avisamos si baja o si entra algo parecido.
      </p>
    )
  }

  if (!open) {
    return (
      <div className="py-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group -mx-1 flex items-center gap-2 rounded-lg px-1 py-1 text-left text-[12.5px] text-gray-500 transition-colors hover:text-[#1A5C38]"
        >
          <Bell className="h-3.5 w-3.5 text-[#1A5C38]" strokeWidth={2} />
          <span>
            ¿Te frena el precio?{' '}
            <span className="font-semibold text-[#1A5C38] underline-offset-2 group-hover:underline">
              Avisame si baja
            </span>
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="py-3">
      <form onSubmit={submit} className="flex gap-1.5">
        <input
          type="text"
          autoFocus
          value={contacto}
          onChange={(e) => {
            setContacto(e.target.value)
            if (status === 'error') setStatus('idle')
          }}
          placeholder="Tu WhatsApp o email"
          aria-label="Tu WhatsApp o email"
          className={`min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-[13px] text-[#24292B] outline-none transition-colors placeholder:text-gray-400 focus:border-[#1A5C38] ${
            status === 'error' ? 'border-[#F40009]/50' : 'border-gray-200'
          }`}
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="flex-none rounded-lg bg-[#1A5C38] px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#154a2d] disabled:opacity-60"
        >
          {status === 'sending' ? '…' : 'Avisame'}
        </button>
      </form>
      <p className="mt-1.5 text-[11px] text-gray-400">
        {status === 'error'
          ? 'Escribí tu WhatsApp o email para activarlo.'
          : 'Te avisamos si baja o si entra algo parecido. Sin spam.'}
      </p>
    </div>
  )
}
