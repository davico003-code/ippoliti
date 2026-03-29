'use client'

export default function TrayectoriaSection() {
  return (
    <>
      <section className="ts">
        <div className="ts-wrap">

          {/* Columna izquierda */}
          <div className="ts-left">
            <div className="ts-eyebrow">Desde 1983</div>
            <h2 className="ts-h2">
              Tu inmobiliaria<br />de confianza.
            </h2>
            <p className="ts-body">
              Más de 40 años acompañando a familias y empresas en la compra, venta y alquiler de propiedades en Funes, Roldán y toda la zona oeste de Rosario.
            </p>
            <a href="/nosotros" className="ts-link">
              Conocé nuestra historia
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Columna derecha */}
          <div className="ts-right">
            <p className="ts-desc">
              Tres oficinas en Funes y Roldán, dos de los municipios con mayor demanda de propiedades en Santa Fe. Casas, lotes, departamentos, locales comerciales y emprendimientos — con un equipo profesional que te guía desde la tasación hasta la escrituración.
            </p>

            {/* Stats */}
            <div className="ts-stats">
              <div className="ts-stat">
                <span className="ts-stat-num">40<span className="ts-plus">+</span></span>
                <span className="ts-stat-label">años de trayectoria</span>
              </div>
              <div className="ts-divider" />
              <div className="ts-stat">
                <span className="ts-stat-num">3</span>
                <span className="ts-stat-label">oficinas propias</span>
              </div>
              <div className="ts-divider" />
              <div className="ts-stat">
                <span className="ts-stat-num">Miles</span>
                <span className="ts-stat-label">de familias mudadas</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <style jsx>{`
        .ts {
          background: #F8F5F0;
          padding: 120px 0;
        }
        .ts-wrap {
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 96px;
          align-items: start;
        }

        /* Izquierda */
        .ts-eyebrow {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #1A5C38;
          margin-bottom: 22px;
        }
        .ts-h2 {
          font-family: 'Raleway', sans-serif;
          font-size: clamp(2.6rem, 4vw, 4rem);
          font-weight: 200;
          line-height: 1.04;
          letter-spacing: -0.03em;
          color: #0E0E0E;
          margin-bottom: 24px;
        }
        .ts-body {
          font-size: 0.95rem;
          color: rgba(14,14,14,0.52);
          line-height: 1.78;
          margin-bottom: 32px;
          max-width: 380px;
        }
        .ts-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.83rem;
          font-weight: 500;
          color: #1A5C38;
          text-decoration: none;
          border-bottom: 1px solid rgba(26,92,56,0.25);
          padding-bottom: 2px;
          transition: border-color 0.2s, gap 0.2s;
        }
        .ts-link:hover {
          border-color: #1A5C38;
          gap: 12px;
        }

        /* Derecha */
        .ts-desc {
          font-size: 0.96rem;
          color: rgba(14,14,14,0.55);
          line-height: 1.82;
          margin-bottom: 56px;
        }

        /* Stats */
        .ts-stats {
          display: flex;
          align-items: center;
          gap: 40px;
        }
        .ts-divider {
          width: 1px;
          height: 48px;
          background: rgba(14,14,14,0.1);
          flex-shrink: 0;
        }
        .ts-stat {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ts-stat-num {
          font-family: 'Poppins', sans-serif;
          font-size: 2.2rem;
          font-weight: 300;
          color: #0E0E0E;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .ts-plus {
          font-size: 1.4rem;
          color: #1A5C38;
        }
        .ts-stat-label {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(14,14,14,0.38);
        }

        /* Responsive */
        @media (max-width: 960px) {
          .ts-wrap {
            grid-template-columns: 1fr;
            gap: 56px;
            padding: 0 32px;
          }
          .ts { padding: 88px 0; }
          .ts-body { max-width: 100%; }
          .ts-stats { gap: 28px; }
        }
        @media (max-width: 600px) {
          .ts { padding: 68px 0; }
          .ts-wrap { padding: 0 20px; }
          .ts-stats { gap: 20px; }
          .ts-stat-num { font-size: 1.8rem; }
        }
      `}</style>
    </>
  )
}
