'use client'

import { useId, useState } from 'react'
import { Loader2, Search, Sparkles } from 'lucide-react'
import type { SeleccionItem } from '@/lib/seleccion'
import type { MotivoSinParecidas } from '@/lib/seleccion-items'

/**
 * "Buscá con IA" (David, 6-oct-2026: "dale la opción que busque con IA debajo
 * de «Listo, avisale a Gisela»"). El cliente escribe como habla y HILO le
 * devuelve nuestras y de colegas con la misma banda que las parecidas. Lo que
 * marque con ♥ se suma a su selección (el camino de siempre). Es la acción
 * secundaria del panel: el botón verde sigue siendo "Listo".
 */

export type ResultadoIA = { texto: string; resumen: string | null; items: SeleccionItem[] }

// Si falta algo, le decimos qué sumar (nunca un "no hay" a secas).
const PIDE: Record<MotivoSinParecidas, string> = {
  no_entendi: 'No te entendí. Probá algo como «casa de 3 dormitorios en Funes hasta USD 250.000».',
  falta_tipo: '¿Casa, departamento o lote? Sumalo y busco.',
  falta_precio: '¿Hasta cuánto querés invertir? Sumalo y busco.',
  falta_zona: '¿En qué barrio o ciudad? Sumalo y busco.',
  sin_referencia: 'Contame qué buscás, dónde y hasta cuánto, y te muestro opciones.',
}

export default function BuscarConIA({
  token, asesor, excluir, soloMirar, onResultado, className = '',
}: {
  token: string
  /** Primer nombre del asesor ("Gisela"). */
  asesor: string
  /** Las que ya descartó (no se le ofrecen de nuevo). Se lee al buscar. */
  excluir: () => string[]
  /** El asesor mirando desde Hilo: busca igual, pero no queda como búsqueda del cliente. */
  soloMirar: boolean
  onResultado: (r: ResultadoIA) => void
  className?: string
}) {
  // La compu y el celular la muestran a la vez (una oculta): ids propios.
  const id = useId()
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState<'idle' | 'buscando'>('idle')
  const [mensaje, setMensaje] = useState<string | null>(null)

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    const t = texto.replace(/\s+/g, ' ').trim()
    if (t.length < 3 || estado === 'buscando') return
    setEstado('buscando')
    setMensaje(null)
    try {
      const res = await fetch(`/api/seleccion/${token}/buscar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: t, excluir: excluir().slice(0, 200), ...(soloMirar ? { asesor: true } : {}) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMensaje(typeof data.error === 'string' ? data.error : 'No pude buscar ahora. Probá de nuevo en un rato.')
        return
      }
      const items: SeleccionItem[] = Array.isArray(data.items) ? data.items : []
      const noEncontradas: string[] = Array.isArray(data.noEncontradas) ? data.noEncontradas : []
      const motivo = data.motivo as MotivoSinParecidas | null
      if (motivo) {
        setMensaje(PIDE[motivo] ?? PIDE.no_entendi)
        return
      }
      const aviso = noEncontradas.length ? `No conozco «${noEncontradas.join('», «')}»: busqué en la zona de tu selección. ` : ''
      setMensaje(
        items.length
          ? `${aviso}Te muestro ${items.length}. Las que marques con ♥ le llegan a ${asesor}.`
          : `${aviso}No encontré con eso. Probá sin el barrio o con otro precio.`,
      )
      onResultado({ texto: t, resumen: typeof data.resumen === 'string' ? data.resumen : null, items })
    } catch {
      setMensaje('No pude buscar ahora. Probá de nuevo en un rato.')
    } finally {
      setEstado('idle')
    }
  }

  return (
    <form onSubmit={buscar} className={className} aria-label="Buscá con IA">
      <label htmlFor={id} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1A5C38]">
        <Sparkles className="h-4 w-4" aria-hidden /> Buscá con IA
      </label>
      <p className="mt-1 text-[14px] leading-snug text-[#4F5C54]">¿Buscás otra cosa? Escribilo como se lo dirías a {asesor}.</p>
      <textarea
        id={id}
        value={texto}
        onChange={(e) => setTexto(e.target.value.slice(0, 300))}
        onKeyDown={(e) => {
          // Enter busca; Shift+Enter, renglón nuevo.
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            e.currentTarget.form?.requestSubmit()
          }
        }}
        rows={2}
        maxLength={300}
        placeholder="Ej: depto de 2 dormitorios en Pichincha hasta USD 170.000"
        className="mt-2.5 w-full resize-none rounded-2xl border border-[#D5DDD8] bg-white px-3.5 py-2.5 text-[16px] leading-snug text-[#111814] placeholder:text-[#8A968E] focus:border-[#1A5C38] focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/20"
      />
      <button
        type="submit"
        disabled={estado === 'buscando' || texto.trim().length < 3}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#1A5C38] bg-white py-2.5 text-[14.5px] font-bold text-[#1A5C38] transition hover:bg-[#EAF3EE] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {estado === 'buscando' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Search className="h-4 w-4" aria-hidden />}
        {estado === 'buscando' ? 'Buscando…' : 'Buscar'}
      </button>
      <p className="mt-2 min-h-[1px] text-[13.5px] leading-snug text-[#4F5C54]" role="status" aria-live="polite">
        {mensaje}
      </p>
    </form>
  )
}
