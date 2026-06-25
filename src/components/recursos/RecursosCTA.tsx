// Contact strip reutilizable — placa verde profundo (paleta oficial SI) para que
// resalte sobre el fondo blanco. Va al fondo de las páginas de recursos.
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, 'Segoe UI', sans-serif"
const GREEN_DEEP = '#0B3F2D'

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
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(40px, 6vw, 72px) clamp(22px, 5vw, 40px)' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .recursos-cta {
            display: flex; align-items: center; justify-content: space-between; gap: clamp(24px, 4vw, 48px);
            background: linear-gradient(150deg, #1A5C38, #123F27);
            border-radius: 28px; padding: clamp(32px, 4vw, 52px) clamp(28px, 4vw, 56px);
            -webkit-font-smoothing: antialiased;
          }
          .recursos-cta-btn { transition: transform .2s cubic-bezier(.2,.7,.2,1); }
          .recursos-cta-btn:hover { transform: scale(1.03); }
          .recursos-cta-btn svg { transition: transform .2s; }
          .recursos-cta-btn:hover svg { transform: translateX(4px); }
          @media (max-width: 760px) {
            .recursos-cta { flex-direction: column; align-items: flex-start; }
            .recursos-cta .recursos-cta-btn { width: 100%; justify-content: center; }
          }
        ` }} />
        <div className="recursos-cta">
          <div>
            <h2 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 2.6vw, 34px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', margin: 0, lineHeight: 1.1 }}>
              {title}
            </h2>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'rgba(255,255,255,0.74)', margin: '10px 0 0', maxWidth: '46ch', lineHeight: 1.5 }}>
              {text}
            </p>
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
              background: '#fff',
              color: GREEN_DEEP,
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 16,
              height: 54,
              padding: '0 30px',
              borderRadius: 999,
              textDecoration: 'none',
            }}
          >
            Hablar con un agente
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
