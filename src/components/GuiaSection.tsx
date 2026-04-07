'use client'

import { useState, useEffect } from 'react'

export default function GuiaSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const [alreadyAccessed, setAlreadyAccessed] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ nombre?: string; email?: string }>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem('si_guia_acceso') === '1') setAlreadyAccessed(true)
    } catch {}
  }, [])

  function validate() {
    const e: { nombre?: string; email?: string } = {}
    if (!nombre.trim()) e.nombre = 'Ingresá tu nombre'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = 'Ingresá un email válido'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const leads = JSON.parse(localStorage.getItem('si_guia_leads') || '[]')
      leads.unshift({ nombre, email, fecha: new Date().toLocaleString('es-AR') })
      localStorage.setItem('si_guia_leads', JSON.stringify(leads))
      localStorage.setItem('si_guia_acceso', '1')
    } catch {}
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSuccess(true)
    setAlreadyAccessed(true)
    setTimeout(() => {
      window.open('/guia-comprador', '_blank')
      setModalOpen(false)
      setSuccess(false)
      setNombre('')
      setEmail('')
    }, 1200)
  }

  return (
    <>
      {/* ─── SECCIÓN ─── */}
      <section className="gs">
        <div className="gs-wrap">

          {/* Columna izquierda */}
          <div className="gs-left">
            <div className="gs-eyebrow">
              Guía gratuita · <span className="gs-num">14</span> capítulos
            </div>

            <h2 className="gs-h2">
              Comprá con<br />inteligencia,<br />no con suerte.
            </h2>

            <p className="gs-sub">
              Todo lo que nadie te cuenta sobre comprar una propiedad en Funes y Roldán. Sin filtros, sin
              letra chica, sin tiempo perdido.
            </p>

            <ol className="gs-list">
              <li>
                <span className="gs-list-num">01</span>
                <span className="gs-list-text">Documentación, gastos ocultos y casos reales</span>
              </li>
              <li>
                <span className="gs-list-num">02</span>
                <span className="gs-list-text">Todo lo que nadie te cuenta del mercado local</span>
              </li>
              <li>
                <span className="gs-list-num">03</span>
                <span className="gs-list-text">Cómo negociar con criterio y sin ansiedad</span>
              </li>
            </ol>

            {alreadyAccessed ? (
              <a
                className="gs-cta"
                href="/guia-comprador"
                target="_blank"
                rel="noopener noreferrer"
              >
                Leer la guía →
              </a>
            ) : (
              <button className="gs-cta" onClick={() => setModalOpen(true)}>
                Leer la guía →
              </button>
            )}

            <p className="gs-note">Acceso permanente · Sin registro</p>
          </div>

          {/* Columna derecha — portada libro */}
          <div
            className="gs-right"
            onClick={() => !alreadyAccessed && setModalOpen(true)}
            style={{ cursor: alreadyAccessed ? 'default' : 'pointer' }}
            aria-hidden={alreadyAccessed}
          >
            <div className="gs-book-scene">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/guia-celular.webp"
                alt="Guía Inteligente del Comprador — SI Inmobiliaria"
                className="gs-book-img"
              />
              <div className="gs-book-ground" />
              {!alreadyAccessed && <p className="gs-book-hint">Clic para acceder →</p>}
            </div>
          </div>

        </div>
      </section>

      {/* ─── MODAL ─── */}
      {modalOpen && (
        <div
          className="gm-overlay"
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="gm">
            <button className="gm-close" onClick={() => setModalOpen(false)} aria-label="Cerrar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {!success ? (
              <>
                <span className="gm-tag">Acceso gratuito · 2026</span>
                <h3 className="gm-title">Guía Inteligente<br />del Comprador</h3>
                <p className="gm-desc">
                  Ingresá tu nombre y email para acceder a los 14 capítulos. Una sola vez, acceso permanente.
                </p>

                <form onSubmit={handleSubmit} noValidate className="gm-form">
                  <div className="gm-field">
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      className={errors.nombre ? 'error' : ''}
                      disabled={loading}
                      autoComplete="given-name"
                    />
                    {errors.nombre && <span className="gm-err">{errors.nombre}</span>}
                  </div>
                  <div className="gm-field">
                    <input
                      type="email"
                      placeholder="Tu email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={errors.email ? 'error' : ''}
                      disabled={loading}
                      autoComplete="email"
                    />
                    {errors.email && <span className="gm-err">{errors.email}</span>}
                  </div>
                  <button type="submit" className="gm-submit" disabled={loading}>
                    {loading
                      ? <span className="gm-loader" />
                      : 'Acceder a la guía'
                    }
                  </button>
                  <p className="gm-privacy">No compartimos tu información. Sin spam.</p>
                </form>
              </>
            ) : (
              <div className="gm-success">
                <div className="gm-check">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3>¡Listo, {nombre}!</h3>
                <p>Abriendo la guía en una nueva pestaña…</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── ESTILOS ─── */}
      <style jsx>{`

        /* ── SECCIÓN ─────────────────────────────── */
        .gs {
          background: #fafaf8;
          padding: 120px 64px;
          overflow: hidden;
        }
        .gs-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 72px;
          align-items: center;
        }

        /* Eyebrow */
        .gs-eyebrow {
          font-family: 'Poppins', system-ui, sans-serif;
          font-weight: 500;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #1A5C38;
          margin-bottom: 20px;
        }
        .gs-num {
          font-variant-numeric: tabular-nums;
        }

        /* Headline */
        .gs-h2 {
          font-family: 'Raleway', sans-serif;
          font-size: 56px;
          font-weight: 300;
          line-height: 1.05;
          letter-spacing: -0.035em;
          color: #1d1d1f;
          margin: 0 0 24px;
        }

        /* Subtitle */
        .gs-sub {
          font-family: 'Poppins', system-ui, sans-serif;
          font-weight: 400;
          font-size: 15px;
          color: #4a4a48;
          line-height: 1.65;
          margin: 0 0 40px;
          max-width: 440px;
        }

        /* Numbered list */
        .gs-list {
          list-style: none;
          padding: 0;
          margin: 0 0 40px;
          border-top: 1px solid #e0e0dc;
          border-bottom: 1px solid #e0e0dc;
        }
        .gs-list li {
          display: flex;
          gap: 18px;
          padding: 16px 0;
          align-items: center;
        }
        .gs-list li + li {
          border-top: 1px solid #e0e0dc;
        }
        .gs-list-num {
          font-family: 'Poppins', system-ui, sans-serif;
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 0.14em;
          color: #1A5C38;
          font-variant-numeric: tabular-nums;
          min-width: 28px;
        }
        .gs-list-text {
          font-family: 'Poppins', system-ui, sans-serif;
          font-weight: 400;
          font-size: 14px;
          line-height: 1.5;
          color: #1d1d1f;
        }

        /* CTA */
        .gs-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #1A5C38;
          color: #fff;
          font-family: 'Poppins', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.01em;
          padding: 14px 28px;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
          width: auto;
        }
        .gs-cta:hover {
          background: #0F3A23;
          transform: translateY(-1px);
        }
        .gs-note {
          margin-top: 16px;
          font-family: 'Poppins', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 400;
          color: #8a8a8a;
          letter-spacing: 0.02em;
        }

        /* ── LIBRO ────────────────────────────────── */
        .gs-right {
          display: flex;
          justify-content: center;
        }
        .gs-book-scene {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .gs-book-img {
          width: 420px;
          height: auto;
          object-fit: contain;
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1);
          filter: drop-shadow(0 40px 80px rgba(26,92,56,0.25)) drop-shadow(0 20px 40px rgba(0,0,0,0.15));
        }
        .gs-right:hover .gs-book-img {
          transform: translateY(-8px);
        }
        .gs-book {
          display: flex;
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1);
          filter: drop-shadow(0 24px 48px rgba(26,92,56,0.28)) drop-shadow(0 8px 16px rgba(0,0,0,0.12));
        }
        .gs-right:hover .gs-book {
          transform: translateY(-8px) rotate(-1.5deg);
          filter: drop-shadow(0 40px 64px rgba(26,92,56,0.32)) drop-shadow(0 16px 32px rgba(0,0,0,0.15));
        }

        /* Lomo */
        .gs-book-spine {
          width: 14px;
          background: #0F3A23;
          border-radius: 4px 0 0 4px;
          flex-shrink: 0;
        }

        /* Tapa */
        .gs-book-cover {
          width: 248px;
          height: 348px;
          background: #1A5C38;
          border-radius: 0 8px 8px 0;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          position: relative;
        }

        /* Decoración fondo */
        .gs-book-cover::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 120% 120%, rgba(201,168,76,0.12) 0%, transparent 60%),
                      radial-gradient(ellipse at -20% -20%, rgba(255,255,255,0.05) 0%, transparent 50%);
        }

        .gs-book-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: relative;
          z-index: 1;
        }
        .gs-book-brand {
          font-size: 0.5rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
        }
        .gs-book-year {
          font-size: 0.55rem;
          font-weight: 600;
          background: rgba(201,168,76,0.2);
          color: #C9A84C;
          padding: 3px 8px;
          border-radius: 999px;
          letter-spacing: 0.1em;
        }

        .gs-book-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }
        .gs-book-si {
          font-family: 'Raleway', sans-serif;
          font-size: 7.5rem;
          font-weight: 800;
          color: rgba(255,255,255,0.07);
          letter-spacing: -0.04em;
          user-select: none;
          line-height: 1;
        }

        .gs-book-bottom {
          position: relative;
          z-index: 1;
        }
        .gs-book-title {
          font-family: 'Raleway', sans-serif;
          font-size: 0.98rem;
          font-weight: 300;
          color: #fff;
          line-height: 1.35;
          margin: 0 0 8px;
        }
        .gs-book-chapters {
          font-size: 0.55rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: rgba(255,255,255,0.38);
          text-transform: uppercase;
        }

        .gs-book-ground {
          width: 180px;
          height: 16px;
          background: radial-gradient(ellipse, rgba(26,92,56,0.2) 0%, transparent 70%);
        }
        .gs-book-hint {
          font-size: 0.73rem;
          color: #1A5C38;
          font-weight: 500;
          letter-spacing: 0.03em;
        }

        /* ── MODAL ────────────────────────────────── */
        .gm-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: gm-fade 0.2s ease;
        }
        @keyframes gm-fade { from { opacity: 0; } to { opacity: 1; } }

        .gm {
          background: #fff;
          border-radius: 22px;
          width: 100%;
          max-width: 460px;
          padding: 52px 48px;
          position: relative;
          animation: gm-slide 0.35s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 40px 100px rgba(0,0,0,0.22);
        }
        @keyframes gm-slide {
          from { opacity: 0; transform: translateY(22px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        .gm-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(0,0,0,0.06);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(0,0,0,0.45);
          transition: background 0.2s;
        }
        .gm-close:hover { background: rgba(0,0,0,0.1); color: rgba(0,0,0,0.7); }

        .gm-tag {
          display: block;
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #1A5C38;
          margin-bottom: 12px;
        }
        .gm-title {
          font-family: 'Raleway', sans-serif;
          font-size: 2rem;
          font-weight: 200;
          line-height: 1.1;
          letter-spacing: -0.015em;
          color: #0E0E0E;
          margin-bottom: 10px;
        }
        .gm-desc {
          font-size: 0.87rem;
          color: rgba(14,14,14,0.48);
          line-height: 1.72;
          margin-bottom: 30px;
        }

        .gm-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .gm-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .gm-field input {
          padding: 15px 18px;
          border: 1.5px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          background: #F8F5F0;
          font-size: 0.92rem;
          color: #0E0E0E;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }
        .gm-field input::placeholder { color: rgba(14,14,14,0.32); }
        .gm-field input:focus {
          border-color: #1A5C38;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(26,92,56,0.1);
        }
        .gm-field input.error { border-color: #EF4444; }
        .gm-err {
          font-size: 0.72rem;
          color: #EF4444;
        }

        .gm-submit {
          margin-top: 4px;
          padding: 16px 28px;
          background: #1A5C38;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 500;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(26,92,56,0.25);
        }
        .gm-submit:hover:not(:disabled) {
          background: #0F3A23;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(26,92,56,0.3);
        }
        .gm-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .gm-loader {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .gm-privacy {
          text-align: center;
          font-size: 0.7rem;
          color: rgba(14,14,14,0.3);
          line-height: 1.5;
        }

        /* Success */
        .gm-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
          padding: 24px 0;
        }
        .gm-check {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: #E4F0E9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1A5C38;
          animation: pop 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }
        .gm-success h3 {
          font-family: 'Raleway', sans-serif;
          font-size: 1.55rem;
          font-weight: 300;
          color: #0E0E0E;
        }
        .gm-success p {
          font-size: 0.88rem;
          color: rgba(14,14,14,0.48);
        }

        /* ── RESPONSIVE ───────────────────────────── */
        @media (max-width: 960px) {
          .gs { padding: 96px 32px; }
          .gs-wrap {
            grid-template-columns: 1fr;
            gap: 64px;
          }
          .gs-right { justify-content: center; }
          .gs-book-img { width: 300px; height: auto; margin: 0 auto; }
          .gs-h2 { font-size: 44px; }
        }
        @media (max-width: 600px) {
          .gs { padding: 80px 24px; }
          .gm { padding: 44px 28px; border-radius: 18px; }
          .gs-h2 { font-size: 36px; }
        }
      `}</style>
    </>
  )
}
