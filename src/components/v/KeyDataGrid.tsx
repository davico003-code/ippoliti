// Grid de datos clave (NO superficies — esas viven en Surfaces.tsx).
// 2 columnas mobile / 4 columnas desktop. Solo renderiza datos no vacíos.
// Para terrenos: oculta dormitorios/baños/cocheras (no aplican).

import {
  Bath,
  Bed,
  Calendar,
  CheckCheck,
  Compass,
  Home,
  Car,
  type LucideIcon,
} from 'lucide-react'
import type { FichaSnapshot } from '@/lib/ficha'

interface DataItem {
  Icon: LucideIcon
  label: string
  value: string
}

export default function KeyDataGrid({ snapshot }: { snapshot: FichaSnapshot }) {
  const s = snapshot
  const isLand = (s.tipo || '').toLowerCase().includes('terreno')

  const items: DataItem[] = []

  if (!isLand) {
    if (s.ambientes) items.push({ Icon: Home, label: 'Ambientes', value: String(s.ambientes) })
    if (s.dormitorios) items.push({ Icon: Bed, label: 'Dormitorios', value: String(s.dormitorios) })
    if (s.banos) items.push({ Icon: Bath, label: 'Baños', value: String(s.banos) })
    if (s.cocheras) items.push({ Icon: Car, label: 'Cocheras', value: String(s.cocheras) })
  }
  if (typeof s.antiguedad === 'number') {
    items.push({
      Icon: Calendar,
      label: 'Antigüedad',
      value: s.antiguedad === 0 ? 'A estrenar' : `${s.antiguedad} años`,
    })
  }
  if (s.orientacion) items.push({ Icon: Compass, label: 'Orientación', value: s.orientacion })
  if (s.estado) items.push({ Icon: CheckCheck, label: 'Estado', value: s.estado })

  if (items.length === 0) return null

  return (
    <section className="key-data-section" style={{ marginTop: 36 }}>
      <div
        className="key-data-grid"
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
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <it.Icon size={18} color="#4A4A4A" strokeWidth={1.6} />
            <div
              style={{
                fontSize: 11,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginTop: 2,
              }}
            >
              {it.label}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: '#1A1A1A',
                lineHeight: 1.2,
              }}
            >
              {it.value}
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          .key-data-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      ` }} />
    </section>
  )
}
