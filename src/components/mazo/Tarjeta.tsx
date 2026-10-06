'use client'

// La TARJETA del Tinder y sus botones ↺ ✕ ★ ♥ (David, 3/4-oct-2026). Las usan
// el mazo abierto (MazoCasas) y la ficha (la primera tarjeta, 'quieta').

import Image from 'next/image'
import { Expand, RotateCcw, Star, X } from 'lucide-react'
import { type ItemFeed, estiloSinLogo, lineaTarjeta, lugarTarjeta, metrosVisibles } from '@/lib/feed-en-red'
import { formatDistanceAR } from '@/lib/geo'
import { MAX_FOTOS_MAZO } from '@/lib/mazo-items'
import { AZUL_VISITA, CORAZON, Corazon, IsotipoSI, ORO_VOLVER, ROJO_PASO } from './marca-mazo'

const RGB: Record<Salida, string> = { like: '26,92,56', pass: '229,72,77', super: '43,127,255' }
/** Cuánto hay que arrastrar la tarjeta para que cuente como ♥ o paso… */
export const UMBRAL_SWIPE = 90
/** …o hacia arriba para "Quiero conocerla". */
export const UMBRAL_SUPER = 110
export const DURACION_SALIDA = 300

/** ♥ (derecha), paso (izquierda) o "Quiero conocerla" (arriba, el super like de Tinder). */
export type Salida = 'like' | 'pass' | 'super'
/** `agarreArriba`: la agarró de la mitad de arriba (gira para un lado) o de abajo (para el otro), como Tinder. */
export type Arrastre = { dx: number; dy: number; agarreArriba?: boolean }

/** Hacia dónde va un arrastre (null = todavía no se movió lo suficiente). */
export function direccionDe(dx: number, dy: number, conSuper = true): Salida | null {
  if (conSuper && dy < -12 && Math.abs(dy) > Math.abs(dx) * 1.1) return 'super'
  if (Math.abs(dx) > 8) return dx > 0 ? 'like' : 'pass'
  return null
}

/**
 * De a cuántas fotos se muestran, una arriba de la otra. En el mazo, de a TRES
 * (David 6-oct, eligió viendo varias simuladas: ninguna foto queda bajo el
 * precio). Ojo: con las barras de Safari cada hueco queda ~2,5:1 (tiras finas).
 * La de la ficha ('quieta', 470 px de alto) sigue de a dos.
 */
export const FOTOS_POR_TARJETA = 3
/** Cuántos grupos de fotos tiene (cada toque al costado pasa al siguiente). */
export const gruposDe = (item: ItemFeed, porGrupo = FOTOS_POR_TARJETA) => Math.max(1, Math.ceil(Math.min(item.fotos.length, MAX_FOTOS_MAZO) / porGrupo))

// Sobre la foto oscura, los colores claros (como los botones de vidrio).
const SELLOS: Record<Salida, { texto: string; color: string; clase: string }> = {
  like: { texto: 'ME GUSTA', color: '#45D98B', clase: 'top-24 left-4 -rotate-12' },
  pass: { texto: 'PASO', color: '#FF6B6F', clase: 'top-24 right-4 rotate-12' },
  super: { texto: 'QUIERO CONOCERLA', color: '#5AAEFF', clase: 'top-[32%] left-1/2 -translate-x-1/2 -rotate-6' },
}

/**
 * Una tarjeta del mazo, con la estética de Tinder. 5-oct (David eligió la
 * propuesta A, "molesta tanto texto sobre la foto… más discreto"): pantalla
 * negra y lo mínimo — precio con ⓘ (detalles), un renglón (dorm · m² · lote) y
 * dónde, con el isotipo o "Otra inmobiliaria". Las fotos de las casas son
 * apaisadas: UNA sola en una tarjeta vertical queda recortada y agrandada
 * ("estirada", David 3-oct). 6-oct (David eligió "3 fotos con degradé a
 * negro" entre varias simuladas): de a TRES arriba, la última se funde a negro
 * y los datos van sobre negro debajo — ninguna foto queda tapada por el precio.
 * Tocar el costado de las fotos pasa al siguiente grupo (barritas arriba);
 * tocar los datos abre "Ver detalles".
 * La de arriba se arrastra y gira según dónde la agarraste; la de abajo crece
 * mientras tanto (`progreso`); 'quieta' = la de la ficha (no se arrastra).
 */
export function Tarjeta({
  item,
  modo,
  guardada,
  arrastre,
  salida,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  par,
  guia = false,
  onDetalles,
  onAmpliar,
  progreso = 0,
  arrastrando = false,
  conSuper = false,
  conBotones = false,
}: {
  item: ItemFeed
  modo: 'arriba' | 'abajo' | 'quieta'
  /** El instructivo la mueve sola (suave) para mostrar cómo se desliza. */
  guia?: boolean
  /** "Ver detalles": ubicación y características sin salir del mazo. */
  onDetalles?: () => void
  /** Foto en grande (desde la primera del par que se ve). */
  onAmpliar?: (desde: number) => void
  guardada: boolean
  arrastre: Arrastre | null
  salida: Salida | null
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp?: (e: React.PointerEvent<HTMLDivElement>) => void
  par: number
  /** Solo la de abajo: 0 quieta → 1 la de arriba ya se va (crece hasta su tamaño). */
  progreso?: number
  /** Solo la de abajo: el dedo sigue apoyado en la de arriba (sigue sin demora). */
  arrastrando?: boolean
  /** Arrastrar hacia arriba = "Quiero conocerla" (en el mazo abierto). */
  conSuper?: boolean
  /** Los botones ↺ ✕ ★ ♥ flotan sobre la foto (mazo abierto): los datos suben para dejarles lugar. */
  conBotones?: boolean
}) {
  const arriba = modo === 'arriba'
  const dx = arrastre?.dx ?? 0
  const dy = arrastre?.dy ?? 0
  const haciaArriba = conSuper && direccionDe(dx, dy, true) === 'super'
  // Gira según DÓNDE la agarraste (como Tinder): de la mitad de arriba la punta va adelante; de abajo, al revés.
  const giro = dx * 0.06 * (arrastre?.agarreArriba === false ? -1 : 1)
  const transform =
    modo === 'abajo'
      ? `scale(${0.94 + 0.06 * progreso}) translateY(${12 * (1 - progreso)}px)`
      : salida === 'super'
        ? `translate(${dx}px, calc(${Math.min(dy, 0)}px - 125%)) rotate(-3deg)`
        : salida
          ? `translate(calc(${dx}px + ${salida === 'like' ? 135 : -135}%), ${dy * 0.4}px) rotate(${salida === 'like' ? 26 : -26}deg)`
          : arrastre
            ? `translate(${dx}px, ${haciaArriba ? dy * 0.85 : dy * 0.2}px) rotate(${haciaArriba ? giro * 0.4 : giro}deg)`
            : 'none'
  const transicion =
    modo === 'abajo'
      ? arrastrando
        ? 'none'
        : 'transform 260ms ease-out'
      : guia
        ? 'transform 520ms ease-in-out'
        : salida
          ? `transform ${DURACION_SALIDA}ms cubic-bezier(.3,.6,.4,1)`
          : arriba && arrastre
            ? 'none'
            : // Vuelve a su lugar con un rebotecito (o aparece como la de arriba).
              'transform 420ms cubic-bezier(.2,1.3,.4,1)'
  const sello: Salida | null = !arriba ? null : salida ?? (haciaArriba ? 'super' : dx > 8 ? 'like' : dx < -8 ? 'pass' : null)
  const fuerzaSello = salida ? 1 : sello === 'super' ? Math.min(1, -dy / UMBRAL_SUPER) : Math.min(1, Math.abs(dx) / UMBRAL_SWIPE)
  const n = Math.min(item.fotos.length, MAX_FOTOS_MAZO)
  const porGrupo = modo === 'quieta' ? 2 : FOTOS_POR_TARJETA
  const pares = gruposDe(item, porGrupo)
  const p = Math.min(par, pares - 1)
  // El último grupo incompleto vuelve a las primeras fotos: nunca una sola estirada.
  const fotos = n >= porGrupo ? Array.from({ length: porGrupo }, (_, i) => item.fotos[(p * porGrupo + i) % n]) : item.fotos.slice(0, n)

  const linea = lineaTarjeta(item)
  const lugar = lugarTarjeta(item)

  return (
    <div
      className={`absolute inset-0 flex flex-col rounded-[22px] overflow-hidden bg-black select-none ${arriba ? 'cursor-grab active:cursor-grabbing' : ''} ${modo === 'abajo' ? 'brightness-75' : ''}`}
      style={{ transform, transition: transicion, touchAction: arriba ? 'none' : undefined }}
      onPointerDown={arriba ? onPointerDown : undefined}
      onPointerMove={arriba ? onPointerMove : undefined}
      onPointerUp={arriba ? onPointerUp : undefined}
      onPointerCancel={arriba ? onPointerUp : undefined}
      aria-hidden={modo === 'abajo'}
    >
      {/* Fotos de a tres (de a dos en la ficha), de punta a punta; la última se funde a negro */}
      <div data-fotos className="relative flex-1 min-h-0 flex flex-col gap-[2px] bg-black">
        {fotos.map((src, i) => (
          <div key={`${src}-${i}`} className="relative flex-1 min-h-0 bg-neutral-800 overflow-hidden">
            <Image
              src={src}
              alt={`${item.titulo} — foto ${p * porGrupo + i + 1}`}
              fill
              draggable={false}
              sizes="(max-width: 480px) 100vw, 440px"
              className="object-cover pointer-events-none"
              style={estiloSinLogo(item.logo)}
              // Solo la de arriba del mazo abierto: la 'quieta' está al pie de la
              // ficha y no tiene que competir con las fotos de arriba.
              priority={arriba && i === 0}
            />
            {i === fotos.length - 1 && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0), #000)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Barritas: una por grupo de fotos (como Tinder) */}
      {pares > 1 && (
        <div className="absolute top-2 left-2.5 right-2.5 flex gap-1">
          {Array.from({ length: pares }, (_, i) => (
            <span key={i} className={`h-[3px] flex-1 rounded-full ${i === p ? 'bg-[#fff]' : 'bg-white/40'}`} />
          ))}
        </div>
      )}
      {guardada && (
        <span className="absolute top-[68px] left-3 grid h-7 w-7 place-items-center rounded-full bg-black/40 backdrop-blur-sm" style={{ color: '#45D98B' }} aria-label="Te gusta">
          <Corazon lleno className="w-4 h-4" />
        </span>
      )}
      {arriba && onAmpliar && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onAmpliar(Math.min(p * porGrupo, Math.max(0, n - 1)))
          }}
          aria-label="Ver la foto en grande"
          className="absolute top-[68px] right-3 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md"
        >
          <Expand className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {/* Sello mientras arrastra (o al decidir con los botones) */}
      {sello && (
        <span
          className={`absolute ${SELLOS[sello].clase} rounded-xl border-4 px-3 py-1 text-[24px] font-black tracking-wide font-raleway bg-black/25 whitespace-nowrap pointer-events-none`}
          style={{ borderColor: SELLOS[sello].color, color: SELLOS[sello].color, opacity: fuerzaSello }}
        >
          {SELLOS[sello].texto}
        </span>
      )}

      {/* Los datos, sobre negro debajo de las fotos (los botones flotan más abajo) */}
      <div className={`relative flex-none bg-black pt-1 pointer-events-none ${conBotones ? 'pb-[88px]' : ''}`}>
        <div data-datos className="px-4 pb-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <p className="whitespace-nowrap text-[27px] font-bold font-numeric leading-none tracking-tight">{item.precio}</p>
            {/* Solo en el mazo abierto: en la ficha la tarjeta entera es un botón (no se anida otro). */}
            {arriba && onDetalles && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  onDetalles()
                }}
                aria-label="Ver detalles"
                className="pointer-events-auto grid h-8 w-8 flex-none place-items-center rounded-full border-[1.5px] border-white/75 text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 11v6M12 7.5v.01" />
                </svg>
              </button>
            )}
          </div>
          {linea && <p className="mt-1.5 font-numeric text-[16px] font-semibold text-white/90">{linea}</p>}
          <p className="mt-1 flex items-center gap-1.5 min-w-0 text-[14px] text-white/70">
            {item.esNuestra ? (
              <IsotipoSI className="h-[15px] w-auto" />
            ) : (
              // "Otra inmobiliaria" en la etiqueta (antes "En red" + la cola del renglón, que se cortaba con direcciones largas).
              <span className="flex-none rounded-full border border-white/25 bg-white/10 px-2 py-[1px] text-[13px] font-bold text-white/90">Otra inmobiliaria</span>
            )}
            {/* "Cerca mío": a cuánto está, siempre entero (la dirección es la que se corta). */}
            {item.distanciaM != null && (
              <span className="flex-none font-numeric font-semibold text-white/90">
                a {formatDistanceAR(metrosVisibles(item.distanciaM) / 1000)}
                {lugar ? ' ·' : ''}
              </span>
            )}
            <span className="truncate">
              {lugar}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

/** Mientras arrastra, el botón de ese lado se agranda y se pinta (como Tinder). */
export type Tendencia = { dir: Salida | null; fuerza: number }

export function BotonesTinder({
  onPaso,
  onMeGusta,
  onVolver,
  onQuieroVerla,
  puedeVolver = false,
  chicos = false,
  tendencia = null,
  sobreFoto = false,
}: {
  onPaso: () => void
  onMeGusta: () => void
  /** ↺ volver a la anterior (como el de Tinder). Sin esto, no se muestra. */
  onVolver?: () => void
  /** ★ "Quiero conocerla" (el super like): coordinar la visita. Sin esto, no se muestra. */
  onQuieroVerla?: () => void
  puedeVolver?: boolean
  chicos?: boolean
  tendencia?: Tendencia | null
  /**
   * Flotando SOBRE la foto, como Tinder (David 5-oct: "usan casi toda la
   * pantalla para la foto, los menús están dentro de las fotos"): vidrio oscuro
   * con los íconos de color. Sin esto, blancos debajo (la ficha).
   */
  sobreFoto?: boolean
}) {
  const grande = chicos ? 'w-14 h-14' : sobreFoto ? 'w-[60px] h-[60px]' : 'w-16 h-16'
  const iconoGrande = chicos ? 'w-7 h-7' : 'w-8 h-8'
  const chico = chicos ? 'w-11 h-11' : sobreFoto ? 'w-12 h-12' : 'w-[52px] h-[52px]'
  const base = sobreFoto
    ? 'pointer-events-auto rounded-full bg-black/35 border border-white/25 backdrop-blur-md shadow-[0_6px_18px_rgba(0,0,0,0.25)] grid place-items-center transition-[transform,background-color,color] duration-150 active:scale-90'
    : 'rounded-full bg-white border border-gray-100 shadow-[0_6px_18px_rgba(0,0,0,0.12)] grid place-items-center transition-[transform,background-color,color] duration-150 active:scale-90'
  // Sobre la foto oscura los colores van más claros (el verde de marca no se lee sobre negro).
  const color = sobreFoto
    ? { pass: '#FF6B6F', super: '#5AAEFF', like: '#45D98B', volver: '#FFC94D' }
    : { pass: ROJO_PASO, super: AZUL_VISITA, like: CORAZON, volver: ORO_VOLVER }
  const pintar = (dir: Salida, color: string): React.CSSProperties => {
    const f = tendencia?.dir === dir ? Math.min(1, tendencia.fuerza) : 0
    if (f <= 0) return { color }
    return { color: f > 0.55 ? '#fff' : color, background: `rgba(${RGB[dir]},${0.12 + 0.88 * f})`, borderColor: 'transparent', transform: `scale(${1 + 0.14 * f})` }
  }
  return (
    <div className={`flex items-center justify-center ${onVolver || onQuieroVerla ? 'gap-4' : 'gap-8'}`}>
      {onVolver && (
        <button
          type="button"
          onClick={onVolver}
          disabled={!puedeVolver}
          aria-label="Volver a la anterior"
          title="Volver a la anterior"
          className={`${chico} ${base} disabled:opacity-35 disabled:active:scale-100`}
          style={{ color: color.volver }}
        >
          <RotateCcw className="w-6 h-6" strokeWidth={2.6} />
        </button>
      )}
      <button type="button" onClick={onPaso} aria-label="Paso" className={`${grande} ${base}`} style={pintar('pass', color.pass)}>
        <X className={iconoGrande} strokeWidth={3} />
      </button>
      {onQuieroVerla && (
        <button type="button" onClick={onQuieroVerla} aria-label="Quiero conocerla: coordinar una visita" title="Quiero conocerla" className={`${chico} ${base}`} style={pintar('super', color.super)}>
          <Star className="w-6 h-6" fill="currentColor" strokeWidth={1.5} />
        </button>
      )}
      <button type="button" onClick={onMeGusta} aria-label="Me gusta" className={`${grande} ${base}`} style={pintar('like', color.like)}>
        <Corazon lleno className={iconoGrande} />
      </button>
    </div>
  )
}
