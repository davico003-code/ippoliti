'use client'

import { useState } from 'react'
import type { FAQ } from '@/lib/barrios/faq'

interface Props {
  faqs: FAQ[]
  title?: string
}

export default function BarrioFAQ({ faqs, title = 'Preguntas frecuentes' }: Props) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div>
      {title && (
        <h3 className="mb-6 font-raleway text-2xl font-semibold text-navy-700 md:text-3xl">
          {title}
        </h3>
      )}
      <div className="divide-y divide-stone-200 rounded-xl bg-white ring-1 ring-stone-200">
        {faqs.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.pregunta}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-stone-50"
              >
                <span className="font-raleway text-base font-medium text-navy-700">
                  {f.pregunta}
                </span>
                <span
                  className={`text-xl text-brand-600 transition-transform ${isOpen ? 'rotate-45' : ''}`}
                  aria-hidden
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-stone-700">{f.respuesta}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
