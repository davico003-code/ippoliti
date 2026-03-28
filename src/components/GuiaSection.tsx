'use client'

import { useState } from 'react'

export default function GuiaSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ nombre?: string; email?: string }>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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

    // Guardar lead en localStorage (reemplazá esto por tu API / webhook si querés)
    try {
      const leads = JSON.parse(localStorage.getItem('si_guia_leads') || '[]')
      leads.unshift({ nombre, email, fecha: new Date().toLocaleString('es-AR') })
      localStorage.setItem('si_guia_leads', JSON.stringify(leads))
      localStorage.setItem('si_guia_acceso', '1')
    } catch {}

    // Simulamos un pequeño delay
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSuccess(true)

    // Abrimos la guía en nueva pestaña después de 1.2s
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
      {/* ─── SECCIÓN HOME ─── */}
      <section className="guia-section">
        <div className="guia-inner">

          {/* Texto izquierda */}
          <div className="guia-text">
            <p className="guia-tag">Recurso gratuito</p>
            <h2 className="guia-title">Guía Inteligente<br />del Comprador</h2>
            <ul className="guia-list">
              <li>Todo lo que nadie te cuenta sobre comprar en Funes y Roldán</li>
              <li>Documentación, gastos ocultos y casos reales</li>
              <li>Cómo negociar con criterio y sin ansiedad</li>
            </ul>
            <button className="guia-btn" onClick={() => setModalOpen(true)}>
              Acceder a la guía gratis
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          </div>

          {/* Preview derecha */}
          <div className="guia-preview" onClick={() => setModalOpen(true)}>
            <div className="guia-preview-card">
              <div className="guia-preview-bg">
                <span className="guia-big-letter">SI</span>
              </div>
              <div className="guia-preview-info">
                <span className="guia-preview-brand">SI Inmobiliaria</span>
                <span className="guia-preview-name">Guía del Comprador 2026</span>
                <span className="guia-preview-sub">14 capítulos · Funes & Roldán</span>
              </div>
            </div>
            <p className="guia-preview-cta">Clic para acceder →</p>
          </div>

        </div>
      </section>

      {/* ─── MODAL ─── */}
      {modalOpen && (
        <div className="guia-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="guia-modal">

            {/* Cierre */}
            <button className="guia-modal-close" onClick={() => setModalOpen(false)} aria-label="Cerrar">
              ✕
            </button>

            {/* Columna decorativa */}
            <div className="guia-modal-deco" aria-hidden>
              <span className="guia-modal-big-si">SI</span>
            </div>

            {/* Columna formulario */}
            <div className="guia-modal-form-col">
              {!success ? (
                <>
                  <p className="guia-modal-tag">Acceso gratuito · 2026</p>
                  <h3 className="guia-modal-title">Guía Inteligente<br />del Comprador</h3>
                  <p className="guia-modal-desc">
                    Ingresá tus datos y accedé ahora a los 14 capítulos con información real sobre comprar en Funes y Roldán.
                  </p>

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="guia-field">
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        className={errors.nombre ? 'error' : ''}
                        disabled={loading}
                        autoComplete="given-name"
                      />
                      {errors.nombre && <span className="guia-field-err">{errors.nombre}</span>}
                    </div>

                    <div className="guia-field">
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={errors.email ? 'error' : ''}
                        disabled={loading}
                        autoComplete="email"
                      />
                      {errors.email && <span className="guia-field-err">{errors.email}</span>}
                    </div>

                    <button type="submit" className="guia-modal-submit" disabled={loading}>
                      {loading ? (
                        <span className="guia-loader" />
                      ) : (
                        <>
                          Acceder a la guía
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                        </>
                      )}
                    </button>

                    <p className="guia-privacy">
                      No compartimos tu información. Sin spam.
                    </p>
                  </form>
                </>
              ) : (
                <div className="guia-success">
                  <div className="guia-success-icon">✓</div>
                  <h3>¡Listo!</h3>
                  <p>Abriendo la guía en una nueva pestaña…</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─── ESTILOS ─── */}
      <style jsx>{`
        /* SECCIÓN */
        .guia-section {
          background: #F8F5F0;
          padding: 100px 0;
        }
        .guia-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 80px;
          align-items: center;
        }
        .guia-tag {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #1A5C38;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .guia-tag::before {
          content: '';
          display: block;
          width: 28px;
          height: 1px;
          background: #1A5C38;
        }
        .guia-title {
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          font-size: clamp(2.2rem, 3.5vw, 3.2rem);
          font-weight: 300;
          line-height: 1.1;
          color: #0E0E0E;
          margin-bottom: 28px;
        }
        .guia-list {
          list-style: none;
          padding: 0;
          margin: 0 0 36px 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .guia-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.95rem;
          color: rgba(14,14,14,0.65);
          line-height: 1.5;
        }
        .guia-list li::before {
          content: '✓';
          color: #1A5C38;
          font-weight: 700;
          flex-shrink: 0;
          font-size: 0.85rem;
          margin-top: 1px;
        }
        .guia-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 36px;
          background: #1A5C38;
          color: #fff;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 0.25s, transform 0.2s;
        }
        .guia-btn:hover {
          background: #0F3A23;
          transform: translateY(-2px);
        }

        /* PREVIEW CARD */
        .guia-preview {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .guia-preview-card {
          width: 220px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.12);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .guia-preview:hover .guia-preview-card {
          transform: translateY(-6px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.18);
        }
        .guia-preview-bg {
          background: #1A5C38;
          height: 160px;
          display: flex;
          align-items: flex-end;
          padding: 0 0 0 16px;
          overflow: hidden;
          position: relative;
        }
        .guia-big-letter {
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          font-size: 9rem;
          font-weight: 700;
          color: rgba(255,255,255,0.12);
          line-height: 1;
          position: absolute;
          bottom: -20px;
          right: -10px;
          letter-spacing: -0.04em;
        }
        .guia-preview-info {
          background: #fff;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .guia-preview-brand {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #1A5C38;
        }
        .guia-preview-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0E0E0E;
        }
        .guia-preview-sub {
          font-size: 0.72rem;
          color: #888;
        }
        .guia-preview-cta {
          font-size: 0.75rem;
          color: #1A5C38;
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        /* MODAL OVERLAY */
        .guia-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(10,10,10,0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeOverlay 0.25s ease;
        }
        @keyframes fadeOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* MODAL */
        .guia-modal {
          background: #fff;
          width: 100%;
          max-width: 820px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
          animation: slideModal 0.35s cubic-bezier(0.16,1,0.3,1);
          max-height: 90vh;
          overflow: auto;
        }
        @keyframes slideModal {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Cierre */
        .guia-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 10;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .guia-modal-close:hover {
          background: rgba(255,255,255,0.25);
        }

        /* Columna decorativa */
        .guia-modal-deco {
          background: #1A5C38;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          position: relative;
          min-height: 480px;
        }
        .guia-modal-big-si {
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          font-size: 18rem;
          font-weight: 700;
          color: rgba(255,255,255,0.08);
          line-height: 1;
          position: absolute;
          bottom: -30px;
          left: -20px;
          letter-spacing: -0.04em;
          pointer-events: none;
        }

        /* Columna formulario */
        .guia-modal-form-col {
          padding: 56px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .guia-modal-tag {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #1A5C38;
          margin-bottom: 12px;
        }
        .guia-modal-title {
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          font-size: clamp(1.8rem, 2.5vw, 2.4rem);
          font-weight: 300;
          line-height: 1.15;
          color: #0E0E0E;
          margin-bottom: 12px;
        }
        .guia-modal-desc {
          font-size: 0.88rem;
          color: rgba(14,14,14,0.55);
          line-height: 1.75;
          margin-bottom: 28px;
        }

        /* Fields */
        .guia-field {
          margin-bottom: 14px;
        }
        .guia-field input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid rgba(0,0,0,0.15);
          background: #F8F5F0;
          font-size: 0.93rem;
          color: #0E0E0E;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          font-family: inherit;
          border-radius: 0;
          -webkit-appearance: none;
        }
        .guia-field input::placeholder { color: rgba(14,14,14,0.35); }
        .guia-field input:focus { border-color: #1A5C38; background: #fff; }
        .guia-field input.error { border-color: #EF4444; }
        .guia-field-err {
          display: block;
          font-size: 0.72rem;
          color: #EF4444;
          margin-top: 4px;
        }

        /* Submit */
        .guia-modal-submit {
          width: 100%;
          margin-top: 6px;
          padding: 15px 28px;
          background: #1A5C38;
          color: #fff;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.25s, transform 0.2s;
        }
        .guia-modal-submit:hover:not(:disabled) {
          background: #0F3A23;
          transform: translateY(-1px);
        }
        .guia-modal-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .guia-loader {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .guia-privacy {
          margin-top: 12px;
          font-size: 0.7rem;
          color: rgba(14,14,14,0.35);
          text-align: center;
          line-height: 1.5;
        }

        /* Success */
        .guia-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          padding: 20px 0;
        }
        .guia-success-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #E4F0E9;
          border: 2px solid #1A5C38;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          color: #1A5C38;
          animation: popIn 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes popIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .guia-success h3 {
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          font-size: 1.6rem;
          font-weight: 300;
          color: #0E0E0E;
        }
        .guia-success p {
          font-size: 0.9rem;
          color: rgba(14,14,14,0.55);
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .guia-inner {
            grid-template-columns: 1fr;
            padding: 0 28px;
            gap: 48px;
          }
          .guia-preview { align-items: flex-start; }
          .guia-modal { grid-template-columns: 1fr; }
          .guia-modal-deco { display: none; }
          .guia-modal-form-col { padding: 48px 36px; }
          .guia-modal-close { color: #0E0E0E; background: rgba(0,0,0,0.06); border-color: rgba(0,0,0,0.1); }
        }
        @media (max-width: 600px) {
          .guia-section { padding: 72px 0; }
          .guia-modal-form-col { padding: 40px 24px; }
        }
      `}</style>
    </>
  )
}
