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
//
// Las piezas viven al lado (Tarjeta, MatchMazo, HojaContacto, Rescate,
// SuscripcionMail, GuiaMazo…); la consulta a Hilo en lib/mazo-consulta.ts y
// qué hacen la X y el atrás en lib/mazo-salida.ts (con test).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { RotateCcw, X } from 'lucide-react'
import type { CriteriosBusqueda, ItemFeed } from '@/lib/feed-en-red'
import { trackEvent } from '@/lib/analytics'
import { barriosParecidos, listaBarrios } from '@/lib/barrios-parecidos'
import { useAtrasDelMazo } from '@/lib/mazo-atras'
import { contactoListo, leerEnviadas, mandarConsulta } from '@/lib/mazo-consulta'
import { type EstadoSalida, type QueHacer, cierraElMazo, queHacerAlSalir } from '@/lib/mazo-salida'
import { contarTinder } from '@/lib/tinder-contador'
import { haptico } from '@/lib/haptico'
import DetalleMazo, { cargarDetalle } from './DetalleMazo'
import VisorFotos from './VisorFotos'
import GuiaMazo, { useGuiaMazo } from './GuiaMazo'
import HojaContacto from './HojaContacto'
import MatchMazo, { type EstadoMatch } from './MatchMazo'
import PreguntaParecidos from './PreguntaParecidos'
import Rescate from './Rescate'
import { SuscripcionMail } from './SuscripcionMail'
import { type Arrastre, type Salida, type Tendencia, BotonesTinder, DURACION_SALIDA, Tarjeta, UMBRAL_SUPER, UMBRAL_SWIPE, direccionDe, paresDe } from './Tarjeta'
import { AZUL_VISITA, CORAZON, Corazon, ORO_VOLVER } from './marca-mazo'
import { useAlbumMazo } from './useAlbumMazo'
import { useGuardadas } from './useGuardadas'

// Lo que usan la ficha (FeedEnRed) y "Conocé tu próximo hogar" sale de acá, como siempre.
export { CORAZON, Chip, Corazon, IconoRed, IsotipoSI, VERDE } from './marca-mazo'
export { type Arrastre, type Salida, type Tendencia, BotonesTinder, Tarjeta, direccionDe } from './Tarjeta'
export { SuscripcionMail } from './SuscripcionMail'
export { useGuardadas } from './useGuardadas'

/** Un latigazo corto también decide (como Tinder): px por milisegundo. */
const VELOCIDAD_LATIGAZO = 0.6

/** El rescate sale UNA vez por visita (aunque abra el mazo varias veces). */
let rescateMostrado = false
/** ♥ dados en esta visita y qué "match" ya se le mostró (cada uno una vez por visita). */
let likesVisita = 0
const matchesVistos = new Set<'match' | 'tres'>()

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
  const conFotos = useAlbumMazo(todos)
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
  const { guia, guiaDx, cerrarGuia } = useGuiaMazo(inicio < items.length, origen)

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
      const envio = mandarConsulta({ nombre: c.nombre, whatsapp: c.whatsapp, keys, barrio, busqueda, origen, visita: true })
      // Ya quedaron marcadas como enviadas (si falla, se desmarcan): ♥ N no las repite mientras viaja.
      refrescarEnviadas()
      void envio.then((r) => {
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
    // Velocidad de los últimos ~120 ms (contando el soltar): un latigazo corto
    // también decide. Si frenó antes de soltar, no quedan muestras viejas: no sale.
    const ms = [...muestras.current.filter((m) => e.timeStamp - m.t < 120), { x: e.clientX, y: e.clientY, t: e.timeStamp }]
    const a = ms[0]
    const b = ms[ms.length - 1]
    const dt = a && b ? Math.max(1, b.t - a.t) : 1
    const vx = a && b ? (b.x - a.x) / dt : 0
    const dir = direccionDe(dx, dy)
    // ★ por gesto SOLO con el arrastre completo hacia arriba: deslizar para
    // arriba es el reflejo de "ver más" (Instagram, TikTok) y una ★ sin querer
    // le manda un asesor (sin latigazo vertical, a propósito).
    if (dir === 'super' && -dy > UMBRAL_SUPER) return decidir('super')
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
  // La X y el ATRÁS deciden lo mismo (lib/mazo-salida.ts, con test): acá solo se hace.
  const estadoSalida = (): EstadoSalida => ({
    guia,
    visor: visor != null,
    detalle,
    match: match != null,
    hoja: hoja?.motivo ?? null,
    rescate,
    enviada: enviada != null,
    terminado,
    pendientes: pendientes.length,
    guardadas: guardadas.length,
    rescateVisto,
    finEsRescate,
    vistas,
  })
  /** Hace lo que se decidió. true = el mazo sigue abierto. */
  const hacer = (q: QueHacer): boolean => {
    if (q === 'sacar-guia') cerrarGuia()
    else if (q === 'sacar-visor') setVisor(null)
    else if (q === 'sacar-detalle') setDetalle(false)
    else if (q === 'sacar-match') setMatch(null)
    else if (q === 'sacar-hoja') setHoja(null)
    else if (q === 'sacar-rescate') setRescate(null)
    else if (q === 'hoja') setHoja({ motivo: 'salir' })
    else if (q === 'rescate') marcarRescate('salir')
    else if (q === 'cerrar-limpiando') cerrarYaConsultadas()
    else if (q === 'cerrar') cerrarTodo()
    return !cierraElMazo(q)
  }
  const salir = () => void hacer(queHacerAlSalir(estadoSalida(), 'x'))

  // ATRÁS DEL NAVEGADOR (David 4-oct: "mi mamá corrió para el costado de la foto
  // y cerró el Tinder sin que le pida los datos"). En el iPhone, deslizar desde
  // el borde izquierdo es "atrás" de Safari: sacaba de la página sin pasar por
  // la pregunta de la X. Al abrir se agrega una entrada propia al historial
  // (misma URL); el gesto o el botón Atrás solo la sacan a ella y acá se hace lo
  // mismo que la X: pregunta (♥ → sus datos; sin ♥ → el rescate) y se queda.
  // Si insiste (atrás otra vez con la pregunta a la vista), recién ahí sale.
  const porAtras = useRef<() => boolean>(() => false)
  porAtras.current = () => hacer(queHacerAlSalir(estadoSalida(), 'atras'))
  useAtrasDelMazo(porAtras)

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
                  Deslizá → si te gusta · <span style={{ color: AZUL_VISITA }}>★</span> para ir a verla
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
        {guia && !terminado && <GuiaMazo onCerrar={cerrarGuia} />}
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
