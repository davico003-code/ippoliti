'use client'

// "¿Comprarías esta casa?" — Sí · Tal vez · No. Reemplaza a las caritas: la
// pregunta que le sirve al dueño es la intención, no el gusto. Guarda en el
// mismo canal de reacciones (Sí→encanta · Tal vez→duda · No→no) para que el
// panel y los votos viejos sigan valiendo. Con "No" se abre "¿Qué te frena?"
// (objeciones sin valuación). Auto-guarda. Data PRIVADA.

import { useState } from 'react'

export type Intencion = 'si' | 'tal_vez' | 'no'

const A_REACT: Record<Intencion, string> = { si: 'encanta', tal_vez: 'duda', no: 'no' }

export function intencionDesdeReact(react: string | null): Intencion | null {
  if (react === 'encanta') return 'si'
  if (react === 'duda') return 'tal_vez'
  if (react === 'no' || react === 'cara') return 'no'
  return null
}

const OPCIONES: { value: Intencion; label: string }[] = [
  { value: 'si', label: 'Sí' },
  { value: 'tal_vez', label: 'Tal vez' },
  { value: 'no', label: 'No' },
]

// 'metro' es la clave histórica de "el precio" (antes "El metro está caro").
const FRENOS = [
  { choice: 'metro', label: 'El precio' },
  { choice: 'ubicacion', label: 'Ubicación' },
  { choice: 'estado', label: 'Estado' },
  { choice: 'tamano', label: 'Tamaño' },
  { choice: 'expensas', label: 'Expensas' },
] as const

// "esta casa", "este lote"… según el tipo publicado.
function objeto(tipo: string): string {
  const t = tipo.toLowerCase()
  if (t.includes('casa')) return 'esta casa'
  if (t.includes('depart')) return 'este depto'
  if (t.includes('lote') || t.includes('terreno')) return 'este lote'
  if (t === 'ph' || t.includes(' ph')) return 'este PH'
  if (t.includes('local')) return 'este local'
  if (t.includes('oficina')) return 'esta oficina'
  if (t.includes('galp')) return 'este galpón'
  if (t.includes('quinta')) return 'esta quinta'
  if (t.includes('cochera')) return 'esta cochera'
  return 'esta propiedad'
}

export function preguntaIntencion(tipo: string, alquiler: boolean): string {
  return `¿${alquiler ? 'Alquilarías' : 'Comprarías'} ${objeto(tipo)}?`
}

export default function IntencionCompra({
  propertyId,
  pregunta,
  intencion,
  onChange,
  initialObjeciones = [],
}: {
  propertyId: number
  pregunta: string
  intencion: Intencion | null
  onChange: (i: Intencion) => void
  initialObjeciones?: string[]
}) {
  const [frenos, setFrenos] = useState<string[]>(initialObjeciones)

  const pick = (i: Intencion) => {
    onChange(i)
    fetch('/api/feedback/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, choice: A_REACT[i] }),
      credentials: 'same-origin',
    }).catch(() => {
      /* fire-and-forget */
    })
  }

  const toggleFreno = (choice: string) => {
    const next = frenos.includes(choice) ? frenos.filter((f) => f !== choice) : [...frenos, choice]
    setFrenos(next)
    fetch('/api/feedback/valuation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, valor: null, objeciones: next }),
      credentials: 'same-origin',
    }).catch(() => {
      /* fire-and-forget */
    })
  }

  const esNo = intencion === 'no'

  return (
    <div className="py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-[15px] font-semibold text-[#24292B]">{pregunta}</p>
        <div role="group" aria-label={pregunta} className="flex gap-1.5">
          {OPCIONES.map((o) => {
            const active = intencion === o.value
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={active}
                onClick={() => pick(o.value)}
                className={`min-h-[36px] min-w-[64px] rounded-full border px-3.5 text-[13px] leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5C38]/40 ${
                  active
                    ? 'border-[#1A5C38] bg-[#1A5C38] font-semibold text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:text-[#24292B]'
                }`}
              >
                {o.label}
              </button>
            )
          })}
        </div>
      </div>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: esNo ? 160 : 0, opacity: esNo ? 1 : 0 }}
      >
        <p className="mt-3 text-[12.5px] text-gray-500">¿Qué te frena?</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {FRENOS.map((f) => {
            const active = frenos.includes(f.choice)
            return (
              <button
                key={f.choice}
                type="button"
                aria-pressed={active}
                tabIndex={esNo ? 0 : -1}
                onClick={() => toggleFreno(f.choice)}
                className={`rounded-full border px-2.5 py-1 text-[12px] leading-none transition-colors ${
                  active
                    ? 'border-[#1A5C38] bg-[#1A5C38] font-medium text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>
        {frenos.length > 0 && (
          <p className="mt-2 text-[12px] text-[#1A5C38]">✓ Gracias, nos ayuda a ajustar con el dueño.</p>
        )}
      </div>
    </div>
  )
}
