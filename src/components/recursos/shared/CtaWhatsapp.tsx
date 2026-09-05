'use client'

import { events } from '@/lib/analytics'

type Props = {
  source: 'costos' | 'ajuste'
  title?: string
  subtitle?: string
  message?: string
}

const PHONE = '5493413340916'

export default function CtaWhatsapp({
  source,
  title = '¿Te quedan dudas con tu caso?',
  subtitle = 'Revisamos tu caso particular sin compromiso por WhatsApp.',
  message,
}: Props) {
  const href = message
    ? `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${PHONE}`

  const handleClick = () => {
    if (source === 'costos') events.calculadoraCostosWhatsapp()
    else events.calculadoraAjusteWhatsapp()
  }

  return (
    <div
      className="rounded-2xl px-7 py-6 text-center shadow-sm"
      style={{ background: '#FFFFFF', border: '1px solid var(--line)' }}
    >
      <p
        className="text-[18px] font-bold tracking-tight m-0 mb-1.5"
        style={{ color: 'var(--tinta)' }}
      >
        {title}
      </p>
      <p className="text-sm m-0 mb-4" style={{ color: 'var(--tinta-soft)' }}>
        {subtitle}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:-translate-y-px"
        style={{
          background: 'var(--si-green)',
          boxShadow: '0 2px 12px rgba(26, 92, 56, 0.25)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--si-green-dark)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--si-green)'
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden
        >
          <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.6-1.6-1.9-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 1.7.7 2.4.8 3.3.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.2-.3-.2-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.3C8.7 21.5 10.3 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.5 0-3-.4-4.3-1.1l-.3-.2-3.1.8.8-3-.2-.3C4.4 15 4 13.5 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z" />
        </svg>
        Consultar por WhatsApp
      </a>
    </div>
  )
}
