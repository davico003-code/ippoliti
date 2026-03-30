import { equipo } from '@/data/equipo'

export default function EquipoSection() {
  return (
    <section style={{
      backgroundColor: '#F9F9F7',
      padding: '96px 24px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{
            fontFamily: 'var(--font-poppins), Poppins, sans-serif',
            fontSize: '0.72rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            color: '#1A5C38',
            marginBottom: '16px',
            margin: '0 0 16px',
          }}>
            Nuestro equipo
          </p>
          <h2 style={{
            fontFamily: 'var(--font-raleway), Raleway, sans-serif',
            fontWeight: 200,
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            color: '#1a1a1a',
            margin: '0',
            letterSpacing: '-0.02em',
          }}>
            Las personas detrás de cada operación
          </h2>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '48px',
        }}>
          {equipo.map((persona, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center' as const,
              gap: '16px',
            }}>

              {/* Avatar */}
              <div style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                backgroundColor: '#e0ebe4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-raleway), Raleway, sans-serif',
                fontWeight: 600,
                fontSize: '2rem',
                color: '#1A5C38',
                flexShrink: 0,
              }}>
                {persona.nombre.charAt(0)}
              </div>

              {/* Info */}
              <div>
                <p style={{
                  fontFamily: 'var(--font-raleway), Raleway, sans-serif',
                  fontWeight: 400,
                  fontSize: '1.05rem',
                  color: '#1a1a1a',
                  margin: '0 0 4px',
                }}>
                  {persona.nombre}
                </p>
                <p style={{
                  fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                  fontSize: '0.68rem',
                  color: '#1A5C38',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.12em',
                  margin: '0 0 12px',
                }}>
                  {persona.rol}
                </p>
                <p style={{
                  fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                  fontSize: '0.82rem',
                  color: '#555',
                  lineHeight: 1.7,
                  margin: '0 0 20px',
                }}>
                  {persona.descripcion}
                </p>
                <a
                  href={`https://wa.me/${persona.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#1A5C38',
                    color: 'white',
                    fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                    fontSize: '0.72rem',
                    padding: '9px 22px',
                    borderRadius: '999px',
                    textDecoration: 'none',
                    letterSpacing: '0.05em',
                  }}
                >
                  Contactar
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
