'use client'

// "Más casas en <barrio>" debajo de la ficha (David, 3-oct-2026). En la ficha:
// una fila de tarjetas "En red" (otras inmobiliarias de la zona, dicho
// abiertamente). Al tocar, se abren las tarjetas TIPO TINDER sobre fondo
// blanco: de a una, primero las nuestras parecidas (sello verde) y después
// las En red. Deslizar a la derecha = ♥, a la izquierda = paso (o los botones
// ✕ / ♥). Tocar el costado de la foto pasa de foto. Al tocar la X para salir,
// si guardó alguna, aparece la hoja para dejar nombre y WhatsApp: la consulta
// entra a Hilo con todo lo que marcó. Nunca se traba el "atrás" del celular.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import {
  type TokkoProperty,
  formatPrice,
  generatePropertySlug,
  getAllPhotos,
  getMainPhoto,
  getTotalSurface,
  tituloVisible,
  translatePropertyType,
} from '@/lib/tokko'
import {
  type FeedEnRed as DatosFeed,
  type GuardadaLocal,
  type ItemFeed,
  escribirContacto,
  escribirGuardadas,
  itemDeEnRed,
  leerContacto,
  leerGuardadas,
  pluralTipo,
} from '@/lib/feed-en-red'
import { trackEvent, trackFbEvent } from '@/lib/analytics'

const VERDE = '#1A5C38'
const OCRE_FONDO = '#F4EAD8'
const OCRE_TEXTO = '#7A5212'
const ROSA = '#E0245E'
/** Cuánto hay que arrastrar la tarjeta para que cuente como ♥ o paso. */
const UMBRAL_SWIPE = 90
const DURACION_SALIDA = 260

function itemDeNuestra(p: TokkoProperty): ItemFeed {
  const fotos = getAllPhotos(p)
  const principal = getMainPhoto(p)
  const beds = p.suite_amount || p.room_amount || 0
  const baths = p.bathroom_amount || 0
  const m2 = getTotalSurface(p)
  return {
    key: `n:${p.id}`,
    esNuestra: true,
    fotos: fotos.length ? fotos : principal ? [principal] : [],
    precio: formatPrice(p),
    datos: [
      translatePropertyType(p.type?.name),
      beds ? `${beds} dorm` : null,
      baths ? `${baths} baño${baths > 1 ? 's' : ''}` : null,
      m2 ? `${Math.round(m2).toLocaleString('es-AR')} m²` : null,
    ]
      .filter(Boolean)
      .join(' · '),
    titulo: tituloVisible(p) || p.fake_address || p.address || '',
    zona: p.location?.name ?? null,
    href: `/propiedades/${generatePropertySlug(p)}`,
    masVista: false,
  }
}

function Sello({ className = 'w-4 h-4' }: { className?: string }) {
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

function IconoRed({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="5" cy="12" r="2.5" />
      <circle cx="19" cy="6" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <path d="M7.3 10.9l9.4-3.8M7.3 13.1l9.4 3.8" />
    </svg>
  )
}

function Corazon({ lleno, className = 'w-7 h-7' }: { lleno: boolean; className?: string }) {
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

type Arrastre = { dx: number; dy: number }

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
function Tarjeta({
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
          <div key={`${src}-${i}`} className="relative flex-1 min-h-0 bg-gray-100">
            <Image
              src={src}
              alt={`${item.titulo} — foto ${p * 2 + i + 1}`}
              fill
              draggable={false}
              sizes="(max-width: 480px) 100vw, 440px"
              className="object-cover pointer-events-none"
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

function BotonesTinder({ onPaso, onMeGusta, chicos = false }: { onPaso: () => void; onMeGusta: () => void; chicos?: boolean }) {
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

export default function FeedEnRed({ property, nuestras }: { property: TokkoProperty; nuestras: TokkoProperty[] }) {
  const [datos, setDatos] = useState<DatosFeed | null>(null)
  const [abierto, setAbierto] = useState(false)
  const [indice, setIndice] = useState(0)
  const [foto, setFoto] = useState(0)
  const [arrastre, setArrastre] = useState<Arrastre | null>(null)
  const [salida, setSalida] = useState<'like' | 'pass' | null>(null)
  const [guardadas, setGuardadas] = useState<GuardadaLocal[]>([])
  const [hoja, setHoja] = useState<EstadoHoja>(null)
  const [montado, setMontado] = useState(false)
  const inicioArrastre = useRef<{ x: number; y: number } | null>(null)
  const seccionRef = useRef<HTMLElement>(null)
  // Aviso flotante "♥ Mirá N casas más": aparece cuando ya recorrió la ficha.
  const [recorrio, setRecorrio] = useState(false)
  const [bloqueALaVista, setBloqueALaVista] = useState(false)
  const [avisoDescartado, setAvisoDescartado] = useState(false)

  useEffect(() => {
    setMontado(true)
    setGuardadas(leerGuardadas())
  }, [])

  useEffect(() => {
    let cancelado = false
    fetch(`/api/propiedades/en-red?id=${property.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: DatosFeed | null) => {
        if (!cancelado && d && Array.isArray(d.tarjetas)) setDatos(d)
      })
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [property.id])

  const enRed = useMemo(() => (datos?.tarjetas ?? []).map(itemDeEnRed), [datos])
  const items = useMemo(
    () => [...nuestras.filter((p) => p.id !== property.id).map(itemDeNuestra).filter((i) => i.fotos.length > 0), ...enRed],
    [nuestras, property.id, enRed],
  )
  const barrio = datos?.barrio || property.location?.name || null
  const plural = pluralTipo(translatePropertyType(property.type?.name))
  const titulo = barrio ? `Más ${plural} en ${barrio}` : `Más ${plural} en la zona`
  const actual = items[indice] ?? null
  const siguiente = items[indice + 1] ?? null
  const terminado = indice >= items.length

  const esGuardada = useCallback((key: string) => guardadas.some((g) => g.key === key), [guardadas])

  const guardar = useCallback(
    (item: ItemFeed) => {
      if (guardadas.some((g) => g.key === item.key)) return
      const next = [...guardadas, { key: item.key, foto: item.fotos[0] ?? null, precio: item.precio, esNuestra: item.esNuestra }].slice(-12)
      setGuardadas(next)
      escribirGuardadas(next)
      trackEvent('feed_en_red_like', { tipo: item.esNuestra ? 'nuestra' : 'en_red' })
    },
    [guardadas],
  )

  /** ♥ o paso: la tarjeta sale volando y aparece la siguiente. */
  const decidir = useCallback(
    (accion: 'like' | 'pass') => {
      if (!actual || salida) return
      if (accion === 'like') guardar(actual)
      setSalida(accion)
      window.setTimeout(() => {
        setIndice((i) => i + 1)
        setFoto(0)
        setArrastre(null)
        setSalida(null)
      }, DURACION_SALIDA)
    },
    [actual, salida, guardar],
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

  const abrirEn = (i: number) => {
    descartarAviso()
    setIndice(Math.max(0, i))
    setFoto(0)
    setArrastre(null)
    setSalida(null)
    setAbierto(true)
    trackEvent('feed_en_red_abrir', { cantidad: items.length })
  }
  const abrir = (key: string | null) => abrirEn(key ? items.findIndex((it) => it.key === key) : 0)
  const cerrarTodo = () => {
    setHoja(null)
    setAbierto(false)
  }
  const salir = () => {
    if (guardadas.length > 0) setHoja({ motivo: 'salir' })
    else setAbierto(false)
  }

  // Sin scroll de la página de atrás; Escape sale, flechas = paso / ♥.
  useEffect(() => {
    if (!abierto) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (hoja) setHoja(null)
        else salir()
      } else if (!hoja && e.key === 'ArrowRight') decidir('like')
      else if (!hoja && e.key === 'ArrowLeft') decidir('pass')
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previo
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, hoja, guardadas.length, decidir])

  /**
   * En la compu la ficha trae una copia oculta de la versión celu: hay DOS
   * FeedEnRed montados. Solo responde el visible (si no, se abrirían dos mazos).
   */
  const esVisible = () => !!seccionRef.current && seccionRef.current.getClientRects().length > 0

  function descartarAviso() {
    setAvisoDescartado(true)
    try {
      window.sessionStorage.setItem('si-mas-casas-aviso', 'no')
    } catch {
      /* sin almacenamiento: se vuelve a mostrar en la próxima ficha */
    }
  }

  // La pestaña "♥ Más casas" de la barra de arriba abre el mazo.
  useEffect(() => {
    if (enRed.length === 0) return
    const onAbrir = (e: Event) => {
      if (!esVisible()) return
      e.preventDefault()
      abrirEn(0)
    }
    window.addEventListener('si:abrir-mas-casas', onAbrir)
    return () => window.removeEventListener('si:abrir-mas-casas', onAbrir)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enRed.length, items.length])

  // Cuándo mostrar el aviso (David, 3-oct: "cuando ya está casi abajo"): al
  // llegar a "Ubicación", la última parte de la ficha — ya vio nuestra casa y
  // está por irse. Se va solo cuando el bloque de "Más casas" entra en pantalla.
  useEffect(() => {
    if (!montado || enRed.length === 0 || !esVisible()) return
    try {
      if (window.sessionStorage.getItem('si-mas-casas-aviso') === 'no') setAvisoDescartado(true)
    } catch {
      /* sin almacenamiento */
    }
    // Se mira en cada scroll (y no con un observer armado una vez) porque
    // "Ubicación" es el mapa y se monta tarde: al cargar el feed todavía no está.
    // capture:true agarra también el scroll del panel de la compu (no es window).
    let demora: number | undefined
    let cuadro = 0
    const revisar = () => {
      cuadro = 0
      const raiz = seccionRef.current
      if (!raiz) return
      const alto = window.innerHeight
      const r = raiz.getBoundingClientRect()
      setBloqueALaVista(r.top < alto && r.bottom > 0)
      if (demora !== undefined) return
      const ubicacion = Array.from(document.querySelectorAll<HTMLElement>('[id="ubicacion"]')).find((el) => el.getClientRects().length > 0)
      // Sin "Ubicación" (raro): cuando le falta menos de una pantalla y media para el bloque.
      const llego = ubicacion ? ubicacion.getBoundingClientRect().top < alto : r.top < alto * 2.5
      if (llego) demora = window.setTimeout(() => setRecorrio(true), 1500)
    }
    const onScroll = () => {
      if (!cuadro) cuadro = window.setTimeout(revisar, 120)
    }
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    revisar()
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true })
      window.clearTimeout(cuadro)
      window.clearTimeout(demora)
    }
  }, [montado, enRed.length])

  if (enRed.length === 0) return null
  const mostrarAviso = recorrio && !bloqueALaVista && !avisoDescartado && !abierto

  const n = items.length
  const g = guardadas.length

  return (
    <>
      <section ref={seccionRef} className="mt-4 bg-white rounded-2xl px-5 md:px-8 pt-6 pb-6 shadow-sm border border-gray-100" aria-labelledby="feed-en-red-titulo">
        <h2 id="feed-en-red-titulo" className="text-2xl font-black text-gray-900 [text-wrap:balance]">
          {titulo}
        </h2>
        <p className="text-sm text-gray-600 mt-1 mb-4 max-w-2xl">
          Algunas las publican otras inmobiliarias. Te las mostramos y te coordinamos la visita nosotros.
        </p>
        {items[0] && (
          <div className="max-w-[420px]">
            <button
              type="button"
              onClick={() => abrirEn(0)}
              aria-label={`Ver ${titulo.toLowerCase()}`}
              className="relative block w-full h-[470px] text-left rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-[#1A5C38]"
            >
              <Tarjeta item={items[0]} modo="quieta" guardada={montado && esGuardada(items[0].key)} arrastre={null} salida={null} par={0} />
            </button>
            <div className="mt-4">
              <BotonesTinder
                chicos
                onPaso={() => abrirEn(1)}
                onMeGusta={() => {
                  guardar(items[0])
                  abrirEn(1)
                }}
              />
            </div>
            <p className="mt-2.5 text-center text-xs text-gray-500">
              {n} para ver · deslizá a la derecha las que te gusten
            </p>
          </div>
        )}
      </section>

      {montado &&
        mostrarAviso &&
        createPortal(
          <div className="fixed left-1/2 -translate-x-1/2 bottom-[92px] md:bottom-6 z-[10300] w-[calc(100%-32px)] max-w-[380px] flex items-center gap-2 rounded-2xl bg-white border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.15)] pl-3 pr-1.5 py-1.5 animate-slide-up motion-reduce:animate-none">
            {items[0]?.fotos[0] && (
              <div className="relative w-10 h-10 flex-none rounded-xl overflow-hidden bg-gray-100">
                <Image src={items[0].fotos[0]} alt="" fill sizes="40px" className="object-cover" />
              </div>
            )}
            <button type="button" onClick={() => abrirEn(0)} className="flex-1 min-w-0 text-left py-1.5">
              <span className="block text-sm font-bold text-gray-900 font-raleway truncate">
                <span style={{ color: ROSA }}>♥</span> Mirá {n} {plural} más
              </span>
              <span className="block text-xs text-gray-500 truncate">{barrio ? `en ${barrio} · ` : ''}deslizá y guardá las que te gusten</span>
            </button>
            <button type="button" onClick={descartarAviso} aria-label="Cerrar aviso" className="w-9 h-9 flex-none rounded-full grid place-items-center text-gray-400 hover:bg-gray-50">
              <X className="w-4 h-4" />
            </button>
          </div>,
          document.body,
        )}

      {montado &&
        abierto &&
        createPortal(
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
                ) : (
                  <div className="absolute inset-0 rounded-3xl border border-gray-200 bg-white flex flex-col items-center justify-center text-center px-6">
                    {g > 0 && (
                      <div className="flex -space-x-3 mb-4">
                        {guardadas.slice(0, 5).map((x) =>
                          x.foto ? (
                            <div key={x.key} className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow">
                              <Image src={x.foto} alt="" fill sizes="56px" className="object-cover" />
                            </div>
                          ) : null,
                        )}
                      </div>
                    )}
                    <p className="text-xl font-black text-gray-900 font-raleway">Viste las {n}</p>
                    <p className="text-sm text-gray-600 mt-1.5 max-w-xs">
                      {g > 0
                        ? `Guardaste ${g}. Un asesor de SI te las muestra y te coordina las visitas.`
                        : 'No guardaste ninguna. Podés verlas de nuevo y darle ♥ a las que te gusten.'}
                    </p>
                    <div className="flex flex-col gap-2 w-full max-w-xs mt-5">
                      {g > 0 && (
                        <button type="button" onClick={() => setHoja({ motivo: 'boton' })} className="h-12 rounded-2xl text-white font-bold" style={{ background: VERDE }}>
                          Que me escriba un asesor
                        </button>
                      )}
                      <button type="button" onClick={() => abrir(null)} className="h-11 rounded-2xl border border-gray-200 text-gray-800 font-semibold">
                        Verlas de nuevo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones ✕ / ♥ y contacto */}
              <div className="px-4 pt-4 pb-[max(14px,env(safe-area-inset-bottom))]">
                {!terminado && <BotonesTinder onPaso={() => decidir('pass')} onMeGusta={() => decidir('like')} />}
                {!terminado &&
                  (g > 0 ? (
                    <button type="button" onClick={() => setHoja({ motivo: 'boton' })} className="mt-3 w-full h-11 rounded-2xl font-bold text-sm border-2" style={{ borderColor: VERDE, color: VERDE }}>
                      ♥ {g} guardada{g > 1 ? 's' : ''} · Que me contacten
                    </button>
                  ) : (
                    <p className="mt-3 text-center text-xs text-gray-500">Deslizá a la derecha si te gusta, a la izquierda para pasar</p>
                  ))}
              </div>

              {hoja && (
                <HojaContacto
                  guardadas={guardadas}
                  barrio={barrio}
                  onCancelar={() => (hoja.motivo === 'salir' ? cerrarTodo() : setHoja(null))}
                  onListo={() => {
                    setGuardadas([])
                    escribirGuardadas([])
                  }}
                  onCerrar={cerrarTodo}
                />
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

function HojaContacto({
  guardadas,
  barrio,
  onCancelar,
  onListo,
  onCerrar,
}: {
  guardadas: GuardadaLocal[]
  barrio: string | null
  onCancelar: () => void
  onListo: () => void
  onCerrar: () => void
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
    window.setTimeout(() => nombreRef.current?.focus(), 60)
  }, [])

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
        body: JSON.stringify({ nombre: nom, whatsapp, guardadas: guardadas.map((g) => g.key), barrio, pageUrl: window.location.href }),
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

  return (
    <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex items-end" onClick={(e) => e.target === e.currentTarget && onCancelar()}>
      <div className="w-full bg-white rounded-t-3xl border-t border-gray-200 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] px-5 pt-4 pb-[max(22px,env(safe-area-inset-bottom))]">
        <div className="w-10 h-1 rounded bg-gray-200 mx-auto mb-4" />
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
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {guardadas.map((g) =>
                g.foto ? (
                  <div key={g.key} className="relative w-14 h-14 flex-none rounded-xl overflow-hidden bg-gray-100">
                    <Image src={g.foto} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                ) : null,
              )}
            </div>
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
              No, gracias
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
