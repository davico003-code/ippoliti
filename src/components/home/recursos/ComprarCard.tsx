// Card "Comprar" (Sección 4) — checklist de aprendizajes de la guía. Estática.
// La tapa del libro se dibuja en CSS (.libro) sobre la foto: no hay imagen
// de la tapa y así queda nítida a cualquier tamaño.

import Link from 'next/link'
import CardFoto from './CardFoto'

const ITEMS = [
  'Cuánto podés pagar sin ahogarte',
  'Reconocer una buena oportunidad',
  'Tasar y no pagar de más',
  'Negociar, reservar y escriturar',
]

export default function ComprarCard() {
  return (
    <div className="card">
      <CardFoto src="/images/herramientas/comprar.webp" alt="Pareja mirando casas en una tablet" minutos={10} foco="30% 35%">
        <div className="libro" aria-hidden>
          <span className="lk">Guía</span>
          <span className="lt">Para comprar tu casa</span>
          <span className="lb">13 capítulos</span>
          <span className="lm">SI INMOBILIARIA</span>
        </div>
      </CardFoto>

      <div className="body">
        <p className="eyebrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5zM12 6.5v13" /></svg>
          Guía gratuita
        </p>
        <h3>¿Estás por comprar?</h3>
        <p className="bajada">Leé nuestra guía y resolvé las dudas antes de dar el paso.</p>

        <ul className="checklist">
          {ITEMS.map(t => (
            <li className="citem" key={t}>
              <span className="cmark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><path d="M20 6L9 17l-5-5" /></svg>
              </span>
              <span className="ctxt">{t}</span>
            </li>
          ))}
        </ul>

        <div className="cmore">+ 9 temas más · 13 capítulos · 62 páginas</div>

        <Link href="/guia" prefetch={false} className="cta">
          Leer la guía gratuita
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Link>
      </div>
    </div>
  )
}
