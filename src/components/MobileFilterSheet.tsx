'use client'

import { X } from 'lucide-react'

const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"

interface Filters {
  type: string
  beds: string
  maxPrice: string
  location: string
}

interface Props {
  open: boolean
  onClose: () => void
  filters: Filters
  onChangeFilter: (key: string, value: string) => void
  onReset: () => void
  resultCount: number
}

const TYPE_OPTIONS = [
  { value: 'todos', label: 'Todas' },
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Depto' },
  { value: 'terreno', label: 'Lote' },
  { value: 'local', label: 'Local' },
]

const BEDS_OPTIONS = [
  { value: 'todos', label: 'Cualquiera' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4+', label: '4+' },
]

const PRICE_OPTIONS = [
  { value: 'sin-limite', label: 'Sin límite' },
  { value: '50000', label: 'USD 50k' },
  { value: '100000', label: 'USD 100k' },
  { value: '200000', label: 'USD 200k' },
  { value: '500000', label: 'USD 500k' },
]

const LOCATION_OPTIONS = [
  { value: 'todos', label: 'Todas' },
  { value: 'funes', label: 'Funes' },
  { value: 'roldan', label: 'Roldán' },
  { value: 'rosario', label: 'Rosario' },
]

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: active ? '1.5px solid #1A5C38' : '1.5px solid #e5e7eb',
        background: active ? 'rgba(26,92,56,0.08)' : '#fff',
        color: active ? '#1A5C38' : '#0a0a0a',
        fontFamily: R,
        fontWeight: active ? 600 : 500,
        fontSize: 14,
        padding: '10px 16px',
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'all 150ms',
      }}
    >
      {label}
    </button>
  )
}

export default function MobileFilterSheet({ open, onClose, filters, onChangeFilter, onReset, resultCount }: Props) {
  if (!open) return null

  const hasActive = filters.type !== 'todos' || filters.beds !== 'todos' || filters.maxPrice !== 'sin-limite' || filters.location !== 'todos'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[10000] bg-black/50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[10001] bg-white flex flex-col"
        style={{
          borderRadius: '24px 24px 0 0',
          maxHeight: '85vh',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
          animation: 'slideUp 250ms ease-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div />
          <span style={{ fontFamily: R, fontWeight: 700, fontSize: 20, color: '#0a0a0a' }}>Filtros</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Tipo */}
          <div>
            <p style={{ fontFamily: R, fontWeight: 600, fontSize: 15, color: '#0a0a0a', marginBottom: 12 }}>Tipo de propiedad</p>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map(o => (
                <Chip key={o.value} label={o.label} active={filters.type === o.value} onClick={() => onChangeFilter('type', o.value)} />
              ))}
            </div>
          </div>

          {/* Dormitorios */}
          <div>
            <p style={{ fontFamily: R, fontWeight: 600, fontSize: 15, color: '#0a0a0a', marginBottom: 12 }}>Dormitorios</p>
            <div className="flex flex-wrap gap-2">
              {BEDS_OPTIONS.map(o => (
                <Chip key={o.value} label={o.label} active={filters.beds === o.value} onClick={() => onChangeFilter('beds', o.value)} />
              ))}
            </div>
          </div>

          {/* Precio */}
          <div>
            <p style={{ fontFamily: R, fontWeight: 600, fontSize: 15, color: '#0a0a0a', marginBottom: 12 }}>Precio máximo (USD)</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_OPTIONS.map(o => (
                <Chip key={o.value} label={o.label} active={filters.maxPrice === o.value} onClick={() => onChangeFilter('maxPrice', o.value)} />
              ))}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <p style={{ fontFamily: R, fontWeight: 600, fontSize: 15, color: '#0a0a0a', marginBottom: 12 }}>Ubicación</p>
            <div className="flex flex-wrap gap-2">
              {LOCATION_OPTIONS.map(o => (
                <Chip key={o.value} label={o.label} active={filters.location === o.value} onClick={() => onChangeFilter('location', o.value)} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          {hasActive && (
            <button
              onClick={onReset}
              style={{ fontFamily: R, fontSize: 14, fontWeight: 500, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Limpiar todo
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1"
            style={{
              background: '#1A5C38',
              color: '#fff',
              fontFamily: R,
              fontSize: 16,
              fontWeight: 600,
              padding: '14px 24px',
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Ver <span style={{ fontFamily: P, fontVariantNumeric: 'tabular-nums' }}>{resultCount}</span> propiedad{resultCount !== 1 ? 'es' : ''}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
