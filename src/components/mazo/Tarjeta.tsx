'use client'

// La TARJETA del Tinder y sus botones ↺ ✕ ★ ♥ (David, 3/4-oct-2026). Las usan
// el mazo abierto (MazoCasas) y la ficha (la primera tarjeta, 'quieta').

import Image from 'next/image'
import { Expand, Info, MapPin, RotateCcw, Star, X } from 'lucide-react'
import { type ItemFeed, estiloSinLogo } from '@/lib/feed-en-red'
import { MAX_FOTOS_MAZO } from '@/lib/mazo-items'
import { AZUL_VISITA, CORAZON, Chip, Corazon, IconoRed, IsotipoSI, ORO_VOLVER, ROJO_PASO, VERDE } from './marca-mazo'

const RGB: Record<Salida, string> = { like: '26,92,56', pass: '229,72,77', super: '43,127,255' }
/** Cuánto hay que arrastrar la tarjeta para que cuente como ♥ o paso… */
export const UMBRAL_SWIPE = 90
/** …o hacia arriba para "Quiero verla". */
export const UMBRAL_SUPER = 110
export const DURACION_SALIDA = 300

/** ♥ (derecha), paso (izquierda) o "Quiero verla" (arriba, el super like de Tinder). */
export type Salida = 'like' | 'pass' | 'super'
/** `agarreArriba`: la agarró de la mitad de arriba (gira para un lado) o de abajo (para el otro), como Tinder. */
export type Arrastre = { dx: number; dy: number; agarreArriba?: boolean }

/** Hacia dónde va un arrastre (null = todavía no se movió lo suficiente). */
export function direccionDe(dx: number, dy: number, conSuper = true): Salida | null {
  if (conSuper && dy < -12 && Math.abs(dy) > Math.abs(dx) * 1.1) return 'super'
  if (Math.abs(dx) > 8) return dx > 0 ? 'like' : 'pass'
  return null
}

/** Cuántos pares de fotos tiene (se muestran de a 2, una arriba de la otra): hasta 5. */
export const paresDe = (item: ItemFeed) => Math.max(1, Math.ceil(Math.min(item.fotos.length, MAX_FOTOS_MAZO) / 2))

const SELLOS: Record<Salida, { texto: string; color: string; clase: string }> = {
  like: { texto: 'ME GUSTA', color: VERDE, clase: 'top-12 left-4 -rotate-12' },
  pass: { texto: 'PASO', color: ROJO_PASO, clase: 'top-12 right-4 rotate-12' },
  super: { texto: 'QUIERO VERLA', color: AZUL_VISITA, clase: 'top-[30%] left-1/2 -translate-x-1/2 -rotate-6' },
}

/**
 * Una tarjeta del mazo, con la estética de Tinder (David 4-oct): la foto ocupa
 * TODA la tarjeta y los datos van encima, sobre un degradé oscuro. Las fotos de
 * las casas son apaisadas: UNA sola en una tarjeta vertical queda recortada y
 * agrandada ("estirada", David 3-oct), así que siguen de a DOS, una arriba de
 * la otra (ahora más altas: casi en su forma). Tocar el costado de las fotos
 * pasa al siguiente par (barritas arriba); tocar los datos abre "Ver detalles".
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
  nota = null,
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
  /** Arrastrar hacia arriba = "Quiero verla" (en el mazo abierto). */
  conSuper?: boolean
  /** Los botones ↺ ✕ ★ ♥ flotan sobre la foto (mazo abierto): los datos suben para dejarles lugar. */
  conBotones?: boolean
  /** Un aviso cortito arriba de la foto (la primera: "Algunas las publican otras inmobiliarias…"). */
  nota?: string | null
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
  const pares = paresDe(item)
  const p = Math.min(par, pares - 1)
  // El último par de una cantidad impar vuelve a la primera foto: nunca una sola estirada.
  const fotos = n > 1 ? [item.fotos[(p * 2) % n], item.fotos[(p * 2 + 1) % n]] : item.fotos.slice(0, 1)
  const direccion = item.direccion || item.zona

  return (
    <div
      className={`absolute inset-0 rounded-3xl overflow-hidden bg-gray-900 shadow-[0_10px_28px_rgba(0,0,0,0.18)] select-none ${arriba ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{ transform, transition: transicion, touchAction: arriba ? 'none' : undefined }}
      onPointerDown={arriba ? onPointerDown : undefined}
      onPointerMove={arriba ? onPointerMove : undefined}
      onPointerUp={arriba ? onPointerUp : undefined}
      onPointerCancel={arriba ? onPointerUp : undefined}
      aria-hidden={modo === 'abajo'}
    >
      {/* Fotos de a dos, de punta a punta */}
      <div data-fotos className="absolute inset-0 flex flex-col gap-[2px] bg-white">
        {fotos.map((src, i) => (
          <div key={`${src}-${i}`} className="relative flex-1 min-h-0 bg-gray-200 overflow-hidden">
            <Image
              src={src}
              alt={`${item.titulo} — foto ${p * 2 + i + 1}`}
              fill
              draggable={false}
              sizes="(max-width: 480px) 100vw, 440px"
              className="object-cover pointer-events-none"
              style={estiloSinLogo(item.logo)}
              // Solo la de arriba del mazo abierto: la 'quieta' está al pie de la
              // ficha y no tiene que competir con las fotos de arriba.
              priority={arriba && i === 0}
            />
          </div>
        ))}
      </div>

      {/* Barritas: una por par de fotos (como Tinder) */}
      {pares > 1 && (
        <div className="absolute top-2 left-3 right-3 flex gap-1">
          {Array.from({ length: pares }, (_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.25)] ${i === p ? 'bg-white' : 'bg-white/45'}`} />
          ))}
        </div>
      )}
      <div className="absolute top-5 left-3 right-16 flex flex-wrap items-center gap-2">
        <Chip nuestra={item.esNuestra} />
        {item.masVista && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-gray-900 shadow-sm">De las más vistas</span>}
        {guardada && (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm" style={{ color: CORAZON }} aria-label="Te gusta">
            <Corazon lleno className="w-[18px] h-[18px]" />
          </span>
        )}
        {nota && <p className="basis-full max-w-[290px] rounded-xl bg-black/50 px-3 py-2 text-[13px] leading-snug text-white backdrop-blur-sm">{nota}</p>}
      </div>
      {arriba && onAmpliar && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onAmpliar(Math.min(p * 2, Math.max(0, n - 1)))
          }}
          aria-label="Ver la foto en grande"
          className="absolute top-4 right-3 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm"
        >
          <Expand className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {/* Sello mientras arrastra (o al decidir con los botones) */}
      {sello && (
        <span
          className={`absolute ${SELLOS[sello].clase} rounded-xl border-[5px] px-3 py-1 text-[28px] font-black tracking-wide font-raleway bg-white/85 whitespace-nowrap pointer-events-none`}
          style={{ borderColor: SELLOS[sello].color, color: SELLOS[sello].color, opacity: fuerzaSello }}
        >
          {SELLOS[sello].texto}
        </span>
      )}

      {/* Datos SOBRE la foto, en un degradé (como Tinder) */}
      <div
        className={`absolute inset-x-0 bottom-0 pt-14 [@media(max-height:720px)]:pt-8 pointer-events-none ${conBotones ? 'pb-[92px]' : ''}`}
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.62) 55%, rgba(0,0,0,0) 100%)' }}
      >
        <div data-datos className="px-4 pb-4 [@media(max-height:720px)]:pb-3 text-white">
          <p className="whitespace-nowrap text-[30px] [@media(max-height:720px)]:text-[26px] font-black font-numeric leading-none [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]">{item.precio}</p>
          {item.datos && <p className="mt-1.5 text-[16px] font-medium font-poppins text-white/95">{item.datos}</p>}
          {direccion && (
            <p className="mt-1 flex items-center gap-1.5 min-w-0 text-[15px] text-white/90">
              <MapPin className="w-4 h-4 flex-none" aria-hidden="true" />
              <span className="truncate">{direccion}</span>
            </p>
          )}
          {/* "Ver detalles" en el renglón de la inmobiliaria (que tiene lugar): al
              lado del precio no entraba en el celu chico y se salía de la tarjeta. */}
          <div className="mt-2 flex items-center justify-between gap-2 min-w-0">
            <p className="flex items-center gap-1.5 min-w-0 text-[13px] text-white/85">
              {item.esNuestra ? <IsotipoSI className="h-[18px] w-auto" /> : <IconoRed className="w-4 h-4 flex-none" />}
              <span className="truncate">{item.esNuestra ? 'SI Inmobiliaria' : 'Otra inmobiliaria'}</span>
            </p>
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
                className="pointer-events-auto flex-none inline-flex h-10 items-center gap-1.5 rounded-full border border-white/35 bg-white/20 px-3.5 text-[14px] font-bold text-white backdrop-blur-md font-raleway"
              >
                <Info className="h-4 w-4" aria-hidden="true" /> Ver detalles
              </button>
            )}
          </div>
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
  /** ★ "Quiero verla" (el super like): coordinar la visita. Sin esto, no se muestra. */
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
        <button type="button" onClick={onQuieroVerla} aria-label="Quiero verla: coordinar una visita" title="Quiero verla" className={`${chico} ${base}`} style={pintar('super', color.super)}>
          <Star className="w-6 h-6" fill="currentColor" strokeWidth={1.5} />
        </button>
      )}
      <button type="button" onClick={onMeGusta} aria-label="Me gusta" className={`${grande} ${base}`} style={pintar('like', color.like)}>
        <Corazon lleno className={iconoGrande} />
      </button>
    </div>
  )
}
