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
// 5-oct (David: "no me gusta lo del match, es muy Tinder" y "usan casi toda
// la pantalla para la foto, los menús están dentro de las fotos"): sin
// "¡Es un match!" (la ★ pide los datos en una hoja blanca, HojaVisita), la
// tarjeta ocupa casi toda la pantalla y ↺ ✕ ★ ♥ flotan sobre la foto.
//
// Las piezas viven al lado (Tarjeta, HojaVisita, HojaContacto, Rescate,
// SuscripcionMail, GuiaMazo…); la consulta a Hilo en lib/mazo-consulta.ts y
// qué hacen la X y el atrás en lib/mazo-salida.ts (con test).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { RotateCcw, X } from 'lucide-react'
import type { CriteriosBusqueda, ItemFeed } from '@/lib/feed-en-red'
import { trackEvent } from '@/lib/analytics'
import { barriosParecidos } from '@/lib/barrios-parecidos'
import { useAtrasDelMazo } from '@/lib/mazo-atras'
import { usePantallaCompletaCelu } from '@/lib/pantalla-completa'
import { type ClienteMazo, contactoListo, leerEnviadas, mandarConsulta, reaccionarEnSeleccion } from '@/lib/mazo-consulta'
import { type EstadoSalida, type QueHacer, cierraElMazo, queHacerAlSalir } from '@/lib/mazo-salida'
import { contarTinder } from '@/lib/tinder-contador'
import { haptico } from '@/lib/haptico'
import DetalleMazo, { cargarDetalle } from './DetalleMazo'
import VisorFotos from './VisorFotos'
import GuiaMazo, { useGuiaMazo } from './GuiaMazo'
import HojaContacto from './HojaContacto'
import HojaVisita, { type EstadoVisita } from './HojaVisita'
import AfinarBusqueda, { type AfinarMazo } from './AfinarBusqueda'
import PreguntaParecidos from './PreguntaParecidos'
import Rescate from './Rescate'
import { SuscripcionMail } from './SuscripcionMail'
import { type Arrastre, type Salida, type Tendencia, BotonesTinder, DURACION_SALIDA, Tarjeta, UMBRAL_SUPER, UMBRAL_SWIPE, direccionDe, paresDe } from './Tarjeta'
import { ORO_VOLVER } from './marca-mazo'
import { useAlbumMazo } from './useAlbumMazo'
import { useAvisoMazo, useReinicioAfinar } from './useAfinarMazo'
import { useMazoQueAprende } from './useMazoQueAprende'
import { ESTILOS_MAZO } from './piel-oscura'
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
  afinar,
  aprender = false,
  cliente = null,
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
  /**
   * "Afiná tu búsqueda" (David 5-oct): quien abre el mazo vuelve a buscar con lo
   * que elija y le pasa las nuevas en `items` (el mazo arranca de nuevo, sin
   * cerrarse). Sin esto (la ficha), no hay ícono y la X sigue con el rescate.
   */
  afinar?: AfinarMazo
  /** Reordena las que faltan según lo que le gusta (la home; no en "Cerca mío", ahí manda la distancia). */
  aprender?: boolean
  /** El link que le mandó su asesor (?s=): ♥ y ★ van a SU selección, sin pedirle datos. */
  cliente?: ClienteMazo | null
}) {
  const { guardadas, guardar, quitar, limpiar, esGuardada } = guardadasApi
  // Las de los barrios parecidos entran DONDE está parado si dice que sí: al
  // final del mazo (la pregunta) o en medio (rescate → "Otra zona").
  const [insercion, setInsercion] = useState<{ en: number; items: ItemFeed[] } | null>(null)
  const base = useMemo(
    () => (insercion ? [...items.slice(0, insercion.en), ...insercion.items, ...items.slice(insercion.en)] : items),
    [items, insercion],
  )
  const parecidos = useMemo(() => barriosParecidos(barrio), [barrio])
  /** pendiente → (pregunta) → cargando → sumados | vacio | no. */
  const [estadoParecidos, setEstadoParecidos] = useState<'pendiente' | 'cargando' | 'sumados' | 'vacio' | 'no'>('pendiente')
  /** Para ↺: cada decisión, con si el ♥ fue nuevo (si ya estaba guardada de antes, volver no se la saca). */
  const [historial, setHistorial] = useState<{ indice: number; accion: Salida; key: string; nueva: boolean }[]>([])
  const [indice, setIndice] = useState(() => Math.min(Math.max(0, inicio), items.length))
  const todos = useMazoQueAprende({ items, todos: base, historial, indice, activo: aprender })
  const conFotos = useAlbumMazo(todos)
  // Se abrió directo en las elegidas (botón de la fila de la compu): no "las vio todas".
  const [directoAlFinal, setDirectoAlFinal] = useState(() => inicio >= items.length)
  const [foto, setFoto] = useState(0)
  const [arrastre, setArrastre] = useState<Arrastre | null>(null)
  const [salida, setSalida] = useState<Salida | null>(null)
  const [hoja, setHoja] = useState<EstadoHoja>(null)
  /** La hoja de ★ "Quiero conocerla" (sin su WhatsApp todavía). */
  const [visita, setVisita] = useState<EstadoVisita>(null)
  /** "Afiná tu búsqueda": desde el ícono o al querer salir sin ♥. */
  const [afinarAbierto, setAfinarAbierto] = useState<'boton' | 'salir' | null>(null)
  const [aviso, setAviso] = useAvisoMazo()
  useReinicioAfinar(
    afinar,
    () => {
      setInsercion(null)
      setIndice(0)
      setFoto(0)
      setHistorial([])
      setArrastre(null)
      setSalida(null)
      setEstadoParecidos('pendiente')
      setDirectoAlFinal(false)
      pasesSeguidos.current = 0
    },
    setAviso,
  )
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
  // Con el link de su asesor ya sabemos quién es: sin el rescate que pide WhatsApp.
  const [rescateVisto, setRescateVisto] = useState(rescateMostrado || !!cliente)
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
    [pendientes, barrio, busqueda, origen, refrescarEnviadas, setAviso],
  )

  /** ♥, paso o ★: la tarjeta sale volando y aparece la siguiente. */
  const decidir = useCallback(
    (accion: Salida) => {
      if (!actual || salida || rescate || guia || visita || afinarAbierto) return
      const yaEstaba = esGuardada(actual.key)
      setHistorial((h) => [...h.slice(-30), { indice, accion, key: actual.key, nueva: accion === 'like' && !yaEstaba }])
      if (accion === 'pass') {
        pasesSeguidos.current += 1
      } else {
        guardar(actual)
        pasesSeguidos.current = 0
        if (cliente) void reaccionarEnSeleccion(cliente, actual, accion).then(refrescarEnviadas)
      }
      haptico(accion !== 'pass')
      // 4 seguidas con ✕ y ninguna guardada: no es lo que busca → rescate.
      const rescatar = accion === 'pass' && guardadas.length === 0 && !enviada && pasesSeguidos.current >= 4 && !rescateVisto && indice + 1 < todos.length
      // El ♥ no interrumpe nada (sin "¡Es un match!", David 5-oct). La ★ sí pide
      // los datos: es él pidiendo la visita.
      let abrirVisita: EstadoVisita = null
      if (accion === 'super') {
        contarTinder('quiero_verla', origen)
        trackEvent('feed_en_red_quiero_verla', { tipo: actual.esNuestra ? 'nuestra' : 'en_red' })
        const contacto = contactoListo()
        if (cliente) setAviso(cliente.soloMirar ? 'Vista del asesor: esto no se manda.' : 'Listo: le avisamos a tu asesor para coordinar la visita.')
        else if (contacto) pedirVisitaDirecto(contacto, actual)
        else abrirVisita = { item: actual }
      }
      setSalida(accion)
      setVistas((v) => Math.max(v, indice + 1))
      window.setTimeout(() => {
        setIndice((i) => i + 1)
        setFoto(0)
        setArrastre(null)
        setSalida(null)
        if (rescatar) marcarRescate('mazo')
        if (abrirVisita) {
          setVisita(abrirVisita)
          // 'match' = le pedimos el WhatsApp en el medio del mazo (Hilo: /tinder).
          contarTinder('match', origen)
        }
      }, DURACION_SALIDA)
    },
    [actual, salida, rescate, guia, visita, afinarAbierto, rescateVisto, enviada, guardar, esGuardada, guardadas.length, indice, todos.length, marcarRescate, origen, pedirVisitaDirecto, cliente, refrescarEnviadas, setAviso],
  )

  /** ↺ Volver a la anterior: si le había dado ♥ recién, se lo saca y decide de nuevo. */
  const volver = useCallback(() => {
    if (salida || rescate || enviada || visita) return
    const ultima = historial[historial.length - 1]
    if (!ultima) return
    setHistorial((h) => h.slice(0, -1))
    if (ultima.nueva) {
      quitar(ultima.key)
      if (cliente) void reaccionarEnSeleccion(cliente, { key: ultima.key }, 'deshacer').then(refrescarEnviadas)
    }
    if (ultima.accion === 'pass') pasesSeguidos.current = Math.max(0, pasesSeguidos.current - 1)
    setIndice(ultima.indice)
    setFoto(0)
    setArrastre(null)
    trackEvent('feed_en_red_volver', { origen })
  }, [salida, rescate, enviada, visita, historial, quitar, origen, cliente, refrescarEnviadas])
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
    if (datos && e.clientY >= datos.top && e.clientY <= datos.bottom) {
      abrirDetalle()
      return
    }
    // Debajo de los datos están los botones flotando: un toque entre ellos no hace nada.
    if (datos && e.clientY > datos.bottom) return
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
    setVisita(null)
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
    visita: visita != null,
    afinar: afinarAbierto,
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
    else if (q === 'sacar-visita') setVisita(null)
    else if (q === 'sacar-afinar') setAfinarAbierto(null)
    else if (q === 'sacar-hoja') setHoja(null)
    else if (q === 'sacar-rescate') setRescate(null)
    else if (q === 'hoja') setHoja({ motivo: 'salir' })
    else if (q === 'rescate') {
      // Con búsqueda para afinar (la home): "¿Afinamos la búsqueda?" en vez de la pregunta suelta.
      if (afinar) {
        rescateMostrado = true
        setRescateVisto(true)
        setAfinarAbierto('salir')
      } else marcarRescate('salir')
    }
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
  usePantallaCompletaCelu() // sin barra del navegador en el celu (Android; el iPhone no deja)

  // Sin scroll de la página de atrás; Escape sale, flechas = paso / ♥ / ★.
  useEffect(() => {
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (guia) cerrarGuia()
        else if (detalle) setDetalle(false)
        else if (visita) setVisita(null)
        else if (afinarAbierto) setAfinarAbierto(null)
        else if (hoja) setHoja(null)
        else if (rescate) setRescate(null)
        else salir()
      } else if (detalle || visor != null || visita || afinarAbierto || hoja || rescate) {
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
  }, [hoja, rescate, guia, detalle, visor, visita, afinarAbierto, guardadas.length, pendientes.length, decidir, volver])

  const n = todos.length
  const g = guardadas.length
  // Mientras arrastra: hacia dónde va y cuánto falta (la de abajo crece, el botón de ese lado se pinta).
  const dirArrastre = arrastre && !guia ? direccionDe(arrastre.dx, arrastre.dy) : null
  const fuerzaArrastre = !arrastre || !dirArrastre ? 0 : dirArrastre === 'super' ? Math.min(1, -arrastre.dy / UMBRAL_SUPER) : Math.min(1, Math.abs(arrastre.dx) / UMBRAL_SWIPE)
  const progresoAbajo = salida ? 1 : fuerzaArrastre
  const tendencia: Tendencia | null = salida ? { dir: salida, fuerza: 1 } : dirArrastre ? { dir: dirArrastre, fuerza: fuerzaArrastre } : null
  // En el final, "Volver a la anterior" va debajo (y él se ocupa del borde de abajo del iPhone).
  const volverFinal = terminado && puedeVolver && !hoja && !rescate && estadoParecidos !== 'cargando'

  return createPortal(
    <div className="fixed inset-0 z-[10400] bg-black md:bg-black/80 md:backdrop-blur-sm md:flex md:items-center md:justify-center" role="dialog" aria-modal="true" aria-label={titulo}>
      <style dangerouslySetInnerHTML={{ __html: ESTILOS_MAZO }} />
      {/* NEGRO como Tinder (David 5-oct: "que se sienta una app real… bien inmersivo"):
          sin encabezado, sin "1 de 24" ni cuántas le gustaron; la X y "afinar" van adentro de la foto. */}
      <div className="mazo-oscuro relative flex flex-col h-[100dvh] w-full bg-black pt-[max(6px,env(safe-area-inset-top))] md:h-[92vh] md:max-w-[440px] md:rounded-3xl md:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Mazo: hasta abajo de todo (los botones van adentro de la foto) */}
        <div className={`relative flex-1 mx-1.5 min-h-0 ${volverFinal ? '' : 'mb-[max(6px,env(safe-area-inset-bottom))]'}`}>
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
                  conBotones
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
                conBotones={!rescate}
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
            <div className="absolute inset-0 rounded-3xl border border-gray-200 bg-white overflow-y-auto px-5 pt-16 pb-6 flex flex-col justify-center">
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
            <div className="absolute inset-0 rounded-3xl border border-gray-200 bg-white overflow-y-auto px-5 pt-16 pb-5">
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
            <div className="absolute inset-0 rounded-3xl border border-gray-200 bg-white overflow-y-auto px-5 pt-16 pb-5">
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
          {!terminado && actual && !rescate && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] pb-4">
              <BotonesTinder
                sobreFoto
                onPaso={() => decidir('pass')}
                onMeGusta={() => decidir('like')}
                onQuieroVerla={() => decidir('super')}
                onVolver={volver}
                puedeVolver={puedeVolver}
                tendencia={tendencia}
              />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-3 top-[18px] z-[6] flex items-center justify-between">
            <button
              type="button"
              onClick={salir}
              aria-label="Salir"
              className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md"
            >
              <X className="h-5 w-5" strokeWidth={2.4} />
            </button>
            {afinar && !terminado && (
              <button
                type="button"
                onClick={() => setAfinarAbierto('boton')}
                aria-label="Afiná tu búsqueda"
                className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
                  <circle cx="16" cy="7" r="2" />
                  <circle cx="8" cy="17" r="2" />
                </svg>
              </button>
            )}
          </div>
          {aviso && (
            <div role="status" className="absolute inset-x-3 top-[68px] z-20 rounded-2xl bg-gray-900/95 px-4 py-3 text-[15px] font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] mazo-aviso">
              {aviso}
            </div>
          )}
        </div>

        {/* En el final también se puede volver a la última (por si la pasó sin querer). */}
        {volverFinal && (
          <div className="px-4 pt-3 pb-[max(14px,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={volver}
              className="mx-auto flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-semibold text-white/80 hover:bg-white/10"
            >
              <RotateCcw className="w-5 h-5" style={{ color: ORO_VOLVER }} strokeWidth={2.6} aria-hidden="true" /> Volver a la anterior
            </button>
          </div>
        )}

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
        {afinarAbierto && afinar && (
          <AfinarBusqueda
            afinar={{
              ...afinar,
              onAplicar: (v) => {
                setAfinarAbierto(null)
                trackEvent('feed_en_red_afinar', { desde: afinarAbierto, tope: v.tope ?? 0, dorm: v.dorm ?? 0, zona: v.zona })
                afinar.onAplicar(v)
              },
            }}
            modo={afinarAbierto}
            onCerrar={() => setAfinarAbierto(null)}
            onSalir={() => (afinarAbierto === 'salir' ? cerrarTodo() : setAfinarAbierto(null))}
          />
        )}
        {visita && (
          <HojaVisita
            estado={visita}
            pendientes={pendientes}
            barrio={barrio}
            busqueda={busqueda}
            origen={origen}
            onSeguir={() => setVisita(null)}
            onEnviado={refrescarEnviadas}
          />
        )}
      </div>
    </div>,
    document.body,
  )
}

