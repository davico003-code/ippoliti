'use client'

// Botón "Ver presentación" del link de un solo uso: se deshabilita al primer
// toque para que un doble toque no mande dos canjes.

import { useState } from 'react'

export default function BotonCanje({ token, texto }: { token: string; texto: string }) {
  const [enviando, setEnviando] = useState(false)
  return (
    <form method="post" action="/api/como-trabajamos/canjear" className="mt-8" onSubmit={() => setEnviando(true)}>
      <input type="hidden" name="k" value={token} />
      <button
        type="submit"
        disabled={enviando}
        className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-8 text-[16px] font-bold text-white disabled:opacity-70"
        style={{ background: '#00754A' }}
      >
        {enviando ? 'Abriendo…' : texto}
      </button>
    </form>
  )
}
