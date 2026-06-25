// Sección 2: precio prominente + badge operación + tipología + zona.
// Server component (sin estado).

import type { FichaSnapshot } from '@/lib/ficha'

export default function PriceHero({ snapshot }: { snapshot: FichaSnapshot }) {
  const s = snapshot

  // Tipología combinada: "Casa · 4 ambientes" o "Departamento · 2 ambientes · 3er piso"
  const tipologiaParts: string[] = []
  if (s.tipo) tipologiaParts.push(s.tipo)
  if (s.ambientes) tipologiaParts.push(`${s.ambientes} ambientes`)
  if (s.piso) tipologiaParts.push(`${s.piso}${/^\d+$/.test(s.piso) ? '°' : ''} piso`)
  const tipologia = tipologiaParts.join(' · ')

  // Para alquileres: mostrar expensas debajo si existen
  const showExpensas = s.expensas && s.expensas > 0
  const expensasFmt = showExpensas
    ? `Expensas $${s.expensas!.toLocaleString('es-AR')}`
    : ''

  return (
    <section style={{ marginTop: 28 }}>
      {/* Precio gigante */}
      <div
        className="price-hero-amount"
        style={{
          fontSize: 36,
          fontWeight: 600,
          color: '#1A1A1A',
          letterSpacing: '-0.02em',
          lineHeight: 1.05,
        }}
      >
        {s.precio}
      </div>

      {/* Expensas (si aplica) */}
      {expensasFmt && (
        <div style={{ marginTop: 6, fontSize: 14, color: '#4A4A4A' }}>
          {expensasFmt}
        </div>
      )}

      {/* Badge operación */}
      {s.operacion && (
        <div
          style={{
            display: 'inline-block',
            marginTop: 12,
            padding: '4px 12px',
            background: '#DBEAFE',
            color: '#1E40AF',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            borderRadius: 6,
          }}
        >
          {s.operacion}
        </div>
      )}

      {/* Tipología */}
      {tipologia && (
        <div
          style={{
            marginTop: 14,
            fontSize: 17,
            fontWeight: 500,
            color: '#1A1A1A',
            lineHeight: 1.4,
          }}
        >
          {tipologia}
        </div>
      )}

      {/* Zona */}
      {(s.zonaCompleta || s.zonaAprox) && (
        <div style={{ marginTop: 4, fontSize: 15, color: '#4A4A4A' }}>
          {s.zonaCompleta || s.zonaAprox}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          .price-hero-amount { font-size: 48px !important; }
        }
      ` }} />
    </section>
  )
}
