// Header de sección para las páginas de recursos. Estilo nuevo (dirección Apple/
// Stripe/Linear, igual que el index de /recursos): tipografía SF Pro, eyebrow
// verde, título 800, sin dorado ni beige. Va debajo del Navbar: eyebrow + título
// + bajada con un tinte suave por tema. Reemplaza los headers propios de cada placa.
import Breadcrumbs from '@/components/recursos/Breadcrumbs'

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, 'Segoe UI', sans-serif"
const ACCENT = '#00754A'
const INK = '#111111'
const MUTED = '#666666'

type Theme = 'green' | 'sand' | 'plain'

// Tintes suaves por tema (sin beige). El verde tira a menta muy clara; el resto, gris.
const TINT: Record<Theme, string> = {
  green: '#EEF4EF',
  sand: '#F2F2EF',
  plain: '#F7F7F5',
}

export default function RecursoHero({
  eyebrow,
  title,
  subtitle,
  theme = 'plain',
  breadcrumbLabel,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  theme?: Theme
  /** Si se pasa, renderiza breadcrumbs Inicio / Recursos / {label} arriba. */
  breadcrumbLabel?: string
}) {
  return (
    <section style={{ background: TINT[theme], borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 clamp(22px, 5vw, 48px)' }}>
        <style>{`
          .recurso-hero { padding: 30px 0 44px; -webkit-font-smoothing: antialiased; }
          @media (max-width: 860px) { .recurso-hero { padding: 20px 0 32px; } }
        `}</style>
        <div className="recurso-hero">
          {breadcrumbLabel && (
            <div style={{ marginBottom: 18 }}>
              <Breadcrumbs
                items={[
                  { label: 'Inicio', href: '/' },
                  { label: 'Recursos', href: '/recursos' },
                  { label: breadcrumbLabel },
                ]}
              />
            </div>
          )}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: ACCENT,
            }}
          >
            <span style={{ width: 28, height: 2, background: ACCENT, borderRadius: 2 }} />
            {eyebrow}
          </span>
          <h1
            style={{
              fontFamily: FONT,
              fontSize: 'clamp(34px, 4vw, 54px)',
              lineHeight: 1.03,
              fontWeight: 800,
              letterSpacing: '-0.035em',
              color: INK,
              margin: '18px 0 0',
              maxWidth: '20ch',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontFamily: FONT, fontSize: 18, color: MUTED, margin: '18px 0 0', maxWidth: '52ch', lineHeight: 1.5, fontWeight: 400 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
