import Image from '@/components/Imagen'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { FranjaFooterMundial, LineaMundial } from '@/components/mundial/FooterMundial'

// Footer blanco (rediseño "Dirección B"). Reemplaza al footer negro en todo el
// sitio. Conserva los links/columnas reales y los datos legales.
// El nombre va como respaldo DENTRO del var(): "var(--font-raleway), 'Raleway'"
// invalidaba toda la declaración si la variable faltaba.
const RALEWAY = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"

const GREEN = 'var(--brand)'
const INK = 'var(--foreground)'
const MUTED = 'var(--tinta-soft)'
const LINE = 'var(--line)'
const LINE_SOFT = 'var(--line)'

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'PROPIEDADES',
    links: [
      { label: 'Comprar en Funes y Roldán', href: '/propiedades?op=venta' },
      { label: 'Alquilar en Funes y Roldán', href: '/propiedades?op=alquiler' },
      { label: 'Alquileres temporarios', href: '/alquileres-temporarios' },
      { label: 'Emprendimientos', href: '/emprendimientos' },
      { label: 'Vender tu propiedad', href: '/vender' },
      { label: 'Tasar tu casa online', href: '/tasar' },
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
      { label: 'Mundo SI · Videos y charlas', href: '/contenidos' },
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

// Bloque "Zonas": todas las páginas de localidad, linkeadas desde todo el
// sitio (Search Console las marcaba "descubierta, sin rastrear": casi nada las
// linkeaba). Al sumar una landing de zona, agregarla acá.
const ZONAS: { titulo: string; links: { label: string; href: string }[] }[] = [
  {
    titulo: 'Funes',
    links: [
      { href: '/casas-en-venta-funes', label: 'Casas en venta en Funes' },
      { href: '/terrenos-funes', label: 'Terrenos en Funes' },
      { href: '/barrios-privados', label: 'Barrios privados de Funes' },
      { href: '/barrio-don-mateo-funes', label: 'Barrio Don Mateo' },
      { href: '/inmobiliaria-funes', label: 'Inmobiliaria en Funes' },
    ],
  },
  {
    titulo: 'Roldán',
    links: [
      { href: '/casas-en-venta-roldan', label: 'Casas en venta en Roldán' },
      { href: '/terrenos-roldan', label: 'Terrenos en Roldán' },
      { href: '/alquiler-roldan', label: 'Alquileres en Roldán' },
      { href: '/propiedades-roldan', label: 'Propiedades en Roldán' },
      { href: '/barrio-los-aromos-roldan', label: 'Barrio Los Aromos' },
      { href: '/barrio-el-molino-roldan', label: 'Barrio El Molino' },
      { href: '/inmobiliaria-roldan', label: 'Inmobiliaria en Roldán' },
    ],
  },
  {
    titulo: 'Rosario',
    links: [
      { href: '/rosario/departamentos', label: 'Departamentos en Rosario' },
      { href: '/casas-en-venta-fisherton', label: 'Casas en Fisherton' },
      { href: '/departamentos-puerto-norte', label: 'Departamentos en Puerto Norte' },
      { href: '/departamentos-pichincha', label: 'Departamentos en Pichincha' },
      { href: '/departamentos-centro-rosario', label: 'Departamentos en el centro' },
      { href: '/departamentos-echesortu', label: 'Departamentos en Echesortu' },
      { href: '/departamentos-abasto', label: 'Departamentos en Abasto' },
      { href: '/inmobiliaria-fisherton', label: 'Inmobiliaria en Fisherton' },
    ],
  },
]

// Links internos con next/link (navegación suave, sin recargar toda la página
// como hacía el <a>); prefetch={false} para no precargar ~35 rutas cada vez que
// el footer entra en pantalla. Los externos abren en otra pestaña.
function FooterLink({ href, label, zona = false }: { href: string; label: string; zona?: boolean }) {
  const className = zona ? 'footerb-link footerb-link--zona' : 'footerb-link'
  if (href.startsWith('/')) {
    return <Link href={href} prefetch={false} className={className}>{label}</Link>
  }
  const externo = href.startsWith('http')
  return (
    <a href={href} className={className} {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {label}
    </a>
  )
}

export default function Footer() {
  return (
    <footer style={{ position: 'relative', background: 'var(--background)', borderTop: `1px solid ${LINE}`, padding: '64px 40px 36px', color: INK }}>
      {/* Edición Mundial 2026 — franja-bandera pegada al borde superior. */}
      <FranjaFooterMundial />
      {/* Columnas como <details> nativos (sin JS). En el celu cada sección se
          pliega: antes eran ~35 links apilados en una sola columna, una pared.
          En la compu se ven siempre abiertas, como antes (::details-content);
          un navegador viejo que no lo soporte las muestra plegables también en
          la compu, que sigue andando. Los links plegados siguen en el HTML, así
          que el enlazado interno de Zonas (el motivo de ese bloque) no se pierde. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .footerb-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 44px; }
        .footerb-link { display: block; font-family: ${RALEWAY}; font-size: 15px; color: ${MUTED}; text-decoration: none; margin-bottom: 12px; transition: color 0.15s ease; }
        .footerb-link--zona { font-size: 14px; margin-bottom: 10px; }
        .footerb-link:hover { color: ${GREEN}; }
        .footerb-sum { display: block; list-style: none; cursor: pointer; font-family: ${RALEWAY}; color: ${INK}; margin: 0 0 18px; }
        .footerb-sum-in { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .footerb-sum::-webkit-details-marker { display: none; }
        .footerb-sum--col { font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
        .footerb-sum--zona { font-size: 15px; font-weight: 700; margin-bottom: 12px; }
        .footerb-chev { flex: none; color: ${MUTED}; transition: transform 0.2s ease-out; }
        .footerb-det[open] > .footerb-sum .footerb-chev { transform: rotate(180deg); }
        @supports selector(::details-content) {
          @media (min-width: 769px) {
            .footerb-det::details-content { content-visibility: visible; display: block; }
            .footerb-det > .footerb-sum { cursor: default; }
            .footerb-chev { display: none; }
          }
        }
        @media (max-width: 768px) {
          footer { padding: 48px 22px 28px !important; }
          .footerb-grid { grid-template-columns: 1fr; gap: 0; }
          .footerb-brand { grid-column: 1 / -1; margin-bottom: 28px; }
          .footerb-sep { display: none; }
          .footerb-zonas { margin: 28px 0 6px !important; }
          .footerb-det { border-bottom: 1px solid ${LINE}; }
          .footerb-det--primero { border-top: 1px solid ${LINE}; }
          .footerb-sum { margin: 0; }
          .footerb-sum-in { min-height: 52px; }
          .footerb-links { padding-bottom: 10px; }
          .footerb-link, .footerb-link--zona { margin: 0; padding: 10px 0; }
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
                className="object-contain si-theme-logo"
              />
            </Link>
            <p style={{ fontFamily: RALEWAY, fontSize: 15, color: MUTED, maxWidth: '34ch', margin: '18px 0 0', lineHeight: 1.5, fontWeight: 500 }}>
              Acompañamos cada decisión inmobiliaria con información clara y agentes que conocen el mercado.
            </p>
          </div>

          {/* Columns — CONTACTO arranca abierta también en el celu: son 4 datos
              que la persona busca justamente al llegar al pie. */}
          {COLUMNS.map((col, i) => (
            <details
              key={col.title}
              className={`footerb-det${i === 0 ? ' footerb-det--primero' : ''}`}
              open={col.title === 'CONTACTO' || undefined}
            >
              <summary className="footerb-sum footerb-sum--col">
                <span className="footerb-sum-in">
                  {col.title}
                  <ChevronDown aria-hidden size={18} strokeWidth={2} className="footerb-chev" />
                </span>
              </summary>
              <div className="footerb-links">
                {col.links.map(l => <FooterLink key={l.label} href={l.href} label={l.label} />)}
              </div>
            </details>
          ))}

          {/* Zonas: segunda fila de la misma grilla, así las columnas coinciden */}
          <div aria-hidden className="footerb-sep" style={{ gridColumn: '1 / -1', borderTop: `1px solid ${LINE_SOFT}` }} />
          <p className="footerb-brand footerb-zonas" style={{ fontFamily: RALEWAY, fontSize: 13, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: INK, margin: 0 }}>
            Zonas
          </p>
          {ZONAS.map((z, i) => (
            <details key={z.titulo} className={`footerb-det${i === 0 ? ' footerb-det--primero' : ''}`}>
              <summary className="footerb-sum footerb-sum--zona">
                <span className="footerb-sum-in">
                  {z.titulo}
                  <ChevronDown aria-hidden size={18} strokeWidth={2} className="footerb-chev" />
                </span>
              </summary>
              <div className="footerb-links">
                {z.links.map(l => <FooterLink key={l.href} href={l.href} label={l.label} zona />)}
              </div>
            </details>
          ))}
        </div>

        <div
          className="footerb-bottom"
          style={{
            borderTop: `1px solid ${LINE_SOFT}`,
            paddingTop: 26,
            marginTop: 44,
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
            {/* Roldán tiene 2 de las 3 oficinas (y es la plaza de origen de la
                marca): no podía faltar en la firma de cada página. */}
            <span>Funes · Roldán · Rosario</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
