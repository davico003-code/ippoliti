'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { FAQ } from '@/lib/barrios/faq'

interface Props {
  faqs: FAQ[]
  title?: string
}

export default function BarrioFAQ({ faqs, title }: Props) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div>
      {title && (
        <h3
          style={{
            fontFamily: 'Raleway, sans-serif',
            fontWeight: 600,
            fontSize: 22,
            color: '#0F0F0F',
            margin: '0 0 24px',
          }}
        >
          {title}
        </h3>
      )}
      <div className="flex flex-col gap-3">
        {faqs.map((f, i) => {
          const isOpen = open === i
          return (
            <div
              key={f.pregunta}
              className="bg-white rounded-xl border border-neutral-200 transition-shadow hover:shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 text-left p-6"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <span
                  className="text-base md:text-lg"
                  style={{
                    fontFamily: 'Raleway, sans-serif',
                    fontWeight: 600,
                    color: '#0F0F0F',
                    lineHeight: 1.4,
                  }}
                >
                  {f.pregunta}
                </span>
                <ChevronDown
                  size={20}
                  strokeWidth={2}
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    color: '#1A5C38',
                    transition: 'transform 300ms ease',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
              {isOpen && (
                <div
                  className="px-6 pb-6"
                  style={{
                    fontFamily: 'Raleway, sans-serif',
                    fontSize: 15,
                    color: '#525252',
                    lineHeight: 1.65,
                    paddingTop: 0,
                  }}
                >
                  {f.respuesta}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
