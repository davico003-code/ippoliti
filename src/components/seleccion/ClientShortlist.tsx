'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronDown, Heart, Sparkles, X } from 'lucide-react'
import type { SeleccionItem } from '@/lib/seleccion'
import MazoSeleccion from './MazoSeleccion'
import TarjetaSeleccion from './TarjetaSeleccion'
import FichaHoja from './FichaHoja'
import CierreSeleccion from './CierreSeleccion'
import { Avatar, LINEA_EN_RED, isValidNote, primerNombre, tieneFicha, type Decision, type Reaction } from './seleccion-ui'

/**
 * Lo que ve el cliente en siinmobiliaria.com/seleccion/<token>.
 *
 * - Celular: mazo tipo Tinder (derecha me gusta, izquierda no). Al terminar,
 *   el cierre: "{asesor} ya tiene tus respuestas" + sus elegidas + visitar.
 * - Compu: grilla de tarjetas con fotos grandes y botones redondos; al
 *   terminar, el mismo cierre en un panel.
 * - En los dos, la ficha se abre ADENTRO de la página (nunca otra pestaña).
 * - Si no le gusta ninguna, aparecen solas parecidas de la red (se piden apenas
 *   carga, así están listas al instante). Las que le gustan se suman a la
 *   selección y el asesor las ve en HILO.
 *
 * Las respuestas se guardan solas (PATCH por propiedad, con debounce) y HILO
 * se las lleva al chat del asesor cada 5 minutos.
 */

const MENSAJE_PARECIDAS = 'Ninguna te convenció. Mirá estas parecidas a lo que buscás.'

type CuerpoReaccion = {
  propertyId: string
  liked: boolean | null
  wantVisit: boolean
  comment: string
  reaction: Reaction['reaction']
  sugerida?: boolean
  /** Parecida En red: lo que vio el cliente, por si HILO no puede sumarla (respaldo). */
  tarjeta?: { title: string; image: string | null; location: string; price: string | null; rooms: number; baths: number; area: number }
}

function leerLocal(clave: string): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(clave) || '[]')
    return Array.isArray(v) ? v.map(String) : []
  } catch {
    return []
  }
}
function escribirLocal(clave: string, valor: string[] | string) {
  try {
    window.localStorage.setItem(clave, typeof valor === 'string' ? valor : JSON.stringify(valor))
  } catch {
    // modo privado / storage bloqueado: no pasa nada, solo no se recuerda
  }
}

const esCelular = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

export default function ClientShortlist({
  clientName, agentName, note, items, initialReactions, token, agentPhoto, soloMirar = false,
}: {
  clientName: string
  agentName: string
  note: string
  items: SeleccionItem[]
  initialReactions: Record<string, Reaction & { updatedAt?: string }>
  token: string
  agentPhoto?: string | null
  /** El asesor mirando desde Hilo (?vista=asesor): puede tocar todo, nada se guarda. */
  soloMirar?: boolean
}) {
  const claveIntro = `seleccion:${token}:intro`
  const claveDescartadas = `seleccion:${token}:parecidas-descartadas`

  const reactionsRef = useRef<Record<string, Reaction>>(
    Object.fromEntries(Object.entries(initialReactions ?? {}).filter(([k]) => k !== '_meta')),
  )
  const [reactions, setReactions] = useState<Record<string, Reaction>>(reactionsRef.current)
  const [parecidas, setParecidas] = useState<SeleccionItem[]>([])
  const [estadoParecidas, setEstadoParecidas] = useState<'idle' | 'cargando' | 'listas'>('idle')
  const [reveladas, setReveladas] = useState<string[]>([])
  const [historial, setHistorial] = useState<{ id: string; antes: Reaction }[]>([])
  const [fichaId, setFichaId] = useState<string | null>(null)
  const [intro, setIntro] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [pedido, setPedido] = useState<{ id: string; d: Decision; n: number } | null>(null)
  const [esperando, setEsperando] = useState(false)
  const [cierreCompu, setCierreCompu] = useState(false)
  const [descartadasOpen, setDescartadasOpen] = useState(false)

  const idsSeleccion = useMemo(() => new Set(items.map((i) => i.id)), [items])
  const porId = useMemo(() => new Map([...parecidas, ...items].map((i) => [i.id, i])), [items, parecidas])
  const todos = useMemo(
    () => [...items, ...reveladas.map((id) => porId.get(id)).filter((i): i is SeleccionItem => !!i && !idsSeleccion.has(i.id))],
    [items, reveladas, porId, idsSeleccion],
  )
  const pendientes = todos.filter((i) => reactions[i.id]?.liked == null)
  const gustaron = todos.filter((i) => reactions[i.id]?.liked === true)
  const descartadas = todos.filter((i) => reactions[i.id]?.liked === false)
  const visitas = todos.filter((i) => reactions[i.id]?.wantVisit).length
  const hechas = todos.length - pendientes.length
  const parecidasSinVer = parecidas.filter((p) => !reveladas.includes(p.id) && !idsSeleccion.has(p.id) && reactions[p.id]?.liked == null)

  const [modoCel, setModoCel] = useState<'mazo' | 'cierre'>(() => (pendientes.length > 0 ? 'mazo' : 'cierre'))
  // Llegó con todo ya elegido (las del Tinder de la web vienen marcadas, o vuelve
  // a mirar): el cierre no le agradece, le muestra sus elegidas para visitar.
  const llegoConElegidas = useRef(pendientes.length === 0 && gustaron.length > 0).current

  /* ── Guardado de respuestas ── */

  const porGuardar = useRef<Record<string, CuerpoReaccion>>({})
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const sumadas = useRef<Set<string>>(new Set())
  // Las respuestas salen DE A UNA: el servidor guarda todas las reacciones en un
  // solo JSON (lee → cambia → escribe) y dos PATCH a la vez se pisaban; en el
  // mazo, deslizando rápido, se perdían respuestas que el asesor nunca veía.
  const cola = useRef<Promise<unknown>>(Promise.resolve())

  const enviar = useCallback((id: string, urgente = false) => {
    const body = porGuardar.current[id]
    if (!body) return
    delete porGuardar.current[id]
    if (soloMirar) return
    const mandar = () =>
      fetch(`/api/seleccion/${token}/reaccion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: urgente,
      }).catch(() => {})
    // La página se está yendo: ya, sin esperar turno.
    if (urgente) {
      void mandar()
      return
    }
    // Si una tarda (sumar una parecida le pide a HILO), la siguiente no espera más de 8 s.
    cola.current = cola.current.then(() => Promise.race([mandar(), new Promise((r) => setTimeout(r, 8000))]))
  }, [token, soloMirar])

  const flush = useCallback((urgente = false) => {
    for (const id of Object.keys(porGuardar.current)) {
      clearTimeout(timers.current[id])
      enviar(id, urgente)
    }
  }, [enviar])

  // Que no se pierda la última respuesta si cierra la pestaña enseguida.
  useEffect(() => {
    const salirYa = () => flush(true)
    const onHide = () => { if (document.visibilityState === 'hidden') flush(true) }
    window.addEventListener('pagehide', salirYa)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('pagehide', salirYa)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [flush])

  function patchReaction(item: SeleccionItem, patch: Partial<Reaction>) {
    const updated = { ...reactionsRef.current[item.id], ...patch }
    reactionsRef.current = { ...reactionsRef.current, [item.id]: updated }
    setReactions(reactionsRef.current)

    // Parecida todavía no guardada en la selección: solo se suma si le gusta.
    // Las que descarta quedan en este navegador (para no volver a ofrecerlas).
    if (item.sugerida && !idsSeleccion.has(item.id) && !sumadas.current.has(item.id)) {
      const descartadasLocales = leerLocal(claveDescartadas).filter((id) => id !== item.id)
      if (updated.liked === false) descartadasLocales.push(item.id)
      escribirLocal(claveDescartadas, descartadasLocales)
      if (updated.liked !== true && !updated.wantVisit) return
      sumadas.current.add(item.id)
    }

    porGuardar.current[item.id] = {
      propertyId: item.id,
      liked: updated.liked ?? null,
      wantVisit: !!updated.wantVisit,
      comment: updated.comment ?? '',
      reaction: updated.reaction ?? null,
      ...(item.sugerida ? { sugerida: true } : {}),
      ...(item.redId
        ? { tarjeta: { title: item.title, image: item.photos[0] ?? null, location: item.location, price: item.price, rooms: item.rooms, baths: item.baths, area: item.area } }
        : {}),
    }
    clearTimeout(timers.current[item.id])
    timers.current[item.id] = setTimeout(() => enviar(item.id), 700)
  }

  function aplicar(item: SeleccionItem, patch: Partial<Reaction>) {
    const antes = reactionsRef.current[item.id] ?? {}
    setHistorial((h) => [...h.slice(-40), { id: item.id, antes }])
    patchReaction(item, patch)
  }

  function decidir(item: SeleccionItem, d: Decision) {
    if (d === 'like') aplicar(item, { reaction: 'encanta', liked: true })
    else if (d === 'nope') aplicar(item, { reaction: 'no', liked: false, wantVisit: false })
    else aplicar(item, { reaction: 'encanta', liked: true, wantVisit: true })
  }

  // En la grilla el mismo botón prende y apaga.
  function decidirGrilla(item: SeleccionItem, d: 'like' | 'nope') {
    const actual = reactionsRef.current[item.id]?.liked
    if ((d === 'like' && actual === true) || (d === 'nope' && actual === false)) {
      aplicar(item, { reaction: null, liked: null, wantVisit: false })
    } else decidir(item, d)
  }

  function deshacer() {
    const ultimo = historial[historial.length - 1]
    if (!ultimo) return
    setHistorial((h) => h.slice(0, -1))
    const item = porId.get(ultimo.id)
    if (!item) return
    patchReaction(item, {
      reaction: ultimo.antes.reaction ?? null,
      liked: ultimo.antes.liked ?? null,
      wantVisit: !!ultimo.antes.wantVisit,
    })
  }

  function toggleVisita(id: string) {
    const item = porId.get(id)
    if (!item) return
    const r = reactionsRef.current[id] ?? {}
    // Pedir visita implica que le gusta.
    patchReaction(item, r.wantVisit ? { wantVisit: false } : { wantVisit: true, liked: true, reaction: 'encanta' })
  }

  /* ── Parecidas ── */

  const cargando = useRef(false)
  const parecidasRef = useRef<SeleccionItem[]>([])
  parecidasRef.current = parecidas

  const cargarParecidas = useCallback(async () => {
    if (cargando.current) return
    cargando.current = true
    setEstadoParecidas('cargando')
    try {
      const excluir = [...parecidasRef.current.map((p) => p.id), ...leerLocal(claveDescartadas)]
      const res = await fetch(`/api/seleccion/${token}/similares?limit=8&excluir=${encodeURIComponent(excluir.join(','))}`)
      const data = res.ok ? await res.json() : { items: [] }
      const nuevas: SeleccionItem[] = Array.isArray(data.items) ? data.items : []
      setParecidas((prev) => {
        const ya = new Set([...prev.map((p) => p.id), ...items.map((i) => i.id)])
        return [...prev, ...nuevas.filter((n) => !ya.has(n.id))]
      })
    } catch {
      // sin parecidas: el cierre le dice que el asesor le busca otras
    } finally {
      cargando.current = false
      setEstadoParecidas('listas')
    }
  }, [token, items, claveDescartadas])

  // Precarga apenas la página respira: cuando termine de mirar ya están.
  useEffect(() => {
    const t = setTimeout(() => { void cargarParecidas() }, 1200)
    return () => clearTimeout(t)
  }, [cargarParecidas])

  function avisar(texto: string) {
    setAviso(texto)
    window.setTimeout(() => setAviso((a) => (a === texto ? null : a)), 2800)
  }

  function revelar(mensaje?: string): boolean {
    const nuevas = parecidasSinVer.map((p) => p.id)
    if (nuevas.length === 0) return false
    setReveladas((r) => [...r, ...nuevas])
    if (mensaje) avisar(mensaje)
    void cargarParecidas() // la próxima tanda, para "ver más"
    return true
  }

  // El panel de cierre de la compu se abre solo UNA vez por visita (si después
  // cambia de opinión en alguna tarjeta, no se lo volvemos a tirar encima).
  const cierreAutoMostrado = useRef(false)
  function terminar(auto = false) {
    flush()
    setModoCel('cierre')
    if (auto && cierreAutoMostrado.current) return
    if (auto) cierreAutoMostrado.current = true
    setCierreCompu(true)
  }

  // Terminó de mirar todo lo que había: si no le gustó ninguna, parecidas
  // solas; si no, el cierre.
  const pendientesAntes = useRef(pendientes.length)
  useEffect(() => {
    const antes = pendientesAntes.current
    pendientesAntes.current = pendientes.length
    if (!(antes > 0 && pendientes.length === 0)) return
    flush()
    if (gustaron.length === 0) {
      if (revelar(MENSAJE_PARECIDAS)) return
      if (estadoParecidas !== 'listas') {
        setEsperando(true)
        if (estadoParecidas === 'idle') void cargarParecidas()
        return
      }
    }
    terminar(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendientes.length])

  useEffect(() => {
    if (!esperando || estadoParecidas !== 'listas') return
    setEsperando(false)
    if (!revelar(MENSAJE_PARECIDAS)) terminar(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esperando, estadoParecidas, parecidas])

  /* ── Intro (celular, primera vez) ── */

  useEffect(() => {
    let visto = false
    try { visto = window.localStorage.getItem(claveIntro) === '1' } catch { /* sin storage */ }
    if (!visto && hechas === 0 && todos.length > 0) setIntro(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function cerrarIntro() {
    setIntro(false)
    escribirLocal(claveIntro, '1')
  }

  /* ── Ficha en hoja ── */

  const ficha = fichaId ? porId.get(fichaId) ?? null : null
  const abrirFicha = (item: SeleccionItem) => { if (tieneFicha(item)) setFichaId(item.id) }
  const cerrarFicha = useCallback(() => setFichaId(null), [])

  function decidirDesdeFicha(d: 'like' | 'nope') {
    if (!ficha) return
    setFichaId(null)
    // En el mazo, la carta de arriba sale animada como si la hubiera deslizado.
    if (esCelular() && modoCel === 'mazo' && pendientes[0]?.id === ficha.id) {
      setPedido({ id: ficha.id, d, n: Date.now() })
      return
    }
    decidirGrilla(ficha, d)
  }

  function verParecidas() {
    if (!revelar()) return
    setCierreCompu(false)
    setModoCel('mazo')
    window.setTimeout(() => document.getElementById('parecidas')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  /* ── Render ── */

  const asesor = primerNombre(agentName)
  const activasSeleccion = items.filter((i) => reactions[i.id]?.liked !== false)
  const activasParecidas = todos.filter((i) => !idsSeleccion.has(i.id) && reactions[i.id]?.liked !== false)
  const indice = (id: string) => items.findIndex((i) => i.id === id)

  const tarjeta = (item: SeleccionItem) => (
    <TarjetaSeleccion
      key={item.id}
      item={item}
      idx={indice(item.id)}
      reaction={reactions[item.id] ?? {}}
      onDecidir={(d) => decidirGrilla(item, d)}
      onVisita={() => toggleVisita(item.id)}
      onComentario={(texto) => patchReaction(item, { comment: texto })}
      onFicha={() => abrirFicha(item)}
    />
  )

  const cierreProps = {
    clientName, agentName, agentPhoto, gustaron, reactions, llegoConElegidas,
    pendientes: pendientes.length,
    parecidasDisponibles: parecidasSinVer.length,
    onVisita: toggleVisita,
    onVerParecidas: verParecidas,
  }

  const seccionDescartadas = descartadas.length > 0 && (
    <div className="mt-8">
      <button type="button" onClick={() => setDescartadasOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-[13.5px] font-semibold text-[#4F5C54] shadow-[0_1px_0_rgba(16,40,28,0.06)]">
        <span className="flex items-center gap-2"><X className="h-4 w-4 text-[#F40009]" strokeWidth={2.6} /> Descartadas ({descartadas.length})</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${descartadasOpen ? 'rotate-180' : ''}`} />
      </button>
      {descartadasOpen && (
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {descartadas.map((item) => (
            <div key={item.id} className="opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0">{tarjeta(item)}</div>
          ))}
        </div>
      )}
    </div>
  )

  if (items.length === 0) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#F4F6F5] px-6 text-center" style={{ fontFamily: 'var(--font-raleway), Raleway, system-ui, sans-serif' }}>
        <div className="max-w-[380px]">
          <div className="mx-auto w-fit"><Avatar foto={agentPhoto} nombre={agentName} size={64} /></div>
          <p className="mt-4 text-[18px] font-bold text-[#111814]">Tu selección se está actualizando</p>
          <p className="mt-2 text-[14.5px] leading-relaxed text-[#4F5C54]">Las propiedades que tenía ya no están disponibles. {asesor} te va a mandar opciones nuevas.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#F4F6F5] text-[#111814]" style={{ fontFamily: 'var(--font-raleway), Raleway, system-ui, sans-serif' }}>
      <style>{CSS}</style>
      {soloMirar && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center pt-[max(6px,env(safe-area-inset-top))]" role="status">
          <span className="rounded-full bg-[#111814]/85 px-3 py-1 text-[13px] font-semibold text-white shadow">Vista del asesor · lo que toques no se guarda</span>
        </div>
      )}

      {/* ── Celular ── */}
      <div className="md:hidden">
        {modoCel === 'mazo' ? (
          <MazoSeleccion
            cola={pendientes}
            hechas={hechas}
            total={todos.length}
            agentName={agentName}
            agentPhoto={agentPhoto}
            clientName={clientName}
            note={note}
            intro={intro}
            onCerrarIntro={cerrarIntro}
            onVerMensaje={() => setIntro(true)}
            onDecidir={decidir}
            onDeshacer={deshacer}
            puedeDeshacer={historial.length > 0}
            onFicha={abrirFicha}
            onListo={() => terminar()}
            pedido={pedido}
            aviso={aviso}
            buscando={esperando}
          />
        ) : (
          <div className="px-4 pb-12" style={{ paddingTop: 'max(36px, env(safe-area-inset-top))' }}>
            <CierreSeleccion {...cierreProps} onSeguir={() => setModoCel('mazo')} />
            {todos.length - descartadas.length > 0 && (
              <section className="mt-12">
                <h3 className="mb-3 px-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#66736B]">Volver a mirar</h3>
                <div className="grid grid-cols-1 gap-5">{todos.filter((i) => reactions[i.id]?.liked !== false).map(tarjeta)}</div>
              </section>
            )}
            {seccionDescartadas}
          </div>
        )}
      </div>

      {/* ── Compu ── */}
      <div className="hidden md:block">
        <main className="mx-auto grid w-full max-w-[1440px] gap-6 px-6 py-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-[24px] bg-white p-5 shadow-[0_1px_0_rgba(16,40,28,0.06),0_14px_40px_-24px_rgba(16,40,28,0.35)]">
              <div className="flex items-center gap-3">
                <Avatar foto={agentPhoto} nombre={agentName} size={56} />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1A5C38]">Tu asesor</p>
                  <h2 className="truncate text-[17px] font-bold text-[#111814]">{agentName}</h2>
                </div>
              </div>
              <p className="mt-4 rounded-2xl rounded-tl-md bg-[#F4F6F5] px-4 py-3 text-[14px] leading-relaxed text-[#2B3630]">
                {isValidNote(note) ? note : `Hola ${primerNombre(clientName)}, te preparé esta selección. Mirala tranquilo y marcame cuáles te gustan.`}
              </p>

              <div className="mt-5 border-t border-[#EEF1EF] pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#66736B]">Selección para</p>
                <p className="mt-0.5 text-[19px] font-bold leading-tight text-[#111814]">{clientName}</p>

                <div className="mt-4 flex items-baseline justify-between text-[13px] text-[#4F5C54]">
                  <span>Revisaste</span>
                  <span className="font-numeric font-semibold text-[#111814]">{hechas} de {todos.length}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#E7EBE8]">
                  <div className="h-full rounded-full bg-[#1A5C38] transition-[width] duration-500" style={{ width: `${todos.length ? (hechas / todos.length) * 100 : 0}%` }} />
                </div>
                <div className="font-numeric mt-3 flex items-center gap-3 text-[13px] text-[#4F5C54]">
                  <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-[#1A5C38]" fill="currentColor" /> {gustaron.length}</span>
                  <span className="inline-flex items-center gap-1"><X className="h-3.5 w-3.5 text-[#F40009]" strokeWidth={3} /> {descartadas.length}</span>
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-[#1A5C38]" /> {visitas}</span>
                </div>
              </div>

              {hechas > 0 && (
                <button type="button" onClick={() => terminar()}
                  className="mt-5 w-full rounded-full bg-[#1A5C38] py-3 text-[14.5px] font-bold text-white transition hover:bg-[#164d2f] active:scale-[0.98]">
                  Listo, avisale a {asesor}
                </button>
              )}
              <p className="mt-2.5 text-center text-[12px] text-[#8A968E]">Tus respuestas se guardan solas.</p>
            </section>
          </aside>

          <section className="min-w-0">
            {activasSeleccion.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{activasSeleccion.map(tarjeta)}</div>
            ) : reveladas.length === 0 && (
              <p className="rounded-[24px] bg-white px-6 py-14 text-center text-[14.5px] text-[#4F5C54]">
                Descartaste todas. {estadoParecidas === 'listas' ? `${asesor} te va a buscar otras opciones.` : 'Buscando parecidas…'}
              </p>
            )}

            {activasParecidas.length > 0 && (
              <div id="parecidas" className="mt-8 scroll-mt-6">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#1A5C38]" />
                  <h3 className="text-[17px] font-bold text-[#111814]">
                    {gustaron.length === 0 ? MENSAJE_PARECIDAS : 'Parecidas a lo que buscás'}
                  </h3>
                </div>
                {activasParecidas.some((i) => i.enRed) && (
                  <p className="-mt-2 mb-4 text-[13.5px] text-[#66736B]">{LINEA_EN_RED}</p>
                )}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{activasParecidas.map(tarjeta)}</div>
              </div>
            )}

            {hechas === todos.length && parecidasSinVer.length > 0 && (
              <button type="button" onClick={verParecidas}
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#D5DDD8] bg-white px-5 py-3 text-[14px] font-semibold text-[#1A5C38] transition hover:border-[#1A5C38]">
                <Sparkles className="h-4 w-4" /> Ver {parecidasSinVer.length} parecida{parecidasSinVer.length !== 1 ? 's' : ''} más
              </button>
            )}

            {seccionDescartadas}
          </section>
        </main>

        {aviso && (
          <div className="fixed left-1/2 top-5 z-[90] -translate-x-1/2 rounded-full bg-[#111814] px-5 py-3 text-[14px] font-semibold text-white shadow-xl" role="status">
            {aviso}
          </div>
        )}

        {cierreCompu && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 p-6" role="dialog" aria-modal="true" aria-label="Listo"
            onClick={(e) => { if (e.target === e.currentTarget) setCierreCompu(false) }}>
            <div className="max-h-[90vh] w-full max-w-[540px] overflow-y-auto rounded-[28px] bg-white px-8 pb-6 pt-9 shadow-2xl">
              <CierreSeleccion {...cierreProps} onSeguir={() => setCierreCompu(false)} onCerrar={() => setCierreCompu(false)} />
            </div>
          </div>
        )}
      </div>

      {ficha && (
        <FichaHoja key={ficha.id} item={ficha} token={token} reaction={reactions[ficha.id] ?? {}} onCerrar={cerrarFicha} onDecidir={decidirDesdeFicha} />
      )}
    </div>
  )
}

const CSS = `
@keyframes si-hoja-entra { from { transform: translateY(28px); opacity: 0 } to { transform: none; opacity: 1 } }
.si-hoja-entra { animation: si-hoja-entra 280ms cubic-bezier(.2,.8,.2,1) both }
@keyframes si-cierre-entra { from { transform: translateY(16px) scale(.98); opacity: 0 } to { transform: none; opacity: 1 } }
.si-cierre-entra { animation: si-cierre-entra 440ms cubic-bezier(.2,.8,.2,1) both }
@keyframes si-check-pop { 0% { transform: scale(0) } 60% { transform: scale(1.18) } 100% { transform: scale(1) } }
.si-check-pop { animation: si-check-pop 520ms 180ms cubic-bezier(.2,.8,.2,1) both }
@media (prefers-reduced-motion: reduce) { .si-hoja-entra, .si-cierre-entra, .si-check-pop { animation: none } }
`
