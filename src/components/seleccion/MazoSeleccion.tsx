'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { CalendarDays, Heart, Info, RotateCcw, X } from 'lucide-react'
import type { SeleccionItem } from '@/lib/seleccion'
import { Avatar, Foto, Specs, isValidNote, logoDePortal, primerNombre, type Decision } from './seleccion-ui'

const UMBRAL = 110 // px de arrastre para decidir
const SALIDA_MS = 260

/**
 * Mazo tipo Tinder para el celular: una propiedad por vez, a pantalla casi
 * completa. Derecha = me gusta, izquierda = no me interesa. Toque a los
 * costados de la foto = foto anterior/siguiente; toque abajo o ⓘ = ficha.
 * Los botones hacen lo mismo que el gesto (accesible y obvio para quien no
 * conoce el swipe).
 */
export default function MazoSeleccion({
  cola, hechas, total, agentName, agentPhoto, clientName, note, intro, onCerrarIntro, onVerMensaje,
  onDecidir, onDeshacer, puedeDeshacer, onFicha, onListo, pedido, aviso, buscando,
}: {
  cola: SeleccionItem[]
  hechas: number
  total: number
  agentName: string
  agentPhoto?: string | null
  clientName: string
  note: string
  intro: boolean
  onCerrarIntro: () => void
  onVerMensaje: () => void
  onDecidir: (item: SeleccionItem, d: Decision) => void
  onDeshacer: () => void
  puedeDeshacer: boolean
  onFicha: (item: SeleccionItem) => void
  onListo: () => void
  /** Decisión tomada desde afuera (la ficha en hoja): anima la salida de la carta. */
  pedido: { id: string; d: Decision; n: number } | null
  /** Cartel arriba del mazo ("Ninguna te convenció…"). */
  aviso: string | null
  /** Se terminaron las cartas y estamos trayendo parecidas. */
  buscando: boolean
}) {
  const top = cola[0] ?? null
  const atras = cola[1] ?? null
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [arrastrando, setArrastrando] = useState(false)
  const [salida, setSalida] = useState<Decision | null>(null)
  const [foto, setFoto] = useState(0)
  const inicio = useRef<{ x: number; y: number; t: number } | null>(null)
  const cartaRef = useRef<HTMLDivElement>(null)

  function salir(d: Decision) {
    if (!top || salida) return
    setSalida(d)
    try { navigator.vibrate?.(12) } catch { /* sin vibración */ }
    const item = top
    window.setTimeout(() => {
      // Mismo render (batch): la carta siguiente aparece ya centrada, sin heredar
      // la salida ni el arrastre de la anterior.
      onDecidir(item, d)
      setSalida(null)
      setDrag({ x: 0, y: 0 })
      setFoto(0)
    }, SALIDA_MS)
  }

  function deshacer() {
    setFoto(0)
    onDeshacer()
  }

  const ultimoPedido = useRef(0)
  useEffect(() => {
    if (pedido && pedido.n !== ultimoPedido.current && top && pedido.id === top.id) {
      ultimoPedido.current = pedido.n
      salir(pedido.d)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedido, top?.id])

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (salida || intro) return
    inicio.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!inicio.current) return
    const dx = e.clientX - inicio.current.x
    const dy = e.clientY - inicio.current.y
    if (!arrastrando && Math.hypot(dx, dy) < 6) return
    setArrastrando(true)
    setDrag({ x: dx, y: dy })
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const ini = inicio.current
    inicio.current = null
    setArrastrando(false)
    if (!ini || !top) return
    const dx = e.clientX - ini.x
    const dy = e.clientY - ini.y
    const vel = Math.abs(dx) / Math.max(1, performance.now() - ini.t)
    if (Math.abs(dx) > UMBRAL || (Math.abs(dx) > 50 && vel > 0.6)) {
      salir(dx > 0 ? 'like' : 'nope')
      return
    }
    setDrag({ x: 0, y: 0 })
    if (Math.hypot(dx, dy) < 8) {
      // Toque: abajo abre la ficha; arriba, mitades = foto anterior/siguiente.
      const r = cartaRef.current?.getBoundingClientRect()
      if (!r) return
      const relY = (e.clientY - r.top) / r.height
      const relX = (e.clientX - r.left) / r.width
      if (relY > 0.66) onFicha(top)
      else if (top.photos.length > 1) setFoto((f) => (relX < 0.4 ? Math.max(0, f - 1) : Math.min(top.photos.length - 1, f + 1)))
    }
  }
  function onPointerCancel() {
    inicio.current = null
    setArrastrando(false)
    setDrag({ x: 0, y: 0 })
  }

  const transformTop = salida === 'like'
    ? `translate(130vw, ${drag.y}px) rotate(24deg)`
    : salida === 'nope'
      ? `translate(-130vw, ${drag.y}px) rotate(-24deg)`
      : salida === 'visita'
        ? 'translate(0, -120vh) rotate(0deg)'
        : `translate(${drag.x}px, ${drag.y * 0.3}px) rotate(${drag.x * 0.055}deg)`
  const avance = Math.min(1, Math.abs(drag.x) / UMBRAL)
  const sello = salida ?? (drag.x > 20 ? 'like' : drag.x < -20 ? 'nope' : null)
  const selloOpacidad = salida ? 1 : avance
  const progreso = total > 0 ? hechas / total : 0

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#F4F6F5]" style={{ overscrollBehavior: 'none' }}>
      {/* Cabecera: quién te la mandó + avance + Listo */}
      <header className="px-4 pb-2" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={onVerMensaje} className="flex min-w-0 flex-1 items-center gap-2.5 text-left" aria-label="Ver el mensaje de tu asesor">
            <Avatar foto={agentPhoto} nombre={agentName} size={36} />
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1A5C38]">Tu asesor</span>
              <span className="block truncate text-[14.5px] font-bold leading-tight text-[#111814]">{agentName}</span>
            </span>
          </button>
          <span className="font-numeric text-[13px] font-medium text-[#66736B]">{Math.min(hechas + 1, total)}/{total}</span>
          {hechas > 0 && (
            <button type="button" onClick={onListo}
              className="rounded-full bg-[#111814] px-3.5 py-1.5 text-[13px] font-semibold text-white active:scale-95">
              Listo
            </button>
          )}
        </div>
        <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-[#E1E6E2]">
          <div className="h-full rounded-full bg-[#1A5C38] transition-[width] duration-500" style={{ width: `${progreso * 100}%` }} />
        </div>
      </header>

      {/* Mazo */}
      <div className="relative min-h-0 flex-1 px-3 pb-1 pt-1">
        {aviso && (
          <div className="pointer-events-none absolute inset-x-6 top-4 z-30 rounded-2xl bg-[#111814]/90 px-4 py-3 text-center text-[13.5px] font-semibold leading-snug text-white shadow-lg backdrop-blur" role="status">
            {aviso}
          </div>
        )}

        {!top && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-[14px] text-[#66736B]">
            {buscando ? (
              <>
                <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#D5DDD8] border-t-[#1A5C38]" />
                Buscando otras parecidas…
              </>
            ) : 'No quedan propiedades por mirar.'}
          </div>
        )}

        {atras && (
          <div key={atras.id} className="absolute inset-x-3 bottom-1 top-1 overflow-hidden rounded-[28px] bg-[#DDE3DF] transition-transform duration-300"
            style={{ transform: `scale(${0.94 + 0.06 * (salida ? 1 : avance)}) translateY(${(1 - (salida ? 1 : avance)) * 14}px)` }}
            aria-hidden>
            {atras.photos[0] && <Foto src={atras.photos[0]} alt="" sizes="100vw" />}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        )}

        {top && (
          <div
            ref={cartaRef}
            key={top.id}
            className="absolute inset-x-3 bottom-1 top-1 touch-none select-none overflow-hidden rounded-[28px] bg-[#DDE3DF] shadow-[0_18px_40px_-16px_rgba(10,30,20,0.45)]"
            style={{
              transform: transformTop,
              transition: arrastrando ? 'none' : `transform ${salida ? SALIDA_MS : 300}ms ${salida ? 'ease-in' : 'cubic-bezier(.2,.8,.2,1)'}`,
              cursor: arrastrando ? 'grabbing' : 'grab',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          >
            {top.photos[foto] ? (
              <Foto key={top.photos[foto]} src={top.photos[foto]} alt={top.title} sizes="100vw" eager />
            ) : (
              <div className="flex h-full items-center justify-center text-[14px] text-[#66736B]">Sin foto</div>
            )}
            {/* Precarga la foto siguiente para que el toque la cambie al instante */}
            {top.photos[foto + 1] && (
              <div className="pointer-events-none absolute inset-0 opacity-0" aria-hidden>
                <Foto src={top.photos[foto + 1]} alt="" sizes="100vw" eager />
              </div>
            )}

            {/* Segmentos de fotos (estilo historias) */}
            {top.photos.length > 1 && (
              <div className="pointer-events-none absolute inset-x-3 top-2.5 flex gap-1">
                {top.photos.map((_, n) => (
                  <span key={n} className="h-[3px] flex-1 rounded-full" style={{ background: n === foto ? '#fff' : 'rgba(255,255,255,0.4)' }} />
                ))}
              </div>
            )}

            <div className="pointer-events-none absolute left-3 top-6 flex items-center gap-1.5">
              {top.sugerida && (
                <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11.5px] font-semibold text-[#1A5C38]">Parecida a lo que buscás</span>
              )}
              {top.externa && logoDePortal(top.url) && (
                <span className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white p-1">
                  <Image src={logoDePortal(top.url)!.logo} alt={logoDePortal(top.url)!.name} width={20} height={20} className="h-5 w-auto" />
                </span>
              )}
            </div>

            {/* Sellos mientras arrastra */}
            {sello === 'like' && (
              <span className="pointer-events-none absolute left-5 top-16 -rotate-[14deg] rounded-xl border-[4px] border-[#00C26E] px-3 py-1 text-[28px] font-extrabold tracking-wide text-[#00C26E]"
                style={{ opacity: selloOpacidad }}>ME GUSTA</span>
            )}
            {sello === 'nope' && (
              <span className="pointer-events-none absolute right-5 top-16 rotate-[14deg] rounded-xl border-[4px] border-[#FF3B3B] px-3 py-1 text-[28px] font-extrabold tracking-wide text-[#FF3B3B]"
                style={{ opacity: selloOpacidad }}>NO</span>
            )}
            {sello === 'visita' && (
              <span className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -rotate-[8deg] rounded-xl border-[4px] border-white px-3 py-1 text-[26px] font-extrabold tracking-wide text-white">
                VISITAR
              </span>
            )}

            {/* Datos sobre la foto */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-5 pb-5 pt-24 text-white">
              <div className="flex items-end gap-3">
                <div className="min-w-0 flex-1">
                  {top.price && <p className="font-numeric text-[24px] font-semibold leading-none tracking-[-0.01em]">{top.price}</p>}
                  <h2 className="mt-1.5 text-[17px] font-bold leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {top.title}
                  </h2>
                  {top.location && <p className="mt-0.5 truncate text-[13px] text-white/80">{top.location}</p>}
                  <Specs item={top} className="mt-2 text-[12.5px] text-white/90" />
                  {isValidNote(top.note) && <p className="mt-2 text-[13px] italic leading-snug text-white/85">&ldquo;{top.note}&rdquo;</p>}
                </div>
                {top.fichaUrl && (
                  <button type="button" aria-label="Ver ficha completa"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onFicha(top)}
                    className="pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md active:scale-90">
                    <Info className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Intro: el mensaje del asesor + cómo se usa. Solo la primera vez. */}
        {intro && (
          <div className="absolute inset-0 z-40 flex items-end bg-black/35 px-3 pb-3 backdrop-blur-[2px]">
            <div className="w-full rounded-[26px] bg-white p-5 shadow-2xl">
              <div className="flex items-center gap-3">
                <Avatar foto={agentPhoto} nombre={agentName} size={48} />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1A5C38]">Tu asesor</p>
                  <p className="text-[16px] font-bold text-[#111814]">{agentName}</p>
                </div>
              </div>
              <p className="mt-3.5 text-[15px] leading-relaxed text-[#2B3630]">
                {isValidNote(note) ? note : `Hola ${primerNombre(clientName)}, te preparé esta selección. Mirala tranquilo y marcame cuáles te gustan.`}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[13px] font-semibold">
                <span className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#FFF1F1] py-3 text-[#D50008]">
                  <X className="h-4 w-4" strokeWidth={3} /> ← No me interesa
                </span>
                <span className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#EAF3EE] py-3 text-[#1A5C38]">
                  Me gusta → <Heart className="h-4 w-4" strokeWidth={2.6} fill="currentColor" />
                </span>
              </div>
              <p className="mt-2.5 text-center text-[12.5px] text-[#66736B]">Deslizá cada propiedad o usá los botones. Tocá la foto para ver más.</p>
              <button type="button" onClick={onCerrarIntro}
                className="mt-4 w-full rounded-full bg-[#1A5C38] py-3.5 text-[15px] font-bold text-white active:scale-[0.98]">
                Empezar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botonera (con etiqueta: no todos conocen el gesto ni los íconos) */}
      <div className="flex items-start justify-center gap-2.5 px-3 pt-2" style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}>
        <BotonMazo etiqueta="Deshacer" chico onClick={deshacer} disabled={!puedeDeshacer || !!salida} color="#C99A00">
          <RotateCcw className="h-5 w-5" strokeWidth={2.6} />
        </BotonMazo>
        <BotonMazo etiqueta="No me interesa" onClick={() => salir('nope')} disabled={!top || !!salida} color="#F40009">
          <X className="h-8 w-8" strokeWidth={3} />
        </BotonMazo>
        <BotonMazo etiqueta="Me gusta" onClick={() => salir('like')} disabled={!top || !!salida} color="#1A5C38">
          <Heart className="h-8 w-8" strokeWidth={2.6} fill="currentColor" />
        </BotonMazo>
        <BotonMazo etiqueta="Visitar" chico onClick={() => salir('visita')} disabled={!top || !!salida} color="#1A5C38">
          <CalendarDays className="h-5 w-5" strokeWidth={2.4} />
        </BotonMazo>
      </div>
    </div>
  )
}

function BotonMazo({
  etiqueta, chico, onClick, disabled, color, children,
}: { etiqueta: string; chico?: boolean; onClick: () => void; disabled?: boolean; color: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={etiqueta}
      className="group flex w-[80px] flex-col items-center gap-1.5 transition disabled:opacity-35">
      <span className={`flex items-center justify-center rounded-full bg-white transition group-active:scale-90 ${chico ? 'mt-2 h-12 w-12 shadow-[0_6px_18px_-8px_rgba(10,30,20,0.35)]' : 'h-16 w-16 shadow-[0_8px_22px_-8px_rgba(10,30,20,0.4)]'}`}
        style={{ color }}>
        {children}
      </span>
      <span className="whitespace-nowrap text-center text-[10.5px] font-semibold leading-tight text-[#4F5C54]">{etiqueta}</span>
    </button>
  )
}
