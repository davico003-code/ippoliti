// Sección dedicada a superficies. Cards con valor grande + label.
// Solo renderiza superficies que tienen valor (skip null/0).
// Layout: 2 cols mobile / 4 cols desktop, igual que KeyDataGrid.

import type { FichaSnapshot } from '@/lib/ficha'

interface Item {
  label: string
  value: string
}

export default function Surfaces({ snapshot }: { snapshot: FichaSnapshot }) {
  const s = snapshot
  const items: Item[] = []

  if (s.m2cubiertos) items.push({ label: 'Cubierta', value: `${s.m2cubiertos} m²` })
  if (s.m2semicubiertos) items.push({ label: 'Semicubierta', value: `${s.m2semicubiertos} m²` })
  if (s.m2descubiertos) items.push({ label: 'Descubierta', value: `${s.m2descubiertos} m²` })
  if (s.m2totales) items.push({ label: 'Total construida', value: `${s.m2totales} m²` })
  if (s.m2terreno) items.push({ label: 'Terreno', value: `${s.m2terreno} m²` })
  if (s.frenteM) items.push({ label: 'Frente', value: `${s.frenteM} m` })
  if (s.fondoM) items.push({ label: 'Fondo', value: `${s.fondoM} m` })

  if (items.length === 0) return null

  return (
    <section className="surfaces-section" style={{ marginTop: 36 }}>
      <h2
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#1A1A1A',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 14,
        }}
      >
        Superficies
      </h2>
      <div
        className="surfaces-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
        }}
      >
        {items.map(it => (
          <div
            key={it.label}
            style={{
              background: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: 14,
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {it.label}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 22,
                fontWeight: 500,
                color: '#1A1A1A',
                lineHeight: 1.1,
              }}
            >
              {it.value}
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          .surfaces-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      ` }} />
    </section>
  )
}
