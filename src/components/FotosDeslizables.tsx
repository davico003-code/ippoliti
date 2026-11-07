'use client'

// Fotos de una tarjeta de propiedad que se pasan sin entrar a la ficha: en la
// compu, flechas al pasar el mouse sobre la foto (o, con `recorrerConMouse`,
// la foto sigue al mouse como en AliExpress); en el celu, swipe que sigue al
// dedo (como Fotos del iPhone). Puntitos siempre (avisan que hay más fotos),
// pero solo como indicador: no se tocan ni se tabulan. Lo usan el listado
// /propiedades (PropiedadCardGrid) y "Nuestra selección" de la home: un solo carrusel.
//
// Lo que va encima de la foto (badges, pastilla del agente) entra como
// `children`. La tarjeta que lo envuelve es un <Link>: las flechas y el swipe
// cortan el click para que pasar de foto no abra la ficha.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import Image from '@/components/Imagen'
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
  recorrerConMouse = false,
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
   *  carrusel que ya scrollea de costado (se pelearían el gesto). Si se olvida,
   *  se apaga solo al detectar un contenedor que desborda de costado. */
  swipe?: boolean
  /** Flechas visibles siempre y también en el celu (donde no hay hover). Para
   *  tarjetas con `swipe` apagado: si no, en el celu no habría cómo pasar fotos. */
  flechasSiempre?: boolean
  /** En la compu, la foto sigue al mouse sin hacer click (como AliExpress): la
   *  foto se parte en franjas verticales, una por foto, y al salir vuelve la
   *  portada. Reemplaza a las flechas del hover (quedan solo para el teclado). */
  recorrerConMouse?: boolean
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
  // Mouse adentro con `recorrerConMouse`: se montan todas (en el listado son 5)
  // para que cada franja muestre su foto al instante, y el cambio va sin
  // deslizar (con la animación de 300 ms la foto quedaba atrás del mouse).
  const [recorriendo, setRecorriendo] = useState(false)
  // Sin precarga de las fotos 2-5 de las tarjetas a la vista (17→22-oct): cada
  // visita de la compu (y cada robot que se presenta como compu) mandaba a
  // Vercel a achicar 4 fotos más por tarjeta y el gasto de imágenes se
  // multiplicó por 20. Se bajan cuando el mouse entra, todas juntas.
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
  // Con el mouse adentro van todas juntas y `eager`: con el `lazy` de siempre,
  // el navegador no pedía las que la tira corre fuera de la vista (la 4 y la 5
  // arrancaban recién cuando el mouse llegaba a su franja).
  const todas = recorriendo
  useEffect(() => {
    if (!calentar || images.length < 2) return
    const n = images.length
    const vecinas = todas
      ? Array.from({ length: n }, (_, i) => i)
      : [imgIdx, (imgIdx + 1) % n, (imgIdx + 2) % n, (imgIdx - 1 + n) % n]
    setMontadas(m => vecinas.every(v => m.includes(v)) ? m : Array.from(new Set([...m, ...vecinas])))
  }, [calentar, todas, imgIdx, images.length])

  const cajaRef = useRef<HTMLDivElement>(null)
  // La tira se mueve a mano (ref) mientras el dedo arrastra: re-renderizar la
  // tarjeta en cada touchmove no llega a 60 fps en un celu medio.
  const tiraRef = useRef<HTMLDivElement>(null)

  // Lleva la tira a `destino`. Con `saltar`, sin transición: de la última a la
  // primera con las flechas se veían pasar todas las fotos en 300 ms (un
  // "rebobinado" que desorientaba). Se escribe el transform a mano ANTES del
  // setState porque si el índice no cambia (el dedo volvió a la misma foto)
  // React no repinta el style y la tira quedaría corrida donde la soltó.
  const irA = (destino: number, saltar = false) => {
    const tira = tiraRef.current
    if (tira) {
      if (saltar) tira.style.transition = 'none'
      else tira.style.transition = '' // vuelve la de la clase (con el ease de la entrada)
      tira.style.transform = `translateX(-${destino * 100}%)`
      if (saltar) {
        void tira.offsetWidth // fuerza el estilo sin transición antes de devolverla
        tira.style.transition = ''
      }
    }
    setImgIdx(destino)
  }

  // Pasar de foto también calienta (con teclado no hubo mouseenter).
  // Las flechas siguen siendo circulares (en la compu no hay otro modo de
  // volver a la portada), pero la vuelta es un salto, no un barrido.
  const [anunciar, setAnunciar] = useState(false)
  const prev = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setCalentar(true)
    setRecorriendo(false)
    setAnunciar(true)
    irA((imgIdx - 1 + images.length) % images.length, imgIdx === 0)
  }
  const next = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setCalentar(true)
    setRecorriendo(false)
    setAnunciar(true)
    irA((imgIdx + 1) % images.length, imgIdx === images.length - 1)
  }

  // Dots: máximo 5 y discretos. Si hay más de 5 fotos, los 5 dots actúan como
  // indicador de progreso — el dot activo se mapea proporcionalmente al índice
  // real. Son solo indicador (antes eran botones de 7 px: 5 paradas de Tab por
  // tarjeta, 112 en la home, y un toque al lado abría la ficha).
  const DOT_MAX = 5
  const dotCount = Math.min(images.length, DOT_MAX)
  const activeDot = images.length <= DOT_MAX
    ? imgIdx
    : Math.round((imgIdx / (images.length - 1)) * (dotCount - 1))

  // Si la tarjeta vive dentro de algo que ya scrollea de costado (el carrusel
  // de la home en la compu, que en una tablet se maneja con el dedo), el swipe
  // de fotos se pelearía con ese scroll: ahí manda el carrusel, como con
  // `swipe` apagado. Se mira el overflow y que de verdad desborde (más que un
  // par de px sueltos): un contenedor con overflow-y:auto también reporta
  // overflow-x:auto, y el listado no tiene que perder el swipe por eso.
  const [enCarrusel, setEnCarrusel] = useState(false)
  useEffect(() => {
    if (!swipe) return
    for (let el = cajaRef.current?.parentElement; el && el !== document.body; el = el.parentElement) {
      const ox = getComputedStyle(el).overflowX
      if ((ox === 'auto' || ox === 'scroll') && el.scrollWidth - el.clientWidth > 40) {
        setEnCarrusel(true)
        return
      }
    }
  }, [swipe])
  const conSwipe = swipe && !enCarrusel && images.length > 1

  // Swipe en el celu: la foto sigue al dedo. El eje se decide en los primeros
  // 8 px: si el gesto es vertical, la página scrollea como siempre y la foto no
  // se mueve (antes un scroll en diagonal cambiaba la foto y cortaba el toque).
  // Al soltar decide la distancia (20% del ancho) o la velocidad (un flick
  // corto). En las puntas no da la vuelta: estira con resistencia y vuelve,
  // como Fotos del iPhone. touch-action: pan-y (en la caja) deja el scroll
  // vertical en manos del navegador; React registra touchmove como pasivo.
  const gestoRef = useRef<{
    x: number; y: number; ancho: number
    eje: 'x' | 'y' | null
    dx: number; ux: number; ut: number; vx: number
  } | null>(null)
  const swipedRef = useRef(false)
  const onTouchStart = (e: React.TouchEvent) => {
    setCalentar(true)
    setRecorriendo(false)
    swipedRef.current = false
    if (e.touches.length !== 1) { gestoRef.current = null; return }
    const t = e.touches[0]
    gestoRef.current = {
      x: t.clientX, y: t.clientY,
      ancho: cajaRef.current?.offsetWidth || 1,
      eje: null, dx: 0, ux: t.clientX, ut: performance.now(), vx: 0,
    }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    const g = gestoRef.current
    const tira = tiraRef.current
    if (!g || !tira || e.touches.length !== 1) return
    const t = e.touches[0]
    const dx = t.clientX - g.x
    const dy = t.clientY - g.y
    if (g.eje === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      g.eje = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      if (g.eje === 'x') tira.style.transition = 'none'
    }
    if (g.eje !== 'x') return
    // Recién pasado el margen de un toque (~10 px) se corta el click: un toque
    // que tembló un poco tiene que seguir abriendo la ficha.
    if (Math.abs(dx) > 10) swipedRef.current = true
    const ahora = performance.now()
    // Velocidad suavizada: entre dos touchmove seguidos puede haber 1 ms.
    if (ahora > g.ut) g.vx = g.vx * 0.2 + ((t.clientX - g.ux) / (ahora - g.ut)) * 0.8
    g.ux = t.clientX; g.ut = ahora; g.dx = dx
    const enPunta = (imgIdx === 0 && dx > 0) || (imgIdx === images.length - 1 && dx < 0)
    tira.style.transform = `translateX(calc(-${imgIdx * 100}% + ${enPunta ? dx * 0.35 : dx}px))`
  }
  const onTouchEnd = () => {
    const g = gestoRef.current
    gestoRef.current = null
    if (!g || g.eje !== 'x') return
    // Si el dedo se quedó quieto antes de soltar, no hubo flick.
    const v = performance.now() - g.ut < 80 ? g.vx : 0
    // Un flick para atrás (contra el arrastre) cancela y vuelve a la foto.
    const dir = Math.abs(v) > 0.3
      ? (Math.sign(v) === Math.sign(g.dx) ? -Math.sign(g.dx) : 0)
      : Math.abs(g.dx) > g.ancho * 0.2 ? -Math.sign(g.dx)
      : 0
    // Un flick corto (menos de 10 px) que igual pasa de foto también corta el
    // click: si no, la foto cambia y además se abre la ficha.
    if (dir !== 0) swipedRef.current = true
    irA(Math.min(images.length - 1, Math.max(0, imgIdx + dir)))
  }
  // Solo mouse: en el celu y la tablet el dedo sigue usando el swipe.
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || images.length < 2) return
    const caja = e.currentTarget.getBoundingClientRect()
    if (caja.width <= 0) return
    const franja = Math.floor(((e.clientX - caja.left) / caja.width) * images.length)
    setCalentar(true)
    setRecorriendo(true)
    setImgIdx(Math.min(images.length - 1, Math.max(0, franja)))
  }
  const onPointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    setImgIdx(0)
  }

  const onClickCapture = (e: React.MouseEvent) => {
    if (swipedRef.current) {
      e.preventDefault(); e.stopPropagation()
      swipedRef.current = false
    }
  }

  // El navegador cancela el toque (llamada, gesto del sistema): la foto vuelve
  // a su lugar en vez de quedar a medio arrastrar.
  const onTouchCancel = () => {
    const g = gestoRef.current
    gestoRef.current = null
    if (g?.eje === 'x') irA(imgIdx)
  }

  // `group/media` acota el hover a la imagen (no a toda la card), así las
  // flechas aparecen solo al pasar el mouse sobre la foto. El botón mide 44 px
  // (área de toque/click) y el círculo que se ve sigue siendo chico: el
  // `group/flecha` le pasa el hover y el foco al círculo de adentro.
  const flecha = flechasSiempre
    ? 'flex'
    : recorrerConMouse
      // Invisibles también tienen que dejar pasar el click (si no, cerca del
      // borde la foto no abriría la ficha).
      ? 'hidden md:flex opacity-0 pointer-events-none focus-visible:opacity-100 focus-visible:pointer-events-auto'
      : 'hidden md:flex opacity-0 group-hover/media:opacity-100 focus-visible:opacity-100'
  const circulo = flechasSiempre ? 'w-9 h-9 bg-white/90 shadow-md' : 'w-8 h-8 bg-white/85 shadow-sm'
  // El círculo queda a 8 px del borde como antes: el botón de 44 px se corre
  // hacia afuera lo que mide de más (4 px con el de 36, 6 px con el de 32).
  const izq = flechasSiempre ? 'left-1' : 'left-0.5'
  const der = flechasSiempre ? 'right-1' : 'right-0.5'
  return (
    <div
      ref={cajaRef}
      className={`group/media relative w-full overflow-hidden rounded-[14px] ${images.length === 0 ? 'bg-gray-100' : imgLoaded ? '' : 'si-img-shimmer'} ${className}`}
      onTouchStart={conSwipe ? onTouchStart : () => setCalentar(true)}
      onTouchMove={conSwipe ? onTouchMove : undefined}
      onTouchEnd={conSwipe ? onTouchEnd : undefined}
      onTouchCancel={conSwipe ? onTouchCancel : undefined}
      onMouseEnter={() => setCalentar(true)}
      onPointerMove={recorrerConMouse ? onPointerMove : undefined}
      onPointerLeave={recorrerConMouse ? onPointerLeave : undefined}
      onClickCapture={conSwipe ? onClickCapture : undefined}
      // pan-y: el scroll vertical (y el zoom con dos dedos) sigue siendo del
      // navegador; el arrastre horizontal es de las fotos.
      style={conSwipe ? { touchAction: 'pan-y pinch-zoom', ...style } : style}
    >
      {images.length > 0 ? (
        // Tira deslizable: la foto actual y sus vecinas ya montadas, así la
        // flecha/swipe corre la foto al instante en vez de esperar la descarga.
        // Curva de salida tipo iOS (arranca rápido y frena suave) para que al
        // soltar el dedo la foto siga con el envión.
        <div
          ref={tiraRef}
          className={`absolute inset-0 flex will-change-transform ${recorriendo ? '' : 'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'}`}
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
                  loading={i > 0 && todas ? 'eager' : undefined}
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
              con `flechasSiempre`, siempre y en todos los tamaños. Nombran la
              casa: "Foto siguiente" solo, repetido 16 veces, no decía de cuál. */}
          <button
            type="button"
            onClick={prev}
            aria-label={`Foto anterior de ${alt}`}
            className={`${flecha} group/flecha absolute ${izq} top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center focus:outline-none transition-opacity duration-200`}
          >
            <span className={`${circulo} rounded-full flex items-center justify-center text-gray-700 group-hover/flecha:bg-white group-focus-visible/flecha:ring-2 group-focus-visible/flecha:ring-gray-500`}>
              <ChevronLeft className="w-4 h-4" />
            </span>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={`Foto siguiente de ${alt}`}
            className={`${flecha} group/flecha absolute ${der} top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center focus:outline-none transition-opacity duration-200`}
          >
            <span className={`${circulo} rounded-full flex items-center justify-center text-gray-700 group-hover/flecha:bg-white group-focus-visible/flecha:ring-2 group-focus-visible/flecha:ring-gray-500`}>
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>
          {/* Dots: máx 5, siempre visibles (avisan que hay más fotos) con
              sombra para que se lean sobre fotos claras. Mismo tamaño y el
              activo opaco, como el iPhone (antes 8 px contra 7 px al 70%: no se
              distinguían). No son botones: un toque ahí abre la ficha. */}
          <div
            aria-hidden="true"
            className={`absolute bottom-2.5 z-10 flex items-center gap-1.5 ${puntos === 'izquierda' ? 'left-3' : puntos === 'derecha' ? 'right-3' : 'left-1/2 -translate-x-1/2'}`}
          >
            {Array.from({ length: dotCount }).map((_, i) => (
              <span
                key={i}
                className="block rounded-full transition-colors duration-200"
                style={{
                  width: 7,
                  height: 7,
                  background: i === activeDot ? '#fff' : 'rgba(255,255,255,0.5)',
                  boxShadow: '0 0 3px rgba(0,0,0,0.45)',
                }}
              />
            ))}
          </div>
          {/* Para lector de pantalla: avisa en qué foto quedó al usar las
              flechas. Vacío hasta entonces (si no, "Foto 1 de 5" se sumaba al
              nombre de cada tarjeta) y mientras el mouse recorre la foto. */}
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {anunciar && !recorriendo ? `Foto ${imgIdx + 1} de ${images.length}` : ''}
          </span>
        </>
      )}

      {children}
    </div>
  )
}
