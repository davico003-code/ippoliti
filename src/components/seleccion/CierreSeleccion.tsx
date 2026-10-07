'use client'

import { CalendarDays, Check, Sparkles } from 'lucide-react'
import type { SeleccionItem } from '@/lib/seleccion'
import { Foto, FotoAsesor, primerNombre, type Reaction } from './seleccion-ui'

/**
 * El cierre, como el "it's a match" de Tinder: el cliente sabe que terminó y
 * qué pasa ahora (su asesor ya tiene sus respuestas y lo contacta). Sus
 * elegidas con "Quiero visitarla" a un toque, y parecidas si quiere más.
 * Si llegó con todo ya elegido (las del Tinder de la web vienen marcadas), no
 * es un "gracias": son sus elegidas y la invitación a visitarlas (David, 6-oct).
 */
export default function CierreSeleccion({
  clientName, agentName, agentPhoto, gustaron, reactions, pendientes, parecidasDisponibles,
  onVisita, onVerParecidas, onSeguir, onCerrar, llegoConElegidas = false,
}: {
  clientName: string
  agentName: string
  agentPhoto?: string | null
  gustaron: SeleccionItem[]
  reactions: Record<string, Reaction>
  /** Las que todavía no miró (si tocó "Listo" antes de terminar). */
  pendientes: number
  parecidasDisponibles: number
  onVisita: (id: string) => void
  onVerParecidas: () => void
  onSeguir: (() => void) | null
  onCerrar?: () => void
  /** Abrió el link con todo ya elegido: "Tus elegidas" en vez de "¡Gracias!". */
  llegoConElegidas?: boolean
}) {
  const nombre = primerNombre(clientName)
  const asesor = primerNombre(agentName)

  return (
    <div className="si-cierre-entra text-center">
      <div className="relative mx-auto h-[112px] w-[112px]">
        <FotoAsesor foto={agentPhoto} nombre={agentName} size={112} />
        <span className="si-check-pop absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#1A5C38] text-white ring-4 ring-white">
          <Check className="h-4 w-4" strokeWidth={3.2} />
        </span>
      </div>

      {gustaron.length > 0 ? (
        <>
          <h2 className="mt-5 text-[26px] font-bold leading-tight tracking-[-0.01em] text-[#111814]">
            {llegoConElegidas ? `Tus elegidas, ${nombre}` : `¡Gracias, ${nombre}!`}
          </h2>
          <p className="mx-auto mt-2 max-w-[400px] text-[16px] font-medium leading-relaxed text-[#1C2620]">
            {llegoConElegidas
              ? `Tocá «Visitar» en las que quieras ver y ${asesor} coordina con vos.`
              : `${asesor} ya tiene tus respuestas y se va a comunicar con vos para seguir.`}
          </p>

          <div className="mx-auto mt-6 max-w-[460px] text-left">
            <p className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#66736B]">
              Te {gustaron.length === 1 ? 'gustó' : `gustaron ${gustaron.length}`}
            </p>
            <ul className="divide-y divide-[#EEF1EF] overflow-hidden rounded-2xl border border-[#E7EBE8] bg-white">
              {gustaron.map((it) => {
                const visita = !!reactions[it.id]?.wantVisit
                return (
                  <li key={it.id} className="flex items-center gap-3 p-2.5">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#EEF1EF]">
                      {it.photos[0] && <Foto src={it.photos[0]} alt={it.title} sizes="56px" logo={it.logo} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-[#111814]">{it.title}</p>
                      {it.price && <p className="font-numeric text-[13px] font-medium text-[#1A5C38]">{it.price}</p>}
                    </div>
                    <button type="button" onClick={() => onVisita(it.id)} aria-pressed={visita}
                      className="inline-flex min-h-[40px] shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition active:scale-95"
                      style={visita ? { background: '#1A5C38', borderColor: '#1A5C38', color: '#fff' } : { background: '#fff', borderColor: '#E3E7E4', color: '#1C2620' }}>
                      {visita ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <CalendarDays className="h-3.5 w-3.5" />}
                      {visita ? 'Visita pedida' : 'Visitar'}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      ) : (
        <>
          <h2 className="mt-5 text-[24px] font-bold leading-tight tracking-[-0.01em] text-[#111814]">Gracias, {nombre}</h2>
          <p className="mx-auto mt-2 max-w-[400px] text-[15px] leading-relaxed text-[#4F5C54]">
            {pendientes > 0
              ? `${asesor} ya tiene tus respuestas. Podés seguir mirando cuando quieras.`
              : `${asesor} ya sabe que ninguna te convenció y te va a buscar otras opciones a medida.`}
          </p>
        </>
      )}

      <div className="mx-auto mt-6 flex max-w-[460px] flex-col gap-2">
        {parecidasDisponibles > 0 && (
          <button type="button" onClick={onVerParecidas}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1A5C38] py-3.5 text-[15px] font-bold text-white transition active:scale-[0.98]">
            {/* David (7-oct): "un botón tipo «quiero ver más propiedades»". Las elige HILO: parecidas a lo que le mandaron, dentro de su presupuesto. */}
            <Sparkles className="h-4 w-4" /> Quiero ver más propiedades
          </button>
        )}
        {onSeguir && pendientes > 0 && (
          <button type="button" onClick={onSeguir}
            className="rounded-full border border-[#E3E7E4] bg-white py-3 text-[14.5px] font-semibold text-[#1C2620] transition active:scale-[0.98]">
            Seguir mirando ({pendientes} sin ver)
          </button>
        )}
        {onCerrar && (
          <button type="button" onClick={onCerrar}
            className="rounded-full py-2.5 text-[14px] font-semibold text-[#66736B] hover:text-[#1C2620]">
            Volver a la selección
          </button>
        )}
      </div>
    </div>
  )
}
