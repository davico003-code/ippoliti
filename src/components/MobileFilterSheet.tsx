'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"

type Currency = 'USD' | 'ARS'

interface Filters {
  type: string
  beds: string
  priceMin: string
  priceMax: string
  currency: Currency
  location: string
}

interface Props {
  open: boolean
  onClose: () => void
  filters: Filters
  onChangeFilter: (key: 'type' | 'beds' | 'location', value: string) => void
  onPriceChange: (min: string, max: string, currency: Currency) => void
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


const LOCATION_OPTIONS = [
  { value: 'todos', label: 'Todas' },
  { value: 'funes', label: 'Funes' },
  { value: 'roldan', label: 'Roldán' },
  { value: 'rosario', label: 'Rosario' },
]

const digitsOnly = (s: string) => s.replace(/\D/g, '')
const formatThousands = (s: string) => {
  const d = digitsOnly(s)
  if (!d) return ''
  return new Intl.NumberFormat('es-AR').format(parseInt(d, 10))
}

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
        padding: '12px 18px',
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'all 150ms',
        minHeight: 44,
      }}
    >
      {label}
    </button>
  )
}

export default function MobileFilterSheet({ open, onClose, filters, onChangeFilter, onPriceChange, onReset, resultCount }: Props) {
  // Estado local del precio: el usuario tipea sin que cada keystroke dispare
  // un re-filtrado. Se commitea cuando hace blur o cierra el sheet.
  const [localMin, setLocalMin] = useState(filters.priceMin)
  const [localMax, setLocalMax] = useState(filters.priceMax)
  const [localCur, setLocalCur] = useState<Currency>(filters.currency)

  // Sync external → local cada vez que se abre o cambian props.
  useEffect(() => {
    setLocalMin(filters.priceMin)
    setLocalMax(filters.priceMax)
    setLocalCur(filters.currency)
  }, [filters.priceMin, filters.priceMax, filters.currency, open])

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY
      document.body.classList.add('scroll-locked')
      document.body.style.top = `-${scrollY}px`
      return () => {
        document.body.classList.remove('scroll-locked')
        document.body.style.top = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [open])

  if (!open) return null

  const minN = localMin ? parseInt(localMin, 10) : 0
  const maxN = localMax ? parseInt(localMax, 10) : Number.POSITIVE_INFINITY
  const priceInvalid = !!localMin && !!localMax && minN > maxN

  const commitPrice = () => {
    if (priceInvalid) return
    if (localMin === filters.priceMin && localMax === filters.priceMax && localCur === filters.currency) return
    onPriceChange(localMin, localMax, localCur)
  }

  const hasActive = filters.type !== 'todos'
    || filters.beds !== 'todos'
    || !!filters.priceMin
    || !!filters.priceMax
    || filters.location !== 'todos'

  const handleClose = () => {
    commitPrice()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[10000] bg-black/50"
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[10001] bg-white flex flex-col"
        style={{
          borderRadius: '24px 24px 0 0',
          maxHeight: '85dvh',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
          animation: 'slideUp 250ms ease-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div />
          <span style={{ fontFamily: R, fontWeight: 700, fontSize: 20, color: '#0a0a0a' }}>Filtros</span>
          <button
            onClick={handleClose}
            className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-500" />
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
            <p style={{ fontFamily: R, fontWeight: 600, fontSize: 15, color: '#0a0a0a', marginBottom: 12 }}>Rango de precio</p>
            {/* Currency segmented */}
            <div className="flex rounded-full bg-gray-100 p-0.5 mb-3">
              {(['USD', 'ARS'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setLocalCur(c)}
                  className="flex-1 py-2 rounded-full"
                  style={{
                    background: localCur === c ? '#1A5C38' : 'transparent',
                    color: localCur === c ? '#fff' : '#6b7280',
                    fontFamily: R,
                    fontSize: 13,
                    fontWeight: localCur === c ? 600 : 500,
                    border: 'none',
                    cursor: 'pointer',
                    minHeight: 40,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Mín"
                aria-label="Precio mínimo"
                value={formatThousands(localMin)}
                onChange={e => setLocalMin(digitsOnly(e.target.value))}
                onBlur={commitPrice}
                style={{
                  flex: 1,
                  height: 48,
                  padding: '0 14px',
                  borderRadius: 12,
                  border: priceInvalid ? '1.5px solid #dc2626' : '1.5px solid #e5e7eb',
                  fontFamily: R,
                  fontSize: 16,
                  outline: 'none',
                }}
              />
              <span className="text-gray-400">—</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Máx"
                aria-label="Precio máximo"
                value={formatThousands(localMax)}
                onChange={e => setLocalMax(digitsOnly(e.target.value))}
                onBlur={commitPrice}
                style={{
                  flex: 1,
                  height: 48,
                  padding: '0 14px',
                  borderRadius: 12,
                  border: priceInvalid ? '1.5px solid #dc2626' : '1.5px solid #e5e7eb',
                  fontFamily: R,
                  fontSize: 16,
                  outline: 'none',
                }}
              />
            </div>
            {priceInvalid && (
              <p style={{ fontFamily: R, fontSize: 12, color: '#dc2626', marginTop: 8 }}>
                El mínimo debe ser menor o igual al máximo.
              </p>
            )}
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
        <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
          {hasActive && (
            <button
              onClick={onReset}
              style={{ fontFamily: R, fontSize: 14, fontWeight: 500, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Limpiar todo
            </button>
          )}
          <button
            onClick={handleClose}
            disabled={priceInvalid}
            className="flex-1"
            style={{
              background: priceInvalid ? '#9ca3af' : '#1A5C38',
              color: '#fff',
              fontFamily: R,
              fontSize: 16,
              fontWeight: 600,
              padding: '14px 24px',
              borderRadius: 14,
              border: 'none',
              cursor: priceInvalid ? 'not-allowed' : 'pointer',
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
