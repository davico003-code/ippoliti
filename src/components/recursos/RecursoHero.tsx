// Header de sección temático para las páginas de recursos (rediseño "Dirección
// B"). Va debajo del Navbar del sitio: eyebrow + título + bajada, con el tinte
// del tema de cada sección. Reemplaza los headers propios de cada placa para
// dar consistencia.
import Breadcrumbs from '@/components/recursos/Breadcrumbs'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const GREEN = '#15543a'
const GOLD = '#9a7b3c'
const INK = '#15201b'
const MUTED = '#5e6a63'

type Theme = 'green' | 'sand' | 'plain'

const TINT: Record<Theme, string> = {
  green: '#eef4ef',
  sand: '#f6f2e9',
  plain: '#f3f5f3',
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
    <section style={{ background: TINT[theme], borderBottom: '1px solid #e6eae7' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px' }}>
        <style>{`
          .recurso-hero { padding: 28px 0 40px; }
          @media (max-width: 860px) { .recurso-hero { padding: 18px 0 30px; } }
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
              fontFamily: RALEWAY,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: GOLD,
            }}
          >
            <span style={{ width: 32, height: 2, background: GOLD }} />
            {eyebrow}
          </span>
          <h1
            style={{
              fontFamily: RALEWAY,
              fontSize: 'clamp(30px, 3.6vw, 46px)',
              lineHeight: 1.06,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: INK,
              margin: '16px 0 0',
              maxWidth: '20ch',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontFamily: RALEWAY, fontSize: 17, color: MUTED, margin: '16px 0 0', maxWidth: '52ch', lineHeight: 1.5, fontWeight: 500 }}>
              {subtitle}
            </p>
          )}
          <div style={{ width: 46, height: 3, background: GREEN, borderRadius: 2, marginTop: 22 }} />
        </div>
      </div>
    </section>
  )
}
