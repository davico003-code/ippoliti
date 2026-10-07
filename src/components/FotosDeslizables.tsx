'use client'

// Fotos de una tarjeta de propiedad que se pasan sin entrar a la ficha: en la
// compu, flechas al pasar el mouse sobre la foto; en el celu, swipe. Puntitos
// siempre (avisan que hay más fotos). Lo usan el listado /propiedades
// (PropiedadCardGrid) y "Nuestra selección" de la home: un solo carrusel.
//
// Lo que va encima de la foto (badges, pastilla del agente, play) entra como
// `children`. La tarjeta que lo envuelve es un <Link>: flechas y puntitos
// cortan el click para que pasar de foto no abra la ficha.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PortadaViva from '@/components/PortadaViva'

export default function FotosDeslizables({
  images,
  alt,
  sizes,
  priority = false,
  diferir = false,
  swipe = true,
  flechasSiempre = false,
  puntos = 'centro',
  imgClassName = '',
  className = '',
  style,
  portadaViva,
  children,
}: {
  images: string[]
  /** Texto alternativo de la portada; las demás suman " — foto N". */
  alt: string
  sizes: string
  priority?: boolean
  /** No montar ni la portada hasta que la página terminó de cargar. Para las
   *  cards de más abajo del listado en el celu: con señal floja, sus portadas
   *  (lazy, pero dentro del margen de 2500 px de Chrome) le comían el ancho de
   *  banda a la foto principal. Las que se montan después del load, normal. */
  diferir?: boolean
  /** Swipe horizontal en el celu. Apagarlo si la tarjeta vive dentro de un
   *  carrusel que ya scrollea de costado (se pelearían el gesto). */
  swipe?: boolean
  /** Flechas visibles siempre y también en el celu (donde no hay hover). Para
   *  tarjetas con `swipe` apagado: si no, en el celu no habría cómo pasar fotos. */
  flechasSiempre?: boolean
  /** Dónde van los puntitos: al costado contrario de lo que haya abajo en la foto
   *  (la cara del agente en la home va a la derecha; la pastilla del listado, a la izquierda). */
  puntos?: 'centro' | 'izquierda' | 'derecha'
  imgClassName?: string
  /** Clases del recuadro (proporción, fondo). */
  className?: string
  style?: CSSProperties
  /** Loop de la portada (destacadas): corre sobre la foto 1 y se apaga al pasar de foto. */
  portadaViva?: string | null
  children?: ReactNode
}) {
  const [imgIdx, setImgIdx] = useState(0)
  // Corta el shimmer del blur-up cuando la primera foto pintó (evita decenas de
  // animaciones corriendo bajo imágenes ya cargadas en grillas grandes).
  const [imgLoaded, setImgLoaded] = useState(false)
  // Fotos montadas en la tira del carrusel. Arranca solo con la portada (no
  // descargar 5 fotos por card en una grilla de 30); al pasar el mouse o tocar
  // la foto se precargan la anterior y las dos siguientes, y cada cambio corre la ventana.
  const [calentar, setCalentar] = useState(false)
  const [montadas, setMontadas] = useState<number[]>([0])
  const [cargada, setCargada] = useState(!diferir)
  useEffect(() => {
    if (cargada) return
    const listo = () => setCargada(true)
    if (document.readyState === 'complete') { listo(); return }
    // Si algo cuelga el load, que igual vea fotos al bajar.
    window.addEventListener('load', listo, { once: true })
    window.addEventListener('scroll', listo, { once: true, passive: true })
    return () => {
      window.removeEventListener('load', listo)
      window.removeEventListener('scroll', listo)
    }
  }, [cargada])
  useEffect(() => {
    if (!calentar || images.length < 2) return
    const n = images.length
    const vecinas = [imgIdx, (imgIdx + 1) % n, (imgIdx + 2) % n, (imgIdx - 1 + n) % n]
    setMontadas(m => vecinas.every(v => m.includes(v)) ? m : Array.from(new Set([...m, ...vecinas])))
  }, [calentar, imgIdx, images.length])

  // Pasar de foto también calienta (con teclado no hubo mouseenter).
  const prev = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setCalentar(true)
    setImgIdx(i => (i - 1 + images.length) % images.length)
  }
  const next = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setCalentar(true)
    setImgIdx(i => (i + 1) % images.length)
  }
  const goTo = (e: React.MouseEvent, i: number) => {
    e.preventDefault(); e.stopPropagation()
    setCalentar(true)
    setImgIdx(i)
  }

  // Dots: máximo 5 y discretos. Si hay más de 5 fotos, los 5 dots actúan como
  // indicador de progreso — el dot activo se mapea proporcionalmente al índice
  // real, y al clickear un dot se salta a la foto representativa de ese tramo.
  const DOT_MAX = 5
  const dotCount = Math.min(images.length, DOT_MAX)
  const activeDot = images.length <= DOT_MAX
    ? imgIdx
    : Math.round((imgIdx / (images.length - 1)) * (dotCount - 1))
  const dotToIndex = (d: number) => images.length <= DOT_MAX
    ? d
    : Math.round((d / (dotCount - 1)) * (images.length - 1))

  // Swipe en mobile: en pantallas chicas no hay flechas, así que el gesto
  // horizontal es la forma de pasar fotos (navegación circular). Si el
  // desplazamiento supera el umbral lo tratamos como swipe y bloqueamos el
  // click sintético para que no abra la ficha.
  const touchStartX = useRef<number | null>(null)
  const swipedRef = useRef(false)
  const SWIPE_THRESHOLD = 40
  const onTouchStart = (e: React.TouchEvent) => {
    setCalentar(true)
    touchStartX.current = e.touches[0].clientX
    swipedRef.current = false
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || images.length <= 1) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      swipedRef.current = true
      setImgIdx(i => dx < 0
        ? (i + 1) % images.length
        : (i - 1 + images.length) % images.length)
    }
    touchStartX.current = null
  }
  const onClickCapture = (e: React.MouseEvent) => {
    if (swipedRef.current) {
      e.preventDefault(); e.stopPropagation()
      swipedRef.current = false
    }
  }

  // `group/media` acota el hover a la imagen (no a toda la card), así las
  // flechas aparecen solo al pasar el mouse sobre la foto.
  const flecha = flechasSiempre
    ? 'flex w-9 h-9 bg-white/90 shadow-md'
    : 'hidden md:flex w-8 h-8 bg-white/85 shadow-sm opacity-0 group-hover/media:opacity-100 focus-visible:opacity-100'
  return (
    <div
      className={`group/media relative w-full overflow-hidden rounded-[14px] ${images.length === 0 ? 'bg-gray-100' : imgLoaded ? '' : 'si-img-shimmer'} ${className}`}
      onTouchStart={swipe ? onTouchStart : () => setCalentar(true)}
      onTouchEnd={swipe ? onTouchEnd : undefined}
      onMouseEnter={() => setCalentar(true)}
      onClickCapture={swipe ? onClickCapture : undefined}
      style={style}
    >
      {images.length > 0 ? (
        // Tira deslizable: la foto actual y sus vecinas ya montadas, así la
        // flecha/swipe corre la foto al instante en vez de esperar la descarga.
        <div
          className="absolute inset-0 flex transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: `translateX(-${imgIdx * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={src + i} className="relative h-full w-full flex-none overflow-hidden bg-gray-100">
              {cargada && montadas.includes(i) && (
                <Image
                  src={src}
                  alt={i === 0 ? alt : `${alt} — foto ${i + 1}`}
                  fill
                  className={`object-cover ${imgClassName}`}
                  sizes={sizes}
                  priority={priority && i === 0}
                  onLoad={i === 0 ? () => setImgLoaded(true) : undefined}
                />
              )}
              {i === 0 && portadaViva && <PortadaViva src={portadaViva} activa={imgIdx === 0} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
          Sin foto
        </div>
      )}

      {/* Patrón Vanzini: en desktop, flechas en hover sobre la imagen
          (group/media). En mobile no hay flechas y los dots quedan siempre
          visibles pero discretos. */}
      {images.length > 1 && (
        <>
          {/* Flechas: solo desktop (hidden md:flex), visibles en hover o foco;
              con `flechasSiempre`, siempre y en todos los tamaños. */}
          <button
            type="button"
            onClick={prev}
            aria-label="Foto anterior"
            className={`${flecha} absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full items-center justify-center text-gray-700 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 transition-opacity duration-200`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Foto siguiente"
            className={`${flecha} absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full items-center justify-center text-gray-700 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 transition-opacity duration-200`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {/* Dots: máx 5, siempre visibles (avisan que hay más fotos) con
              sombra para que se lean sobre fotos claras. */}
          <div className={`absolute bottom-2.5 z-10 flex items-center gap-1.5 ${puntos === 'izquierda' ? 'left-3' : puntos === 'derecha' ? 'right-3' : 'left-1/2 -translate-x-1/2'}`}>
            {Array.from({ length: dotCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => goTo(e, dotToIndex(i))}
                aria-label={`Ir a foto ${dotToIndex(i) + 1}`}
                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all duration-200"
                style={{
                  width: i === activeDot ? 8 : 7,
                  height: i === activeDot ? 8 : 7,
                  background: i === activeDot ? '#fff' : 'rgba(255,255,255,0.7)',
                  boxShadow: '0 0 3px rgba(0,0,0,0.45)',
                }}
              />
            ))}
          </div>
        </>
      )}

      {children}
    </div>
  )
}
