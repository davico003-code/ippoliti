'use client'

// Buscador de la portada: UNO SOLO para el celu y la compu. Antes eran dos
// copias de ~140 líneas (HeroMobile y HeroSearch) que ya hablaban distinto:
// otro placeholder, otros tamaños, otra letra en las sugerencias; y cualquier
// mejora llegaba a una sola. Entre los dos cambia solo el aire (padding y ancho).
//
// Lo que hace ahora y antes no:
// 1. Responde al instante. /propiedades es dinámico: entre el toque y el
//    esqueleto del listado pasaban 1-3 s sin nada en pantalla y la gente volvía
//    a tocar (lo mismo que ya se arregló en el "Ingresar" del navbar). Ahora
//    vibra al tocar, el botón muestra el mismo aro girando y queda deshabilitado
//    hasta que llega el listado.
// 2. Propone antes de que escribas: al enfocar con el campo vacío ofrece zonas
//    y qué buscar (la app piensa, el usuario confirma). Si ya buscaste algo,
//    "Volver a: …" va primero.
// 3. Teclado de búsqueda: type="search" + enterKeyHint="search" (el iPhone
//    muestra "Buscar" en vez de "intro") y una × para borrar de un toque.

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { History, Search, X } from 'lucide-react'
import { highlightMatch } from '@/lib/highlight'
import { buscarZonas, type Zona } from '@/lib/zonas'
import { haptico } from '@/lib/haptico'

const RALEWAY = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"
const PLACEHOLDER = 'Barrio, ciudad o dirección'
const MAX_ZONAS = 6
// La misma clave que usa el listado (PropiedadesView): lo que buscaste allá
// aparece acá como "Volver a" y lo que buscás acá aparece allá.
const CLAVE_HISTORIAL = 'si_search_history'

const ZONAS_SUGERIDAS = ['Funes', 'Roldán', 'Rosario', 'Fisherton']
const QUE_BUSCAS = [
  { label: 'Comprar', href: '/propiedades?op=venta' },
  { label: 'Alquilar', href: '/propiedades?op=alquiler' },
  { label: 'Terrenos', href: '/propiedades?q=terreno' },
  { label: 'Emprendimientos', href: '/emprendimientos' },
]

function urlBusqueda(q: string): string {
  return `/propiedades?q=${encodeURIComponent(q)}`
}

// localStorage puede no estar (modo privado, datos bloqueados): nunca rompe.
function leerHistorial(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CLAVE_HISTORIAL) || '[]')
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string' && !!x.trim()) : []
  } catch {
    return []
  }
}

// Mismo formato que el listado: más reciente primero, sin repetidos, máx. 5.
function guardarEnHistorial(termino: string): void {
  const t = termino.trim()
  if (!t) return
  try {
    const next = [t, ...leerHistorial().filter(x => x.toLowerCase() !== t.toLowerCase())].slice(0, 5)
    localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(next))
  } catch { /* sin historial */ }
}

// ─── Panel de sugerencias (compartido) ───────────────────────────────────────

type SugerenciasProps = {
  query: string
  zonas: Zona[]
  reciente: string | null
  /** url a la que ir y, si corresponde, el término a guardar como búsqueda. */
  onElegir: (url: string, termino?: string) => void
}

/**
 * Con el campo vacío: chips de zonas y de qué buscar (y "Volver a" si hay una
 * búsqueda reciente). Con 2+ letras: las zonas que coinciden. En cualquier otro
 * caso no muestra nada (nunca un panel vacío).
 */
export default function SugerenciasBusqueda({ query, zonas, reciente, onElegir }: SugerenciasProps) {
  const q = query.trim()
  const vacio = q.length === 0
  if (!vacio && (q.length < 2 || zonas.length === 0)) return null

  // onMouseDown preventDefault: que el toque no le saque el foco al input antes
  // del click (si no, el panel se cerraba y el toque se perdía).
  const sinRobarFoco = (e: React.MouseEvent) => e.preventDefault()

  return (
    <div
      className="buscador-panel text-left"
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 6,
        background: 'var(--theme-surface, #fff)',
        borderRadius: 16,
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        overflow: 'auto',
        maxHeight: 340,
        zIndex: 60,
      }}
    >
      {vacio ? (
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reciente && (
            <button
              type="button"
              className="buscador-chip buscador-chip--reciente si-tap"
              style={{ alignSelf: 'flex-start', maxWidth: '100%' }}
              onMouseDown={sinRobarFoco}
              onClick={() => onElegir(urlBusqueda(reciente), reciente)}
            >
              <History size={16} strokeWidth={2.2} aria-hidden="true" style={{ flexShrink: 0 }} />
              <span className="truncate" style={{ minWidth: 0 }}>
                {/* Espacio real: sin él se leía "Volver a:Funes". */}
                Volver a:{' '}<strong style={{ fontWeight: 700 }}>{reciente}</strong>
              </span>
            </button>
          )}
          <div role="group" aria-label="Zonas" className="flex flex-wrap" style={{ gap: 6 }}>
            {ZONAS_SUGERIDAS.map(z => (
              <button
                key={z}
                type="button"
                className="buscador-chip si-tap"
                onMouseDown={sinRobarFoco}
                onClick={() => onElegir(urlBusqueda(z), z)}
              >
                {z}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Qué buscás" className="flex flex-wrap" style={{ gap: 6 }}>
            {QUE_BUSCAS.map(o => (
              <button
                key={o.label}
                type="button"
                className="buscador-chip si-tap"
                onMouseDown={sinRobarFoco}
                onClick={() => onElegir(o.href)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        zonas.map(zona => (
          <button
            key={zona.id}
            type="button"
            className="buscador-sug"
            onMouseDown={sinRobarFoco}
            onClick={() => onElegir(urlBusqueda(zona.nombre), zona.nombre)}
          >
            <span style={{ flex: 1, minWidth: 0 }}>{highlightMatch(zona.nombre, query)}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--theme-subtle, #6b7280)', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {zona.tipo === 'barrio_cerrado' ? `${zona.ciudad} · Country` : zona.ciudad}
            </span>
          </button>
        ))
      )}
    </div>
  )
}

// ─── Buscador de la portada (celu y compu) ───────────────────────────────────

type BuscadorProps = {
  variante: 'celu' | 'compu'
  /** Clases del contenedor (p. ej. la entrada animada de la portada del celu). */
  className?: string
  style?: React.CSSProperties
}

export function BuscadorHero({ variante, className = '', style }: BuscadorProps) {
  const celu = variante === 'celu'
  const [query, setQuery] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [reciente, setReciente] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const zonas = buscarZonas(query, MAX_ZONAS)

  // La búsqueda reciente se lee al montar (no en el render: la home es ISR y
  // el HTML del servidor no puede depender del navegador).
  useEffect(() => {
    setReciente(leerHistorial()[0] ?? null)
  }, [])

  // Cerrar al tocar afuera o al pasar el foco (Tab) a otra cosa de la página.
  useEffect(() => {
    function fuera(e: Event) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('focusin', fuera)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('focusin', fuera)
    }
  }, [])

  // Toda salida pasa por acá: vibra, cierra el panel, baja el teclado (así se
  // ve el aro) y navega dentro de una transición para saber cuándo terminó.
  function ir(url: string, termino?: string) {
    if (pending) return
    haptico()
    setAbierto(false)
    if (termino) {
      setQuery(termino)
      guardarEnHistorial(termino)
    }
    inputRef.current?.blur()
    startTransition(() => router.push(url))
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    ir(q ? urlBusqueda(q) : '/propiedades', q || undefined)
  }

  function borrar() {
    setQuery('')
    setAbierto(true)
    inputRef.current?.focus()
  }

  return (
    <div
      ref={wrapperRef}
      className={`buscador-hero relative mx-auto w-full ${className}`}
      style={{ maxWidth: celu ? 460 : 540, ...style }}
      onKeyDown={e => { if (e.key === 'Escape') setAbierto(false) }}
    >
      {/* action + name="q": si el JS todavía no cargó, el formulario igual
          lleva al listado; y con action el iPhone muestra la tecla "Buscar". */}
      <form
        role="search"
        action="/propiedades"
        onSubmit={enviar}
        className="bg-white shadow-xl flex items-center"
        style={{
          borderRadius: 9999,
          padding: celu ? '6px 6px 6px 16px' : '8px 8px 8px 24px',
          gap: celu ? 8 : 12,
        }}
      >
        <Search size={18} style={{ color: 'var(--theme-subtle, #888780)', flexShrink: 0 }} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          name="q"
          enterKeyHint="search"
          value={query}
          readOnly={pending}
          onChange={e => {
            setQuery(e.target.value)
            setAbierto(true)
          }}
          onFocus={() => setAbierto(true)}
          placeholder={PLACEHOLDER}
          aria-label="Buscar por barrio, ciudad o dirección"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 min-w-0 border-none outline-none bg-transparent placeholder:text-[#888780]"
          style={{
            fontFamily: RALEWAY,
            fontWeight: 500,
            fontSize: 15,
            color: 'var(--theme-ink, #111)',
            background: 'transparent',
          }}
        />
        {query && !pending && (
          <button
            type="button"
            className="buscador-borrar si-tap"
            aria-label="Borrar búsqueda"
            onMouseDown={e => e.preventDefault()}
            onClick={borrar}
          >
            <X size={15} strokeWidth={2.4} aria-hidden="true" />
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="hero-buscar-btn si-tap relative shrink-0 border-none cursor-pointer disabled:cursor-progress"
          style={{
            // Acento fijo: verde de marca sólido (fondo y hover en globals.css).
            color: '#fff',
            fontFamily: RALEWAY,
            fontSize: 14,
            fontWeight: 700,
            minHeight: 44,
            padding: celu ? '0 18px' : '0 28px',
            borderRadius: 9999,
            // transform incluido: si no, este inline pisaba la transición del
            // .si-tap y el "hundirse" al tocar salía de golpe.
            transition: 'background 180ms, box-shadow 180ms, transform 180ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* El texto queda (invisible) para que el botón no cambie de ancho. */}
          <span style={{ opacity: pending ? 0 : 1 }}>Buscar</span>
          {pending && (
            <span
              aria-hidden
              className="absolute inset-0 m-auto rounded-full animate-spin"
              style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff' }}
            />
          )}
        </button>
      </form>

      {abierto && !pending && (
        <SugerenciasBusqueda query={query} zonas={zonas} reciente={reciente} onElegir={ir} />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .buscador-hero input[type="search"] { -webkit-appearance: none; appearance: none; }
        .buscador-hero input[type="search"]::-webkit-search-cancel-button,
        .buscador-hero input[type="search"]::-webkit-search-decoration { -webkit-appearance: none; appearance: none; display: none; }
        .buscador-borrar { position: relative; flex-shrink: 0; width: 28px; height: 28px; border: 0; border-radius: 9999px; display: inline-flex; align-items: center; justify-content: center; background: var(--theme-surface-soft, #F1F3F2); color: var(--theme-muted, #4b5563); cursor: pointer; }
        .buscador-borrar::after { content: ''; position: absolute; inset: -8px; }
        .buscador-panel { animation: buscadorPanelIn 180ms cubic-bezier(.2,.7,.2,1) both; }
        @keyframes buscadorPanelIn { from { opacity: 0; transform: translate3d(0,-4px,0); } to { opacity: 1; transform: none; } }
        .buscador-chip { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px; border: 0; border-radius: 9999px; font: 600 14px ${RALEWAY}; color: var(--theme-ink, #111); background: var(--theme-surface-soft, #F4F6F5); cursor: pointer; transition: background 150ms ease-out, transform 180ms cubic-bezier(0.22, 1, 0.36, 1); }
        .buscador-chip--reciente { background: var(--brand-light, #E8F2ED); color: var(--brand, #1A5C38); }
        .buscador-chip:focus-visible, .buscador-sug:focus-visible { outline: 2px solid var(--brand, #1A5C38); outline-offset: -2px; }
        .buscador-sug { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 48px; padding: 10px 16px; text-align: left; border: 0; border-bottom: 1px solid var(--theme-border, #f2f2f2); background: transparent; font: 500 15px ${RALEWAY}; color: var(--theme-ink, #111); cursor: pointer; transition: background 150ms ease-out; }
        .buscador-sug:last-child { border-bottom: 0; }
        .buscador-sug:active { background: var(--theme-surface-soft, #F4F6F5); }
        @media (hover: hover) {
          .buscador-sug:hover { background: var(--theme-surface-soft, #F4F6F5); }
          .buscador-chip:hover { background: var(--brand-light, #E8F2ED); }
        }
        @media (prefers-reduced-motion: reduce) {
          .buscador-panel { animation: none; }
          .buscador-chip, .buscador-sug { transition: none; }
        }
      ` }} />
    </div>
  )
}
