// Card "Comprar" (Sección 4) — checklist de aprendizajes de la guía. Estática.

import Link from 'next/link'

const ITEMS = [
  'Cuánto podés pagar sin ahogarte',
  'Reconocer una buena oportunidad',
  'Tasar y no pagar de más',
  'Negociar, reservar y escriturar',
]

export default function ComprarCard() {
  return (
    <div className="card">
      <span className="clock">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        10 min
      </span>
      <p className="eyebrow">Guía gratuita</p>
      <h3>¿Estás por comprar?</h3>

      <div className="checklist">
        {ITEMS.map(t => (
          <div className="citem" key={t}>
            <span className="cmark">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><path d="M20 6L9 17l-5-5" /></svg>
            </span>
            <span className="ctxt">{t}</span>
          </div>
        ))}
      </div>

      <div className="cmore">+ 9 temas más · 13 capítulos · 62 páginas</div>

      <Link href="/guia" prefetch={false} className="ctaR">
        <span className="link">
          Leer la guía gratuita
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 1l5 5-5 5" /></svg>
        </span>
      </Link>
    </div>
  )
}
