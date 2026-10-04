'use client'

// El MAZO tipo Tinder (David, 3-oct-2026), sobre fondo blanco: de a una
// tarjeta, primero las nuestras (sello verde) y después las "En red" (otras
// inmobiliarias de la zona, dicho abiertamente). Deslizar a la derecha = ♥,
// a la izquierda = paso (o los botones ✕ / ♥, o las flechas del teclado).
// Tocar el costado de las fotos pasa de par. Al final, las elegidas en grande
// con el formulario; al salir con alguna guardada, la hoja de nombre y
// WhatsApp; si no guarda ninguna, el rescate (una vez por visita). La
// consulta entra a Hilo con todo lo que marcó.
//
// Lo abren la ficha ("Más casas en <barrio>", solo abajo de todo) y "Conocé
// tu próximo hogar" de la home. Se monta al abrir y se desmonta al cerrar.

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import {
  type GuardadaLocal,
  type ItemFeed,
  escribirContacto,
  escribirGuardadas,
  estiloSinLogo,
  leerContacto,
  leerGuardadas,
} from '@/lib/feed-en-red'
import { trackEvent, trackFbEvent } from '@/lib/analytics'

export const VERDE = '#1A5C38'
const OCRE_FONDO = '#F4EAD8'
const OCRE_TEXTO = '#7A5212'
export const ROSA = '#E0245E'
/** Cuánto hay que arrastrar la tarjeta para que cuente como ♥ o paso. */
const UMBRAL_SWIPE = 90
const DURACION_SALIDA = 260

/** El rescate sale UNA vez por visita (aunque abra el mazo varias veces). */
let rescateMostrado = false

/**
 * Las ♥ de este navegador (localStorage: sobreviven al pasar de una ficha a
 * otra). `montado` = ya se leyó el almacenamiento (antes, nada se muestra
 * guardado: evita el desfasaje con el HTML del servidor).
 */
export function useGuardadas() {
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
  }, [])
  const limpiar = useCallback(() => {
    actuales.current = []
    setGuardadas([])
    escribirGuardadas([])
  }, [])
  const esGuardada = useCallback((key: string) => guardadas.some((g) => g.key === key), [guardadas])
  return { guardadas, guardar, limpiar, esGuardada, montado }
}

export function Sello({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={`${className} flex-none`} viewBox="0 0 24 24" role="img" aria-label="Verificada">
      <polygon
        fill={VERDE}
        points="24,12 22,14.7 22.4,18 19.4,19.4 18,22.4 14.7,22 12,24 9.3,22 6,22.4 4.6,19.4 1.6,18 2,14.7 0,12 2,9.3 1.6,6 4.6,4.6 6,1.6 9.3,2 12,0 14.7,2 18,1.6 19.4,4.6 22.4,6 22,9.3"
      />
      <path d="M7.2 12.4l3.1 3.1 6.5-6.6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
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

function Chip({ nuestra }: { nuestra: boolean }) {
  return nuestra ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white font-raleway shadow-sm" style={{ background: VERDE }}>
      SI
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-raleway shadow-sm" style={{ background: OCRE_FONDO, color: OCRE_TEXTO }}>
      <IconoRed className="w-3 h-3" /> En red
    </span>
  )
}

export type Arrastre = { dx: number; dy: number }

/** Cuántos pares de fotos tiene (se muestran de a 2, una arriba de la otra). */
const paresDe = (item: ItemFeed) => Math.max(1, Math.ceil(item.fotos.length / 2))

/**
 * Una tarjeta del mazo. Las fotos de las casas son apaisadas: en una tarjeta
 * vertical, UNA foto queda recortada y agrandada ("estirada", David 3-oct).
 * Por eso van de a DOS, una arriba de la otra, cada una casi en su forma, y
 * los datos abajo sobre blanco. Tocar el costado de las fotos pasa al
 * siguiente par (barritas arriba). La de arriba se arrastra; la de abajo
 * asoma un poco más chica; 'quieta' = la de la ficha (no se arrastra).
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
}: {
  item: ItemFeed
  modo: 'arriba' | 'abajo' | 'quieta'
  guardada: boolean
  arrastre: Arrastre | null
  salida: 'like' | 'pass' | null
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp?: (e: React.PointerEvent<HTMLDivElement>) => void
  par: number
}) {
  const arriba = modo === 'arriba'
  const dx = arrastre?.dx ?? 0
  const transform =
    modo === 'abajo'
      ? 'scale(0.95) translateY(10px)'
      : salida
        ? `translateX(${salida === 'like' ? 140 : -140}%) rotate(${salida === 'like' ? 18 : -18}deg)`
        : arrastre
          ? `translateX(${dx}px) translateY(${(arrastre.dy ?? 0) * 0.15}px) rotate(${dx / 18}deg)`
          : 'none'
  const transicion = arriba && arrastre && !salida ? 'none' : `transform ${DURACION_SALIDA}ms ease-out`
  const fuerza = Math.min(1, Math.abs(dx) / UMBRAL_SWIPE)
  const n = item.fotos.length
  const pares = paresDe(item)
  const p = Math.min(par, pares - 1)
  // El último par de una cantidad impar vuelve a la primera foto: nunca una sola estirada.
  const fotos = n > 1 ? [item.fotos[(p * 2) % n], item.fotos[(p * 2 + 1) % n]] : item.fotos.slice(0, 1)

  return (
    <div
      className={`absolute inset-0 flex flex-col rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.10)] select-none ${arriba ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{ transform, transition: transicion, touchAction: arriba ? 'none' : undefined }}
      onPointerDown={arriba ? onPointerDown : undefined}
      onPointerMove={arriba ? onPointerMove : undefined}
      onPointerUp={arriba ? onPointerUp : undefined}
      onPointerCancel={arriba ? onPointerUp : undefined}
      aria-hidden={modo === 'abajo'}
    >
      {/* Fotos de a dos */}
      <div data-fotos className="relative flex-1 min-h-0 flex flex-col gap-[3px] bg-white">
        {fotos.map((src, i) => (
          <div key={`${src}-${i}`} className="relative flex-1 min-h-0 bg-gray-100 overflow-hidden">
            <Image
              src={src}
              alt={`${item.titulo} — foto ${p * 2 + i + 1}`}
              fill
              draggable={false}
              sizes="(max-width: 480px) 100vw, 440px"
              className="object-cover pointer-events-none"
              style={estiloSinLogo(item.logo)}
              priority={modo !== 'abajo' && i === 0}
            />
          </div>
        ))}

        {/* Barritas: una por par de fotos */}
        {pares > 1 && (
          <div className="absolute top-2.5 left-3 right-3 flex gap-1">
            {Array.from({ length: pares }, (_, i) => (
              <span key={i} className={`h-1 flex-1 rounded-full shadow-sm ${i === p ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
        )}
        <div className="absolute top-6 left-3 flex items-center gap-2">
          <Chip nuestra={item.esNuestra} />
          {item.masVista && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-gray-900 shadow-sm">De las más vistas</span>
          )}
        </div>
        {guardada && (
          <div className="absolute top-6 right-3 text-[#E0245E] drop-shadow">
            <Corazon lleno className="w-7 h-7" />
          </div>
        )}

        {/* Sellos mientras arrastra */}
        {arriba && dx > 8 && (
          <span
            className="absolute top-16 left-5 -rotate-12 rounded-xl border-4 px-3 py-1 text-2xl font-black tracking-wide font-raleway bg-white/85"
            style={{ borderColor: VERDE, color: VERDE, opacity: fuerza }}
          >
            ME GUSTA
          </span>
        )}
        {arriba && dx < -8 && (
          <span className="absolute top-16 right-5 rotate-12 rounded-xl border-4 border-gray-500 px-3 py-1 text-2xl font-black tracking-wide text-gray-600 font-raleway bg-white/85" style={{ opacity: fuerza }}>
            PASO
          </span>
        )}
      </div>

      {/* Datos sobre blanco */}
      <div className="flex-none px-4 pt-3 pb-3.5 bg-white">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[24px] font-black font-numeric leading-none text-gray-900">{item.precio}</p>
          {/* Solo en el mazo abierto: en la ficha la tarjeta entera es un botón (no se anida un link). */}
          {item.href && arriba && (
            <Link
              href={item.href}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="flex-none text-xs font-bold font-raleway"
              style={{ color: VERDE }}
            >
              Ver ficha
            </Link>
          )}
        </div>
        {item.datos && <p className="text-[15px] mt-1.5 text-gray-700 font-poppins">{item.datos}</p>}
        <p className="text-[13px] mt-1 flex items-center gap-1.5 min-w-0 text-gray-500">
          {item.esNuestra ? <Sello /> : <IconoRed className="w-4 h-4 flex-none" />}
          <span className="truncate">
            {item.esNuestra ? 'SI Inmobiliaria' : 'Otra inmobiliaria'}
            {item.zona ? ` · ${item.zona}` : ''}
          </span>
        </p>
      </div>
    </div>
  )
}

export function BotonesTinder({ onPaso, onMeGusta, chicos = false }: { onPaso: () => void; onMeGusta: () => void; chicos?: boolean }) {
  const tam = chicos ? 'w-14 h-14' : 'w-16 h-16'
  const icono = chicos ? 'w-7 h-7' : 'w-8 h-8'
  return (
    <div className="flex items-center justify-center gap-8">
      <button
        type="button"
        onClick={onPaso}
        aria-label="Paso"
        className={`${tam} rounded-full bg-white border border-gray-200 shadow-[0_6px_18px_rgba(0,0,0,0.10)] grid place-items-center text-gray-500 active:scale-90 transition-transform`}
      >
        <X className={icono} strokeWidth={2.6} />
      </button>
      <button
        type="button"
        onClick={onMeGusta}
        aria-label="Me gusta"
        className={`${tam} rounded-full bg-white border border-gray-200 shadow-[0_6px_18px_rgba(0,0,0,0.10)] grid place-items-center active:scale-90 transition-transform`}
        style={{ color: ROSA }}
      >
        <Corazon lleno className={icono} />
      </button>
    </div>
  )
}


type EstadoHoja = { motivo: 'salir' | 'boton' } | null

export default function MazoCasas({
  items,
  titulo,
  barrio,
  inicio = 0,
  guardadasApi,
  onCerrar,
  origen,
  busqueda = null,
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
}) {
  const { guardadas, guardar, limpiar, esGuardada } = guardadasApi
  const [indice, setIndice] = useState(() => Math.min(Math.max(0, inicio), items.length))
  const [foto, setFoto] = useState(0)
  const [arrastre, setArrastre] = useState<Arrastre | null>(null)
  const [salida, setSalida] = useState<'like' | 'pass' | null>(null)
  const [hoja, setHoja] = useState<EstadoHoja>(null)
  const inicioArrastre = useRef<{ x: number; y: number } | null>(null)
  // Rescate: una vez por visita, cuando pasa 4 seguidas sin ♥ o se va sin guardar.
  const [rescate, setRescate] = useState<'mazo' | 'salir' | null>(null)
  const [rescateVisto, setRescateVisto] = useState(rescateMostrado)
  const pasesSeguidos = useRef(0)
  const [vistas, setVistas] = useState(0)

  const marcarRescate = useCallback((momento: 'mazo' | 'salir') => {
    rescateMostrado = true
    setRescateVisto(true)
    setRescate(momento)
  }, [])

  useEffect(() => {
    trackEvent('feed_en_red_abrir', { cantidad: items.length, origen })
    // Solo al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const actual = items[indice] ?? null
  const siguiente = items[indice + 1] ?? null
  const terminado = indice >= items.length

  /** ♥ o paso: la tarjeta sale volando y aparece la siguiente. */
  const decidir = useCallback(
    (accion: 'like' | 'pass') => {
      if (!actual || salida || rescate) return
      if (accion === 'like') {
        guardar(actual)
        pasesSeguidos.current = 0
      } else {
        pasesSeguidos.current += 1
      }
      // 4 seguidas con ✕ y ninguna guardada: no es lo que busca → rescate.
      const rescatar = accion === 'pass' && guardadas.length === 0 && pasesSeguidos.current >= 4 && !rescateVisto && indice + 1 < items.length
      setSalida(accion)
      setVistas((v) => Math.max(v, indice + 1))
      window.setTimeout(() => {
        setIndice((i) => i + 1)
        setFoto(0)
        setArrastre(null)
        setSalida(null)
        if (rescatar) marcarRescate('mazo')
      }, DURACION_SALIDA)
    },
    [actual, salida, rescate, rescateVisto, guardar, guardadas.length, indice, items.length, marcarRescate],
  )

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (salida) return
    e.currentTarget.setPointerCapture(e.pointerId)
    inicioArrastre.current = { x: e.clientX, y: e.clientY }
    setArrastre({ dx: 0, dy: 0 })
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ini = inicioArrastre.current
    if (!ini) return
    setArrastre({ dx: e.clientX - ini.x, dy: e.clientY - ini.y })
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const ini = inicioArrastre.current
    inicioArrastre.current = null
    if (!ini || !actual) return setArrastre(null)
    const dx = e.clientX - ini.x
    const dy = e.clientY - ini.y
    if (Math.abs(dx) > UMBRAL_SWIPE) return decidir(dx > 0 ? 'like' : 'pass')
    setArrastre(null)
    // Un toque (sin arrastrar) sobre las fotos: mitad izquierda = par anterior, derecha = siguiente.
    const pares = paresDe(actual)
    const zona = e.currentTarget.querySelector('[data-fotos]')?.getBoundingClientRect()
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6 && pares > 1 && zona && e.clientY >= zona.top && e.clientY <= zona.bottom) {
      const derecha = e.clientX - zona.left > zona.width / 2
      setFoto((f) => (derecha ? Math.min(f + 1, pares - 1) : Math.max(f - 1, 0)))
    }
  }

  const verDeNuevo = () => {
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
    onCerrar()
  }
  const salir = () => {
    if (guardadas.length > 0) return setHoja({ motivo: 'salir' })
    // Se va sin guardar ninguna después de mirar algunas: una pregunta rápida.
    if (!rescateVisto && vistas > 0) return marcarRescate('salir')
    cerrarTodo()
  }

  // Sin scroll de la página de atrás; Escape sale, flechas = paso / ♥.
  useEffect(() => {
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (hoja) setHoja(null)
        else if (rescate) setRescate(null)
        else salir()
      } else if (!hoja && !rescate && e.key === 'ArrowRight') decidir('like')
      else if (!hoja && !rescate && e.key === 'ArrowLeft') decidir('pass')
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previo
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoja, rescate, guardadas.length, decidir])

  const n = items.length
  const g = guardadas.length

  return createPortal(
    <div className="fixed inset-0 z-[10400] bg-white md:bg-white/85 md:backdrop-blur-sm md:flex md:items-center md:justify-center" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="relative flex flex-col h-[100dvh] w-full bg-white md:h-[92vh] md:max-w-[440px] md:rounded-3xl md:border md:border-gray-200 md:shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-3 px-4 pt-[max(14px,env(safe-area-inset-top))] pb-2">
          <div className="min-w-0">
            <p className="font-black text-gray-900 font-raleway truncate">{titulo}</p>
            <p className="text-xs text-gray-500">
              {terminado ? `Viste las ${n}` : `${indice + 1} de ${n}`}
              {g > 0 ? ` · ♥ ${g} guardada${g > 1 ? 's' : ''}` : ''}
            </p>
          </div>
          <button type="button" onClick={salir} aria-label="Salir" className="w-10 h-10 rounded-full border border-gray-200 bg-white grid place-items-center flex-none text-gray-800 hover:bg-gray-50">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="px-4 pb-3 text-xs leading-relaxed text-gray-500">
          <strong className="text-gray-800">Algunas las publican otras inmobiliarias.</strong> Te las mostramos y te coordinamos la visita nosotros.
        </p>

        {/* Mazo */}
        <div className="relative flex-1 mx-4 min-h-0">
          {!terminado && actual ? (
            <>
              {siguiente && <Tarjeta key={siguiente.key} item={siguiente} modo="abajo" guardada={esGuardada(siguiente.key)} arrastre={null} salida={null} par={0} />}
              <Tarjeta
                key={actual.key}
                item={actual}
                modo="arriba"
                guardada={esGuardada(actual.key)}
                arrastre={arrastre}
                salida={salida}
                par={foto}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              />
            </>
          ) : g > 0 ? (
            // El CTA AL FINAL con las elegidas (David, 3-oct): el formulario ya está acá.
            <div className="absolute inset-0 rounded-3xl border border-gray-200 bg-white overflow-y-auto px-5 py-5">
              <HojaContacto
                enLinea
                guardadas={guardadas}
                barrio={barrio}
                busqueda={busqueda}
                textoCancelar="Verlas de nuevo"
                onCancelar={verDeNuevo}
                onListo={limpiar}
                onCerrar={cerrarTodo}
              />
            </div>
          ) : (
            <div className="absolute inset-0 rounded-3xl border border-gray-200 bg-white overflow-y-auto px-5 py-5">
              {rescateVisto ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-xl font-black text-gray-900 font-raleway">Viste las {n}</p>
                  <p className="text-sm text-gray-600 mt-1.5 max-w-xs">Podés verlas de nuevo y darle ♥ a las que te gusten.</p>
                  <button type="button" onClick={verDeNuevo} className="mt-5 h-11 px-6 rounded-2xl border border-gray-200 text-gray-800 font-semibold">
                    Verlas de nuevo
                  </button>
                </div>
              ) : (
                <Rescate momento="fin" barrio={barrio} busqueda={busqueda} vistas={n} onListo={cerrarTodo} onSecundario={verDeNuevo} />
              )}
            </div>
          )}
          {rescate === 'mazo' && !terminado && (
            <div className="absolute inset-0 z-10 rounded-3xl border border-gray-200 bg-white overflow-y-auto px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
              <Rescate momento="mazo" barrio={barrio} busqueda={busqueda} vistas={vistas} onListo={() => setRescate(null)} onSecundario={() => setRescate(null)} />
            </div>
          )}
        </div>

        {/* Botones ✕ / ♥ */}
        <div className="px-4 pt-4 pb-[max(14px,env(safe-area-inset-bottom))]">
          {!terminado && !rescate && <BotonesTinder onPaso={() => decidir('pass')} onMeGusta={() => decidir('like')} />}
          {/* Mientras desliza, solo ✕ y ♥ (David, 3-oct: "que se concentre en eso"); el CTA está al final. */}
          {!terminado && !rescate && (
            <p className="mt-3 text-center text-xs text-gray-500">
              {g > 0 ? (
                <>
                  <span style={{ color: ROSA }}>♥</span> {g} guardada{g > 1 ? 's' : ''} · seguí deslizando, al final te las mandamos
                </>
              ) : (
                'Deslizá a la derecha si te gusta, a la izquierda para pasar'
              )}
            </p>
          )}
        </div>

        {rescate === 'salir' && (
          <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex items-end" onClick={(e) => e.target === e.currentTarget && cerrarTodo()}>
            <div className="w-full bg-white rounded-t-3xl border-t border-gray-200 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] px-5 pt-4 pb-[max(22px,env(safe-area-inset-bottom))]">
              <div className="w-10 h-1 rounded bg-gray-200 mx-auto mb-4" />
              <Rescate momento="salir" barrio={barrio} busqueda={busqueda} vistas={vistas} onListo={cerrarTodo} onSecundario={cerrarTodo} />
            </div>
          </div>
        )}
        {hoja && (
          <HojaContacto
            guardadas={guardadas}
            barrio={barrio}
            busqueda={busqueda}
            onCancelar={() => (hoja.motivo === 'salir' ? cerrarTodo() : setHoja(null))}
            onListo={limpiar}
            onCerrar={cerrarTodo}
          />
        )}
      </div>
    </div>,
    document.body,
  )
}

function HojaContacto({
  guardadas,
  barrio,
  busqueda = null,
  onCancelar,
  onListo,
  onCerrar,
  enLinea = false,
  textoCancelar = 'No, gracias',
}: {
  guardadas: GuardadaLocal[]
  barrio: string | null
  busqueda?: string | null
  onCancelar: () => void
  onListo: () => void
  onCerrar: () => void
  /** true = el CTA del final del mazo (sin velo ni hoja que sube). */
  enLinea?: boolean
  textoCancelar?: string
}) {
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState<string | null>(null)
  const nombreRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const c = leerContacto()
    setNombre(c.nombre)
    setWhatsapp(c.whatsapp)
    // En el final del mazo no se abre el teclado solo: primero ve sus elegidas.
    if (!enLinea) window.setTimeout(() => nombreRef.current?.focus(), 60)
  }, [enLinea])

  const n = guardadas.length
  const nuestras = guardadas.filter((g) => g.esNuestra).length
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
    const nom = nombre.trim()
    if (nom.length < 2) return setError('Poné tu nombre así el asesor sabe cómo llamarte.')
    if (whatsapp.replace(/\D/g, '').length < 10) return setError('Revisá el WhatsApp: con característica, por ejemplo 341 555 1234.')
    setError(null)
    setEnviando(true)
    try {
      const res = await fetch('/api/feed-en-red/consulta', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nombre: nom, whatsapp, guardadas: guardadas.map((g) => g.key), barrio, busqueda, pageUrl: window.location.href }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'No pudimos enviarlo. Probá de nuevo.')
      escribirContacto({ nombre: nom, whatsapp })
      trackEvent('feed_en_red_consulta', { cantidad: n, en_red: red })
      trackFbEvent('Lead', { content_name: 'feed_en_red', content_ids: guardadas.filter((g) => g.esNuestra).map((g) => g.key.slice(2)) })
      setListo(nom.split(/\s+/)[0])
      onListo()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos enviarlo. Probá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  const contenido = (
    <>
        {listo ? (
          <div className="text-center py-3">
            <div className="text-4xl" style={{ color: VERDE }} aria-hidden="true">
              ✓
            </div>
            <h3 className="text-lg font-black text-gray-900 mt-1 font-raleway">Listo, {listo}</h3>
            <p className="text-sm text-gray-600 mt-1">Un asesor de SI te escribe por WhatsApp con las que guardaste.</p>
            <button type="button" onClick={onCerrar} className="mt-4 w-full h-12 rounded-2xl text-white font-bold" style={{ background: VERDE }}>
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate>
            {enLinea ? (
              // Final del mazo: las elegidas bien a la vista, con su precio.
              <div className="grid grid-cols-2 gap-2 mb-4">
                {guardadas.map((g) => (
                  <div key={g.key} className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      {g.foto && <Image src={g.foto} alt="" fill sizes="(max-width: 480px) 50vw, 200px" className="object-cover" style={estiloSinLogo(g.logo)} />}
                      <span className="absolute top-1.5 right-1.5 text-[#E0245E] drop-shadow">
                        <Corazon lleno className="w-5 h-5" />
                      </span>
                    </div>
                    <p className="px-2 py-1.5 text-[13px] font-black text-gray-900 font-numeric truncate">{g.precio}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {guardadas.map((g) =>
                  g.foto ? (
                    <div key={g.key} className="relative w-14 h-14 flex-none rounded-xl overflow-hidden bg-gray-100">
                      <Image src={g.foto} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                  ) : null,
                )}
              </div>
            )}
            <h3 className="text-lg font-black text-gray-900 font-raleway [text-wrap:balance]">
              {n === 1 ? 'Te gustó 1' : `Te gustaron ${n}`}. ¿Te ayudamos?
            </h3>
            <p className="text-[13px] leading-relaxed text-gray-600 mt-1 mb-3.5">{explicacion}</p>
            <label htmlFor="feed-nombre" className="block text-xs font-semibold text-gray-800 mb-1">
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
            <label htmlFor="feed-wsp" className="block text-xs font-semibold text-gray-800 mb-1">
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
              className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[16px] mb-2 outline-none focus:ring-2 focus:ring-[#1A5C38]"
            />
            {error && (
              <p className="text-xs text-[#E0245E] mb-2" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={enviando} className="w-full h-12 rounded-2xl text-white font-bold mt-1 disabled:opacity-70" style={{ background: VERDE }}>
              {enviando ? 'Enviando…' : 'Que me escriba un asesor'}
            </button>
            <button type="button" onClick={onCancelar} className="block mx-auto mt-3 text-sm text-gray-500">
              {textoCancelar}
            </button>
          </form>
        )}
    </>
  )
  if (enLinea) return <div className="w-full">{contenido}</div>
  return (
    <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex items-end" onClick={(e) => e.target === e.currentTarget && onCancelar()}>
      <div className="w-full bg-white rounded-t-3xl border-t border-gray-200 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] px-5 pt-4 pb-[max(22px,env(safe-area-inset-bottom))]">
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
  momento,
  barrio,
  busqueda = null,
  vistas,
  onListo,
  onSecundario,
}: {
  momento: 'mazo' | 'salir' | 'fin'
  barrio: string | null
  busqueda?: string | null
  vistas: number
  /** Ya contestó (con o sin WhatsApp). */
  onListo: () => void
  /** "Seguir mirando" / "No, gracias" / "Verlas de nuevo". */
  onSecundario: () => void
}) {
  const [motivos, setMotivos] = useState<string[]>([])
  const [whatsapp, setWhatsapp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    setWhatsapp(leerContacto().whatsapp)
    trackEvent('feed_en_red_rescate', { momento })
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
      whatsapp: conWhatsapp ? whatsapp : '',
      motivos,
      barrio,
      busqueda,
      vistas,
      pageUrl: window.location.href,
    })

  const enviar = async (conWhatsapp: boolean) => {
    if (conWhatsapp && whatsapp.replace(/\D/g, '').length < 10) {
      return setError('Dejá tu WhatsApp con característica, por ejemplo 341 555 1234.')
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
        <p className="text-sm text-gray-600 mt-1">Un asesor de SI te escribe por WhatsApp apenas tengamos algo así.</p>
        <button type="button" onClick={onListo} className="mt-4 w-full h-12 rounded-2xl text-white font-bold" style={{ background: VERDE }}>
          {momento === 'mazo' ? 'Seguir mirando' : 'Cerrar'}
        </button>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-black text-gray-900 font-raleway [text-wrap:balance]">{titulo}</h3>
      <p className="text-[13px] leading-relaxed text-gray-600 mt-1 mb-3.5">{bajada}</p>
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
      <label htmlFor={`rescate-wsp-${momento}`} className="block text-xs font-semibold text-gray-800 mb-1">
        Tu WhatsApp, si querés que te avisemos
      </label>
      <input
        id={`rescate-wsp-${momento}`}
        type="tel"
        inputMode="tel"
        value={whatsapp}
        onChange={(e) => {
          setWhatsapp(e.target.value)
          setError(null)
        }}
        autoComplete="tel"
        placeholder="341 555 1234"
        className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[16px] mb-2 outline-none focus:ring-2 focus:ring-[#1A5C38]"
      />
      {error && (
        <p className="text-xs text-[#E0245E] mb-2" role="alert">
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
