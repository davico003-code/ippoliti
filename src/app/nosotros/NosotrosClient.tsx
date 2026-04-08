'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"
const GREEN = '#1A5C38'

const STATS = [
  { num: '43', label: 'Años' },
  { num: '+1.500', label: 'Propiedades vendidas' },
  { num: '3', label: 'Sedes' },
  { num: '20K+', label: 'Comunidad IG' },
]

const FAMILIA = [
  { n: 'Susana Ippoliti', c: 'Fundadora · 1983' },
  { n: 'Laura Flores', c: 'Co-dirección' },
  { n: 'David Flores', c: 'Director · Mat. 0621' },
]

const CAPITULOS = [
  {
    n: '01',
    year: '1983',
    title: 'Susana funda SI en Roldán.',
    body:
      'Susana Ippoliti abre las puertas en 1ro de Mayo 258 con una idea simple: tratar a cada cliente como a un vecino.',
  },
  {
    n: '02',
    year: '2010s',
    title: 'Llega la segunda generación.',
    body:
      'Laura y David se suman al proyecto familiar. El oficio se mantiene, pero la forma de ejercerlo cambia.',
  },
  {
    n: '03',
    year: 'Hoy',
    title: 'Una nueva casa en Funes.',
    body:
      'Tres sedes, un equipo consolidado y una nueva casa pensada como un estudio con galería de arte.',
  },
]

const ESPACIO_FOTOS = [
  { src: '/nosotros/IMG_4036.jpg', alt: 'Salón principal' },
  { src: '/nosotros/IMG_8457.jpg', alt: 'Lobby' },
  { src: '/nosotros/IMG_2545_2.JPG', alt: 'Living' },
  { src: '/nosotros/IMG_0432.JPG', alt: 'Sala de reuniones' },
  { src: '/nosotros/oficina_funes_3.JPG', alt: 'Sala directorio' },
  { src: '/nosotros/DSC09309.jpg', alt: 'Galería PARED' },
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
  { nombre: 'Funes', dir: 'Hipólito Yrigoyen 2643', h: 'Lun a Vie · 9 a 18 hs · Sáb · 9 a 13 hs' },
  { nombre: 'Roldán centro', dir: '1ro de Mayo 258', h: 'Lun a Vie · 9 a 18 hs · Sáb · 9 a 13 hs' },
  { nombre: 'Roldán este', dir: 'Catamarca 775', h: 'Lun a Vie · 9 a 18 hs · Sáb · 9 a 13 hs' },
]

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase()
}

function Avatar({ nombre, size = 56 }: { nombre: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(26,92,56,0.15)',
        border: `1px solid ${GREEN}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: GREEN,
        fontFamily: POPPINS,
        fontWeight: 500,
        fontSize: size >= 80 ? 24 : 16,
        letterSpacing: '-0.02em',
      }}
    >
      {iniciales(nombre)}
    </div>
  )
}

export default function NosotrosClient() {
  const waMsg = encodeURIComponent('Hola, vi el sitio de SI Inmobiliaria y quería consultarles...')
  const waHref = `https://wa.me/5493412101694?text=${waMsg}`
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rootRef.current) return
    const els = rootRef.current.querySelectorAll<HTMLElement>('[data-reveal]')
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <main ref={rootRef} className="nosotros-dark">
      <style jsx global>{`
        .nosotros-dark {
          background: #0a0a0a;
          color: #fff;
          font-family: ${POPPINS};
        }
        .nosotros-dark [data-reveal] {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nosotros-dark [data-reveal].is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .nd-title {
          font-family: ${RALEWAY};
          font-weight: 200;
          letter-spacing: -0.035em;
          line-height: 1.05;
          color: #fff;
          margin: 0;
        }
        .nd-eyebrow {
          font-family: ${POPPINS};
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${GREEN};
        }
        .nd-section {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .nd-px {
          padding-left: 64px;
          padding-right: 64px;
        }
        .nd-photo-hover {
          overflow: hidden;
          border-radius: 12px;
          position: relative;
        }
        .nd-photo-hover img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .nd-photo-hover:hover img {
          transform: scale(1.02);
        }
        @media (max-width: 1024px) {
          .nd-px { padding-left: 40px !important; padding-right: 40px !important; }
        }
        @media (max-width: 720px) {
          .nd-px { padding-left: 24px !important; padding-right: 24px !important; }
          .nd-hero-title { font-size: 40px !important; }
          .nd-section-title { font-size: 32px !important; }
          .nd-stats { flex-wrap: wrap; gap: 32px !important; }
          .nd-stats-divider { display: none !important; }
          .nd-historia-grid { grid-template-columns: 1fr !important; }
          .nd-pared-grid { grid-template-columns: 1fr !important; }
          .nd-espacio-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .nd-direccion-grid { grid-template-columns: 1fr !important; }
          .nd-asesores-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .nd-sedes-grid { grid-template-columns: 1fr !important; }
          .nd-familia-meta { flex-direction: column !important; gap: 12px !important; align-items: flex-start !important; }
          .nd-familia-meta .nd-divider-v { display: none !important; }
        }
      `}</style>

      {/* 1. HERO */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Image
          src="/nosotros/IMG_4053.JPG"
          alt="Fachada SI Inmobiliaria"
          fill
          priority
          style={{ objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
        <div
          className="nd-px"
          data-reveal
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            maxWidth: 1100,
            padding: '120px 64px',
          }}
        >
          <div className="nd-eyebrow" style={{ marginBottom: 28 }}>
            SI INMOBILIARIA · DESDE 1983
          </div>
          <h1
            className="nd-title nd-hero-title"
            style={{ fontSize: 'clamp(40px, 6vw, 84px)', maxWidth: 980, margin: '0 auto 28px' }}
          >
            Una inmobiliaria que se piensa como un estudio.
          </h1>
          <p
            style={{
              fontFamily: POPPINS,
              fontSize: 17,
              fontWeight: 300,
              color: '#888',
              lineHeight: 1.6,
              maxWidth: 620,
              margin: '0 auto 64px',
            }}
          >
            Cuatro décadas acompañando familias en Funes, Roldán y Rosario.
          </p>
          <div
            className="nd-stats"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 56,
            }}
          >
            {STATS.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
                {i > 0 && (
                  <div
                    className="nd-stats-divider"
                    style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.15)' }}
                  />
                )}
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: POPPINS,
                      fontWeight: 300,
                      fontSize: 42,
                      color: '#fff',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {s.num}
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      fontFamily: POPPINS,
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#888',
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. LA FAMILIA */}
      <section className="nd-section" style={{ position: 'relative' }}>
        <div style={{ position: 'relative', width: '100%', height: '70vh', minHeight: 520 }}>
          <Image
            src="/nosotros/LAURASUSANADAVID.jpeg"
            alt="Susana, Laura y David"
            fill
            style={{ objectFit: 'cover', objectPosition: 'top' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.9) 100%)',
            }}
          />
          <div
            className="nd-px"
            data-reveal
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 56,
              padding: '0 64px',
            }}
          >
            <div className="nd-eyebrow" style={{ marginBottom: 18 }}>
              LA FAMILIA
            </div>
            <h2 className="nd-title nd-section-title" style={{ fontSize: 48, marginBottom: 28, maxWidth: 720 }}>
              Tres generaciones, un mismo oficio.
            </h2>
            <div
              className="nd-familia-meta"
              style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}
            >
              {FAMILIA.map((m, i) => (
                <div key={m.n} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  {i > 0 && (
                    <div
                      className="nd-divider-v"
                      style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.25)' }}
                    />
                  )}
                  <div
                    style={{
                      fontFamily: POPPINS,
                      fontSize: 13,
                      fontWeight: 400,
                      color: 'rgba(255,255,255,0.85)',
                    }}
                  >
                    <span style={{ fontWeight: 500, color: '#fff' }}>{m.n}</span>
                    <span style={{ color: '#888' }}> — {m.c}</span>
                  </div>
                </div>
              ))}
            </div>
            <p
              style={{
                marginTop: 32,
                fontFamily: RALEWAY,
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: 19,
                color: '#fff',
                letterSpacing: '-0.01em',
              }}
            >
              “Más que una empresa, una continuidad de vocación.”
            </p>
          </div>
        </div>
      </section>

      {/* 3. HISTORIA */}
      <section
        className="nd-section nd-px"
        style={{ background: '#0f0f0f', padding: '140px 64px' }}
      >
        <h2
          className="nd-title nd-section-title"
          data-reveal
          style={{ fontSize: 48, textAlign: 'center', marginBottom: 96 }}
        >
          Cuarenta y tres años en tres capítulos.
        </h2>
        <div
          className="nd-historia-grid"
          data-reveal
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 56,
            maxWidth: 1280,
            margin: '0 auto',
          }}
        >
          {CAPITULOS.map(c => (
            <div key={c.n} style={{ position: 'relative', paddingTop: 80 }}>
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 0,
                  left: -10,
                  fontFamily: RALEWAY,
                  fontWeight: 200,
                  fontSize: 140,
                  lineHeight: 1,
                  color: GREEN,
                  opacity: 0.3,
                  letterSpacing: '-0.04em',
                }}
              >
                {c.n}
              </div>
              <div
                style={{
                  position: 'relative',
                  fontFamily: POPPINS,
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: GREEN,
                  marginBottom: 14,
                }}
              >
                {c.year}
              </div>
              <h3
                style={{
                  position: 'relative',
                  fontFamily: RALEWAY,
                  fontWeight: 300,
                  fontSize: 24,
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                  color: '#fff',
                  margin: '0 0 16px',
                }}
              >
                {c.title}
              </h3>
              <p
                style={{
                  position: 'relative',
                  fontFamily: POPPINS,
                  fontSize: 14,
                  fontWeight: 300,
                  lineHeight: 1.7,
                  color: '#888',
                  margin: 0,
                }}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. EL ESPACIO */}
      <section className="nd-section nd-px" style={{ padding: '140px 64px' }}>
        <h2
          className="nd-title nd-section-title"
          data-reveal
          style={{ fontSize: 48, textAlign: 'center', marginBottom: 80, maxWidth: 760, margin: '0 auto 80px' }}
        >
          Una casa diseñada para acompañar decisiones importantes.
        </h2>
        <div
          className="nd-espacio-grid"
          data-reveal
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          {ESPACIO_FOTOS.map(f => (
            <div
              key={f.src}
              className="nd-photo-hover"
              style={{ position: 'relative', aspectRatio: '4 / 5', background: '#111' }}
            >
              <Image src={f.src} alt={f.alt} fill style={{ objectFit: 'cover' }} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* 5. PARED */}
      <section
        className="nd-section nd-px"
        style={{ background: '#0f0f0f', padding: '140px 64px' }}
      >
        <div
          className="nd-pared-grid"
          data-reveal
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 80,
            alignItems: 'center',
            maxWidth: 1280,
            margin: '0 auto',
          }}
        >
          <div className="nd-photo-hover" style={{ position: 'relative', aspectRatio: '4 / 5', background: '#111' }}>
            <Image
              src="/nosotros/DSC09309.jpg"
              alt="Galería PARED"
              fill
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
          <div>
            <div className="nd-eyebrow" style={{ marginBottom: 20 }}>
              PARED
            </div>
            <h2 className="nd-title" style={{ fontSize: 36, marginBottom: 28 }}>
              Una galería de arte dentro de nuestra casa.
            </h2>
            <p
              style={{
                fontFamily: POPPINS,
                fontSize: 16,
                fontWeight: 300,
                lineHeight: 1.75,
                color: '#888',
                margin: 0,
                maxWidth: 480,
              }}
            >
              Porque vender una propiedad es ayudar a crear un hogar, y los hogares se construyen con
              historia, con cultura, con arte.
            </p>
          </div>
        </div>
      </section>

      {/* 6. INAUGURACIÓN */}
      <section className="nd-section" style={{ position: 'relative' }}>
        <div style={{ position: 'relative', width: '100%', height: '60vh', minHeight: 460 }}>
          <Image
            src="/nosotros/DSC09609.JPG"
            alt="Inauguración casa Funes"
            fill
            style={{ objectFit: 'cover' }}
            loading="lazy"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
          <div
            data-reveal
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 24px',
            }}
          >
            <p
              className="nd-title"
              style={{
                fontSize: 'clamp(22px, 3vw, 36px)',
                textAlign: 'center',
                fontWeight: 300,
                letterSpacing: '-0.02em',
              }}
            >
              Inauguración de la casa de Funes · Noviembre 2024
            </p>
          </div>
        </div>
      </section>

      {/* 7. EQUIPO */}
      <section
        className="nd-section nd-px"
        style={{ background: '#0a0a0a', padding: '140px 64px' }}
      >
        <h2
          className="nd-title nd-section-title"
          data-reveal
          style={{ fontSize: 48, textAlign: 'center', marginBottom: 96 }}
        >
          Las personas detrás de cada historia.
        </h2>

        {/* Dirección */}
        <div data-reveal style={{ maxWidth: 1100, margin: '0 auto 96px' }}>
          <div
            style={{
              fontFamily: POPPINS,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#888',
              textAlign: 'center',
              marginBottom: 48,
            }}
          >
            Dirección
          </div>
          <div
            className="nd-direccion-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}
          >
            {DIRECCION.map(p => (
              <div
                key={p.n}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '40px 24px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16,
                }}
              >
                <Avatar nombre={p.n} size={80} />
                <div
                  style={{
                    marginTop: 20,
                    fontFamily: RALEWAY,
                    fontWeight: 400,
                    fontSize: 18,
                    color: '#fff',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {p.n}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: POPPINS,
                    fontSize: 12,
                    color: '#888',
                  }}
                >
                  {p.c}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asesores */}
        <div data-reveal style={{ maxWidth: 1100, margin: '0 auto 80px' }}>
          <div
            style={{
              fontFamily: POPPINS,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#888',
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            Asesores comerciales
          </div>
          <div
            className="nd-asesores-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}
          >
            {ASESORES.map(n => (
              <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar nombre={n} size={56} />
                <div
                  style={{
                    marginTop: 14,
                    fontFamily: POPPINS,
                    fontSize: 13,
                    color: '#fff',
                    textAlign: 'center',
                  }}
                >
                  {n}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Administración */}
        <div data-reveal style={{ maxWidth: 1100, margin: '0 auto 80px' }}>
          <div
            style={{
              fontFamily: POPPINS,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#888',
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            Administración
          </div>
          <div
            className="nd-asesores-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}
          >
            {ADMIN.map(n => (
              <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar nombre={n} size={56} />
                <div
                  style={{
                    marginTop: 14,
                    fontFamily: POPPINS,
                    fontSize: 13,
                    color: '#fff',
                    textAlign: 'center',
                  }}
                >
                  {n}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing */}
        <div data-reveal style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div
            style={{
              fontFamily: POPPINS,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#888',
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            Marketing
          </div>
          <div
            className="nd-asesores-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}
          >
            {MARKETING.map(p => (
              <div key={p.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar nombre={p.n} size={56} />
                <div
                  style={{
                    marginTop: 14,
                    fontFamily: POPPINS,
                    fontSize: 13,
                    color: '#fff',
                    textAlign: 'center',
                  }}
                >
                  {p.n}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: POPPINS,
                    fontSize: 11,
                    color: '#888',
                    textAlign: 'center',
                  }}
                >
                  {p.c}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. SEDES */}
      <section
        className="nd-section nd-px"
        style={{ background: '#111', padding: '140px 64px' }}
      >
        <h2
          className="nd-title nd-section-title"
          data-reveal
          style={{ fontSize: 48, textAlign: 'center', marginBottom: 80 }}
        >
          Tres puertas abiertas.
        </h2>
        <div
          className="nd-sedes-grid"
          data-reveal
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 32,
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          {SEDES.map(s => (
            <div
              key={s.nombre}
              style={{
                padding: '40px 32px',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${GREEN}33`,
                borderRadius: 16,
                transition: 'border-color 0.3s ease, transform 0.3s ease',
              }}
            >
              <div
                style={{
                  fontFamily: POPPINS,
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: GREEN,
                  marginBottom: 18,
                }}
              >
                {s.nombre}
              </div>
              <div
                style={{
                  fontFamily: RALEWAY,
                  fontWeight: 300,
                  fontSize: 22,
                  color: '#fff',
                  letterSpacing: '-0.01em',
                  marginBottom: 14,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {s.dir}
              </div>
              <div
                style={{
                  fontFamily: POPPINS,
                  fontSize: 13,
                  fontWeight: 300,
                  color: '#888',
                  lineHeight: 1.6,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {s.h}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. CTA FINAL */}
      <section
        className="nd-section nd-px"
        style={{ background: '#0a0a0a', padding: '160px 64px' }}
      >
        <div data-reveal style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2
            className="nd-title nd-section-title"
            style={{ fontSize: 'clamp(36px, 5vw, 64px)', marginBottom: 56 }}
          >
            ¿Querés conocernos en persona?
          </h2>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: GREEN,
                color: '#fff',
                padding: '16px 36px',
                borderRadius: 999,
                fontFamily: POPPINS,
                fontWeight: 500,
                fontSize: 14,
                letterSpacing: '0.02em',
                textDecoration: 'none',
                transition: 'background 0.3s ease, transform 0.3s ease',
              }}
            >
              Agendar visita
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '16px 36px',
                borderRadius: 999,
                fontFamily: POPPINS,
                fontWeight: 500,
                fontSize: 14,
                letterSpacing: '0.02em',
                textDecoration: 'none',
                transition: 'border-color 0.3s ease, background 0.3s ease',
              }}
            >
              Escribinos
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
