// Sección 4: descripción.
// Si la descripción de Tokko viene con headings tipo "Tipología:", "Distribución:",
// "Terminaciones:", etc., los detecta y los renderiza como subsecciones con H3.
// Caso default (mayoría de propiedades): un bloque continuo dividido en
// párrafos por dobles saltos de línea o saltos simples si no hay dobles.

const HEADING_KEYWORDS = [
  'tipología',
  'tipologia',
  'ubicación',
  'ubicacion',
  'distribución',
  'distribucion',
  'terminaciones',
  'entrega',
  'etapa del inmueble',
  'etapa',
  'servicios',
  'antigüedad',
  'antiguedad',
  'amenities',
  'amenidades',
  'características',
  'caracteristicas',
]

interface Block {
  heading: string | null
  body: string
}

function parseBlocks(text: string): Block[] {
  const lines = text.split(/\r?\n/)
  const blocks: Block[] = []
  let current: Block = { heading: null, body: '' }

  const isHeading = (line: string) => {
    const m = line.match(/^\s*([A-Za-zÁÉÍÓÚáéíóúñÑ\s]+):\s*$/)
    if (!m) return null
    const word = m[1].trim().toLowerCase()
    return HEADING_KEYWORDS.includes(word) ? m[1].trim() : null
  }

  for (const raw of lines) {
    const heading = isHeading(raw)
    if (heading) {
      if (current.body.trim() || current.heading) {
        blocks.push({ ...current, body: current.body.trim() })
      }
      current = { heading, body: '' }
    } else {
      current.body += raw + '\n'
    }
  }
  if (current.body.trim() || current.heading) {
    blocks.push({ ...current, body: current.body.trim() })
  }

  return blocks
}

export default function StructuredDescription({ text }: { text: string }) {
  if (!text || !text.trim()) return null

  const blocks = parseBlocks(text)
  const hasStructure = blocks.some(b => b.heading)

  return (
    <section style={{ marginTop: 36 }}>
      <h2
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#1A1A1A',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 16,
        }}
      >
        Descripción
      </h2>

      {hasStructure ? (
        blocks.map((b, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            {b.heading && (
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: '#1A1A1A',
                  margin: '0 0 8px',
                  letterSpacing: '-0.005em',
                }}
              >
                {b.heading}
              </h3>
            )}
            <Paragraphs text={b.body} />
          </div>
        ))
      ) : (
        <Paragraphs text={text} />
      )}
    </section>
  )
}

function Paragraphs({ text }: { text: string }) {
  // Preferimos split por dobles saltos. Si no hay dobles, usamos saltos
  // simples (descripciones tipo lista).
  const hasDoubles = /\n\s*\n/.test(text)
  const paras = hasDoubles
    ? text.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean)
    : text.split(/\n+/).map(p => p.trim()).filter(Boolean)

  if (paras.length === 0) return null

  return (
    <div className="desc-body" style={{ color: '#4A4A4A' }}>
      {paras.map((p, i) => (
        <p
          key={i}
          style={{
            fontSize: 17,
            lineHeight: 1.7,
            margin: i === 0 ? 0 : '12px 0 0',
            whiteSpace: 'pre-wrap',
          }}
        >
          {p}
        </p>
      ))}
      <style>{`
        @media (min-width: 768px) {
          .desc-body p { font-size: 18px !important; }
        }
      `}</style>
    </div>
  )
}
