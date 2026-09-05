'use client'

// Flujo de tasación en 3 pasos, en una sola página (estado en cliente):
//   1) barrio + tipo + m²  →  2) qué se pide por parecidas  →  3) nombre + WhatsApp  →  Listo
// Medición: ViewContent al montar, TasacionRango (custom) al mostrar el paso 2,
// Lead SOLO cuando el servidor confirmó el envío. Los mismos tres en GA4.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { BarrioTasacion, ComparablesResponse, TipoTasacion, UtmTasacion } from '@/lib/tasacion/types'
import { barrioMasCercano, fmtMiles, M2_FALLBACK, parseTipo, TEXTO_TIPO, cuentaTipo, normalizarCelularAr } from '@/lib/tasacion/formato'
import { trackEvent, trackFbCustomEvent, trackFbEvent } from '@/lib/analytics'
import Paso1Datos, { type GeoEstado } from './Paso1Datos'
import Paso2Rango from './Paso2Rango'
import Paso3Pedido from './Paso3Pedido'
import PantallaListo from './PantallaListo'

type Paso = 1 | 2 | 3 | 'listo'

interface Props {
  barrios: BarrioTasacion[]
  /** ?barrio=<slug> (los anuncios y /tasar linkean así). */
  barrioInicial?: string
  /** ?tipo=casa|lote|depto (también acepta Terreno/Departamento del flujo viejo). */
  tipoInicial?: string
  /** ?zona=<nombre> (compat con el link viejo de /tasar). */
  zonaInicial?: string
}

function normalizarTexto(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

function resolverBarrioInicial(barrios: BarrioTasacion[], slug?: string, zona?: string): BarrioTasacion | null {
  if (slug) {
    const s = normalizarTexto(slug)
    const porSlug = barrios.find((b) => b.slug === s || b.id === slug)
    if (porSlug) return porSlug
    const porNombre = barrios.find((b) => normalizarTexto(b.nombre).replace(/[^a-z0-9]+/g, '-') === s)
    if (porNombre) return porNombre
  }
  if (zona) {
    const z = normalizarTexto(zona)
    const porZona = barrios.find((b) => normalizarTexto(b.nombre) === z)
    if (porZona) return porZona
  }
  return null
}

function barrioPorDefecto(barrios: BarrioTasacion[], tipo: TipoTasacion, ciudad: string): BarrioTasacion | null {
  const enCiudad = barrios.filter((b) => b.ciudad === ciudad && cuentaTipo(b, tipo) > 0)
  const lista = enCiudad.length ? enCiudad : barrios.filter((b) => cuentaTipo(b, tipo) > 0)
  // Sin conteos (catálogo local): el primero de la ciudad, que viene ordenado por actividad.
  if (!lista.length) return barrios.find((b) => b.ciudad === ciudad) ?? barrios[0] ?? null
  return lista.sort((a, b) => cuentaTipo(b, tipo) - cuentaTipo(a, tipo))[0]
}

function leerUtm(): UtmTasacion | null {
  if (typeof window === 'undefined') return null
  const sp = new URLSearchParams(window.location.search)
  const g = (k: string) => sp.get(k)?.slice(0, 150) || null
  const utm = { source: g('utm_source'), medium: g('utm_medium'), campaign: g('utm_campaign'), content: g('utm_content') }
  return utm.source || utm.medium || utm.campaign || utm.content ? utm : null
}

export default function TasacionFlow({ barrios, barrioInicial, tipoInicial, zonaInicial }: Props) {
  const tipoIni = parseTipo(tipoInicial) ?? 'casa'
  const barrioIni = resolverBarrioInicial(barrios, barrioInicial, zonaInicial)

  const [paso, setPaso] = useState<Paso>(1)
  const [tipo, setTipo] = useState<TipoTasacion>(tipoIni)
  const [ciudad, setCiudad] = useState<string>(barrioIni?.ciudad ?? 'Funes')
  const [barrio, setBarrio] = useState<BarrioTasacion | null>(() => barrioIni ?? barrioPorDefecto(barrios, tipoIni, 'Funes'))
  const [lote, setLote] = useState<string>(() => String((barrioIni ?? barrioPorDefecto(barrios, tipoIni, 'Funes'))?.m2Tipico.lote ?? M2_FALLBACK.lote))
  const [cubiertos, setCubiertos] = useState<string>(() => String((barrioIni ?? barrioPorDefecto(barrios, tipoIni, 'Funes'))?.m2Tipico.cubiertos ?? M2_FALLBACK.cubiertos))
  const [loteTocado, setLoteTocado] = useState(false)
  const [cubTocado, setCubTocado] = useState(false)
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null)
  const [geoEstado, setGeoEstado] = useState<GeoEstado>('idle')
  const [cargando, setCargando] = useState(false)
  const [errorPaso1, setErrorPaso1] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ComparablesResponse | null>(null)
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)

  const tituloRef = useRef<HTMLHeadingElement>(null)
  const pasoPrevio = useRef<Paso>(paso)
  // Guardia de reentrada del envío: no depende del re-render que deshabilita el botón.
  const enviandoRef = useRef(false)

  // Medición del paso 1 (una vez).
  useEffect(() => {
    trackFbEvent('ViewContent', { content_name: 'Tasación · paso 1' })
    trackEvent('tasacion_paso1', { barrio: barrioIni?.nombre ?? '', tipo: tipoIni })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Al cambiar de paso: arriba de todo y foco en el título (lectores de pantalla).
  useEffect(() => {
    if (pasoPrevio.current === paso) return
    pasoPrevio.current = paso
    window.scrollTo({ top: 0, behavior: 'auto' })
    tituloRef.current?.focus({ preventScroll: true })
  }, [paso])

  const elegirBarrio = useCallback(
    (b: BarrioTasacion) => {
      setBarrio(b)
      setCiudad(b.ciudad)
      if (!loteTocado) setLote(String(b.m2Tipico.lote ?? M2_FALLBACK.lote))
      if (!cubTocado) setCubiertos(String(b.m2Tipico.cubiertos ?? M2_FALLBACK.cubiertos))
      setErrorPaso1(null)
    },
    [loteTocado, cubTocado],
  )

  const cambiarTipo = (t: TipoTasacion) => {
    setTipo(t)
    setErrorPaso1(null)
    // Si el barrio actual no tiene comparables del nuevo tipo, sugerimos el mejor de la ciudad.
    if (barrio && cuentaTipo(barrio, t) === 0) {
      const mejor = barrioPorDefecto(barrios, t, ciudad)
      if (mejor && mejor.id !== barrio.id) elegirBarrio(mejor)
    }
  }

  const usarUbicacion = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation || geoEstado === 'buscando') return
    setGeoEstado('buscando')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setGeo(p)
        const cercano = barrioMasCercano(barrios, p)
        if (cercano) {
          elegirBarrio(cercano)
          setGeoEstado('ok')
        } else {
          // A más de 25 km del barrio más cercano: no cambiamos el barrio y lo decimos.
          setGeoEstado('fuera')
        }
      },
      () => setGeoEstado('fallo'), // permiso negado o timeout: se avisa en el botón y seguimos sin ubicación
      // En un reintento (fuera de zona / fallo) pedimos posición fresca, no la cacheada.
      { enableHighAccuracy: false, timeout: 8000, maximumAge: geoEstado === 'idle' ? 300000 : 0 },
    )
  }

  const m2Lote = tipo !== 'depto' ? Number(lote) || null : null
  const m2Cub = tipo !== 'lote' ? Number(cubiertos) || null : null

  const verRango = async () => {
    if (!barrio) {
      setErrorPaso1('Elegí tu barrio para seguir.')
      return
    }
    if (tipo !== 'depto' && !m2Lote) {
      setErrorPaso1('Contanos los m² del lote, aunque sea aproximado.')
      return
    }
    if (tipo !== 'lote' && !m2Cub) {
      setErrorPaso1('Contanos los m² cubiertos, aunque sea aproximado.')
      return
    }
    setErrorPaso1(null)
    setCargando(true)
    const sp = new URLSearchParams({ barrioId: barrio.id, tipo })
    if (m2Cub) sp.set('m2Cubiertos', String(m2Cub))
    if (m2Lote) sp.set('m2Lote', String(m2Lote))
    if (geo) {
      sp.set('lat', String(geo.lat))
      sp.set('lng', String(geo.lng))
    }
    let r: ComparablesResponse
    try {
      const res = await fetch(`/api/tasacion/comparables?${sp.toString()}`, { headers: { accept: 'application/json' } })
      r = res.ok ? ((await res.json()) as ComparablesResponse) : nivel4()
    } catch {
      r = nivel4()
    }
    if (!r || typeof r !== 'object' || !r.rango) r = { ...nivel4(), ...(r && typeof r === 'object' ? { barrio: r.barrio ?? null, periodo: r.periodo ?? '' } : {}) }
    setResultado(r)
    setCargando(false)
    // Nivel 4: no hay número que mostrar → directo al pedido, sin pantalla intermedia.
    setPaso(r.nivel === 4 ? 3 : 2)
    trackFbCustomEvent('TasacionRango', { barrio: barrio.nombre, nivel: r.nivel, n: r.n })
    trackEvent('tasacion_rango', { barrio: barrio.nombre, nivel: r.nivel, n: r.n, tipo })
  }

  const enviarPedido = async () => {
    if (!barrio || !resultado || enviandoRef.current) return
    enviandoRef.current = true
    setEnviando(true)
    setErrorEnvio(null)
    const honeypot = (document.getElementById('website') as HTMLInputElement | null)?.value ?? ''
    try {
      const res = await fetch('/api/tasacion/solicitud', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          whatsapp: normalizarCelularAr(whatsapp),
          website: honeypot,
          tasacion: {
            barrioId: barrio.id,
            barrioNombre: barrio.nombre,
            ciudad: barrio.ciudad,
            esCerrado: barrio.esCerrado,
            tipo,
            m2Cubiertos: m2Cub,
            m2Lote,
            rangoVisto: resultado.rango,
            nivel: resultado.nivel,
            n: resultado.n,
            lat: geo?.lat ?? null,
            lng: geo?.lng ?? null,
            utm: leerUtm(),
            paginaUrl: window.location.href.slice(0, 500),
          },
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setErrorEnvio(data.error || 'No pudimos enviar tu pedido. Probá de nuevo en unos segundos; tus datos quedan cargados.')
        setEnviando(false)
        return
      }
      // Solo acá: el servidor confirmó que Hilo recibió el pedido.
      trackFbEvent('Lead', { content_name: 'Tasación', barrio: barrio.nombre, nivel: resultado.nivel })
      trackEvent('tasacion_pedido', { barrio: barrio.nombre, nivel: resultado.nivel, tipo })
      setEnviando(false)
      setPaso('listo')
    } catch {
      setErrorEnvio('Parece que no hay conexión. Revisá internet y probá de nuevo; tus datos quedan cargados.')
      setEnviando(false)
    } finally {
      enviandoRef.current = false
    }
  }

  const esNivel4 = resultado?.nivel === 4

  const resumen = barrio
    ? `${TEXTO_TIPO[tipo].singular[0].toUpperCase() + TEXTO_TIPO[tipo].singular.slice(1)} en ${barrio.nombre}${m2Lote ? ` · ${fmtMiles(m2Lote)} m²` : ''}${m2Cub ? ` · ${fmtMiles(m2Cub)} m² cub.` : ''}`
    : ''

  return (
    <div className="min-h-screen bg-white">
      <div className={`mx-auto max-w-[520px] px-5 pt-3 ${paso === 'listo' ? 'pb-16' : 'pb-[150px]'}`}>
        {paso === 1 && (
          <Paso1Datos
            barrios={barrios}
            datos={{ barrio, tipo, lote, cubiertos }}
            ciudad={ciudad}
            onBarrio={elegirBarrio}
            onTipo={cambiarTipo}
            onLote={(v) => {
              setLote(v)
              setLoteTocado(true)
            }}
            onCubiertos={(v) => {
              setCubiertos(v)
              setCubTocado(true)
            }}
            onUbicacion={usarUbicacion}
            geoEstado={geoEstado}
            onContinuar={verRango}
            cargando={cargando}
            error={errorPaso1}
            tituloRef={tituloRef}
          />
        )}
        {paso === 2 && resultado && barrio && (
          <Paso2Rango
            resultado={resultado}
            barrio={barrio}
            tipo={tipo}
            onPedir={() => setPaso(3)}
            onVolver={() => setPaso(1)}
            tituloRef={tituloRef}
          />
        )}
        {paso === 3 && (
          <Paso3Pedido
            resumen={resumen}
            pocosDatos={esNivel4 && barrio ? { barrio: barrio.nombre, tipo } : null}
            textoVolver={esNivel4 ? 'Cambiar datos' : 'Volver'}
            nombre={nombre}
            whatsapp={whatsapp}
            onNombre={setNombre}
            onWhatsapp={setWhatsapp}
            onEnviar={enviarPedido}
            enviando={enviando}
            error={errorEnvio}
            onVolver={() => setPaso(esNivel4 ? 1 : 2)}
            tituloRef={tituloRef}
          />
        )}
        {paso === 'listo' && <PantallaListo nombre={nombre} resumen={resumen} tituloRef={tituloRef} />}
      </div>
    </div>
  )
}

function nivel4(): ComparablesResponse {
  return { nivel: 4, ambito: null, n: 0, rango: null, unidad: null, descripcion: '', periodo: '', muestras: [], barrio: null }
}
