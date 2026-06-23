// Header de sección para las páginas de recursos. Estilo Apple: tipografía SF Pro,
// fondo BLANCO, título 800 y todo CENTRADO. Eyebrow verde, sin dorado ni beige.
// Va debajo del Navbar y reemplaza los headers propios de cada placa.
import Breadcrumbs from '@/components/recursos/Breadcrumbs'

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, 'Segoe UI', sans-serif"
const ACCENT = '#00754A'
const INK = '#111111'
const MUTED = '#666666'

type Theme = 'green' | 'sand' | 'plain'

export default function RecursoHero({
  eyebrow,
  title,
  subtitle,
  breadcrumbLabel,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  /** Se mantiene por compatibilidad; el hero ahora es siempre blanco. */
  theme?: Theme
  /** Si se pasa, renderiza breadcrumbs Inicio / Recursos / {label} arriba. */
  breadcrumbLabel?: string
}) {
  return (
    <section style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 clamp(22px, 5vw, 48px)' }}>
        <style>{`
          .recurso-hero { padding: 30px 0 50px; text-align: center; -webkit-font-smoothing: antialiased; }
          @media (max-width: 860px) { .recurso-hero { padding: 20px 0 38px; } }
        `}</style>
        <div className="recurso-hero">
          {breadcrumbLabel && (
            <div style={{ marginBottom: 22, display: 'flex', justifyContent: 'center' }}>
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
              display: 'inline-block',
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: ACCENT,
            }}
          >
            {eyebrow}
          </span>
          <h1
            style={{
              fontFamily: FONT,
              fontSize: 'clamp(34px, 4.2vw, 56px)',
              lineHeight: 1.03,
              fontWeight: 800,
              letterSpacing: '-0.035em',
              color: INK,
              margin: '14px auto 0',
              maxWidth: '20ch',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontFamily: FONT, fontSize: 18, color: MUTED, margin: '18px auto 0', maxWidth: '58ch', lineHeight: 1.55, fontWeight: 400 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
