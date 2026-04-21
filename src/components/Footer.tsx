import Link from 'next/link'
import EmailLink from './EmailLink'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"
const GREEN = '#1A5C38'
const EMAIL_B64 = 'dmVudGFzQGlubW9iaWxpYXJpYWlwcG9saXRpLmNvbQ=='

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
]

const CONTACTO_LINKS: { label: string; href: string }[] = [
  { label: '(341) 210-1694', href: 'https://wa.me/5493412101694' },
  { label: '@inmobiliaria.si', href: 'https://www.instagram.com/inmobiliaria.si' },
  { label: '@davidflores.pov', href: 'https://www.instagram.com/davidflores.pov' },
  { label: 'Charlas Que Sí · YouTube', href: 'https://www.youtube.com/@mundosiinmobiliaria' },
  { label: '@si.inmobiliaria', href: 'https://www.tiktok.com/@si.inmobiliaria' },
]

const LINK_STYLE = {
  display: 'block',
  fontFamily: POPPINS,
  fontSize: 12,
  color: 'rgba(255,255,255,0.55)',
  textDecoration: 'none',
  marginBottom: 8,
  transition: 'color 0.2s ease',
} as const

export default function Footer() {
  return (
    <footer style={{ background: '#111', padding: '48px 48px 32px', color: '#fff' }}>
      <style>{`
        .footer-top { display: flex; gap: 56px; align-items: flex-start; margin-bottom: 40px; flex-wrap: wrap; }
        .footer-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 56px; flex: 1; }
        .footer-link:hover { color: #fff !important; }
        .social-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin: 0 0 32px; padding: 24px 0; border-top: 0.5px solid rgba(255,255,255,0.1); border-bottom: 0.5px solid rgba(255,255,255,0.1); }
        .social-icon { width: 40px; height: 40px; border-radius: 999px; border: 0.5px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7); transition: color 0.2s ease, border-color 0.2s ease; }
        .social-icon:hover { color: ${GREEN}; border-color: ${GREEN}; }
        .social-icon[aria-disabled="true"] { opacity: 0.35; cursor: not-allowed; }
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
                  <a key={l.label} href={l.href} className="footer-link" style={LINK_STYLE}>
                    {l.label}
                  </a>
                ))}
              </div>
            ))}

            {/* Columna CONTACTO — con email ofuscado */}
            <div>
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
                CONTACTO
              </div>
              <EmailLink
                encoded={EMAIL_B64}
                label="Escribinos a SI INMOBILIARIA"
                placeholder="Escribinos"
                className="footer-link"
                style={LINK_STYLE}
                textClassName=""
              />
              {CONTACTO_LINKS.map(l => (
                <a key={l.label} href={l.href} className="footer-link" style={LINK_STYLE}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="social-row" aria-label="SI INMOBILIARIA en redes sociales">
          <a
            href="https://www.instagram.com/inmobiliaria.si"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram SI INMOBILIARIA"
            className="social-icon"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
          </a>
          <a
            href="https://www.instagram.com/davidflores.pov"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram David Flores @davidflores.pov"
            className="social-icon"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
          </a>
          <a
            href="https://www.youtube.com/@mundosiinmobiliaria"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube Charlas Que Sí"
            className="social-icon"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
          </a>
          <span
            aria-label="LinkedIn (próximamente)"
            aria-disabled="true"
            title="Próximamente"
            className="social-icon"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
          </span>
          <span
            aria-label="X (próximamente)"
            aria-disabled="true"
            title="Próximamente"
            className="social-icon"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </span>
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
            © 2026 SI INMOBILIARIA · David Flores Mat. N° 0621
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
