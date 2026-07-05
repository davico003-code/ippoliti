'use client'

// Kiosco VERTICAL "vidriera viva". Renderiza una secuencia curada de tarjetas
// (VitrinaCard) con ganchos para que enganche: precio oculto→reveal, adiviná el
// barrio (pin en mini-mapa), countdown Top 5 de Funes, micro-récords y placas
// institucionales con CTA rotando. Todo dentro de un marco 9:16 que se ROTA 90°
// en pantallas apaisadas (para un TV parado que no auto-rota) y a pantalla
// completa al tocar. El pase cicla solo y no se frena.

import { useEffect, useState } from 'react'
import type { VitrinaCard, PropView } from '../tvVitrina'

const RELOAD_MS = 40 * 60 * 1000
const D = { hidden: 4000, reveal: 4500, cta: 5500, record: 4200 }

function totalMs(c: VitrinaCard): number {
  if (c.kind === 'property') return D.hidden + D.reveal
  return c.kind === 'cta' ? D.cta : D.record
}

export default function TvVerticalClient({ cards }: { cards: VitrinaCard[] }) {
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (cards.length === 0) return
    setRevealed(false)
    const c = cards[idx % cards.length]
    const timers: ReturnType<typeof setTimeout>[] = []
    if (c.kind === 'property') {
      timers.push(setTimeout(() => setRevealed(true), D.hidden))
    }
    timers.push(setTimeout(() => setIdx((i) => (i + 1) % cards.length), totalMs(c)))
    return () => timers.forEach(clearTimeout)
  }, [idx, cards])

  useEffect(() => {
    const t = setTimeout(() => window.location.reload(), RELOAD_MS)
    return () => clearTimeout(t)
  }, [])

  const toggleFullscreen = () => {
    const el = document.documentElement
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {})
    else document.exitFullscreen?.().catch(() => {})
  }

  if (cards.length === 0) {
    return (
      <main style={{ height: '100dvh', display: 'grid', placeItems: 'center', background: '#08100B' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-blanco.webp" alt="SI INMOBILIARIA" style={{ height: 56, width: 'auto', opacity: 0.9 }} />
      </main>
    )
  }

  const card = cards[idx % cards.length]
  const propCount = cards.filter((c) => c.kind === 'property').length

  return (
    <main
      className="tvv-root"
      onClick={toggleFullscreen}
      title="Tocar para pantalla completa"
      data-props={propCount}
      data-total={cards.length}
    >
      <div className="tvv-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-blanco.webp" alt="SI INMOBILIARIA" className="tvv-logo" />

        <div key={idx} className="tvv-card">
          {card.kind === 'property' && <PropertyCard card={card} revealed={revealed} />}
          {card.kind === 'cta' && <CtaCard data={card.data} />}
          {card.kind === 'record' && <RecordCard data={card.data} />}
        </div>

        <div key={`p-${idx}`} className="tvv-progress" style={{ animationDuration: `${totalMs(card)}ms` }} />
      </div>
      <style>{CSS}</style>
    </main>
  )
}

// ── Property (con gancho reveal-price | guess-zone | countdown) ───────────────
function PropertyCard({
  card,
  revealed,
}: {
  card: Extract<VitrinaCard, { kind: 'property' }>
  revealed: boolean
}) {
  const p: PropView = card.data
  const hero = p.photos[0]
  const thumbs = p.photos.slice(1, 4)
  const isGuess = card.hook === 'guess-zone'
  const zoneText = [p.barrio, p.zona].filter(Boolean).join(' · ') || p.zona

  return (
    <div className="pc">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={hero} alt="" className="pc-hero tvv-kb" />
      <div className="pc-scrim" />

      {/* Rank del countdown */}
      {card.rank != null && (
        <div className="pc-rank">
          <span className="pc-rank-kicker">Top {card.total} casas de Funes</span>
          <span className="pc-rank-n">N° {card.rank}</span>
        </div>
      )}

      {/* Tira de fotos de la misma casa */}
      {thumbs.length > 0 && (
        <div className="pc-strip">
          {thumbs.map((src, k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={k} src={src} alt="" className="pc-thumb" />
          ))}
        </div>
      )}

      <div className="pc-info">
        <div className="pc-eyebrow">
          {p.destacada && card.rank == null && <span className="pc-badge">Selección SI</span>}
          {/* En guess-zone ocultamos la zona hasta el reveal */}
          <span className="pc-meta">{p.tipo}{!isGuess && zoneText ? ` · ${zoneText}` : ''}</span>
        </div>
        {p.titulo && <h2 className="pc-title">{p.titulo}</h2>}
        {p.specs.length > 0 && (
          <div className="pc-specs">
            {p.specs.map((s, i) => (
              <div key={i} className="pc-spec"><span className="pc-spec-v">{s.v}</span><span className="pc-spec-l">{s.l}</span></div>
            ))}
          </div>
        )}

        {/* GANCHO */}
        {!isGuess ? (
          // precio oculto → reveal
          !revealed ? (
            <div className="pc-teaser"><span className="pc-teaser-q">¿Cuánto vale?</span><span className="pc-eye">👀</span></div>
          ) : (
            <div className="pc-price-row">
              <div className="pc-price-lbl">Precio</div>
              <div className="pc-price pc-pop">{p.price}</div>
            </div>
          )
        ) : (
          // adiviná el barrio → reveal con pin
          !revealed ? (
            <div className="pc-teaser"><span className="pc-teaser-q">¿Dónde está?</span><span className="pc-eye">👀</span></div>
          ) : (
            <div className="pc-zone pc-pop">
              <MiniMap />
              <div className="pc-zone-txt">
                <span className="pc-pin">📍</span>
                <span className="pc-zone-name">{zoneText}</span>
              </div>
              <div className="pc-price pc-price-sm">{p.price}</div>
            </div>
          )
        )}
      </div>

      {p.qr && (
        <div className="pc-qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.qr} alt="QR" className="pc-qr-img" />
          <span className="pc-qr-t">Escaneá</span>
        </div>
      )}
    </div>
  )
}

function MiniMap() {
  // Mapa estilizado (sin tiles externos): calles abstractas + pin que cae.
  return (
    <svg className="pc-map" viewBox="0 0 100 42" preserveAspectRatio="none" aria-hidden>
      <rect width="100" height="42" fill="#0f2419" />
      <g stroke="#1f4d34" strokeWidth="1.4">
        <path d="M0 14 H100 M0 28 H100 M18 0 V42 M42 0 V42 M66 0 V42 M84 0 V42" />
      </g>
      <g stroke="#2c6b48" strokeWidth="2.2" opacity="0.7">
        <path d="M0 21 H100 M50 0 V42" />
      </g>
    </svg>
  )
}

// ── CTA institucional ────────────────────────────────────────────────────────
function CtaCard({ data }: { data: Extract<VitrinaCard, { kind: 'cta' }>['data'] }) {
  return (
    <div className="cta">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-blanco.webp" alt="SI INMOBILIARIA" className="cta-logo" />
      <div className="cta-main">
        <h2 className="cta-title">{data.title}</h2>
        <p className="cta-sub">{data.subtitle}</p>
        <span className="cta-note">{data.note}</span>
      </div>
      {data.qr && (
        <div className="cta-qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.qr} alt="QR" className="cta-qr-img" />
          <span className="cta-qr-t">Escaneá</span>
        </div>
      )}
    </div>
  )
}

// ── Micro-récord ─────────────────────────────────────────────────────────────
function RecordCard({ data }: { data: Extract<VitrinaCard, { kind: 'record' }>['data'] }) {
  return (
    <div className="rec">
      <span className="rec-emoji">{data.emoji}</span>
      <span className="rec-label">{data.label}</span>
      <span className="rec-value pc-pop">{data.value}</span>
    </div>
  )
}

const CSS = `
  .tvv-root { position: fixed; inset: 0; overflow: hidden; background: #000; }
  .tvv-stage { position: absolute; top: 50%; left: 50%; overflow: hidden; background: #08100B;
    width: 100vw; height: 100dvh; transform: translate(-50%, -50%);
    container-type: size; }
  @media (orientation: landscape) {
    .tvv-stage { width: 100dvh; height: 100vw; transform: translate(-50%, -50%) rotate(90deg); }
  }
  .tvv-logo { position: absolute; top: 3cqh; left: 5cqw; z-index: 20; height: 3.2cqh; min-height: 26px; width: auto;
    filter: drop-shadow(0 2px 10px rgba(0,0,0,.6)); }
  .tvv-card { position: absolute; inset: 0; }
  .tvv-progress { position: absolute; left: 0; bottom: 0; height: .6cqh; min-height: 3px; z-index: 25;
    background: linear-gradient(90deg, #1A5C38, #8CF0B4); width: 0; animation-name: prog;
    animation-timing-function: linear; animation-fill-mode: forwards; }
  @keyframes prog { from { width: 0; } to { width: 100%; } }

  /* ── Property ── */
  .pc { position: absolute; inset: 0; overflow: hidden; }
  .pc-hero { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .tvv-kb { animation: kb 9000ms ease-out forwards; }
  @keyframes kb { from { transform: scale(1.04); } to { transform: scale(1.14); } }
  .pc-scrim { position: absolute; inset: 0;
    background: linear-gradient(0deg, rgba(6,14,9,.95) 0%, rgba(6,14,9,.6) 26%, rgba(6,14,9,0) 55%),
                linear-gradient(180deg, rgba(6,14,9,.55) 0%, rgba(6,14,9,0) 16%); }

  .pc-rank { position: absolute; top: 9cqh; left: 5cqw; z-index: 6; display: flex; flex-direction: column;
    animation: inUp 700ms cubic-bezier(.2,.7,.2,1) both; }
  .pc-rank-kicker { font-size: 2.6cqw; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #8CF0B4; }
  .pc-rank-n { font-family: var(--font-poppins), sans-serif; font-weight: 700; font-size: 13cqw; line-height: .9;
    color: #fff; text-shadow: 0 3px 20px rgba(0,0,0,.5); }

  .pc-strip { position: absolute; top: 8cqh; right: 5cqw; z-index: 6; display: flex; flex-direction: column; gap: 1.6cqh; }
  .pc-thumb { width: 16cqw; height: 16cqw; object-fit: cover; border-radius: 2.4cqw; border: .35cqw solid rgba(255,255,255,.85);
    box-shadow: 0 1cqh 2.4cqh rgba(0,0,0,.5); animation: pop 600ms cubic-bezier(.34,1.56,.64,1) both; }
  .pc-thumb:nth-child(2) { animation-delay: 90ms; }
  .pc-thumb:nth-child(3) { animation-delay: 180ms; }

  .pc-info { position: absolute; left: 5cqw; right: 5cqw; bottom: 4.5cqh; z-index: 6; }
  .pc-eyebrow { display: flex; align-items: center; gap: 2cqw; margin-bottom: 1.4cqh; flex-wrap: wrap;
    animation: inUp 600ms ease both; }
  .pc-badge { background: #1A5C38; color: #fff; font-weight: 700; font-size: 2.4cqw; letter-spacing: .1em;
    text-transform: uppercase; padding: .6cqh 2.4cqw; border-radius: 999px; }
  .pc-meta { font-size: 3cqw; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #A6E7BE;
    text-shadow: 0 1px 8px rgba(0,0,0,.6); }
  .pc-title { font-family: var(--font-raleway), sans-serif; font-weight: 400; font-size: 4.6cqw; line-height: 1.12;
    margin: 0 0 1.8cqh; color: #fff; text-shadow: 0 2px 14px rgba(0,0,0,.6);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    animation: inUp 650ms ease both; }
  .pc-specs { display: flex; margin-bottom: 2.4cqh; animation: inUp 700ms ease both; }
  .pc-spec { padding: 0 3cqw; display: flex; flex-direction: column; }
  .pc-spec:first-child { padding-left: 0; }
  .pc-spec + .pc-spec { border-left: 1px solid rgba(255,255,255,.3); }
  .pc-spec-v { font-family: var(--font-poppins), sans-serif; font-weight: 700; font-size: 5cqw; line-height: 1; }
  .pc-spec-l { font-size: 2.2cqw; color: rgba(255,255,255,.8); margin-top: .5cqh; }

  .pc-teaser { display: flex; align-items: center; gap: 2.5cqw; margin-top: 1.4cqh; animation: pulse 1.6s ease-in-out infinite; }
  .pc-price-row, .pc-zone { margin-top: 1.6cqh; }
  .pc-teaser-q { font-family: var(--font-raleway), sans-serif; font-weight: 800; font-size: 9cqw; color: #fff;
    text-shadow: 0 3px 20px rgba(0,0,0,.5); }
  .pc-eye { font-size: 8cqw; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .55; } }

  .pc-price-row { }
  .pc-price-lbl { font-family: var(--font-poppins), sans-serif; font-weight: 600; font-size: 2.4cqw;
    letter-spacing: .4em; text-transform: uppercase; color: rgba(255,255,255,.75); margin-bottom: .6cqh; }
  .pc-price { font-family: var(--font-poppins), sans-serif; font-weight: 700; font-size: 12cqw; line-height: .95;
    letter-spacing: -.03em; color: #fff; font-variant-numeric: tabular-nums; text-shadow: 0 3px 24px rgba(0,0,0,.55); }
  .pc-price-sm { font-size: 8cqw; margin-top: 1.4cqh; }
  .pc-pop { animation: pop 600ms cubic-bezier(.34,1.56,.64,1) both; }

  .pc-zone { position: relative; }
  .pc-map { width: 100%; height: 22cqh; display: block; border-radius: 2.6cqw; overflow: hidden;
    outline: 1px solid rgba(255,255,255,.12); }
  .pc-zone-txt { position: absolute; top: 6cqh; left: 4cqw; right: 4cqw; display: flex; align-items: center; gap: 2cqw; }
  .pc-pin { font-size: 9cqw; animation: drop 600ms cubic-bezier(.34,1.56,.64,1) both; }
  .pc-zone-name { font-family: var(--font-raleway), sans-serif; font-weight: 800; font-size: 6.5cqw; color: #fff;
    text-shadow: 0 2px 14px rgba(0,0,0,.6); line-height: 1; }
  @keyframes drop { from { opacity: 0; transform: translateY(-6cqh) scale(.6); } to { opacity: 1; transform: none; } }

  .pc-qr { position: absolute; bottom: 4.5cqh; right: 5cqw; z-index: 8; display: flex; flex-direction: column;
    align-items: center; gap: .6cqh; background: #fff; border-radius: 2.4cqw; padding: 1.4cqw;
    box-shadow: 0 1cqh 2.4cqh rgba(0,0,0,.5); }
  .pc-qr-img { width: 14cqw; height: 14cqw; display: block; }
  .pc-qr-t { font-size: 2cqw; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: #0E1A14; }

  /* ── CTA ── */
  .cta { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 4cqh; padding: 8cqw; text-align: center;
    background: radial-gradient(120% 90% at 50% 15%, #1A5C38 0%, #0F3A23 48%, #08100B 100%); }
  .cta-logo { height: 5cqh; width: auto; animation: inUp 700ms ease both; }
  .cta-main { display: flex; flex-direction: column; align-items: center; gap: 1.4cqh; animation: inUp 800ms ease both; }
  .cta-title { font-family: var(--font-raleway), sans-serif; font-weight: 800; font-size: 12cqw; line-height: 1; margin: 0; color: #fff; }
  .cta-sub { font-family: var(--font-raleway), sans-serif; font-weight: 400; font-size: 6cqw; margin: 0; color: #A6E7BE; }
  .cta-note { font-family: var(--font-poppins), sans-serif; font-size: 3.4cqw; color: rgba(255,255,255,.8); margin-top: 1cqh; }
  .cta-qr { background: #fff; border-radius: 3cqw; padding: 2cqw; display: flex; flex-direction: column; align-items: center; gap: 1cqw;
    box-shadow: 0 1.4cqh 3cqh rgba(0,0,0,.5); animation: pop 700ms cubic-bezier(.34,1.56,.64,1) both; }
  .cta-qr-img { width: 26cqw; height: 26cqw; display: block; }
  .cta-qr-t { font-size: 2.6cqw; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #0E1A14; }

  /* ── Récord ── */
  .rec { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 2cqh; padding: 8cqw; text-align: center;
    background: radial-gradient(120% 80% at 50% 30%, #0F3A23 0%, #08100B 70%); }
  .rec-emoji { font-size: 22cqw; animation: pop 700ms cubic-bezier(.34,1.56,.64,1) both; }
  .rec-label { font-family: var(--font-poppins), sans-serif; font-weight: 600; font-size: 4cqw;
    letter-spacing: .1em; text-transform: uppercase; color: #A6E7BE; }
  .rec-value { font-family: var(--font-poppins), sans-serif; font-weight: 700; font-size: 15cqw; line-height: 1;
    color: #fff; font-variant-numeric: tabular-nums; }

  @keyframes inUp { from { opacity: .3; transform: translateY(3cqh); } to { opacity: 1; transform: none; } }
  @keyframes pop { from { opacity: .4; transform: scale(.8); } to { opacity: 1; transform: scale(1); } }

  @media (prefers-reduced-motion: reduce) {
    .tvv-kb, .pc-pop, .pc-thumb, .pc-teaser, .pc-pin, .cta-qr, .rec-emoji, .pc-rank, .pc-eyebrow, .pc-title, .pc-specs, .cta-logo, .cta-main { animation: none !important; }
  }
`
