'use client'

// "Compartir varias" en el listado, SOLO para asesores con sesión (David,
// 14-nov-2026: "filtran Vida Lagoon, seleccionan 3 lotes y les aparece la
// opción de enviar en un único link"). Tildás en las tarjetas, ponés el nombre
// del cliente y "Copiar link" te deja en el portapapeles SU link de
// seguimiento, que arma Hilo (/api/agentes/seguimiento): un solo link por
// cliente, si ya tenía uno las propiedades se suman ahí. Igual que la barra
// del listado de Hilo: nombre + copiar, sin WhatsApp (lo pega el asesor).
//
// La tanda vive en sessionStorage: sobrevive a cambiar filtros y a entrar y
// volver de una ficha. Tope 6, el mismo de Hilo (MAX_TANDA).

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Check, Link2, Loader2, X } from 'lucide-react'
import { useEsAgente } from '@/lib/use-es-agente'
import { copiarTexto } from '@/lib/share-ficha'
import { haptico } from '@/lib/haptico'
import { showToast } from '@/components/Toast'

export const MAX_TANDA = 6
const CLAVE = 'si-tanda-seguimiento-v1'

type Ctx = {
  ids: number[]
  tiene: (id: number) => boolean
  alternar: (id: number) => void
  vaciar: () => void
}

const TandaCtx = createContext<Ctx | null>(null)

/** null = no hay sesión de asesor (o la tarjeta está fuera del listado): no se muestra nada. */
export function useTandaSeguimiento(): Ctx | null {
  return useContext(TandaCtx)
}

function leer(): number[] {
  try {
    const v = JSON.parse(sessionStorage.getItem(CLAVE) ?? '[]')
    return Array.isArray(v) ? v.filter((x): x is number => Number.isInteger(x)).slice(0, MAX_TANDA) : []
  } catch {
    return []
  }
}

export function TandaSeguimientoProvider({ children }: { children: ReactNode }) {
  const esAgente = useEsAgente()
  const [ids, setIds] = useState<number[]>([])

  useEffect(() => {
    if (esAgente) setIds(leer())
  }, [esAgente])

  const guardar = useCallback((nuevos: number[]) => {
    setIds(nuevos)
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(nuevos))
    } catch {}
  }, [])

  const alternar = useCallback(
    (id: number) => {
      haptico()
      if (ids.includes(id)) return guardar(ids.filter((x) => x !== id))
      if (ids.length >= MAX_TANDA) {
        showToast(`Hasta ${MAX_TANDA} por link. Mandá estas y seguí con otras.`, { variant: 'error' })
        return
      }
      guardar([...ids, id])
    },
    [ids, guardar],
  )

  const valor = useMemo<Ctx>(
    () => ({ ids, tiene: (id) => ids.includes(id), alternar, vaciar: () => guardar([]) }),
    [ids, alternar, guardar],
  )

  if (!esAgente) return <>{children}</>
  return (
    <TandaCtx.Provider value={valor}>
      {children}
      <BarraSeguimiento />
    </TandaCtx.Provider>
  )
}

/** La casilla de la tarjeta (al lado de Compartir). */
export function CasillaSeguimiento({ propertyId, size = 36 }: { propertyId: number; size?: number }) {
  const tanda = useTandaSeguimiento()
  if (!tanda) return null
  const tildada = tanda.tiene(propertyId)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        tanda.alternar(propertyId)
      }}
      aria-pressed={tildada}
      aria-label={tildada ? 'Sacar del link de seguimiento' : 'Sumar al link de seguimiento'}
      title={tildada ? 'Sacar del link' : 'Sumar al link de seguimiento'}
      className="si-tap relative inline-flex items-center justify-center rounded-full after:absolute after:-inset-1 after:content-['']"
      style={{
        width: size,
        height: size,
        border: tildada ? '2px solid #17613C' : '2px solid #9CA3AF',
        background: tildada ? '#17613C' : 'var(--card-surface, #fff)',
        color: '#fff',
        transition: 'background-color 150ms, border-color 150ms',
      }}
    >
      {tildada && <Check className="h-5 w-5" strokeWidth={3} aria-hidden />}
    </button>
  )
}

function BarraSeguimiento() {
  const tanda = useTandaSeguimiento()
  const [cliente, setCliente] = useState('')
  const [enviando, setEnviando] = useState(false)
  if (!tanda || tanda.ids.length === 0) return null
  const n = tanda.ids.length

  const pedir = async (): Promise<string> => {
    const r = await fetch('/api/agentes/seguimiento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cliente: cliente.trim(), ids: tanda.ids }),
    })
    const j = (await r.json().catch(() => null)) as { url?: string; error?: string; omitidas?: number } | null
    if (!r.ok || !j?.url) throw new Error(j?.error || 'No se pudo armar el link. Probá de nuevo.')
    return j.url
  }

  const copiar = async () => {
    if (enviando) return
    if (cliente.trim().length < 2) {
      showToast('Poné el nombre del cliente.', { variant: 'error' })
      return
    }
    setEnviando(true)
    haptico()
    const nombre = cliente.trim()
    const listo = () => {
      showToast(`Link de seguimiento copiado para ${nombre}`)
      tanda.vaciar()
      setCliente('')
    }
    try {
      // Safari pide reservar el portapapeles DENTRO del toque: ClipboardItem
      // con la promesa del fetch (mismo truco que el link para colega).
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        const urlPromise = pedir()
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'text/plain': urlPromise.then((u) => new Blob([u], { type: 'text/plain' })) })])
          listo()
          return
        } catch {
          const url = await urlPromise // si falló Hilo, cae al catch de afuera con su mensaje
          if (await copiarTexto(url)) return listo()
          showToast(`No se pudo copiar. Link: ${url}`, { variant: 'error', duration: 10000 })
          tanda.vaciar()
          return
        }
      }
      const url = await pedir()
      if (await copiarTexto(url)) return listo()
      showToast(`No se pudo copiar. Link: ${url}`, { variant: 'error', duration: 10000 })
      tanda.vaciar()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo armar el link.', { variant: 'error', duration: 5000 })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      role="region"
      aria-label="Link de seguimiento"
      className="fixed left-3 right-3 z-[10002] mx-auto flex max-w-xl flex-col gap-2 rounded-2xl border p-3 shadow-2xl md:left-1/2 md:right-auto md:w-[560px] md:-translate-x-1/2"
      // Colores del tema (la web pasa a oscuro según la hora).
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)', background: 'var(--card-surface, #fff)', borderColor: 'var(--tinta-mute, #E5E7EB)', color: 'var(--foreground, #111827)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          <Link2 className="mr-1.5 inline h-4 w-4 align-[-3px]" style={{ color: 'var(--brand, #17613C)' }} aria-hidden />
          {n} {n === 1 ? 'propiedad tildada' : 'propiedades tildadas'}
          <span className="font-normal" style={{ color: 'var(--tinta-mute)' }}> · máx. {MAX_TANDA}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            tanda.vaciar()
            setCliente('')
          }}
          className="inline-flex h-9 items-center gap-1 rounded-full px-2 text-sm hover:opacity-70"
          style={{ color: 'var(--tinta-soft)' }}
        >
          <X className="h-4 w-4" aria-hidden /> Destildar
        </button>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          void copiar()
        }}
      >
        <label htmlFor="tanda-cliente" className="sr-only">Nombre del cliente</label>
        <input
          id="tanda-cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Nombre del cliente…"
          autoComplete="off"
          enterKeyHint="send"
          maxLength={80}
          className="min-w-0 flex-1 rounded-xl border px-3 text-base outline-none focus:ring-2 focus:ring-[#17613C]/40"
          style={{ height: 46, borderColor: 'var(--tinta-mute, #D1D5DB)', background: 'var(--background, #fff)', color: 'var(--foreground)' }}
        />
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-70"
          style={{ height: 46, background: '#17613C' }}
        >
          {enviando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
          {enviando ? 'Armando…' : 'Copiar link'}
        </button>
      </form>
    </div>
  )
}
