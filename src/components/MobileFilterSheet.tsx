'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { X } from 'lucide-react'

const R = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"
const P = "var(--font-poppins, 'Poppins'), system-ui, sans-serif"

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
  /** Tipologías presentes en el inventario (las mismas del filtro desktop). */
  typeOptions?: { value: string; label: string }[]
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
  { value: 'mono', label: 'Mono' },
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

// La hoja baja en 180 ms al cerrar (antes se desmontaba de golpe en un frame):
// queda montada ese rato con la animación de salida y recién ahí se va.
const SALIDA_MS = 180
// Mientras se tipea el precio, el "Ver N propiedades" se recalcula a los
// 250 ms de la última tecla: antes quedaba viejo hasta el blur y la persona
// leía 180, tocaba y aparecían 12. El filtrado es en memoria: es barato.
const PRECIO_DEBOUNCE_MS = 250

const digitsOnly = (s: string) => s.replace(/\D/g, '')
const formatThousands = (s: string) => {
  const d = digitsOnly(s)
  if (!d) return ''
  return new Intl.NumberFormat('es-AR').format(parseInt(d, 10))
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      // Con lector de pantalla, "Casa, botón, seleccionado": antes no había
      // forma de saber cuál estaba elegido más que por el color.
      aria-pressed={active}
      style={{
        border: active ? '1.5px solid #1A5C38' : '1.5px solid var(--theme-border, #e5e7eb)',
        background: active ? 'var(--theme-tint, rgba(26,92,56,0.08))' : 'var(--theme-surface, #fff)',
        color: active ? 'var(--theme-accent, #1A5C38)' : 'var(--theme-ink, #0a0a0a)',
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

export default function MobileFilterSheet({ open, onClose, filters, onChangeFilter, onPriceChange, onReset, resultCount, typeOptions }: Props) {
  // Estado local del precio: el usuario tipea sin que cada keystroke dispare
  // un re-filtrado. Se commitea con una pausa corta al tipear (debounce), en
  // el blur o al cerrar el sheet.
  const [localMin, setLocalMin] = useState(filters.priceMin)
  const [localMax, setLocalMax] = useState(filters.priceMax)
  const [localCur, setLocalCur] = useState<Currency>(filters.currency)
  // Lo último que mandamos al padre. Cuando vuelve como prop es nuestro propio
  // eco: no se re-sincroniza, porque si la persona siguió tipeando en el medio
  // le pisaríamos la última tecla con el valor anterior.
  const ecoRef = useRef<string | null>(null)

  // Sync external → local cada vez que se abre o cambian props.
  useEffect(() => {
    const clave = `${filters.priceMin}|${filters.priceMax}|${filters.currency}`
    const eco = ecoRef.current
    ecoRef.current = null
    if (eco === clave) return
    setLocalMin(filters.priceMin)
    setLocalMax(filters.priceMax)
    setLocalCur(filters.currency)
  }, [filters.priceMin, filters.priceMax, filters.currency, open])

  // Presencia: `open` manda la entrada; al pasar a false la hoja sigue montada
  // SALIDA_MS con la animación de salida (y sin espera si se pidió menos
  // movimiento en el sistema).
  const [visible, setVisible] = useState(open)
  useEffect(() => {
    if (open) { setVisible(true); return }
    const reducir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const t = window.setTimeout(() => setVisible(false), reducir ? 0 : SALIDA_MS)
    return () => window.clearTimeout(t)
  }, [open])
  const montado = open || visible
  const cerrando = !open && visible

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

  const minN = localMin ? parseInt(localMin, 10) : 0
  const maxN = localMax ? parseInt(localMax, 10) : Number.POSITIVE_INFINITY
  const priceInvalid = !!localMin && !!localMax && minN > maxN

  const commitPrice = () => {
    if (priceInvalid) return
    if (localMin === filters.priceMin && localMax === filters.priceMax && localCur === filters.currency) return
    ecoRef.current = `${localMin}|${localMax}|${localCur}`
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

  // Los timers y el teclado leen siempre la última versión (con el precio
  // que se está tipeando ahora, no el del render en que se armaron).
  const commitRef = useRef(commitPrice)
  commitRef.current = commitPrice
  const cerrarRef = useRef(handleClose)
  cerrarRef.current = handleClose

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => commitRef.current(), PRECIO_DEBOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [localMin, localMax, localCur, open])

  // Diálogo de verdad: el foco entra a la hoja al abrir (VoiceOver anuncia
  // "Filtros, diálogo" en vez de quedarse en la página de atrás), Tab no se
  // escapa a la página tapada, Escape cierra (iPad con teclado, compu chica)
  // y al cerrar el foco vuelve al botón que la abrió.
  const hojaRef = useRef<HTMLDivElement>(null)
  const tituloId = useId()
  useEffect(() => {
    if (!open) return
    const previo = document.activeElement instanceof HTMLElement ? document.activeElement : null
    hojaRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      const hoja = hojaRef.current
      if (!hoja) return
      if (e.key === 'Escape') {
        e.preventDefault()
        cerrarRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const focos = Array.from(hoja.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'))
      if (focos.length === 0) return
      const primero = focos[0]
      const ultimo = focos[focos.length - 1]
      const activo = document.activeElement
      if (!hoja.contains(activo)) { e.preventDefault(); primero.focus() }
      else if (e.shiftKey && (activo === primero || activo === hoja)) { e.preventDefault(); ultimo.focus() }
      else if (!e.shiftKey && activo === ultimo) { e.preventDefault(); primero.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (previo && document.contains(previo)) previo.focus({ preventScroll: true })
    }
  }, [open])

  if (!montado) return null

  return (
    <>
      {/* Backdrop: entra y sale con fade (antes aparecía y desaparecía de golpe). */}
      <div
        className="fixed inset-0 z-[10000] bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
        style={{
          animation: cerrando
            ? `si-filtros-velo-out ${SALIDA_MS}ms ease-in forwards`
            : 'si-filtros-velo-in 200ms ease-out',
        }}
      />

      {/* Sheet: sube con la curva de las hojas de iOS (arranca rápido y frena
          suave) y baja más corta, en ease-in, como algo que se suelta. */}
      <div
        ref={hojaRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className="fixed bottom-0 left-0 right-0 z-[10001] bg-white flex flex-col outline-none"
        style={{
          borderRadius: '24px 24px 0 0',
          maxHeight: '85dvh',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
          animation: cerrando
            ? `si-filtros-out ${SALIDA_MS}ms cubic-bezier(0.4,0,1,1) forwards`
            : 'si-filtros-in 250ms cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Header (el hueco de la izquierda mide lo mismo que la X, así
            "Filtros" queda centrado de verdad). */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="w-11" aria-hidden="true" />
          <h2 id={tituloId} style={{ fontFamily: R, fontWeight: 700, fontSize: 20, color: 'var(--theme-ink, #0a0a0a)', margin: 0 }}>Filtros</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar filtros"
            className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-500" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Tipo */}
          <div>
            <p style={{ fontFamily: R, fontWeight: 600, fontSize: 15, color: 'var(--theme-ink, #0a0a0a)', marginBottom: 12 }}>Tipo de propiedad</p>
            <div className="flex flex-wrap gap-2">
              {(typeOptions ?? TYPE_OPTIONS).map(o => (o.value === 'todos' ? { ...o, label: 'Todas' } : o)).map(o => (
                <Chip key={o.value} label={o.label} active={filters.type === o.value} onClick={() => onChangeFilter('type', o.value)} />
              ))}
            </div>
          </div>

          {/* Dormitorios */}
          <div>
            <p style={{ fontFamily: R, fontWeight: 600, fontSize: 15, color: 'var(--theme-ink, #0a0a0a)', marginBottom: 12 }}>Dormitorios</p>
            <div className="flex flex-wrap gap-2">
              {BEDS_OPTIONS.map(o => (
                <Chip key={o.value} label={o.label} active={filters.beds === o.value} onClick={() => onChangeFilter('beds', o.value)} />
              ))}
            </div>
          </div>

          {/* Precio */}
          <div>
            <p style={{ fontFamily: R, fontWeight: 600, fontSize: 15, color: 'var(--theme-ink, #0a0a0a)', marginBottom: 12 }}>Rango de precio</p>
            {/* Currency segmented */}
            <div className="flex rounded-full bg-gray-100 p-0.5 mb-3">
              {(['USD', 'ARS'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setLocalCur(c)}
                  aria-pressed={localCur === c}
                  className="flex-1 py-2 rounded-full"
                  style={{
                    background: localCur === c ? '#1A5C38' : 'transparent',
                    color: localCur === c ? '#fff' : 'var(--theme-subtle, #6b7280)',
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
                  minWidth: 0,
                  background: 'var(--theme-surface-soft, #fff)',
                  height: 48,
                  padding: '0 14px',
                  borderRadius: 12,
                  border: priceInvalid ? '1.5px solid #dc2626' : '1.5px solid var(--theme-border, #e5e7eb)',
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
                  minWidth: 0,
                  background: 'var(--theme-surface-soft, #fff)',
                  height: 48,
                  padding: '0 14px',
                  borderRadius: 12,
                  border: priceInvalid ? '1.5px solid #dc2626' : '1.5px solid var(--theme-border, #e5e7eb)',
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
            <p style={{ fontFamily: R, fontWeight: 600, fontSize: 15, color: 'var(--theme-ink, #0a0a0a)', marginBottom: 12 }}>Ubicación</p>
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
              type="button"
              onClick={onReset}
              // 44 px de alto para el dedo, aunque se lea como un link.
              style={{ fontFamily: R, fontSize: 14, fontWeight: 500, color: 'var(--theme-subtle, #6b7280)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '0 6px' }}
            >
              Limpiar todo
            </button>
          )}
          <button
            type="button"
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

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes si-filtros-in {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes si-filtros-out {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
        @keyframes si-filtros-velo-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes si-filtros-velo-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      ` }} />
    </>
  )
}
