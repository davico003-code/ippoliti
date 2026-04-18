import Link from 'next/link'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"
const GREEN = '#1A5C38'

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'PROPIEDADES',
    links: [
      { label: 'Comprar en Funes y Roldán', href: '/propiedades?op=venta' },
      { label: 'Alquilar en Funes y Roldán', href: '/propiedades?op=alquiler' },
      { label: 'Emprendimientos', href: '/emprendimientos' },
      { label: 'Tasaciones', href: '/tasaciones' },
    ],
  },
  {
    title: 'INFORMACIÓN',
    links: [
      { label: 'Informes de mercado', href: '/informes' },
      { label: 'Guía del Comprador', href: '/guia' },
      { label: 'Blog', href: '/blog' },
      { label: 'Nosotros', href: '/nosotros' },
    ],
  },
  {
    title: 'CONTACTO',
    links: [
      { label: '(341) 210-1694', href: 'https://wa.me/5493412101694' },
      { label: 'ventas@inmobiliariaippoliti.com', href: 'mailto:ventas@inmobiliariaippoliti.com' },
      { label: '@inmobiliaria.si', href: 'https://www.instagram.com/inmobiliaria.si' },
      { label: '@si.inmobiliaria', href: 'https://www.tiktok.com/@si.inmobiliaria' },
    ],
  },
]

export default function Footer() {
  return (
    <footer style={{ background: '#111', padding: '48px 48px 32px', color: '#fff' }}>
      <style>{`
        .footer-top { display: flex; gap: 56px; align-items: flex-start; margin-bottom: 40px; flex-wrap: wrap; }
        .footer-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 56px; flex: 1; }
        .footer-link:hover { color: #fff !important; }
        @media (max-width: 768px) {
          footer { padding: 40px 24px 24px !important; }
          .footer-top { flex-direction: column; gap: 32px; }
          .footer-cols { grid-template-columns: 1fr 1fr; gap: 32px; }
        }
        @media (max-width: 480px) {
          .footer-cols { grid-template-columns: 1fr; }
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="footer-top">
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: GREEN,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontFamily: POPPINS,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              SI
            </div>
            <div>
              <div
                style={{
                  fontFamily: RALEWAY,
                  fontWeight: 600,
                  fontSize: 11,
                  color: '#fff',
                  letterSpacing: '1.2px',
                  lineHeight: 1.2,
                }}
              >
                INMOBILIARIA
              </div>
              <div
                style={{
                  fontFamily: POPPINS,
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '1px',
                  marginTop: 2,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                DESDE 1983
              </div>
            </div>
          </Link>

          {/* Columns */}
          <div className="footer-cols">
            {COLUMNS.map(col => (
              <div key={col.title}>
                <div
                  style={{
                    fontFamily: POPPINS,
                    fontSize: 9,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    color: 'rgba(255,255,255,0.35)',
                    marginBottom: 16,
                  }}
                >
                  {col.title}
                </div>
                {col.links.map(l => (
                  <a
                    key={l.label}
                    href={l.href}
                    className="footer-link"
                    style={{
                      display: 'block',
                      fontFamily: POPPINS,
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.55)',
                      textDecoration: 'none',
                      marginBottom: 8,
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: '0.5px solid rgba(255,255,255,0.1)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <p
            style={{
              fontFamily: POPPINS,
              fontSize: 11,
              color: 'rgba(255,255,255,0.3)',
              margin: 0,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            © 2026 SI Inmobiliaria · David Flores Mat. N° 0621
          </p>
          <div
            style={{
              fontFamily: POPPINS,
              fontSize: 11,
              color: 'rgba(255,255,255,0.3)',
              display: 'flex',
              gap: 12,
            }}
          >
            <a href="#" className="footer-link" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s ease' }}>
              Política de Privacidad
            </a>
            <span>·</span>
            <a href="#" className="footer-link" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s ease' }}>
              Términos y Condiciones
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
