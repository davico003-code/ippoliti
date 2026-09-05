import Image from 'next/image'
import Link from 'next/link'
import { FranjaFooterMundial, LineaMundial } from '@/components/mundial/FooterMundial'

// Footer blanco (rediseño "Dirección B"). Reemplaza al footer negro en todo el
// sitio. Conserva los links/columnas reales y los datos legales.
const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"

const GREEN = '#15543a'
const INK = '#15201b'
const MUTED = '#5e6a63'
const LINE = '#e6eae7'
const LINE_SOFT = '#eef1ef'

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
      { label: 'Mercado inmobiliario de Funes', href: '/mercado-inmobiliario-funes' },
      { label: 'Recursos y calculadoras', href: '/recursos' },
      { label: 'Informes de mercado', href: '/informes' },
      { label: 'Guía del Comprador', href: '/guia' },
      { label: 'Blog', href: '/blog' },
      { label: 'Nosotros', href: '/nosotros' },
    ],
  },
  {
    title: 'CONTACTO',
    links: [
      { label: '(341) 334-0916', href: 'https://wa.me/5493413340916' },
      { label: 'contacto@siinmobiliaria.com', href: 'mailto:contacto@siinmobiliaria.com' },
      { label: '@inmobiliaria.si', href: 'https://www.instagram.com/inmobiliaria.si' },
      { label: '@si.inmobiliaria', href: 'https://www.tiktok.com/@si.inmobiliaria' },
    ],
  },
]

export default function Footer() {
  return (
    <footer style={{ position: 'relative', background: '#fff', borderTop: `1px solid ${LINE}`, padding: '64px 40px 36px', color: INK }}>
      {/* Edición Mundial 2026 — franja-bandera pegada al borde superior. */}
      <FranjaFooterMundial />
      <style dangerouslySetInnerHTML={{ __html: `
        .footerb-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 44px; }
        .footerb-link:hover { color: ${GREEN} !important; }
        @media (max-width: 768px) {
          footer { padding: 48px 22px 28px !important; }
          .footerb-grid { grid-template-columns: 1fr 1fr; gap: 34px; }
          .footerb-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .footerb-grid { grid-template-columns: 1fr; }
        }
        .footerb-bottom { flex-direction: row; }
        @media (max-width: 768px) {
          .footerb-bottom { flex-direction: column; align-items: flex-start !important; gap: 14px; }
        }
      ` }} />
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div className="footerb-grid">
          {/* Brand */}
          <div className="footerb-brand">
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <Image
                src="/LOGO_HORIZONTAL.png"
                alt="SI INMOBILIARIA"
                width={205}
                height={30}
                className="object-contain"
              />
            </Link>
            <p style={{ fontFamily: RALEWAY, fontSize: 15, color: MUTED, maxWidth: '34ch', margin: '18px 0 0', lineHeight: 1.5, fontWeight: 500 }}>
              Acompañamos cada decisión inmobiliaria con información clara y agentes que conocen el mercado.
            </p>
          </div>

          {/* Columns */}
          {COLUMNS.map(col => (
            <div key={col.title}>
              <p
                style={{
                  fontFamily: RALEWAY,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: INK,
                  margin: '0 0 18px',
                }}
              >
                {col.title}
              </p>
              {col.links.map(l => (
                <a
                  key={l.label}
                  href={l.href}
                  className="footerb-link"
                  style={{
                    display: 'block',
                    fontFamily: RALEWAY,
                    fontSize: 15,
                    color: MUTED,
                    textDecoration: 'none',
                    marginBottom: 12,
                    transition: 'color 0.15s ease',
                  }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div
          className="footerb-bottom"
          style={{
            borderTop: `1px solid ${LINE_SOFT}`,
            paddingTop: 26,
            marginTop: 56,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <p style={{ fontFamily: RALEWAY, fontSize: 14, color: MUTED, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
            © 2026 SI INMOBILIARIA · David Flores Mat. N° 0621
          </p>
          <LineaMundial />
          <div style={{ fontFamily: RALEWAY, fontSize: 14, color: MUTED, display: 'flex', gap: 12 }}>
            <span>Funes · Rosario · Santa Fe</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
