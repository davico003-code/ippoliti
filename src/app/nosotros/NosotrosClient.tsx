'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'

const OfficesMap = dynamic(() => import('@/components/OfficesMap'), { ssr: false })

const RALEWAY = "'Raleway', system-ui, sans-serif"
const POPPINS = "'Poppins', system-ui, sans-serif"
const GREEN = '#1A5C38'
const INK = '#1d1d1f'
const MUTED = '#6e6e73'
const BODY = '#4a4a48'
const BG = '#fafaf8'

const tabular: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' }

const STATS = [
  { num: '43', label: 'Años de historia' },
  { num: '+1.500', label: 'Propiedades vendidas' },
  { num: '3', label: 'Sedes' },
  { num: '20K+', label: 'Comunidad IG' },
]

const CAPITULOS = [
  {
    n: '01 · 1983',
    title: 'Susana funda SI en Roldán.',
    body:
      'Susana Ippoliti abre las puertas en 1ro de Mayo 258 con una idea simple: tratar a cada cliente como a un vecino. Ese gesto fundacional sigue siendo la brújula.',
  },
  {
    n: '02 · 2010s',
    title: 'Llega la segunda generación.',
    body:
      'Laura y David se suman al proyecto familiar. El oficio se mantiene, pero la forma de ejercerlo cambia: llega la tecnología, el diseño, la escala.',
  },
  {
    n: '03 · Hoy',
    title: 'Una nueva casa en Funes.',
    body:
      'Tres sedes, un equipo consolidado y una nueva casa pensada como un estudio: un espacio donde también vive una galería de arte.',
  },
]

const FAMILIA = [
  { nombre: 'Susana Ippoliti', cargo: 'Fundadora · 1983' },
  { nombre: 'Laura Flores', cargo: 'Co-dirección · Administración' },
  { nombre: 'David Flores', cargo: 'Director · Mat. N° 0621' },
]

const DIRECCION = [
  { n: 'Susana Ippoliti', c: 'Fundadora' },
  { n: 'Laura Flores', c: 'Co-dirección' },
  { n: 'David Flores', c: 'Director · Mat. 0621' },
]

const ASESORES = [
  'Aldana Ruiz',
  'Carolina Echen',
  'Gino Pecchenino',
  'Gisela Ramallo',
  'Lucia Wilson',
  'Maria Jose Espilocin',
  'Mariana Orlate',
  'Mauro Matteucci',
]

const ADMIN = ['Marisa Benitez', 'Eliana Rojas', 'Sabrina Riters', 'Leticia Alexenicer']

const MARKETING = [
  { n: 'Micaela Gonzalez', c: 'Marketing' },
  { n: 'Julian Ruschneider', c: 'Producción audiovisual' },
]

const SEDES = [
  { nombre: 'Funes', direccion: 'Hipólito Yrigoyen 2643', h1: 'Lun a Vie · 9 a 18 hs', h2: 'Sáb · 9 a 13 hs' },
  { nombre: 'Roldán centro', direccion: '1ro de Mayo 258', h1: 'Lun a Vie · 9 a 18 hs', h2: 'Sáb · 9 a 13 hs' },
  { nombre: 'Roldán este', direccion: 'Catamarca 775', h1: 'Lun a Vie · 9 a 18 hs', h2: 'Sáb · 9 a 13 hs' },
]

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase()
}

function Avatar({ nombre, big = false }: { nombre: string; big?: boolean }) {
  const size = big ? 110 : 90
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: GREEN,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: POPPINS,
        fontWeight: 500,
        fontSize: big ? 28 : 22,
        letterSpacing: '-0.02em',
        marginBottom: big ? 14 : 12,
      }}
    >
      {iniciales(nombre)}
    </div>
  )
}

function Eyebrow({ children, color = GREEN }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontFamily: POPPINS,
        fontWeight: 500,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.22em',
        color,
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="nosotros-section-title"
      style={{
        fontFamily: RALEWAY,
        fontWeight: 300,
        fontSize: 44,
        lineHeight: 1.1,
        letterSpacing: '-0.03em',
        color: INK,
        maxWidth: 600,
        margin: 0,
      }}
    >
      {children}
    </h2>
  )
}

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: POPPINS,
        fontWeight: 500,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        color: MUTED,
        marginBottom: 28,
        paddingBottom: 14,
        borderBottom: `1px solid ${INK}`,
      }}
    >
      {children}
    </div>
  )
}

export default function NosotrosClient() {
  const waMsg = encodeURIComponent('Hola, vi el sitio de SI Inmobiliaria y quería consultarles...')
  const waHref = `https://wa.me/5493412101694?text=${waMsg}`

  return (
    <main style={{ background: BG, color: INK }}>
      <style jsx global>{`
        .nosotros-hero-title { font-size: 56px; }
        .nosotros-px { padding-left: 64px; padding-right: 64px; }
        .nosotros-grid-equipo-4 { grid-template-columns: repeat(4, 1fr); }
        .nosotros-grid-equipo-3 { grid-template-columns: repeat(3, 1fr); }
        .nosotros-historia-grid { grid-template-columns: repeat(3, 1fr); }
        .nosotros-familia-grid { grid-template-columns: 320px 1fr; }
        .nosotros-sedes-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 1024px) {
          .nosotros-hero-title { font-size: 44px !important; }
          .nosotros-px { padding-left: 32px !important; padding-right: 32px !important; }
          .nosotros-section-title { font-size: 36px !important; }
          .nosotros-grid-equipo-4 { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 720px) {
          .nosotros-hero-title { font-size: 36px !important; }
          .nosotros-px { padding-left: 24px !important; padding-right: 24px !important; }
          .nosotros-section-title { font-size: 30px !important; }
          .nosotros-historia-grid { grid-template-columns: 1fr !important; }
          .nosotros-familia-grid { grid-template-columns: 1fr !important; }
          .nosotros-pared-grid { grid-template-columns: 1fr !important; }
          .nosotros-sedes-grid { grid-template-columns: 1fr !important; }
          .nosotros-grid-equipo-4 { grid-template-columns: repeat(2, 1fr) !important; }
          .nosotros-grid-equipo-3 { grid-template-columns: repeat(2, 1fr) !important; }
          .nosotros-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* 1. HERO */}
      <section style={{ position: 'relative', width: '100%', height: 720, overflow: 'hidden' }}>
        <Image
          src="/nosotros/IMG_4053.JPG"
          alt="Fachada SI Inmobiliaria"
          fill
          priority
          style={{ objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)',
          }}
        />
        <div style={{ position: 'absolute', top: 32, left: 48, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 26,
              height: 26,
              background: GREEN,
              color: '#fff',
              fontFamily: POPPINS,
              fontWeight: 500,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            SI
          </div>
          <span
            style={{
              fontFamily: POPPINS,
              fontWeight: 500,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            INMOBILIARIA · DESDE 1983
          </span>
        </div>
        <div style={{ position: 'absolute', bottom: 56, left: 48, right: 48 }}>
          <h1
            className="nosotros-hero-title"
            style={{
              fontFamily: RALEWAY,
              fontWeight: 300,
              lineHeight: 1.08,
              letterSpacing: '-0.035em',
              color: '#fff',
              margin: 0,
            }}
          >
            Una inmobiliaria
            <br />
            que se piensa como
            <br />
            un estudio.
          </h1>
          <p
            style={{
              fontFamily: POPPINS,
              fontWeight: 400,
              fontSize: 16,
              color: 'rgba(255,255,255,0.82)',
              lineHeight: 1.55,
              maxWidth: 480,
              marginTop: 20,
            }}
          >
            Cuatro décadas acompañando familias en Funes, Roldán y Rosario. Tres generaciones, un mismo
            oficio.
          </p>
        </div>
      </section>

      {/* 2. STATS */}
      <section className="nosotros-px" style={{ padding: '96px 64px' }}>
        <div className="nosotros-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ borderTop: `1px solid ${INK}`, paddingTop: 24 }}>
              <div
                style={{
                  fontFamily: POPPINS,
                  fontWeight: 500,
                  fontSize: 56,
                  color: INK,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  ...tabular,
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontFamily: POPPINS,
                  fontWeight: 500,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: MUTED,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. HISTORIA */}
      <section className="nosotros-px" style={{ paddingBottom: 120 }}>
        <Eyebrow>Historia</Eyebrow>
        <SectionTitle>Cuarenta y tres años en tres capítulos.</SectionTitle>
        <div className="nosotros-historia-grid" style={{ display: 'grid', gap: 48, marginTop: 64 }}>
          {CAPITULOS.map(c => (
            <div key={c.n}>
              {/* TODO: agregar foto cuando David la suba a /public/nosotros/
              <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', marginBottom: 24 }}>
                <Image src="..." alt="..." fill style={{ objectFit: 'cover' }} loading="lazy" />
              </div>
              */}
              <div
                style={{
                  fontFamily: POPPINS,
                  fontWeight: 500,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: GREEN,
                  marginBottom: 12,
                  ...tabular,
                }}
              >
                {c.n}
              </div>
              <h3
                style={{
                  fontFamily: RALEWAY,
                  fontWeight: 400,
                  fontSize: 24,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: INK,
                  margin: '0 0 14px',
                }}
              >
                {c.title}
              </h3>
              <p style={{ fontFamily: POPPINS, fontWeight: 400, fontSize: 14, lineHeight: 1.65, color: BODY, margin: 0 }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. LA FAMILIA */}
      <section className="nosotros-px" style={{ paddingBottom: 120 }}>
        <Eyebrow>La familia</Eyebrow>
        <SectionTitle>Tres generaciones unidas por un mismo oficio.</SectionTitle>
        <div className="nosotros-familia-grid" style={{ display: 'grid', gap: 56, marginTop: 56, alignItems: 'start' }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5' }}>
            <Image
              src="/nosotros/LAURASUSANADAVID.jpeg"
              alt="Susana, Laura y David Ippoliti Flores"
              fill
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
          <div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {FAMILIA.map(m => (
                <li key={m.nombre} style={{ padding: '18px 0', borderBottom: '1px solid #d0d0cc' }}>
                  <div
                    style={{
                      fontFamily: RALEWAY,
                      fontWeight: 500,
                      fontSize: 21,
                      letterSpacing: '-0.015em',
                      color: INK,
                    }}
                  >
                    {m.nombre}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontFamily: POPPINS,
                      fontWeight: 400,
                      fontSize: 13,
                      color: MUTED,
                      ...tabular,
                    }}
                  >
                    {m.cargo}
                  </div>
                </li>
              ))}
            </ul>
            <blockquote
              style={{
                marginTop: 36,
                marginLeft: 0,
                paddingLeft: 20,
                borderLeft: `2px solid ${GREEN}`,
                fontFamily: RALEWAY,
                fontWeight: 300,
                fontSize: 19,
                lineHeight: 1.5,
                letterSpacing: '-0.01em',
                color: INK,
              }}
            >
              “Más que una empresa, una continuidad de vocación.”
            </blockquote>
          </div>
        </div>
      </section>

      {/* 5. EL ESPACIO */}
      <section className="nosotros-px" style={{ paddingBottom: 120 }}>
        <Eyebrow>El espacio</Eyebrow>
        <SectionTitle>Una casa diseñada para acompañar decisiones importantes.</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 56 }}>
          <div style={{ gridColumn: '1 / -1', position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
            <Image
              src="/nosotros/IMG_4036.jpg"
              alt="Salón principal SI Funes"
              fill
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3' }}>
            <Image
              src="/nosotros/IMG_8457.jpg"
              alt="Lobby"
              fill
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3' }}>
            <Image src="/nosotros/IMG_2545_2.JPG" alt="Living" fill style={{ objectFit: 'cover' }} loading="lazy" />
          </div>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3' }}>
            <Image
              src="/nosotros/IMG_0432.JPG"
              alt="Sala de reuniones"
              fill
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3' }}>
            <Image
              src="/nosotros/oficina_funes_3.JPG"
              alt="Sala directorio"
              fill
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 6. PARED */}
      <section className="nosotros-px" style={{ paddingBottom: 120 }}>
        <div className="nosotros-pared-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3' }}>
            <Image
              src="/nosotros/DSC09309.jpg"
              alt="Galería PARED"
              fill
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
          <div>
            <Eyebrow>Pared</Eyebrow>
            <h2
              style={{
                fontFamily: RALEWAY,
                fontWeight: 300,
                fontSize: 36,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                color: INK,
                margin: '0 0 28px',
              }}
            >
              Una galería de arte dentro de nuestra casa.
            </h2>
            <p
              style={{
                fontFamily: POPPINS,
                fontWeight: 400,
                fontSize: 16,
                lineHeight: 1.65,
                color: BODY,
                margin: 0,
              }}
            >
              Porque vender una propiedad es ayudar a crear un hogar, y los hogares se construyen con
              historia, con cultura, con arte. PARED es el espacio que abrimos dentro de SI para que el
              arte también sea parte de la conversación.
            </p>
          </div>
        </div>
      </section>

      {/* 7. EQUIPO */}
      <section className="nosotros-px" style={{ paddingBottom: 96 }}>
        <Eyebrow>El equipo</Eyebrow>
        <SectionTitle>Las personas detrás de cada historia.</SectionTitle>

        <div style={{ marginTop: 64, marginBottom: 64 }}>
          <SubHeader>Dirección</SubHeader>
          <div className="nosotros-grid-equipo-3" style={{ display: 'grid', gap: 32 }}>
            {DIRECCION.map(p => (
              <div key={p.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar nombre={p.n} big />
                <div
                  style={{
                    fontFamily: RALEWAY,
                    fontWeight: 500,
                    fontSize: 16,
                    color: INK,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    textAlign: 'center',
                  }}
                >
                  {p.n}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: POPPINS,
                    fontWeight: 400,
                    fontSize: 11,
                    color: MUTED,
                    textAlign: 'center',
                    ...tabular,
                  }}
                >
                  {p.c}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 64 }}>
          <SubHeader>Asesores comerciales</SubHeader>
          <div className="nosotros-grid-equipo-4" style={{ display: 'grid', gap: 32 }}>
            {ASESORES.map(n => (
              <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar nombre={n} />
                <div
                  style={{
                    fontFamily: RALEWAY,
                    fontWeight: 500,
                    fontSize: 14,
                    color: INK,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    textAlign: 'center',
                  }}
                >
                  {n}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 64 }}>
          <SubHeader>Administración</SubHeader>
          <div className="nosotros-grid-equipo-4" style={{ display: 'grid', gap: 32 }}>
            {ADMIN.map(n => (
              <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar nombre={n} />
                <div
                  style={{
                    fontFamily: RALEWAY,
                    fontWeight: 500,
                    fontSize: 14,
                    color: INK,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    textAlign: 'center',
                  }}
                >
                  {n}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SubHeader>Marketing</SubHeader>
          <div className="nosotros-grid-equipo-4" style={{ display: 'grid', gap: 32 }}>
            {MARKETING.map(p => (
              <div key={p.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar nombre={p.n} />
                <div
                  style={{
                    fontFamily: RALEWAY,
                    fontWeight: 500,
                    fontSize: 14,
                    color: INK,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    textAlign: 'center',
                  }}
                >
                  {p.n}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: POPPINS,
                    fontWeight: 400,
                    fontSize: 11,
                    color: MUTED,
                    textAlign: 'center',
                  }}
                >
                  {p.c}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Foto inauguración */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', marginTop: 24 }}>
          <Image
            src="/nosotros/DSC09609.JPG"
            alt="Inauguración casa Funes — Noviembre 2024"
            fill
            style={{ objectFit: 'cover' }}
            loading="lazy"
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)',
            }}
          />
          <div style={{ position: 'absolute', left: 32, bottom: 32, right: 32 }}>
            <div
              style={{
                fontFamily: RALEWAY,
                fontWeight: 300,
                fontSize: 28,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                color: '#fff',
              }}
            >
              Inauguración de la casa de Funes.
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: POPPINS,
                fontWeight: 500,
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'rgba(255,255,255,0.7)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              Noviembre 2024
            </div>
          </div>
        </div>
      </section>

      {/* 9. SEDES */}
      <section className="nosotros-px" style={{ paddingBottom: 120 }}>
        <Eyebrow>Sedes</Eyebrow>
        <SectionTitle>Tres puertas abiertas.</SectionTitle>
        <div
          style={{
            marginTop: 56,
            marginBottom: 40,
            width: '100%',
            aspectRatio: '21 / 9',
            border: '1px solid #e0e0dc',
            background: '#f0f0ec',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <OfficesMap />
        </div>
        <div className="nosotros-sedes-grid" style={{ display: 'grid', gap: 40 }}>
          {SEDES.map(s => (
            <div key={s.nombre} style={{ borderTop: `1px solid ${INK}`, paddingTop: 22 }}>
              <div
                style={{
                  fontFamily: POPPINS,
                  fontWeight: 500,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.22em',
                  color: MUTED,
                  marginBottom: 12,
                }}
              >
                {s.nombre}
              </div>
              <div
                style={{
                  fontFamily: POPPINS,
                  fontWeight: 400,
                  fontSize: 16,
                  color: INK,
                  lineHeight: 1.5,
                  marginBottom: 8,
                  ...tabular,
                }}
              >
                {s.direccion}
              </div>
              <div
                style={{
                  fontFamily: POPPINS,
                  fontWeight: 400,
                  fontSize: 13,
                  color: MUTED,
                  lineHeight: 1.5,
                  ...tabular,
                }}
              >
                {s.h1}
                <br />
                {s.h2}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. CTA */}
      <section className="nosotros-px" style={{ paddingBottom: 144 }}>
        <div style={{ borderTop: `1px solid ${INK}`, paddingTop: 56 }}>
          <SectionTitle>¿Querés conocernos en persona?</SectionTitle>
          <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: GREEN,
                color: '#fff',
                padding: '14px 28px',
                borderRadius: 999,
                fontFamily: POPPINS,
                fontWeight: 500,
                fontSize: 14,
                letterSpacing: '0.01em',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Agendar visita
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'transparent',
                color: GREEN,
                border: `1px solid ${GREEN}`,
                padding: '14px 28px',
                borderRadius: 999,
                fontFamily: POPPINS,
                fontWeight: 500,
                fontSize: 14,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
