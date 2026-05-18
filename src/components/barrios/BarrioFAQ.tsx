'use client'

import { useState } from 'react'
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
      <div>
        {faqs.map((f, i) => {
          const isOpen = open === i
          return (
            <div
              key={f.pregunta}
              style={{ borderBottom: '1px solid rgba(15,15,15,0.1)' }}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '18px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  textAlign: 'left',
                  fontFamily: 'Raleway, sans-serif',
                  fontWeight: 500,
                  fontSize: 16,
                  color: '#0F0F0F',
                  lineHeight: 1.4,
                }}
              >
                <span>{f.pregunta}</span>
                <span
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    fontFamily: 'Raleway, sans-serif',
                    fontSize: 22,
                    fontWeight: 300,
                    color: '#1A5C38',
                    lineHeight: 1,
                    width: 20,
                    textAlign: 'center',
                  }}
                >
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <div
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 14,
                    color: '#6B7280',
                    lineHeight: 1.6,
                    paddingBottom: 18,
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
