// Card de contacto del COLEGA externo. Único punto de contacto en toda la
// página. Estricto: nombre + WhatsApp + email opcional. NADA más:
// sin "asesor inmobiliario", sin agencia, sin matrícula, sin avatar default
// con iniciales SI.

interface Props {
  colega: {
    nombre: string
    whatsapp: string
    email: string | null
  }
}

export default function ContactCard({ colega }: Props) {
  const waText = encodeURIComponent('Hola, vi la propiedad que me compartiste')
  const waHref = `https://wa.me/${colega.whatsapp}?text=${waText}`

  return (
    <div
      style={{
        background: '#F8F8F8',
        padding: 24,
        borderRadius: 14,
        border: '1px solid #EAEAEA',
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: '#6B6B6B',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
        }}
      >
        Contacto
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: '#1A1A1A',
          marginBottom: 18,
          letterSpacing: '-0.01em',
        }}
      >
        {colega.nombre}
      </div>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          background: '#25D366',
          color: '#fff',
          padding: '14px 20px',
          borderRadius: 999,
          fontSize: 15,
          fontWeight: 600,
          textDecoration: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* WhatsApp glyph (inline svg, sin libs) */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.371-.025-.52-.074-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
        </svg>
        WhatsApp
      </a>

      {colega.email && (
        <a
          href={`mailto:${colega.email}`}
          style={{
            display: 'block',
            marginTop: 12,
            fontSize: 14,
            color: '#6B6B6B',
            textAlign: 'center',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          {colega.email}
        </a>
      )}
    </div>
  )
}
