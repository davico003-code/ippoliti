// Contact strip reutilizable (rediseño "Dirección B"). Va al fondo de las
// páginas de recursos, encima del footer. Estilo del mockup.
const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const GREEN = '#15543a'
const INK = '#15201b'
const MUTED = '#5e6a63'
const LINE = '#e6eae7'

const WHATSAPP =
  'https://wa.me/5493412101694?text=' +
  encodeURIComponent('Hola SI Inmobiliaria, tengo una consulta sobre mi operación.')

export default function RecursosCTA({
  title = '¿Tenés dudas con tu operación?',
  text = 'Un agente te ayuda a interpretar los números y avanzar con confianza.',
}: {
  title?: string
  text?: string
}) {
  return (
    <section style={{ background: '#fff' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px' }}>
        <style>{`
          .recursos-cta { display: flex; align-items: center; justify-content: space-between; gap: 30px;
            border-top: 1px solid ${LINE}; padding: 48px 0; }
          @media (max-width: 860px) {
            .recursos-cta { flex-direction: column; align-items: flex-start; }
            .recursos-cta .recursos-cta-btn { width: 100%; justify-content: center; }
            .recursos-cta { padding: 40px 22px; }
          }
        `}</style>
        <div className="recursos-cta">
          <div>
            <h2 style={{ fontFamily: RALEWAY, fontSize: 'clamp(22px, 2.4vw, 30px)', fontWeight: 800, letterSpacing: '-0.02em', color: INK, margin: 0 }}>
              {title}
            </h2>
            <p style={{ fontFamily: RALEWAY, fontSize: 16, color: MUTED, margin: '8px 0 0' }}>{text}</p>
          </div>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="recursos-cta-btn"
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: GREEN,
              color: '#fff',
              fontFamily: RALEWAY,
              fontWeight: 700,
              fontSize: 16,
              padding: '16px 28px',
              borderRadius: 100,
              textDecoration: 'none',
            }}
          >
            Hablar con un agente
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
