'use client'

// VISOR DE FOTOS A PANTALLA COMPLETA de la ficha (celu y compu, 25-oct-2026).
// Antes era una pila vertical que aparecía de golpe y abría siempre en la foto
// 1: tocabas la cuarta y caías arriba de todo, sin saber cuántas iban. Ahora
// abre EN la foto tocada, se pasa de foto deslizando (scroll-snap nativo del
// navegador, sin librería: el dedo manda y el celu hace la inercia de siempre),
// con contador "3 / 22" y una ✕ de 44 px que queda por debajo del reloj.
//
// El Atrás del celu (botón de Android o deslizar desde el borde en el iPhone)
// CIERRA el visor en vez de sacarte de la ficha: el que llegó por un anuncio
// cerraba las fotos y terminaba en Google. Calca useAtrasDelMazo
// (lib/mazo-atras.ts), que ya anda en el Tinder.
//
// ¿Por qué no yet-another-react-lightbox (la usa PhotoGallery)? La ficha hoy no
// la carga: sumarla es otra librería en la ruta más visitada (o un import
// diferido que demora el primer toque), su deslizamiento no es el scroll nativo
// y el Atrás igual había que resolverlo acá.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from '@/components/Imagen'
import { atrasEsDelMazo, marcarMazoAbierto } from '@/lib/mazo-atras'

// Motion corto: entra con fade + escala (200 ms, ease-out) y sale más rápido
// (160 ms, ease-in), como una hoja de iOS. Va por Web Animations, que NO
// alcanza el reset de prefers-reduced-motion de globals.css: por eso se mira a mano.
const ENTRADA_MS = 200
const SALIDA_MS = 160
const CURVA_ENTRADA = 'cubic-bezier(.22,1,.36,1)'

function sinMovimiento(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** 'smooth' salvo para quien pidió menos movimiento (el behavior de JS ignora el reset de CSS). */
function scrollSuave(): ScrollBehavior {
  return sinMovimiento() ? 'auto' : 'smooth'
}

/**
 * Qué foto está a la vista en un carril horizontal con scroll-snap (una foto
 * por ancho). Se lee del scrollLeft en el próximo cuadro: el contador cambia al
 * pasar la mitad, como en Fotos del iPhone, sin re-render en cada píxel.
 */
export function useFotoALaVista(n: number, inicial = 0) {
  const ref = useRef<HTMLDivElement>(null)
  const [indice, setIndice] = useState(inicial)
  const raf = useRef(0)
  const onScroll = useCallback(() => {
    if (raf.current) return
    raf.current = requestAnimationFrame(() => {
      raf.current = 0
      const el = ref.current
      if (!el || !el.clientWidth) return
      setIndice(Math.min(n - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth))))
    })
  }, [n])
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current) }, [])
  return { ref, indice, onScroll }
}

/**
 * Mientras el visor está abierto hay una entrada propia en el historial (misma
 * URL): el Atrás solo saca esa entrada y se llama a `porAtras` (lo mismo que la
 * ✕). Al cerrar con la ✕ se hace history.back() y ese popstate se lo traga el
 * visor, para no dejar una entrada colgada (si no, el próximo Atrás "no hace
 * nada"). Igual que el mazo: el back() se posterga un instante y se cancela si
 * el visor vuelve a montarse (StrictMode en desarrollo).
 *
 * Usa la MISMA marca que el mazo (atrasEsDelMazo): PropertyPanel, la ficha de la
 * compu, se cierra con cualquier popstate y mira esa marca para dejarlo pasar.
 * Si la marca ya estaba puesta por otro, no se la saca al cerrar.
 */
function useAtrasCierra(porAtras: { readonly current: () => void }): void {
  const entrada = useRef<{ marca: string; propia: boolean; backTimer: number | null; ajena: boolean; marcada: boolean } | null>(null)
  useEffect(() => {
    let e = entrada.current
    if (e && e.backTimer != null) {
      window.clearTimeout(e.backTimer)
      e.backTimer = null
    } else {
      e = entrada.current = { marca: `galeria-${Date.now()}`, propia: true, backTimer: null, ajena: atrasEsDelMazo(), marcada: false }
      window.history.pushState({ ...(window.history.state ?? {}), siGaleria: e.marca }, '')
    }
    const actual = e
    if (!actual.ajena && !actual.marcada) {
      marcarMazoAbierto(true)
      actual.marcada = true
    }
    const soltarMarca = () => {
      if (!actual.marcada) return
      actual.marcada = false
      marcarMazoAbierto(false)
    }
    const onPop = (ev: PopStateEvent) => {
      // Un segundo Atrás mientras el visor se va (160 ms) ya no es nuestro: pasa.
      if (!actual.propia) return
      ev.stopImmediatePropagation()
      actual.propia = false
      // Los que escuchan después ya no tienen que ignorar el próximo Atrás.
      soltarMarca()
      porAtras.current()
    }
    window.addEventListener('popstate', onPop, true)
    return () => {
      window.removeEventListener('popstate', onPop, true)
      actual.backTimer = window.setTimeout(() => {
        actual.backTimer = null
        entrada.current = null
        if (!actual.propia || window.history.state?.siGaleria !== actual.marca) return soltarMarca()
        // Se cerró con la ✕ (o Escape): se saca la entrada propia sin que nadie
        // más se entere (la marca sigue puesta hasta que pase ese popstate).
        const listo = () => {
          window.removeEventListener('popstate', tragar, true)
          soltarMarca()
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
  }, [porAtras])
}

export default function GaleriaDeslizable({
  fotos,
  inicio = 0,
  titulo,
  onCerrar,
}: {
  fotos: string[]
  /** Foto en la que abre (la que se tocó). */
  inicio?: number
  titulo: string
  /** Se llama al terminar de cerrarse, con la foto que quedó a la vista. */
  onCerrar: (ultima: number) => void
}) {
  const n = fotos.length
  const primera = Math.min(Math.max(0, inicio), Math.max(0, n - 1))
  const { ref: carril, indice, onScroll } = useFotoALaVista(n, primera)
  const raiz = useRef<HTMLDivElement>(null)
  const botonCerrar = useRef<HTMLButtonElement>(null)
  const indiceRef = useRef(indice)
  indiceRef.current = indice
  const onCerrarRef = useRef(onCerrar)
  onCerrarRef.current = onCerrar

  // Solo se montan la foto a la vista y sus vecinas (y las que ya se vieron):
  // abrir el visor no tiene que pedir 22 fotos grandes de golpe.
  const [montadas, setMontadas] = useState<ReadonlySet<number>>(
    () => new Set([primera - 1, primera, primera + 1].filter(k => k >= 0 && k < n)),
  )
  useEffect(() => {
    setMontadas(prev => {
      const faltan = [indice - 1, indice, indice + 1, indice + 2].filter(k => k >= 0 && k < n && !prev.has(k))
      if (faltan.length === 0) return prev
      const sig = new Set(prev)
      faltan.forEach(k => sig.add(k))
      return sig
    })
  }, [indice, n])

  // Cerrar: fade corto y recién ahí se desmonta. Un solo cierre aunque se
  // toquen la ✕ y el Atrás a la vez.
  const cerrando = useRef(false)
  const cerrar = useCallback(() => {
    if (cerrando.current) return
    cerrando.current = true
    const fin = () => onCerrarRef.current(indiceRef.current)
    const el = raiz.current
    if (!el || sinMovimiento() || typeof el.animate !== 'function') return fin()
    let hecho = false
    const unaVez = () => {
      if (hecho) return
      hecho = true
      fin()
    }
    const anim = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: SALIDA_MS, easing: 'ease-in', fill: 'forwards' })
    carril.current?.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.97)' }], { duration: SALIDA_MS, easing: 'ease-in', fill: 'forwards' })
    anim.onfinish = unaVez
    // Por si la animación no termina nunca (pestaña en segundo plano).
    window.setTimeout(unaVez, SALIDA_MS + 120)
  }, [carril])

  const porAtras = useRef(cerrar)
  porAtras.current = cerrar
  useAtrasCierra(porAtras)

  const ir = useCallback((d: number) => {
    const c = carril.current
    if (!c || !c.clientWidth) return
    const k = Math.min(n - 1, Math.max(0, Math.round(c.scrollLeft / c.clientWidth) + d))
    c.scrollTo({ left: k * c.clientWidth, behavior: scrollSuave() })
  }, [carril, n])

  // Abre parado en la foto tocada ANTES de pintar (sin verse el salto desde la
  // 1), con el foco en la ✕ para el teclado y la entrada corta. Antes de mover
  // el foco se anota quién lo tenía (la foto que abrió el visor) para
  // devolvérselo al cerrar; solo la primera vez (StrictMode monta dos veces).
  const abridor = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    if (!abridor.current && document.activeElement instanceof HTMLElement) abridor.current = document.activeElement
    const c = carril.current
    if (c) c.scrollLeft = primera * c.clientWidth
    botonCerrar.current?.focus({ preventScroll: true })
    if (sinMovimiento()) return
    raiz.current?.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: ENTRADA_MS, easing: 'ease-out' })
    c?.animate?.([{ transform: 'scale(0.96)' }, { transform: 'scale(1)' }], { duration: ENTRADA_MS, easing: CURVA_ENTRADA })
    // Solo al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Al girar el celu o cambiar el ancho de la ventana, el scrollLeft en px
  // quedaría entre dos fotos: se vuelve a parar en la que estaba.
  useEffect(() => {
    let ancho = carril.current?.clientWidth ?? 0
    const alinear = () => {
      const c = carril.current
      if (!c || c.clientWidth === ancho) return
      ancho = c.clientWidth
      c.scrollLeft = indiceRef.current * c.clientWidth
    }
    window.addEventListener('resize', alinear)
    return () => window.removeEventListener('resize', alinear)
  }, [carril])

  // Teclado (compu): Escape cierra SOLO el visor (en el panel la ficha también
  // se cierra con Escape: se escucha en captura y no se deja seguir); flechas
  // pasan de foto; Tab no se escapa del visor.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        cerrar()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        e.stopPropagation()
        ir(e.key === 'ArrowRight' ? 1 : -1)
      } else if (e.key === 'Tab') {
        // Solo los visibles: en el celu las flechas existen pero están ocultas
        // (hidden md:grid) y un focus() sobre ellas no hace nada: el Tab quedaba trabado.
        const botones = Array.from(raiz.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? []).filter(b => b.offsetParent !== null)
        if (botones.length === 0) return
        const i = botones.indexOf(document.activeElement as HTMLButtonElement)
        const sig = e.shiftKey ? (i <= 0 ? botones.length - 1 : i - 1) : (i === -1 || i === botones.length - 1 ? 0 : i + 1)
        e.preventDefault()
        botones[sig].focus()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [cerrar, ir])

  // Bloqueo de scroll del body mientras el visor está abierto. Sin esto, al
  // llegar al final de las fotos el scroll se "cae" a la página de atrás
  // (scroll chaining). position:fixed es el lock real que necesita iOS Safari
  // (overscroll-behavior solo no alcanza), con compensación del ancho de la
  // scrollbar para no correr la página; al cerrar se vuelve a la misma altura
  // y el foco vuelve a la foto que abrió el visor.
  useEffect(() => {
    const scrollY = window.scrollY
    const body = document.body
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    }
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    if (scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`
    return () => {
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.left = prev.left
      body.style.right = prev.right
      body.style.width = prev.width
      body.style.overflow = prev.overflow
      body.style.paddingRight = prev.paddingRight
      // El <html> tiene scroll-behavior: smooth (globals.css): sin apagarlo un
      // instante, al cerrar se veía la ficha subir hasta arriba y volver a bajar.
      const html = document.documentElement
      const suaveAntes = html.style.scrollBehavior
      html.style.scrollBehavior = 'auto'
      window.scrollTo(0, scrollY)
      html.style.scrollBehavior = suaveAntes
      const previo = abridor.current
      if (previo?.isConnected && previo !== document.body) previo.focus({ preventScroll: true })
    }
  }, [])

  if (n === 0) return null

  // Va por portal al <body>: la ficha abierta como panel vive dentro de un
  // contenedor con transform y un `fixed` adentro se mediría contra él.
  return createPortal(
    <div
      ref={raiz}
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${titulo}`}
      className="fixed inset-0 z-[10500] flex flex-col bg-black text-white"
    >
      <div
        className="flex shrink-0 items-center justify-between pb-2 pl-5 pr-3"
        style={{ paddingTop: 'max(8px, env(safe-area-inset-top, 0px))' }}
      >
        <p className="font-numeric text-[15px] font-semibold text-white/90" aria-live="polite">
          {indice + 1} / {n}
        </p>
        <button
          ref={botonCerrar}
          type="button"
          onClick={cerrar}
          aria-label="Cerrar las fotos"
          className="grid h-11 w-11 place-items-center rounded-full bg-white/15 transition-colors duration-150 hover:bg-white/25 active:bg-white/30"
        >
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={carril}
          onScroll={onScroll}
          className="flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-none"
        >
          {fotos.map((src, k) => (
            <div
              key={`${k}-${src}`}
              className="relative h-full w-full shrink-0 snap-center snap-always"
              aria-hidden={k === indice ? undefined : true}
            >
              {montadas.has(k) && (
                <Image
                  src={src}
                  alt={`Foto ${k + 1} de ${n} de ${titulo}`}
                  fill
                  sizes="100vw"
                  loading="eager"
                  draggable={false}
                  className="select-none object-contain"
                />
              )}
            </div>
          ))}
        </div>

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => ir(-1)}
              disabled={indice === 0}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 transition-colors duration-150 hover:bg-white/30 disabled:opacity-30 md:grid"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => ir(1)}
              disabled={indice === n - 1}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 transition-colors duration-150 hover:bg-white/30 disabled:opacity-30 md:grid"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Aire abajo para la barra de inicio del iPhone. */}
      <div aria-hidden="true" className="shrink-0" style={{ height: 'max(16px, env(safe-area-inset-bottom, 0px))' }} />
    </div>,
    document.body,
  )
}
