'use client'

// El MAZO tipo Tinder (David, 3-oct-2026), sobre fondo blanco: de a una
// tarjeta, primero las nuestras (con el isotipo de SI) y después las "En red" (otras
// inmobiliarias de la zona, dicho abiertamente). Deslizar a la derecha = ♥,
// a la izquierda = paso (o los botones ✕ / ♥, o las flechas del teclado).
// Tocar el costado de las fotos pasa de par. Al final, las elegidas en grande
// con el formulario; al salir con alguna guardada, la hoja de nombre y
// WhatsApp; si no guarda ninguna, el rescate (una vez por visita). La
// consulta entra a Hilo con todo lo que marcó.
//
// Lo abren la ficha ("Más casas en <barrio>", solo abajo de todo) y "Conocé
// tu próximo hogar" de la home. Se monta al abrir y se desmonta al cerrar.
//
// 4-oct (David): el botón ↺ vuelve a la anterior (si le había dado ♥, se lo
// saca: decide de nuevo), y al terminar un barrio con parecidos
// (barrios-parecidos.ts) PRIMERO pregunta y, si dice que sí, suma esas casas.
//
// 4-oct (David: "que puedan dejar su mail y ya prefiltramos su búsqueda para
// campañas de mailing"): "Recibí las nuevas por mail" (SuscripcionMail) al
// final, en el rescate (WhatsApp O mail) y como campo opcional del formulario.
// La búsqueda (`criterios`) viaja con el mail y Hilo la escribe en el contacto.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Expand, Info, Mail, MapPin, RotateCcw, Star, X } from 'lucide-react'
import {
  type CriteriosBusqueda,
  type GuardadaLocal,
  type ItemFeed,
  type PosicionLogo,
  esEmail,
  escribirContacto,
  escribirGuardadas,
  estiloSinLogo,
  leerContacto,
  leerGuardadas,
  textoBusqueda,
} from '@/lib/feed-en-red'
import { trackEvent, trackFbEvent } from '@/lib/analytics'
import { Logo } from '@/components/marca/LogoSI'
import { barriosParecidos, listaBarrios } from '@/lib/barrios-parecidos'
import { MAX_FOTOS_MAZO, completarFotos } from '@/lib/mazo-items'
import { marcarMazoAbierto } from '@/lib/mazo-atras'
import DetalleMazo, { cargarDetalle } from './DetalleMazo'
import VisorFotos from './VisorFotos'
import { contarTinder, type OrigenTinder } from '@/lib/tinder-contador'
import { haptico } from '@/lib/haptico'

export const VERDE = '#1A5C38'
const OCRE_FONDO = '#F4EAD8'
const OCRE_TEXTO = '#7A5212'
/**
 * El ♥ del Tinder es VERDE (David 4-oct: "darle más la estética de Tinder": en
 * Tinder el me gusta es verde y el paso rojo; acá el verde es el de la marca).
 * Antes era rosa. Lo usan también la ficha y "Conocé tu próximo hogar".
 */
export const CORAZON = VERDE
const ROJO_PASO = '#E5484D'
const AZUL_VISITA = '#2B7FFF'
const ORO_VOLVER = '#D99A00'
const RGB: Record<Salida, string> = { like: '26,92,56', pass: '229,72,77', super: '43,127,255' }
/** Cuánto hay que arrastrar la tarjeta para que cuente como ♥ o paso… */
const UMBRAL_SWIPE = 90
/** …o hacia arriba para "Quiero verla". */
const UMBRAL_SUPER = 110
/** Un latigazo corto también decide (como Tinder): px por milisegundo. */
const VELOCIDAD_LATIGAZO = 0.6
const DURACION_SALIDA = 300

/** El instructivo se muestra una vez por navegador. */
const CLAVE_GUIA = 'si-mazo-guia-v2'

/** El rescate sale UNA vez por visita (aunque abra el mazo varias veces). */
let rescateMostrado = false
/** ♥ dados en esta visita y qué "match" ya se le mostró (cada uno una vez por visita). */
let likesVisita = 0
const matchesVistos = new Set<'match' | 'tres'>()

/**
 * Las ♥ de este navegador (localStorage: sobreviven al pasar de una ficha a
 * otra). `montado` = ya se leyó el almacenamiento (antes, nada se muestra
 * guardado: evita el desfasaje con el HTML del servidor).
 */
export function useGuardadas(origen?: OrigenTinder) {
  const [guardadas, setGuardadas] = useState<GuardadaLocal[]>([])
  const [montado, setMontado] = useState(false)
  const actuales = useRef<GuardadaLocal[]>([])
  useEffect(() => {
    actuales.current = leerGuardadas()
    setGuardadas(actuales.current)
    setMontado(true)
  }, [])
  const guardar = useCallback((item: ItemFeed) => {
    if (actuales.current.some((g) => g.key === item.key)) return
    const next = [...actuales.current, { key: item.key, foto: item.fotos[0] ?? null, precio: item.precio, esNuestra: item.esNuestra, logo: item.logo ?? null }].slice(-12)
    actuales.current = next
    setGuardadas(next)
    escribirGuardadas(next)
    trackEvent('feed_en_red_like', { tipo: item.esNuestra ? 'nuestra' : 'en_red' })
    if (origen) contarTinder('like', origen)
  }, [origen])
  /** Sacar el ♥ (la fila de la compu permite arrepentirse). */
  const quitar = useCallback((key: string) => {
    const next = actuales.current.filter((g) => g.key !== key)
    if (next.length === actuales.current.length) return
    actuales.current = next
    setGuardadas(next)
    escribirGuardadas(next)
  }, [])
  const limpiar = useCallback(() => {
    actuales.current = []
    setGuardadas([])
    escribirGuardadas([])
  }, [])
  const esGuardada = useCallback((key: string) => guardadas.some((g) => g.key === key), [guardadas])
  return { guardadas, guardar, quitar, limpiar, esGuardada, montado }
}

/**
 * El isotipo OFICIAL de SI (placa verde + monograma; kit de marca en
 * si-crm/logo-si-inmobiliaria, copiado tal cual en components/marca/LogoSI).
 * Antes era una pastilla con las letras "SI" escritas y un tilde genérico.
 */
export function IsotipoSI({ className = 'h-4 w-auto' }: { className?: string }) {
  return <Logo variant="isotipo" className={`${className} flex-none`} />
}

export function IconoRed({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="5" cy="12" r="2.5" />
      <circle cx="19" cy="6" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <path d="M7.3 10.9l9.4-3.8M7.3 13.1l9.4 3.8" />
    </svg>
  )
}

export function Corazon({ lleno, className = 'w-7 h-7' }: { lleno: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.4-9.3-9A5 5 0 0 1 12 6.6a5 5 0 0 1 9.3 4.9c-1.8 4.6-9.3 9-9.3 9z"
        fill={lleno ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Chip({ nuestra }: { nuestra: boolean }) {
  return nuestra ? (
    // Sin caja alrededor: el isotipo ya es la placa (regla del kit: no encerrarlo).
    <IsotipoSI className="h-7 w-auto" />
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-raleway shadow-sm" style={{ background: OCRE_FONDO, color: OCRE_TEXTO }}>
      <IconoRed className="w-3 h-3" /> En red
    </span>
  )
}

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
const paresDe = (item: ItemFeed) => Math.max(1, Math.ceil(Math.min(item.fotos.length, MAX_FOTOS_MAZO) / 2))

const SELLOS: Record<Salida, { texto: string; color: string; clase: string }> = {
  like: { texto: 'ME GUSTA', color: VERDE, clase: 'top-12 left-4 -rotate-12' },
  pass: { texto: 'PASO', color: ROJO_PASO, clase: 'top-12 right-4 rotate-12' },
  super: { texto: 'QUIERO VERLA', color: AZUL_VISITA, clase: 'bottom-[38%] left-1/2 -translate-x-1/2 -rotate-6' },
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
      <div className="absolute top-5 left-3 flex items-center gap-2">
        <Chip nuestra={item.esNuestra} />
        {item.masVista && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-gray-900 shadow-sm">De las más vistas</span>}
        {guardada && (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm" style={{ color: CORAZON }} aria-label="Te gusta">
            <Corazon lleno className="w-[18px] h-[18px]" />
          </span>
        )}
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
      <div className="absolute inset-x-0 bottom-0 pt-14 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.6) 55%, rgba(0,0,0,0) 100%)' }}>
        <div data-datos className="px-4 pb-4 text-white">
          <p className="whitespace-nowrap text-[30px] font-black font-numeric leading-none [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]">{item.precio}</p>
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
}) {
  const grande = chicos ? 'w-14 h-14' : 'w-16 h-16'
  const iconoGrande = chicos ? 'w-7 h-7' : 'w-8 h-8'
  const chico = chicos ? 'w-11 h-11' : 'w-[52px] h-[52px]'
  const base =
    'rounded-full bg-white border border-gray-100 shadow-[0_6px_18px_rgba(0,0,0,0.12)] grid place-items-center transition-[transform,background-color,color] duration-150 active:scale-90'
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
          style={{ color: ORO_VOLVER }}
        >
          <RotateCcw className="w-6 h-6" strokeWidth={2.6} />
        </button>
      )}
      <button type="button" onClick={onPaso} aria-label="Paso" className={`${grande} ${base}`} style={pintar('pass', ROJO_PASO)}>
        <X className={iconoGrande} strokeWidth={3} />
      </button>
      {onQuieroVerla && (
        <button type="button" onClick={onQuieroVerla} aria-label="Quiero verla: coordinar una visita" title="Quiero verla" className={`${chico} ${base}`} style={pintar('super', AZUL_VISITA)}>
          <Star className="w-6 h-6" fill="currentColor" strokeWidth={1.5} />
        </button>
      )}
      <button type="button" onClick={onMeGusta} aria-label="Me gusta" className={`${grande} ${base}`} style={pintar('like', CORAZON)}>
        <Corazon lleno className={iconoGrande} />
      </button>
    </div>
  )
}

type EstadoHoja = { motivo: 'salir' | 'boton' } | null
/**
 * EL MATCH (David 4-oct: "que no termine sin sacarle algún dato o sin que nos
 * consulte por una propiedad o por varias"). Como el "¡Es un match!" de Tinder:
 * al primer ♥ de la visita, al tercero, y al tocar ★ "Quiero verla". Solo si
 * todavía no sabemos su WhatsApp; si ya lo dejó, no se interrumpe nada.
 */
type EstadoMatch = { modo: 'match' | 'tres' | 'visita'; item: ItemFeed } | null

export default function MazoCasas({
  items,
  titulo,
  barrio,
  inicio = 0,
  guardadasApi,
  onCerrar,
  origen,
  busqueda = null,
  criterios = null,
  cargarParecidos,
}: {
  items: ItemFeed[]
  titulo: string
  barrio: string | null
  inicio?: number
  guardadasApi: ReturnType<typeof useGuardadas>
  onCerrar: () => void
  origen: 'ficha' | 'home'
  /** Lo que eligió en la home ("casas hasta USD 200 mil"), para el aviso al asesor. */
  busqueda?: string | null
  /** Dónde, qué y hasta cuánto: viaja con el mail para los envíos (Hilo lo escribe en el contacto). */
  criterios?: CriteriosBusqueda | null
  /**
   * Trae las casas de los barrios parecidos (barrios-parecidos.ts). Sin esto
   * (o si el barrio no tiene parecidos) el mazo termina como siempre.
   */
  cargarParecidos?: (barrios: string[], yaVistas: ReadonlySet<string>) => Promise<ItemFeed[]>
}) {
  const { guardadas, guardar, quitar, limpiar, esGuardada } = guardadasApi
  // Las de los barrios parecidos entran DONDE está parado si dice que sí: al
  // final del mazo (la pregunta) o en medio (rescate → "Otra zona").
  const [insercion, setInsercion] = useState<{ en: number; items: ItemFeed[] } | null>(null)
  const todos = useMemo(
    () => (insercion ? [...items.slice(0, insercion.en), ...insercion.items, ...items.slice(insercion.en)] : items),
    [items, insercion],
  )
  const parecidos = useMemo(() => barriosParecidos(barrio), [barrio])
  // Las nuestras vienen del listado con las 5 fotos de la tarjeta: el mazo pide
  // las del álbum (hasta 10 = 5 pares, David 4-oct) de las casas que tiene.
  const [album, setAlbum] = useState<Record<string, string[]>>({})
  const pedidas = useRef(new Set<string>())
  useEffect(() => {
    const faltan = todos.filter((i) => i.esNuestra && i.key.startsWith('n:') && !pedidas.current.has(i.key)).slice(0, 16)
    if (!faltan.length) return
    faltan.forEach((i) => pedidas.current.add(i.key))
    const ids = faltan.map((i) => i.key.slice(2)).join(',')
    fetch(`/api/propiedades/fotos-mazo?ids=${ids}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { fotos?: Record<string, string[]> } | null) => {
        if (!d?.fotos) return
        setAlbum((a) => {
          const nuevo = { ...a }
          for (const [id, fotos] of Object.entries(d.fotos!)) if (Array.isArray(fotos)) nuevo[`n:${id}`] = fotos
          return nuevo
        })
      })
      .catch(() => {})
  }, [todos])
  const conFotos = useCallback(
    (i: ItemFeed | null): ItemFeed | null => (i && album[i.key] ? { ...i, fotos: completarFotos(i.fotos, album[i.key]) } : i),
    [album],
  )
  /** pendiente → (pregunta) → cargando → sumados | vacio | no. */
  const [estadoParecidos, setEstadoParecidos] = useState<'pendiente' | 'cargando' | 'sumados' | 'vacio' | 'no'>('pendiente')
  /** Para ↺: cada decisión, con si el ♥ fue nuevo (si ya estaba guardada de antes, volver no se la saca). */
  const [historial, setHistorial] = useState<{ indice: number; accion: Salida; key: string; nueva: boolean }[]>([])
  const [indice, setIndice] = useState(() => Math.min(Math.max(0, inicio), items.length))
  // Se abrió directo en las elegidas (botón de la fila de la compu): no "las vio todas".
  const [directoAlFinal, setDirectoAlFinal] = useState(() => inicio >= items.length)
  const [foto, setFoto] = useState(0)
  const [arrastre, setArrastre] = useState<Arrastre | null>(null)
  const [salida, setSalida] = useState<Salida | null>(null)
  const [hoja, setHoja] = useState<EstadoHoja>(null)
  const [match, setMatch] = useState<EstadoMatch>(null)
  /** Aviso cortito abajo ("Listo, te escribimos…"). */
  const [aviso, setAviso] = useState<string | null>(null)
  useEffect(() => {
    if (!aviso) return
    const t = window.setTimeout(() => setAviso(null), 3800)
    return () => window.clearTimeout(t)
  }, [aviso])
  /** Las que ya le mandamos a un asesor (no se le vuelven a pedir ni a mandar). */
  const [enviadas, setEnviadas] = useState<ReadonlySet<string>>(() => new Set<string>())
  const refrescarEnviadas = useCallback(() => setEnviadas(new Set(leerEnviadas())), [])
  useEffect(refrescarEnviadas, [refrescarEnviadas])
  const inicioArrastre = useRef<{ x: number; y: number; arriba: boolean } | null>(null)
  /** Últimos puntos del dedo: la velocidad decide el latigazo. */
  const muestras = useRef<{ x: number; y: number; t: number }[]>([])
  const cruzoUmbral = useRef(false)
  // Rescate: una vez por visita, cuando pasa 4 seguidas sin ♥ o se va sin guardar.
  const [rescate, setRescate] = useState<'mazo' | 'salir' | null>(null)
  const [rescateVisto, setRescateVisto] = useState(rescateMostrado)
  const pasesSeguidos = useRef(0)
  const [vistas, setVistas] = useState(0)
  /**
   * Ya mandó la consulta: desde el final ('linea', el "Listo" queda a la vista
   * aunque las ♥ se limpien) o desde la hoja de salida ('hoja'). Después de eso
   * nunca se le pregunta de nuevo (ni la hoja ni el rescate).
   */
  const [enviada, setEnviada] = useState<'linea' | 'hoja' | null>(null)
  /**
   * INSTRUCTIVO (David 4-oct: "un instructivo sencillo para insinuar cómo se
   * maneja"): la primera vez en este celu, la tarjeta se mueve sola a la
   * derecha (ME GUSTA) y a la izquierda (PASO) y un cartel lo dice en pocos
   * renglones. Se va con "¡Entendido!" o tocando en cualquier lado.
   */
  const [guia, setGuia] = useState(false)
  const [guiaDx, setGuiaDx] = useState<number | null>(null)
  useEffect(() => {
    let vista = true
    try {
      vista = window.localStorage.getItem(CLAVE_GUIA) === '1'
    } catch {
      vista = false
    }
    if (vista || inicio >= items.length) return
    setGuia(true)
    const pasos: [number, number | null][] = [[700, 90], [1500, -90], [2300, null], [3300, 90], [4100, -90], [4900, null]]
    const timers = pasos.map(([t, dx]) => window.setTimeout(() => setGuiaDx(dx), t))
    return () => timers.forEach((t) => window.clearTimeout(t))
    // Solo al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const cerrarGuia = () => {
    setGuia(false)
    setGuiaDx(null)
    try {
      window.localStorage.setItem(CLAVE_GUIA, '1')
    } catch {
      /* sin almacenamiento: se vuelve a mostrar la próxima vez */
    }
    trackEvent('feed_en_red_guia', { origen })
  }

  const marcarRescate = useCallback((momento: 'mazo' | 'salir') => {
    rescateMostrado = true
    setRescateVisto(true)
    setRescate(momento)
  }, [])

  useEffect(() => {
    trackEvent('feed_en_red_abrir', { cantidad: items.length, origen })
    contarTinder('abrir', origen)
    // Solo al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** "Ver detalles" abierto (de la tarjeta de arriba). */
  const [detalle, setDetalle] = useState(false)
  /** Foto en grande abierta: desde qué foto (de la tarjeta de arriba). */
  const [visor, setVisor] = useState<number | null>(null)
  const abrirDetalle = () => {
    setDetalle(true)
    contarTinder('detalles', origen)
  }
  const abrirVisor = (desde: number) => {
    setVisor(desde)
    contarTinder('foto', origen)
  }
  const actual = conFotos(todos[indice] ?? null)
  const siguiente = conFotos(todos[indice + 1] ?? null)
  const terminado = indice >= todos.length
  // Los detalles de la de arriba se piden solos al rato: "Ver detalles" abre al instante.
  const claveArriba = todos[indice]?.key ?? null
  useEffect(() => {
    if (!claveArriba) return
    const t = window.setTimeout(() => void cargarDetalle(claveArriba), 700)
    return () => window.clearTimeout(t)
  }, [claveArriba])

  const pendientes = useMemo(() => guardadas.filter((g) => !enviadas.has(g.key)), [guardadas, enviadas])

  /** ★ con el WhatsApp ya conocido: se manda en el momento, sin preguntar nada. */
  const pedirVisitaDirecto = useCallback(
    (c: { nombre: string; whatsapp: string }, item: ItemFeed) => {
      const keys = Array.from(new Set([item.key, ...pendientes.map((g) => g.key)]))
      void mandarConsulta({ nombre: c.nombre, whatsapp: c.whatsapp, keys, barrio, busqueda, origen, visita: true }).then((r) => {
        refrescarEnviadas()
        setAviso(r.ok ? `Listo, ${c.nombre.split(/\s+/)[0]}: un asesor te escribe para coordinar la visita.` : r.error)
      })
    },
    [pendientes, barrio, busqueda, origen, refrescarEnviadas],
  )

  /** ♥, paso o ★: la tarjeta sale volando y aparece la siguiente. */
  const decidir = useCallback(
    (accion: Salida) => {
      if (!actual || salida || rescate || guia || match) return
      const yaEstaba = esGuardada(actual.key)
      setHistorial((h) => [...h.slice(-30), { indice, accion, key: actual.key, nueva: accion === 'like' && !yaEstaba }])
      if (accion === 'pass') {
        pasesSeguidos.current += 1
      } else {
        guardar(actual)
        pasesSeguidos.current = 0
      }
      haptico(accion !== 'pass')
      // 4 seguidas con ✕ y ninguna guardada: no es lo que busca → rescate.
      const rescatar = accion === 'pass' && guardadas.length === 0 && !enviada && pasesSeguidos.current >= 4 && !rescateVisto && indice + 1 < todos.length
      let abrirMatch: EstadoMatch = null
      const contacto = contactoListo()
      if (accion === 'super') {
        contarTinder('quiero_verla', origen)
        trackEvent('feed_en_red_quiero_verla', { tipo: actual.esNuestra ? 'nuestra' : 'en_red' })
        if (contacto) pedirVisitaDirecto(contacto, actual)
        else abrirMatch = { modo: 'visita', item: actual }
      } else if (accion === 'like' && !yaEstaba) {
        likesVisita += 1
        const modo = likesVisita === 1 ? 'match' : likesVisita === 3 ? 'tres' : null
        if (modo && !contacto && !enviada && !matchesVistos.has(modo)) {
          matchesVistos.add(modo)
          abrirMatch = { modo, item: actual }
        }
      }
      setSalida(accion)
      setVistas((v) => Math.max(v, indice + 1))
      window.setTimeout(() => {
        setIndice((i) => i + 1)
        setFoto(0)
        setArrastre(null)
        setSalida(null)
        if (rescatar) marcarRescate('mazo')
        if (abrirMatch) {
          setMatch(abrirMatch)
          contarTinder('match', origen)
        }
      }, DURACION_SALIDA)
    },
    [actual, salida, rescate, guia, match, rescateVisto, enviada, guardar, esGuardada, guardadas.length, indice, todos.length, marcarRescate, origen, pedirVisitaDirecto],
  )

  /** ↺ Volver a la anterior: si le había dado ♥ recién, se lo saca y decide de nuevo. */
  const volver = useCallback(() => {
    if (salida || rescate || enviada || match) return
    const ultima = historial[historial.length - 1]
    if (!ultima) return
    setHistorial((h) => h.slice(0, -1))
    if (ultima.nueva) quitar(ultima.key)
    if (ultima.accion === 'pass') pasesSeguidos.current = Math.max(0, pasesSeguidos.current - 1)
    setIndice(ultima.indice)
    setFoto(0)
    setArrastre(null)
    trackEvent('feed_en_red_volver', { origen })
  }, [salida, rescate, enviada, match, historial, quitar, origen])
  const puedeVolver = historial.length > 0 && !enviada

  // Terminó un barrio que tiene parecidos: PRIMERO pregunta (David 4-oct).
  const preguntaParecidos =
    terminado &&
    !directoAlFinal &&
    !enviada &&
    !!cargarParecidos &&
    parecidos.length > 0 &&
    (estadoParecidos === 'pendiente' || estadoParecidos === 'cargando' || estadoParecidos === 'vacio')
  /** Trae las de los barrios parecidos y las pone como las PRÓXIMAS tarjetas. */
  const sumarParecidas = async (desde: 'final' | 'rescate'): Promise<boolean> => {
    if (!cargarParecidos || estadoParecidos === 'cargando' || insercion) return false
    setEstadoParecidos('cargando')
    contarTinder('parecidos_si', origen)
    trackEvent('feed_en_red_parecidos', { respuesta: 'si', barrio: barrio ?? '', desde })
    const nuevas = await cargarParecidos(parecidos, new Set(todos.map((i) => i.key))).catch(() => [] as ItemFeed[])
    if (nuevas.length === 0) {
      // Desde el rescate no se le vuelve a preguntar al final (ya sabe que no hay).
      setEstadoParecidos(desde === 'final' ? 'vacio' : 'no')
      return false
    }
    setInsercion({ en: indice, items: nuevas })
    setEstadoParecidos('sumados')
    setFoto(0)
    pasesSeguidos.current = 0
    return true
  }
  const verParecidos = () => void sumarParecidas('final')
  // El rescate ("¿No es lo que buscás?" → "Otra zona") también los ofrece, si
  // todavía no se le preguntó.
  const ofrecerEnRescate = !!cargarParecidos && parecidos.length > 0 && estadoParecidos === 'pendiente'
  const parecidasDesdeRescate = async (): Promise<boolean> => {
    const ok = await sumarParecidas('rescate')
    if (ok) setRescate(null)
    return ok
  }
  const noParecidos = () => {
    trackEvent('feed_en_red_parecidos', { respuesta: 'no', barrio: barrio ?? '' })
    setEstadoParecidos('no')
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (salida) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const r = e.currentTarget.getBoundingClientRect()
    inicioArrastre.current = { x: e.clientX, y: e.clientY, arriba: e.clientY < r.top + r.height / 2 }
    muestras.current = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }]
    cruzoUmbral.current = false
    setArrastre({ dx: 0, dy: 0, agarreArriba: inicioArrastre.current.arriba })
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ini = inicioArrastre.current
    if (!ini) return
    const dx = e.clientX - ini.x
    const dy = e.clientY - ini.y
    muestras.current = [...muestras.current.filter((m) => e.timeStamp - m.t < 120), { x: e.clientX, y: e.clientY, t: e.timeStamp }]
    // Un golpecito al cruzar el punto en que la tarjeta ya se va (como Tinder).
    const dir = direccionDe(dx, dy)
    const fuera = dir === 'super' ? -dy > UMBRAL_SUPER : dir !== null && Math.abs(dx) > UMBRAL_SWIPE
    if (fuera !== cruzoUmbral.current) {
      cruzoUmbral.current = fuera
      if (fuera) haptico()
    }
    setArrastre({ dx, dy, agarreArriba: ini.arriba })
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const ini = inicioArrastre.current
    inicioArrastre.current = null
    if (!ini || !actual) return setArrastre(null)
    const dx = e.clientX - ini.x
    const dy = e.clientY - ini.y
    // Velocidad de los últimos ~120 ms: un latigazo corto también decide.
    const ms = muestras.current
    const a = ms[0]
    const b = ms[ms.length - 1]
    const dt = a && b ? Math.max(1, b.t - a.t) : 1
    const vx = a && b ? (b.x - a.x) / dt : 0
    const vy = a && b ? (b.y - a.y) / dt : 0
    const dir = direccionDe(dx, dy)
    if (dir === 'super' && (-dy > UMBRAL_SUPER || (vy < -VELOCIDAD_LATIGAZO && -dy > 40))) return decidir('super')
    if (
      (dir === 'like' || dir === 'pass') &&
      (Math.abs(dx) > UMBRAL_SWIPE || (Math.abs(vx) > VELOCIDAD_LATIGAZO && Math.abs(dx) > 30 && Math.sign(vx) === Math.sign(dx)))
    ) {
      return decidir(dir)
    }
    setArrastre(null)
    if (Math.abs(dx) >= 6 || Math.abs(dy) >= 6) return
    // Un toque (sin arrastrar): sobre los datos = "Ver detalles"; sobre las
    // fotos, mitad izquierda = par anterior, derecha = siguiente (como Tinder).
    const datos = e.currentTarget.querySelector('[data-datos]')?.getBoundingClientRect()
    if (datos && e.clientY >= datos.top) {
      abrirDetalle()
      return
    }
    const pares = paresDe(actual)
    if (pares > 1) {
      const zona = e.currentTarget.getBoundingClientRect()
      const derecha = e.clientX - zona.left > zona.width / 2
      setFoto((f) => (derecha ? Math.min(f + 1, pares - 1) : Math.max(f - 1, 0)))
    }
  }

  // Llegó al final sin guardar ninguna: ese final YA es el rescate de esta
  // visita (antes, al tocar la X ahí salía otro "¿Te vas sin guardar ninguna?").
  const finContado = useRef(false)
  useEffect(() => {
    if (terminado && !directoAlFinal && !finContado.current) {
      finContado.current = true
      contarTinder('final', origen)
    }
  }, [terminado, directoAlFinal, origen])
  const finEsRescate = terminado && !preguntaParecidos && guardadas.length === 0 && !enviada && !rescateVisto
  useEffect(() => {
    if (finEsRescate) rescateMostrado = true
  }, [finEsRescate])

  const verDeNuevo = () => {
    setDirectoAlFinal(false)
    setRescateVisto(rescateMostrado)
    pasesSeguidos.current = 0
    setRescate(null)
    setIndice(0)
    setFoto(0)
    setArrastre(null)
    setSalida(null)
  }
  const cerrarTodo = () => {
    setHoja(null)
    setRescate(null)
    setMatch(null)
    onCerrar()
  }
  /** Todas sus ♥ ya están con un asesor: se limpian al irse (como al mandar desde el final). */
  const cerrarYaConsultadas = () => {
    limpiar()
    cerrarTodo()
  }
  const salir = () => {
    // Ya mandó la consulta, o el formulario ya está a la vista (final con
    // elegidas): sale directo, sin repetirle el mismo formulario en una hoja.
    if (enviada || (terminado && pendientes.length > 0)) return cerrarTodo()
    // ♥ que todavía no nos mandó: "¡No pierdas tus elegidas!".
    if (pendientes.length > 0) return setHoja({ motivo: 'salir' })
    // Le gustaron y ya las tiene un asesor (match o ★): se va tranquilo.
    if (guardadas.length > 0) return cerrarYaConsultadas()
    // Se va sin guardar ninguna después de mirar algunas: una pregunta rápida.
    if (!rescateVisto && !finEsRescate && vistas > 0) return marcarRescate('salir')
    cerrarTodo()
  }

  // ATRÁS DEL NAVEGADOR (David 4-oct: "mi mamá corrió para el costado de la foto
  // y cerró el Tinder sin que le pida los datos"). En el iPhone, deslizar desde
  // el borde izquierdo es "atrás" de Safari: sacaba de la página sin pasar por
  // la pregunta de la X. Al abrir se agrega una entrada propia al historial
  // (misma URL); el gesto o el botón Atrás solo la sacan a ella y acá se hace lo
  // mismo que la X: pregunta (♥ → sus datos; sin ♥ → el rescate) y se queda.
  // Si insiste (atrás otra vez con la pregunta a la vista), recién ahí sale.
  const porAtras = useRef<() => boolean>(() => false)
  porAtras.current = () => {
    if (guia) {
      cerrarGuia()
      return true
    }
    if (visor != null) {
      setVisor(null)
      return true
    }
    if (detalle) {
      setDetalle(false)
      return true
    }
    if (match) {
      setMatch(null)
      return true
    }
    if (hoja?.motivo === 'salir' || rescate === 'salir') {
      cerrarTodo()
      return false
    }
    if (hoja) {
      setHoja(null)
      return true
    }
    if (rescate === 'mazo') {
      setRescate(null)
      return true
    }
    if (enviada) {
      cerrarTodo()
      return false
    }
    // El formulario del final ya está a la vista: se queda ahí.
    if (terminado && pendientes.length > 0) return true
    if (pendientes.length > 0) {
      setHoja({ motivo: 'salir' })
      return true
    }
    if (guardadas.length > 0) {
      cerrarYaConsultadas()
      return false
    }
    if (!rescateVisto && !finEsRescate && vistas > 0) {
      marcarRescate('salir')
      return true
    }
    cerrarTodo()
    return false
  }
  // La entrada sobrevive al desmontar/montar de prueba de React (StrictMode en
  // desarrollo): el back() de limpieza se posterga un instante y se cancela si
  // el mazo vuelve a montarse (mismo truco que PropertyPanel).
  const entrada = useRef<{ marca: string; propia: boolean; backTimer: number | null } | null>(null)
  useEffect(() => {
    const empujar = (marca: string) => window.history.pushState({ ...(window.history.state ?? {}), siMazo: marca }, '')
    let e = entrada.current
    if (e && e.backTimer != null) {
      window.clearTimeout(e.backTimer)
      e.backTimer = null
    } else {
      e = entrada.current = { marca: `mazo-${Date.now()}`, propia: true, backTimer: null }
      empujar(e.marca)
    }
    const actual = e
    marcarMazoAbierto(true)
    // Ojo: en la ventana, el popstate lo atienden los listeners EN EL ORDEN EN
    // QUE SE REGISTRARON (la captura no adelanta a nadie). Los de antes —la
    // ficha de la compu (PropertyPanel se cierra con cualquier popstate)— miran
    // la marca de mazo-atras.ts y lo dejan pasar; a los de después se los corta.
    const onPop = (ev: PopStateEvent) => {
      ev.stopImmediatePropagation()
      actual.propia = false
      if (porAtras.current()) {
        empujar(actual.marca)
        actual.propia = true
      }
    }
    window.addEventListener('popstate', onPop, true)
    return () => {
      window.removeEventListener('popstate', onPop, true)
      actual.backTimer = window.setTimeout(() => {
        actual.backTimer = null
        entrada.current = null
        if (!actual.propia || window.history.state?.siMazo !== actual.marca) return marcarMazoAbierto(false)
        // Se cerró con la X: se saca la entrada propia sin que nadie más se entere
        // (la marca sigue puesta hasta que pase ese popstate).
        const listo = () => {
          window.removeEventListener('popstate', tragar, true)
          marcarMazoAbierto(false)
        }
        const tragar = (ev: PopStateEvent) => {
          ev.stopImmediatePropagation()
          listo()
        }
        window.addEventListener('popstate', tragar, true)
        window.setTimeout(listo, 1500)
        window.history.back()
      }, 0)
    }
  }, [])

  // Sin scroll de la página de atrás; Escape sale, flechas = paso / ♥ / ★.
  useEffect(() => {
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (guia) cerrarGuia()
        else if (detalle) setDetalle(false)
        else if (match) setMatch(null)
        else if (hoja) setHoja(null)
        else if (rescate) setRescate(null)
        else salir()
      } else if (detalle || visor != null || match || hoja || rescate) {
        return
      } else if (e.key === 'ArrowRight') decidir('like')
      else if (e.key === 'ArrowLeft') decidir('pass')
      else if (e.key === 'ArrowUp') decidir('super')
      else if (e.key === 'Backspace' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) volver()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previo
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoja, rescate, guia, detalle, visor, match, guardadas.length, pendientes.length, decidir, volver])

  const n = todos.length
  // Mirando las de los barrios parecidos: el título lo dice.
  const tituloVisible =
    insercion && indice >= insercion.en && indice < insercion.en + insercion.items.length ? `Casas en ${listaBarrios(parecidos)}` : titulo
  const g = guardadas.length
  // Mientras arrastra: hacia dónde va y cuánto falta (la de abajo crece, el botón de ese lado se pinta).
  const dirArrastre = arrastre && !guia ? direccionDe(arrastre.dx, arrastre.dy) : null
  const fuerzaArrastre = !arrastre || !dirArrastre ? 0 : dirArrastre === 'super' ? Math.min(1, -arrastre.dy / UMBRAL_SUPER) : Math.min(1, Math.abs(arrastre.dx) / UMBRAL_SWIPE)
  const progresoAbajo = salida ? 1 : fuerzaArrastre
  const tendencia: Tendencia | null = salida ? { dir: salida, fuerza: 1 } : dirArrastre ? { dir: dirArrastre, fuerza: fuerzaArrastre } : null

  return createPortal(
    <div className="fixed inset-0 z-[10400] bg-white md:bg-white/85 md:backdrop-blur-sm md:flex md:items-center md:justify-center" role="dialog" aria-modal="true" aria-label={titulo}>
      <style dangerouslySetInnerHTML={{ __html: ESTILOS_MAZO }} />
      <div className="relative flex flex-col h-[100dvh] w-full bg-white md:h-[92vh] md:max-w-[440px] md:rounded-3xl md:border md:border-gray-200 md:shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden">
        {/* Encabezado: título, por cuál va y sus elegidas (♥ N) siempre a mano */}
        <div className="flex items-center justify-between gap-2 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
          <div className="min-w-0 flex-1">
            <p className="font-black text-gray-900 font-raleway truncate">{tituloVisible}</p>
            <p className="text-[13px] text-gray-500">
              {terminado ? (directoAlFinal && g > 0 ? `Tus elegidas · ${n} para ver` : `Viste las ${n}`) : `${indice + 1} de ${n}`}
            </p>
          </div>
          {g > 0 && !terminado && (
            <button
              type="button"
              onClick={() => setHoja({ motivo: 'boton' })}
              aria-label={`Tus elegidas: ${g}. Pedí que te las mandemos`}
              className="flex-none inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-[15px] font-bold text-white shadow-sm active:scale-95 transition-transform"
              style={{ background: CORAZON }}
            >
              <span key={g} className="mazo-latido inline-grid">
                <Corazon lleno className="w-[18px] h-[18px]" />
              </span>
              {g}
            </button>
          )}
          <button type="button" onClick={salir} aria-label="Salir" className="w-10 h-10 rounded-full border border-gray-200 bg-white grid place-items-center flex-none text-gray-800 hover:bg-gray-50">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Solo en la primera: después cada tarjeta de colega lo dice con su chip
            "En red", y en el celu chico ese renglón les sacaba lugar a las fotos. */}
        {indice === 0 && !terminado && todos.some((i) => !i.esNuestra) && (
          <p className="px-4 pb-2.5 text-[13px] leading-relaxed text-gray-600">
            <strong className="text-gray-800">Algunas las publican otras inmobiliarias.</strong> Te las mostramos y te coordinamos la visita nosotros.
          </p>
        )}
        {!(indice === 0 && !terminado && todos.some((i) => !i.esNuestra)) && <div className="h-1" aria-hidden="true" />}

        {/* Mazo */}
        <div className="relative flex-1 mx-3 min-h-0">
          {!terminado && actual ? (
            <>
              {siguiente && (
                <Tarjeta
                  key={siguiente.key}
                  item={siguiente}
                  modo="abajo"
                  guardada={esGuardada(siguiente.key)}
                  arrastre={null}
                  salida={null}
                  par={0}
                  progreso={progresoAbajo}
                  arrastrando={!!arrastre && !salida}
                />
              )}
              <Tarjeta
                key={actual.key}
                item={actual}
                modo="arriba"
                guardada={esGuardada(actual.key)}
                arrastre={guia && guiaDx != null ? { dx: guiaDx, dy: 0 } : arrastre}
                guia={guia}
                conSuper
                onDetalles={abrirDetalle}
                onAmpliar={abrirVisor}
                salida={salida}
                par={foto}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              />
            </>
          ) : preguntaParecidos ? (
            <div className="absolute inset-0 rounded-3xl border border-gray-200 bg-white overflow-y-auto px-5 py-6 flex flex-col justify-center">
              <PreguntaParecidos
                barrio={barrio}
                parecidos={parecidos}
                estado={estadoParecidos}
                onSi={verParecidos}
                onNo={noParecidos}
              />
            </div>
          ) : g > 0 || enviada === 'linea' ? (
            // El CTA AL FINAL con las elegidas (David, 3-oct): el formulario ya está acá.
            // Al enviar, las ♥ se limpian pero el "Listo" sigue a la vista.
            <div className="absolute inset-0 rounded-3xl border border-gray-200 bg-white overflow-y-auto px-5 py-5">
              <HojaContacto
                origen={origen}
                enLinea
                guardadas={guardadas}
                enviadas={enviadas}
                barrio={barrio}
                busqueda={busqueda}
                criterios={criterios}
                textoCancelar="Verlas de nuevo"
                onCancelar={verDeNuevo}
                onListo={() => {
                  setEnviada('linea')
                  limpiar()
                  refrescarEnviadas()
                }}
                onCerrar={cerrarYaConsultadas}
              />
            </div>
          ) : (
            <div className="absolute inset-0 rounded-3xl border border-gray-200 bg-white overflow-y-auto px-5 py-5">
              {rescateVisto || enviada ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-xl font-black text-gray-900 font-raleway">Viste las {n}</p>
                  <p className="text-sm text-gray-600 mt-1.5 max-w-xs">Podés verlas de nuevo y darle ♥ a las que te gusten.</p>
                  <button type="button" onClick={verDeNuevo} className="mt-5 h-11 px-6 rounded-2xl border border-gray-200 text-gray-800 font-semibold">
                    Verlas de nuevo
                  </button>
                  {criterios && (
                    <div className="mt-6 w-full max-w-sm text-left">
                      <SuscripcionMail criterios={criterios} origen={origen} />
                    </div>
                  )}
                </div>
              ) : (
                <Rescate origen={origen} momento="fin" barrio={barrio} busqueda={busqueda} criterios={criterios} vistas={n} onListo={cerrarTodo} onSecundario={verDeNuevo} />
              )}
            </div>
          )}
          {rescate === 'mazo' && !terminado && (
            <div className="absolute inset-0 z-10 rounded-3xl border border-gray-200 bg-white overflow-y-auto px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
              <Rescate
                origen={origen}
                momento="mazo"
                barrio={barrio}
                busqueda={busqueda}
                criterios={criterios}
                vistas={vistas}
                parecidos={parecidos}
                onVerParecidos={ofrecerEnRescate ? parecidasDesdeRescate : undefined}
                onListo={() => setRescate(null)}
                onSecundario={() => setRescate(null)}
              />
            </div>
          )}
          {aviso && (
            <div role="status" className="absolute inset-x-3 top-3 z-20 rounded-2xl bg-gray-900/95 px-4 py-3 text-[15px] font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] mazo-aviso">
              {aviso}
            </div>
          )}
        </div>

        {/* Botones ↺ ✕ ★ ♥ (como Tinder) */}
        <div className="px-4 pt-4 pb-[max(14px,env(safe-area-inset-bottom))]">
          {!terminado && !rescate && (
            <BotonesTinder
              onPaso={() => decidir('pass')}
              onMeGusta={() => decidir('like')}
              onQuieroVerla={() => decidir('super')}
              onVolver={volver}
              puedeVolver={puedeVolver}
              tendencia={tendencia}
            />
          )}
          {/* Al final también se puede volver a la última (por si la pasó sin querer). */}
          {terminado && puedeVolver && !hoja && !rescate && estadoParecidos !== 'cargando' && (
            <button
              type="button"
              onClick={volver}
              className="mx-auto flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw className="w-5 h-5" style={{ color: ORO_VOLVER }} strokeWidth={2.6} aria-hidden="true" /> Volver a la anterior
            </button>
          )}
          {!terminado && !rescate && (
            <p className="mt-3 text-center text-[13px] text-gray-500">
              {g > 0 && pendientes.length === 0 ? (
                <>
                  <span style={{ color: CORAZON }}>✓</span> Tus elegidas ya las tiene un asesor · seguí mirando
                </>
              ) : g > 0 ? (
                <>
                  <span style={{ color: CORAZON }}>♥</span> {g} elegida{g > 1 ? 's' : ''} · tocá <span className="font-semibold text-gray-700">♥ {g}</span> arriba y te las mandamos
                </>
              ) : (
                <>
                  Deslizá a la derecha si te gusta · <span style={{ color: AZUL_VISITA }}>★</span> para coordinar una visita
                </>
              )}
            </p>
          )}
        </div>

        {rescate === 'salir' && (
          <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex items-end" onClick={(e) => e.target === e.currentTarget && cerrarTodo()}>
            <div className="w-full bg-white rounded-t-3xl border-t border-gray-200 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] px-5 pt-4 pb-[max(22px,env(safe-area-inset-bottom))]">
              <div className="w-10 h-1 rounded bg-gray-200 mx-auto mb-4" />
              <Rescate
                origen={origen}
                momento="salir"
                barrio={barrio}
                busqueda={busqueda}
                criterios={criterios}
                vistas={vistas}
                parecidos={parecidos}
                onVerParecidos={ofrecerEnRescate ? parecidasDesdeRescate : undefined}
                onListo={cerrarTodo}
                onSecundario={cerrarTodo}
              />
            </div>
          </div>
        )}
        {visor != null && actual && !terminado && (
          <VisorFotos fotos={actual.fotos} inicio={visor} titulo={actual.titulo || actual.precio} logo={actual.logo} onCerrar={() => setVisor(null)} />
        )}
        {detalle && actual && !terminado && (
          <DetalleMazo
            item={actual}
            guardada={esGuardada(actual.key)}
            onCerrar={() => setDetalle(false)}
            onPaso={() => {
              setDetalle(false)
              decidir('pass')
            }}
            onMeGusta={() => {
              setDetalle(false)
              decidir('like')
            }}
            onQuieroVerla={() => {
              setDetalle(false)
              decidir('super')
            }}
          />
        )}
        {guia && !terminado && (
          <div className="absolute inset-0 z-20 flex items-end bg-black/20" onClick={cerrarGuia} role="presentation">
            <div
              className="w-full bg-white rounded-t-3xl px-5 pt-5 [@media(max-height:720px)]:pt-4 pb-[max(22px,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.15)]"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Cómo se usa"
            >
              <p className="text-xl font-black text-gray-900 font-raleway">Así de fácil</p>
              <ul className="mt-3 space-y-3 [@media(max-height:720px)]:mt-2 [@media(max-height:720px)]:space-y-2 text-[16px] text-gray-800">
                <li className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full grid place-items-center flex-none" style={{ background: '#E7F2EC', color: CORAZON }} aria-hidden="true">
                    <Corazon lleno className="w-5 h-5" />
                  </span>
                  <span>
                    <strong>Deslizá a la derecha</strong> la que te gusta
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full grid place-items-center flex-none" style={{ background: '#FDECEC', color: ROJO_PASO }} aria-hidden="true">
                    <X className="w-5 h-5" strokeWidth={3} />
                  </span>
                  <span>
                    <strong>A la izquierda</strong> para pasar a otra
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full grid place-items-center flex-none" style={{ background: '#E8F1FF', color: AZUL_VISITA }} aria-hidden="true">
                    <Star className="w-5 h-5" fill="currentColor" strokeWidth={1.5} />
                  </span>
                  <span>
                    <strong>Hacia arriba o ★</strong> si querés ir a verla
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full grid place-items-center flex-none bg-gray-100 text-gray-600" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M10 9l3 3-3 3" />
                    </svg>
                  </span>
                  <span>
                    <strong>Tocá el costado de la foto</strong> para ver más; tocá el precio para los detalles
                  </span>
                </li>
              </ul>
              <p className="mt-3 text-[15px] text-gray-600 [@media(max-height:720px)]:hidden">Las que te gusten te las mandamos por WhatsApp.</p>
              <button type="button" onClick={cerrarGuia} className="mt-4 w-full h-12 rounded-2xl text-white font-bold text-[16px]" style={{ background: VERDE }} autoFocus>
                ¡Entendido!
              </button>
            </div>
          </div>
        )}
        {hoja && (
          <HojaContacto
            origen={origen}
            motivo={hoja.motivo}
            guardadas={guardadas}
            enviadas={enviadas}
            barrio={barrio}
            busqueda={busqueda}
            criterios={criterios}
            onCancelar={() => (hoja.motivo === 'salir' ? cerrarTodo() : setHoja(null))}
            onListo={() => {
              refrescarEnviadas()
              // Desde ♥ N (mitad del mazo) sigue mirando: las ♥ quedan y las nuevas se suman.
              if (hoja.motivo === 'salir') {
                setEnviada('hoja')
                limpiar()
              }
            }}
            onCerrar={hoja.motivo === 'salir' ? cerrarTodo : () => setHoja(null)}
          />
        )}
        {match && (
          <MatchMazo
            estado={match}
            pendientes={pendientes}
            barrio={barrio}
            busqueda={busqueda}
            origen={origen}
            onSeguir={() => setMatch(null)}
            onEnviado={refrescarEnviadas}
          />
        )}
      </div>
    </div>,
    document.body,
  )
}

/** Animaciones del mazo (el latido del ♥ N, el match, el aviso). Sin movimiento si el sistema lo pide. */
const ESTILOS_MAZO = `
@keyframes mazo-latido { 0% { transform: scale(1) } 35% { transform: scale(1.45) } 100% { transform: scale(1) } }
@keyframes mazo-subir { 0% { transform: translateY(0) scale(.6); opacity: 0 } 15% { opacity: .9 } 100% { transform: translateY(-220px) scale(1.1); opacity: 0 } }
@keyframes mazo-entrar { 0% { transform: scale(.7); opacity: 0 } 70% { transform: scale(1.06); opacity: 1 } 100% { transform: scale(1) } }
@keyframes mazo-aviso { 0% { transform: translateY(-16px); opacity: 0 } 100% { transform: none; opacity: 1 } }
.mazo-latido { animation: mazo-latido 420ms ease-out }
.mazo-entrar { animation: mazo-entrar 520ms cubic-bezier(.2,1.2,.4,1) both }
.mazo-aviso { animation: mazo-aviso 220ms ease-out both }
.mazo-corazon-sube { animation: mazo-subir 2.6s ease-out infinite }
@media (prefers-reduced-motion: reduce) { .mazo-latido, .mazo-entrar, .mazo-aviso, .mazo-corazon-sube { animation: none } }
`

/** Las ♥ que ya le mandamos a un asesor (localStorage: no se mandan dos veces). */
const CLAVE_ENVIADAS = 'si-feed-enviadas'
function leerEnviadas(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(CLAVE_ENVIADAS) ?? '[]')
    return Array.isArray(v) ? v.filter((k): k is string => typeof k === 'string') : []
  } catch {
    return []
  }
}
function marcarEnviadas(keys: string[]): void {
  try {
    const todas = Array.from(new Set([...leerEnviadas(), ...keys])).slice(-40)
    window.localStorage.setItem(CLAVE_ENVIADAS, JSON.stringify(todas))
  } catch {
    /* sin almacenamiento */
  }
}

/** Su nombre y WhatsApp, si ya los dejó en este navegador (si no, null). */
function contactoListo(): { nombre: string; whatsapp: string } | null {
  const c = leerContacto()
  return c.nombre.trim().length >= 2 && c.whatsapp.replace(/\D/g, '').length >= 10 ? { nombre: c.nombre.trim(), whatsapp: c.whatsapp } : null
}

/**
 * La consulta a Hilo (la usan el match, ★ "Quiero verla", ♥ N y el final). Las
 * que se mandan quedan marcadas: nunca se le vuelven a mandar al asesor.
 */
async function mandarConsulta(p: {
  nombre: string
  whatsapp: string
  email?: string
  criterios?: CriteriosBusqueda | null
  keys: string[]
  barrio: string | null
  busqueda: string | null
  origen: OrigenTinder
  /** Tocó ★ "Quiero verla": el asesor sabe que quiere coordinar la visita. */
  visita?: boolean
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/feed-en-red/consulta', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        nombre: p.nombre,
        whatsapp: p.whatsapp,
        email: p.email || undefined,
        suscripcion: p.email && p.criterios ? p.criterios : undefined,
        guardadas: p.keys,
        barrio: p.barrio,
        busqueda: p.busqueda,
        visita: p.visita === true,
        pageUrl: window.location.href,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: typeof data.error === 'string' ? data.error : 'No pudimos enviarlo. Probá de nuevo.' }
    escribirContacto({ nombre: p.nombre, whatsapp: p.whatsapp, email: p.email })
    marcarEnviadas(p.keys)
    trackEvent('feed_en_red_consulta', { cantidad: p.keys.length, en_red: p.keys.filter((k) => !k.startsWith('n:')).length, visita: p.visita === true })
    trackFbEvent('Lead', { content_name: 'feed_en_red', content_ids: p.keys.filter((k) => k.startsWith('n:')).map((k) => k.slice(2)) })
    contarTinder('consulta', p.origen)
    return { ok: true }
  } catch {
    return { ok: false, error: 'No pudimos enviarlo. Probá de nuevo.' }
  }
}

/** Hasta 3 fotos en abanico, como las cartas de Tinder (match y "No pierdas tus elegidas"). */
function AbanicoFotos({ fotos }: { fotos: { src: string | null; logo?: PosicionLogo | null }[] }) {
  const tres = fotos.filter((f) => f.src).slice(-3)
  const giros = tres.length === 1 ? [0] : tres.length === 2 ? [-7, 7] : [-10, 0, 10]
  return (
    <div className="relative mx-auto h-[118px] w-[210px]" aria-hidden="true">
      {tres.map((f, i) => (
        <div
          key={`${f.src}-${i}`}
          className="absolute left-1/2 top-1 h-[108px] w-[84px] overflow-hidden rounded-2xl border-[3px] border-white bg-gray-100 shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
          style={{ transform: `translateX(calc(-50% + ${(i - (tres.length - 1) / 2) * 52}px)) rotate(${giros[i]}deg)`, zIndex: i === Math.floor(tres.length / 2) ? 2 : 1 }}
        >
          <Image src={f.src!} alt="" fill sizes="84px" className="object-cover" style={estiloSinLogo(f.logo)} />
        </div>
      ))}
    </div>
  )
}

/**
 * "¡Es un match!" (Tinder): la casa que le gustó + el isotipo de SI, y ahí
 * mismo nombre y WhatsApp. "Seguir mirando" siempre a mano: no es una traba.
 */
function MatchMazo({
  estado,
  pendientes,
  barrio,
  busqueda,
  origen,
  onSeguir,
  onEnviado,
}: {
  estado: NonNullable<EstadoMatch>
  pendientes: GuardadaLocal[]
  barrio: string | null
  busqueda: string | null
  origen: OrigenTinder
  onSeguir: () => void
  onEnviado: () => void
}) {
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState<string | null>(null)
  useEffect(() => {
    const c = leerContacto()
    setNombre(c.nombre)
    setWhatsapp(c.whatsapp)
  }, [])
  const { modo, item } = estado
  const keys = Array.from(new Set([item.key, ...pendientes.map((g) => g.key)]))
  const cantidad = keys.length
  const titulo = modo === 'visita' ? '¡Vamos a verla!' : modo === 'tres' ? `¡Ya van ${cantidad}!` : '¡Es un match!'
  const bajada =
    modo === 'visita'
      ? 'Dejanos tu nombre y WhatsApp y un asesor te escribe para coordinar la visita.'
      : modo === 'tres'
        ? `¿Te mandamos las ${cantidad} por WhatsApp? Un asesor te pasa la info de cada una y te coordina las visitas.`
        : 'Te gustó esta casa. Un asesor te pasa toda la info y te coordina la visita.'
  const fotos = modo === 'tres' ? [...pendientes.filter((g) => g.key !== item.key).map((g) => ({ src: g.foto, logo: g.logo })), { src: item.fotos[0] ?? null, logo: item.logo }] : []

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviando) return
    const nom = nombre.trim()
    if (nom.length < 2) return setError('Poné tu nombre así el asesor sabe cómo llamarte.')
    if (whatsapp.replace(/\D/g, '').length < 10) return setError('Revisá el WhatsApp: con característica, por ejemplo 341 555 1234.')
    setError(null)
    setEnviando(true)
    const r = await mandarConsulta({ nombre: nom, whatsapp, keys, barrio, busqueda, origen, visita: modo === 'visita' })
    setEnviando(false)
    if (!r.ok) return setError(r.error)
    trackEvent('feed_en_red_match_datos', { modo })
    onEnviado()
    setListo(nom.split(/\s+/)[0])
  }

  return (
    <div
      className="absolute inset-0 z-30 overflow-y-auto bg-white"
      style={{ background: 'radial-gradient(120% 60% at 50% 0%, rgba(26,92,56,0.16) 0%, rgba(255,255,255,0) 60%), #fff' }}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      {/* Corazones que suben (como el match de Tinder) */}
      <div className="pointer-events-none absolute inset-x-0 top-[34%] h-0" aria-hidden="true">
        {[12, 28, 46, 64, 80, 90].map((x, i) => (
          <span key={x} className="mazo-corazon-sube absolute" style={{ left: `${x}%`, color: i % 2 ? CORAZON : '#3FA36B', animationDelay: `${i * 0.38}s` }}>
            <Corazon lleno className={i % 3 === 0 ? 'w-5 h-5' : 'w-3.5 h-3.5'} />
          </span>
        ))}
      </div>
      <div className="relative mx-auto flex min-h-full max-w-sm flex-col justify-center px-6 pb-[max(22px,env(safe-area-inset-bottom))] pt-[max(22px,env(safe-area-inset-top))] text-center">
        {listo ? (
          <div className="mazo-entrar">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full text-white" style={{ background: VERDE }} aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
            <p className="mt-4 text-[28px] font-black text-gray-900 font-raleway">¡Listo, {listo}!</p>
            <p className="mt-2 text-[17px] text-gray-700">Un asesor de SI te escribe por WhatsApp. Seguí mirando: si te gusta otra, tocá ♥ arriba y te la sumamos.</p>
            <button type="button" onClick={onSeguir} className="mt-6 h-[52px] w-full rounded-2xl text-[17px] font-bold text-white" style={{ background: VERDE }} autoFocus>
              Seguir mirando
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate>
            <p
              className="mazo-entrar text-[42px] leading-none font-black italic font-raleway bg-clip-text text-transparent [text-wrap:balance]"
              style={{ backgroundImage: `linear-gradient(90deg, ${VERDE}, #3FA36B)` }}
            >
              {titulo}
            </p>
            {modo === 'tres' ? (
              <div className="mt-5">
                <AbanicoFotos fotos={fotos} />
              </div>
            ) : (
              // La casa y SI, juntas (en Tinder son las dos personas).
              <div className="mazo-entrar mt-5 flex items-center justify-center" aria-hidden="true">
                <div className="relative h-[104px] w-[104px] -rotate-6 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                  {item.fotos[0] && <Image src={item.fotos[0]} alt="" fill sizes="104px" className="object-cover" style={estiloSinLogo(item.logo)} />}
                </div>
                <div className="-ml-5 grid h-[104px] w-[104px] rotate-6 place-items-center rounded-full border-4 border-white bg-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                  <IsotipoSI className="h-11 w-auto" />
                </div>
              </div>
            )}
            <p className="mt-4 text-[17px] leading-snug text-gray-700">{bajada}</p>
            {!item.esNuestra && modo !== 'tres' && (
              <p className="mt-1.5 text-[14px] text-gray-500">La publica otra inmobiliaria de la zona: la visita te la coordinamos nosotros.</p>
            )}
            <div className="mt-5 space-y-2.5 text-left">
              <label htmlFor="match-nombre" className="sr-only">
                Tu nombre
              </label>
              <input
                id="match-nombre"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value)
                  setError(null)
                }}
                autoComplete="name"
                placeholder="Tu nombre"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-[17px] outline-none focus:ring-2 focus:ring-[#1A5C38]"
              />
              <label htmlFor="match-wsp" className="sr-only">
                Tu WhatsApp
              </label>
              <input
                id="match-wsp"
                type="tel"
                inputMode="tel"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value)
                  setError(null)
                }}
                autoComplete="tel"
                placeholder="Tu WhatsApp (341 555 1234)"
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-[17px] outline-none focus:ring-2 focus:ring-[#1A5C38]"
              />
            </div>
            {error && (
              <p className="mt-2 text-left text-sm text-[#E0245E]" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={enviando} className="mt-4 h-[52px] w-full rounded-2xl text-[17px] font-bold text-white disabled:opacity-70" style={{ background: VERDE }}>
              {enviando ? 'Enviando…' : modo === 'visita' ? 'Coordinar la visita' : 'Que me escriba un asesor'}
            </button>
            <button type="button" onClick={onSeguir} className="mt-2 h-12 w-full rounded-2xl text-[16px] font-semibold text-gray-600">
              Seguir mirando
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

/**
 * Al terminar un barrio con parecidos: la PREGUNTA (David 4-oct: "mostrale
 * alguno parecido, pero primero preguntale"). Nunca se suman solas.
 */
function PreguntaParecidos({
  barrio,
  parecidos,
  estado,
  onSi,
  onNo,
}: {
  barrio: string | null
  parecidos: string[]
  estado: 'pendiente' | 'cargando' | 'sumados' | 'vacio' | 'no'
  onSi: () => void
  onNo: () => void
}) {
  if (estado === 'vacio') {
    return (
      <div className="text-center">
        <p className="text-xl font-black text-gray-900 font-raleway">Por ahora no hay otras</p>
        <p className="text-[16px] text-gray-600 mt-2">
          No encontramos casas en {listaBarrios(parecidos)} con lo que buscás. Te avisamos cuando entre alguna.
        </p>
        <button type="button" onClick={onNo} className="mt-5 w-full h-12 rounded-2xl text-white font-bold" style={{ background: VERDE }}>
          Seguir
        </button>
      </div>
    )
  }
  const cargando = estado === 'cargando'
  return (
    <div className="text-center">
      <div className="mx-auto w-12 h-12 rounded-full grid place-items-center" style={{ background: '#EAF3EE', color: VERDE }} aria-hidden="true">
        <MapPin className="w-6 h-6" />
      </div>
      <p className="mt-3 text-xl font-black text-gray-900 font-raleway [text-wrap:balance]">¿Te muestro casas en barrios parecidos?</p>
      <p className="text-[16px] text-gray-600 mt-2">{barrio ? `Ya viste las de ${barrio}. ` : ''}Estos barrios se le parecen:</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {parecidos.map((b) => (
          <span key={b} className="inline-flex items-center h-9 px-3.5 rounded-full border border-gray-200 bg-gray-50 text-[15px] font-semibold text-gray-800">
            {b}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onSi}
        disabled={cargando}
        className="mt-6 w-full h-12 rounded-2xl text-white font-bold disabled:opacity-70"
        style={{ background: VERDE }}
      >
        {cargando ? 'Buscando…' : 'Sí, mostrame'}
      </button>
      <button type="button" onClick={onNo} disabled={cargando} className="mt-2 w-full h-12 rounded-2xl border border-gray-200 text-gray-800 font-semibold">
        No, gracias
      </button>
    </div>
  )
}

function HojaContacto({
  origen,
  guardadas,
  enviadas,
  barrio,
  busqueda = null,
  criterios = null,
  onCancelar,
  onListo,
  onCerrar,
  enLinea = false,
  motivo = 'salir',
  textoCancelar = 'No, gracias',
}: {
  origen: OrigenTinder
  guardadas: GuardadaLocal[]
  /** Las que ya tiene un asesor (match o ★): no se vuelven a mandar. */
  enviadas: ReadonlySet<string>
  barrio: string | null
  busqueda?: string | null
  criterios?: CriteriosBusqueda | null
  onCancelar: () => void
  onListo: () => void
  onCerrar: () => void
  /** true = el CTA del final del mazo (sin velo ni hoja que sube). */
  enLinea?: boolean
  /** 'salir' = se va con ♥ sin mandar ("¡No pierdas tus elegidas!"); 'boton' = tocó ♥ N arriba. */
  motivo?: 'salir' | 'boton'
  textoCancelar?: string
}) {
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  // Opcional: con el mail, además de la consulta, recibe las nuevas de su búsqueda.
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState<string | null>(null)
  /** Ya dejó nombre y WhatsApp antes: se muestra "Te las mandamos a …" con un toque (y "Cambiar"). */
  const [conocido, setConocido] = useState(false)
  const nombreRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const c = leerContacto()
    setNombre(c.nombre)
    setWhatsapp(c.whatsapp)
    setEmail(c.email)
    const ya = !!contactoListo()
    setConocido(ya)
    // En el final del mazo no se abre el teclado solo: primero ve sus elegidas.
    if (!enLinea && !ya) window.setTimeout(() => nombreRef.current?.focus(), 60)
  }, [enLinea])

  // Solo las que todavía no tiene un asesor (las del match o ★ ya se mandaron).
  const pendientes = listo ? guardadas : guardadas.filter((g) => !enviadas.has(g.key))
  const n = pendientes.length
  const nuestras = pendientes.filter((g) => g.esNuestra).length
  const red = n - nuestras
  const explicacion =
    red === 0
      ? 'Un asesor de SI te pasa toda la info y te coordina la visita.'
      : `${
          nuestras === 0
            ? red === 1
              ? 'La publica otra inmobiliaria'
              : 'Las publican otras inmobiliarias'
            : `${nuestras === 1 ? 'Una es nuestra' : `${nuestras} son nuestras`} y ${red === 1 ? 'una la publica otra inmobiliaria' : `${red} las publican otras inmobiliarias`}`
        } de la zona. Trabajamos en red: te coordinamos las visitas y te acompañamos en la compra.`

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviando) return
    const nom = nombre.trim()
    if (nom.length < 2) return setError('Poné tu nombre así el asesor sabe cómo llamarte.')
    if (whatsapp.replace(/\D/g, '').length < 10) return setError('Revisá el WhatsApp: con característica, por ejemplo 341 555 1234.')
    const mail = email.trim()
    if (mail && !esEmail(mail)) return setError('Revisá el mail (o dejalo vacío).')
    setError(null)
    setEnviando(true)
    const r = await mandarConsulta({ nombre: nom, whatsapp, email: mail, criterios, keys: pendientes.map((g) => g.key), barrio, busqueda, origen })
    setEnviando(false)
    if (!r.ok) return setError(r.error)
    if (mail) trackEvent('mazo_suscripcion_mail', { donde: 'formulario' })
    setListo(nom.split(/\s+/)[0])
    onListo()
  }

  const textoCerrar = motivo === 'boton' && !enLinea ? 'Seguir mirando' : 'Cerrar'
  const yaTodas = !listo && n === 0 && guardadas.length > 0

  const contenido = (
    <>
        {listo || yaTodas ? (
          <div className="text-center py-3">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full text-white" style={{ background: VERDE }} aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-gray-900 mt-2 font-raleway">{listo ? `Listo, ${listo}` : 'Ya las tiene un asesor'}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {listo ? 'Un asesor de SI te escribe por WhatsApp con las que guardaste.' : 'Tus elegidas ya se las pasamos: te escribe por WhatsApp. Si te gusta otra, tocá ♥ y te la sumamos.'}
            </p>
            {listo && email.trim() && criterios && <p className="text-sm text-gray-600 mt-1">Y te avisamos por mail cuando entren {textoBusqueda(criterios)}.</p>}
            <button type="button" onClick={onCerrar} className="mt-4 w-full h-12 rounded-2xl text-white font-bold" style={{ background: VERDE }}>
              {textoCerrar}
            </button>
            {enLinea && yaTodas && (
              <button type="button" onClick={onCancelar} className="block mx-auto mt-3 text-sm text-gray-500">
                {textoCancelar}
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={enviar} noValidate>
            {enLinea ? (
              // Final del mazo: las elegidas bien a la vista, con su precio.
              <div className="grid grid-cols-2 gap-2 mb-4">
                {pendientes.map((g) => (
                  <div key={g.key} className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      {g.foto && <Image src={g.foto} alt="" fill sizes="(max-width: 480px) 50vw, 200px" className="object-cover" style={estiloSinLogo(g.logo)} />}
                      <span className="absolute top-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm" style={{ color: CORAZON }}>
                        <Corazon lleno className="w-4 h-4" />
                      </span>
                    </div>
                    <p className="px-2 py-1.5 text-[13px] font-black text-gray-900 font-numeric truncate">{g.precio}</p>
                  </div>
                ))}
              </div>
            ) : (
              // Hoja: sus elegidas en abanico, como cartas de Tinder.
              <div className="mb-3">
                <AbanicoFotos fotos={pendientes.map((g) => ({ src: g.foto, logo: g.logo }))} />
              </div>
            )}
            <h3 className={`text-lg font-black text-gray-900 font-raleway [text-wrap:balance] ${enLinea ? '' : 'text-center'}`}>
              {motivo === 'salir' && !enLinea ? '¡No pierdas tus elegidas!' : `${n === 1 ? 'Te gustó 1' : `Te gustaron ${n}`}. ¿Te ayudamos?`}
            </h3>
            <p className={`text-[14px] leading-relaxed text-gray-600 mt-1 mb-3.5 ${enLinea ? '' : 'text-center'}`}>
              {motivo === 'salir' && !enLinea ? `${n === 1 ? 'Te gustó 1' : `Te gustaron ${n}`}: te ${n === 1 ? 'la' : 'las'} mandamos por WhatsApp. ` : ''}
              {explicacion}
            </p>
            {conocido ? (
              // Ya lo conocemos: un toque.
              <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="min-w-0 text-[15px] text-gray-800">
                  <span className="block font-bold truncate">{nombre}</span>
                  <span className="block text-gray-600 truncate">{whatsapp}</span>
                </p>
                <button type="button" onClick={() => setConocido(false)} className="flex-none text-[14px] font-semibold underline underline-offset-2" style={{ color: VERDE }}>
                  Cambiar
                </button>
              </div>
            ) : (
              <>
                <label htmlFor="feed-nombre" className="block text-sm font-semibold text-gray-800 mb-1">
                  Tu nombre
                </label>
                <input
                  id="feed-nombre"
                  ref={nombreRef}
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value)
                    setError(null)
                  }}
                  autoComplete="name"
                  placeholder="Martina"
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[16px] mb-2.5 outline-none focus:ring-2 focus:ring-[#1A5C38]"
                />
                <label htmlFor="feed-wsp" className="block text-sm font-semibold text-gray-800 mb-1">
                  Tu WhatsApp
                </label>
                <input
                  id="feed-wsp"
                  type="tel"
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value)
                    setError(null)
                  }}
                  autoComplete="tel"
                  placeholder="341 555 1234"
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[16px] mb-2.5 outline-none focus:ring-2 focus:ring-[#1A5C38]"
                />
                {criterios && (
                  <>
                    <label htmlFor="feed-mail" className="block text-sm font-semibold text-gray-800 mb-1">
                      Tu mail <span className="font-normal text-gray-500">(opcional · te avisamos cuando entren {textoBusqueda(criterios)})</span>
                    </label>
                    <input
                      id="feed-mail"
                      type="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError(null)
                      }}
                      autoComplete="email"
                      placeholder="martina@gmail.com"
                      className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[16px] mb-2 outline-none focus:ring-2 focus:ring-[#1A5C38]"
                    />
                  </>
                )}
              </>
            )}
            {error && (
              <p className="text-sm text-[#E0245E] mb-2" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={enviando} className="w-full h-12 rounded-2xl text-white font-bold mt-1 disabled:opacity-70" style={{ background: VERDE }}>
              {enviando ? 'Enviando…' : conocido ? `Mandámel${n === 1 ? 'a' : 'as'} por WhatsApp` : 'Que me escriba un asesor'}
            </button>
            <button type="button" onClick={onCancelar} className="block mx-auto mt-3 text-sm text-gray-500">
              {motivo === 'boton' && !enLinea ? 'Seguir mirando' : textoCancelar}
            </button>
          </form>
        )}
    </>
  )
  if (enLinea) return <div className="w-full">{contenido}</div>
  return (
    <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex items-end" onClick={(e) => e.target === e.currentTarget && onCancelar()}>
      <div className="w-full max-h-full overflow-y-auto bg-white rounded-t-3xl border-t border-gray-200 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] px-5 pt-4 pb-[max(22px,env(safe-area-inset-bottom))]">
        <div className="w-10 h-1 rounded bg-gray-200 mx-auto mb-4" />
        {contenido}
      </div>
    </div>
  )
}

const MOTIVOS = ['Más económicas', 'Más grandes', 'Otra zona', 'Otro tipo de propiedad', 'Solo estaba mirando'] as const

/**
 * El RESCATE (David, 3-oct: "si pone no me gusta, tratar de rescatarlo… un
 * feedback rápido para no perder ese cliente"). No en cada ✕ (cansa): cuando
 * pasa 4 seguidas sin ningún ♥, cuando se va sin guardar ninguna o cuando
 * termina el mazo sin guardar. Un toque para decir qué busca y, si quiere, su
 * WhatsApp para avisarle cuando entre algo así (entra a Hilo por turno). Sin
 * WhatsApp, lo que eligió igual se guarda (anónimo).
 */
function Rescate({
  origen,
  momento,
  barrio,
  busqueda = null,
  criterios = null,
  vistas,
  parecidos = [],
  onVerParecidos,
  onListo,
  onSecundario,
}: {
  origen: OrigenTinder
  momento: 'mazo' | 'salir' | 'fin'
  barrio: string | null
  busqueda?: string | null
  /** Con la búsqueda, el campo acepta también un mail (David 4-oct): queda suscripto a las nuevas. */
  criterios?: CriteriosBusqueda | null
  vistas: number
  /** Barrios parecidos al que mira (barrios-parecidos.ts). */
  parecidos?: string[]
  /**
   * Con "Otra zona" marcado, ofrece verlos ahí mismo (David 4-oct). Devuelve
   * false si no había ninguna. Sin esto (ya se le preguntó), no se ofrece.
   */
  onVerParecidos?: () => Promise<boolean>
  /** Ya contestó (con o sin WhatsApp). */
  onListo: () => void
  /** "Seguir mirando" / "No, gracias" / "Verlas de nuevo". */
  onSecundario: () => void
}) {
  const [motivos, setMotivos] = useState<string[]>([])
  // WhatsApp o mail (con un "@" es mail: queda suscripto a las nuevas de su búsqueda).
  const [whatsapp, setWhatsapp] = useState('')
  const [porMail, setPorMail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState(false)
  const [parecidasEstado, setParecidasEstado] = useState<'idle' | 'cargando' | 'vacio'>('idle')
  const ofrecerParecidos = !!onVerParecidos && parecidos.length > 0 && motivos.includes('Otra zona')

  const verParecidas = async () => {
    if (!onVerParecidos || parecidasEstado === 'cargando') return
    // Lo que marcó igual le sirve al equipo (anónimo, como "Seguir mirando").
    void fetch('/api/feed-en-red/consulta', { method: 'POST', headers: { 'content-type': 'application/json' }, body: cuerpo(false), keepalive: true }).catch(() => {})
    setParecidasEstado('cargando')
    const ok = await onVerParecidos().catch(() => false)
    if (!ok) setParecidasEstado('vacio')
  }

  useEffect(() => {
    const c = leerContacto()
    setWhatsapp(c.whatsapp || (criterios ? c.email : ''))
    trackEvent('feed_en_red_rescate', { momento })
    // Solo al montar (el criterio no cambia mientras está abierto).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [momento])

  const titulo = momento === 'mazo' ? '¿No es lo que buscás?' : momento === 'salir' ? '¿Te vas sin guardar ninguna?' : '¿No encontraste lo que buscabas?'
  const bajada =
    momento === 'mazo'
      ? 'Contanos en un toque qué buscás y te ayudamos a encontrarla.'
      : 'Contanos qué buscás y te avisamos cuando entre algo así.'
  const secundario = momento === 'mazo' ? 'Seguir mirando' : momento === 'salir' ? 'No, gracias' : 'Verlas de nuevo'

  const cuerpo = (conWhatsapp: boolean) =>
    JSON.stringify({
      tipo: conWhatsapp ? 'busca' : 'feedback',
      // Si ya lo dejó antes en este navegador, el asesor sabe cómo llamarlo.
      nombre: conWhatsapp ? leerContacto().nombre : '',
      whatsapp: conWhatsapp ? whatsapp : '',
      motivos,
      barrio,
      busqueda,
      vistas,
      pageUrl: window.location.href,
    })

  const enviar = async (conWhatsapp: boolean) => {
    if (enviando) return
    const dato = whatsapp.trim()
    if (conWhatsapp && criterios && dato.includes('@')) {
      if (!esEmail(dato)) return setError('Revisá el mail.')
      setError(null)
      setEnviando(true)
      // Lo que marcó igual le sirve al equipo (anónimo).
      if (motivos.length) {
        void fetch('/api/feed-en-red/consulta', { method: 'POST', headers: { 'content-type': 'application/json' }, body: cuerpo(false), keepalive: true }).catch(() => {})
      }
      const ok = await suscribirMail(dato, criterios, motivos)
      setEnviando(false)
      if (!ok) return setError('No pudimos anotarte. Probá de nuevo.')
      trackEvent('mazo_suscripcion_mail', { donde: `rescate_${momento}` })
      contarTinder('busca', origen)
      setPorMail(dato)
      setListo(true)
      return
    }
    if (conWhatsapp && whatsapp.replace(/\D/g, '').length < 10) {
      return setError(criterios ? 'Dejá tu WhatsApp con característica (341 555 1234) o tu mail.' : 'Dejá tu WhatsApp con característica, por ejemplo 341 555 1234.')
    }
    setError(null)
    setEnviando(true)
    try {
      const res = await fetch('/api/feed-en-red/consulta', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: cuerpo(conWhatsapp),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(typeof data.error === 'string' ? data.error : 'No pudimos enviarlo. Probá de nuevo.')
      }
      if (conWhatsapp) {
        escribirContacto({ nombre: leerContacto().nombre, whatsapp })
        trackFbEvent('Lead', { content_name: 'feed_en_red_rescate' })
        contarTinder('busca', origen)
        setListo(true)
      } else {
        onListo()
      }
    } catch (err) {
      if (conWhatsapp) setError(err instanceof Error ? err.message : 'No pudimos enviarlo. Probá de nuevo.')
      else onListo()
    } finally {
      setEnviando(false)
    }
  }

  if (listo) {
    return (
      <div className="text-center py-3">
        <div className="text-4xl" style={{ color: VERDE }} aria-hidden="true">
          ✓
        </div>
        <h3 className="text-lg font-black text-gray-900 mt-1 font-raleway">Listo</h3>
        <p className="text-sm text-gray-600 mt-1">
          {porMail ? `Te escribimos a ${porMail} cuando entren ${textoBusqueda(criterios)}.` : 'Un asesor de SI te escribe por WhatsApp apenas tengamos algo así.'}
        </p>
        <button type="button" onClick={onListo} className="mt-4 w-full h-12 rounded-2xl text-white font-bold" style={{ background: VERDE }}>
          {momento === 'mazo' ? 'Seguir mirando' : 'Cerrar'}
        </button>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-black text-gray-900 font-raleway [text-wrap:balance]">{titulo}</h3>
      <p className="text-[14px] leading-relaxed text-gray-600 mt-1 mb-3.5">{bajada}</p>
      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Qué buscás">
        {MOTIVOS.map((m) => {
          const on = motivos.includes(m)
          return (
            <button
              key={m}
              type="button"
              aria-pressed={on}
              onClick={() => setMotivos((xs) => (on ? xs.filter((x) => x !== m) : [...xs, m]))}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition-colors ${on ? 'text-white border-transparent' : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'}`}
              style={on ? { background: VERDE } : undefined}
            >
              {m}
            </button>
          )
        })}
      </div>
      {ofrecerParecidos && (
        <div className="mb-4 rounded-2xl p-3.5" style={{ background: '#EAF3EE' }}>
          <p className="text-[16px] font-bold text-gray-900">¿Te muestro casas en barrios parecidos?</p>
          <p className="text-[15px] text-gray-700 mt-0.5">{listaBarrios(parecidos)}</p>
          {parecidasEstado === 'vacio' ? (
            <p className="text-[15px] text-gray-700 mt-2">Por ahora no hay otras en esos barrios con lo que buscás.</p>
          ) : (
            <button
              type="button"
              onClick={() => void verParecidas()}
              disabled={parecidasEstado === 'cargando'}
              className="mt-2.5 w-full h-11 rounded-xl text-white font-bold disabled:opacity-70"
              style={{ background: VERDE }}
            >
              {parecidasEstado === 'cargando' ? 'Buscando…' : 'Sí, mostrame'}
            </button>
          )}
        </div>
      )}
      <label htmlFor={`rescate-wsp-${momento}`} className="block text-sm font-semibold text-gray-800 mb-1">
        {criterios ? 'Tu WhatsApp o tu mail, si querés que te avisemos' : 'Tu WhatsApp, si querés que te avisemos'}
      </label>
      <input
        id={`rescate-wsp-${momento}`}
        type={criterios ? 'text' : 'tel'}
        inputMode={criterios ? 'text' : 'tel'}
        value={whatsapp}
        onChange={(e) => {
          setWhatsapp(e.target.value)
          setError(null)
        }}
        autoComplete={criterios ? 'on' : 'tel'}
        autoCapitalize="none"
        placeholder={criterios ? '341 555 1234 o martina@gmail.com' : '341 555 1234'}
        className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[16px] mb-2 outline-none focus:ring-2 focus:ring-[#1A5C38]"
      />
      {error && (
        <p className="text-sm text-[#E0245E] mb-2" role="alert">
          {error}
        </p>
      )}
      <button type="button" disabled={enviando} onClick={() => void enviar(true)} className="w-full h-12 rounded-2xl text-white font-bold mt-1 disabled:opacity-70" style={{ background: VERDE }}>
        {enviando ? 'Enviando…' : 'Avisame cuando entre algo así'}
      </button>
      <button
        type="button"
        disabled={enviando}
        onClick={() => {
          // Sin WhatsApp: lo que eligió igual sirve (anónimo, sin esperar la respuesta).
          if (motivos.length) {
            void fetch('/api/feed-en-red/consulta', { method: 'POST', headers: { 'content-type': 'application/json' }, body: cuerpo(false), keepalive: true }).catch(() => {})
          }
          onSecundario()
        }}
        className="block mx-auto mt-3 text-sm text-gray-500"
      >
        {secundario}
      </button>
    </div>
  )
}

/** Anota el mail con su búsqueda (web → Hilo). true si quedó registrado. */
async function suscribirMail(email: string, criterios: CriteriosBusqueda, motivos: string[] = []): Promise<boolean> {
  try {
    const res = await fetch('/api/feed-en-red/suscripcion', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, nombre: leerContacto().nombre, criterios, busqueda: textoBusqueda(criterios), motivos, pageUrl: window.location.href }),
    })
    if (!res.ok) return false
    escribirContacto({ email })
    trackFbEvent('Lead', { content_name: 'mazo_suscripcion_mail' })
    return true
  } catch {
    return false
  }
}

/**
 * "Recibí las nuevas por mail" (David, 4-oct): deja el mail y su búsqueda ya
 * filtrada (dónde, qué, hasta cuánto) para los envíos. No es una consulta:
 * nadie lo llama; le llegan las nuevas que entren de lo que busca.
 */
export function SuscripcionMail({ criterios, compacta = false, origen }: { criterios: CriteriosBusqueda; compacta?: boolean; origen?: OrigenTinder }) {
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'listo'>('idle')
  const [error, setError] = useState<string | null>(null)
  const buscaTexto = textoBusqueda(criterios)

  useEffect(() => {
    setEmail(leerContacto().email)
  }, [])

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (estado === 'enviando') return
    const mail = email.trim()
    if (!esEmail(mail)) return setError('Revisá el mail, por ejemplo martina@gmail.com.')
    setError(null)
    setEstado('enviando')
    const ok = await suscribirMail(mail, criterios)
    if (!ok) {
      setEstado('idle')
      return setError('No pudimos anotarte. Probá de nuevo.')
    }
    trackEvent('mazo_suscripcion_mail', { donde: compacta ? 'fila_compu' : 'final' })
    if (origen) contarTinder('busca', origen)
    setEstado('listo')
  }

  if (estado === 'listo') {
    return (
      <div className={`rounded-2xl bg-[#EAF3EE] ${compacta ? 'px-4 py-3' : 'p-4'}`} role="status">
        <p className="text-[15px] font-bold text-gray-900">Listo, te anotamos.</p>
        <p className="text-sm text-gray-700 mt-0.5">
          Te escribimos a {email.trim()} cuando entren {buscaTexto}. Te das de baja cuando quieras.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} noValidate className={`rounded-2xl bg-[#F6F8F6] ${compacta ? 'px-4 py-3 md:flex md:items-center md:gap-4' : 'p-4'}`}>
      <div className={compacta ? 'md:flex-1 md:min-w-0' : ''}>
        <p className="flex items-center gap-2 text-[15px] font-bold text-gray-900">
          <Mail className="w-4 h-4 flex-none" style={{ color: VERDE }} aria-hidden="true" />
          Recibí las nuevas por mail
        </p>
        <p className="text-sm text-gray-600 mt-0.5">Te avisamos cuando entren {buscaTexto}.</p>
      </div>
      <div className={`flex gap-2 ${compacta ? 'mt-2.5 md:mt-0 md:w-[420px]' : 'mt-3'}`}>
        <label htmlFor={`suscripcion-mail-${compacta ? 'c' : 'f'}`} className="sr-only">
          Tu mail
        </label>
        <input
          id={`suscripcion-mail-${compacta ? 'c' : 'f'}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError(null)
          }}
          placeholder="martina@gmail.com"
          className="min-w-0 flex-1 h-11 rounded-xl border border-gray-200 bg-white px-3 text-[16px] outline-none focus:ring-2 focus:ring-[#1A5C38]"
        />
        <button type="submit" disabled={estado === 'enviando'} className="flex-none h-11 px-4 rounded-xl text-white font-bold disabled:opacity-70" style={{ background: VERDE }}>
          {estado === 'enviando' ? 'Anotando…' : 'Quiero recibirlas'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-[#E0245E] mt-2" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
