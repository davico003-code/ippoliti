'use client'

// Flujo de tasación para VENDEDORES (27-sep-2026), en una sola página:
//   1) qué vendés · barrio · cuándo pensás vender  →  2) nombre + WhatsApp  →  Listo
// Sin rango automático: con el rango el dueño veía el número y se iba (≈260 lo
// vieron, 1 pidió) y David no confía en que se parezca al real. El valor lo da
// un tasador del equipo. Medición: ViewContent al montar, TasacionContacto
// (custom) al llegar al formulario, Lead SOLO cuando el servidor confirmó el
// envío. Los mismos tres en GA4.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { BarrioTasacion, PlazoVenta, TipoTasacion, UtmTasacion } from '@/lib/tasacion/types'
import { parseTipo, PLAZOS_VENTA, TEXTO_TIPO, normalizarCelularAr } from '@/lib/tasacion/formato'
import { trackEvent, trackFbCustomEvent, trackFbEvent } from '@/lib/analytics'
import { barrioParaPedido } from '@/lib/tasacion/barrio-de-zona'
import PasoVender from './PasoVender'
import Paso3Pedido from './Paso3Pedido'
import PantallaListo from './PantallaListo'

type Paso = 1 | 3 | 'listo'

interface Props {
  barrios: BarrioTasacion[]
  /** ?barrio=<slug> (los anuncios y /tasar linkean así). */
  barrioInicial?: string
  /** ?tipo=casa|lote|depto (también acepta Terreno/Departamento del flujo viejo). */
  tipoInicial?: string
  /** ?zona=<nombre> (compat con el link viejo de /tasar). */
  zonaInicial?: string
  /** ?ciudad= (acompaña a ?zona= desde /tasar). */
  ciudadInicial?: string
}

function normalizarTexto(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

function resolverBarrioInicial(barrios: BarrioTasacion[], slug?: string, zona?: string, ciudad?: string): BarrioTasacion | null {
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
    // Las landings /tasar usan los nombres del mercado ("Kentucky Club de Campo",
    // "Vida Lagoon"): el de la lista por palabras o, si no está, uno propio con el
    // nombre (solo con ciudad). Así el vendedor no llega sin barrio ni el pedido rebota.
    return barrioParaPedido(barrios, zona, ciudad)
  }
  return null
}

function leerUtm(): UtmTasacion | null {
  if (typeof window === 'undefined') return null
  const sp = new URLSearchParams(window.location.search)
  const g = (k: string) => sp.get(k)?.slice(0, 150) || null
  const utm = { source: g('utm_source'), medium: g('utm_medium'), campaign: g('utm_campaign'), content: g('utm_content') }
  return utm.source || utm.medium || utm.campaign || utm.content ? utm : null
}

export default function TasacionFlow({ barrios, barrioInicial, tipoInicial, zonaInicial, ciudadInicial }: Props) {
  const tipoIni = parseTipo(tipoInicial) ?? 'casa'
  // Sin barrio por defecto: en una página de vendedores un barrio pre-elegido
  // que no es el suyo es un pedido con datos falsos. Solo si viene en el link.
  const barrioIni = resolverBarrioInicial(barrios, barrioInicial, zonaInicial, ciudadInicial)

  const [paso, setPaso] = useState<Paso>(1)
  const [tipo, setTipo] = useState<TipoTasacion>(tipoIni)
  const [barrio, setBarrio] = useState<BarrioTasacion | null>(barrioIni)
  const [plazo, setPlazo] = useState<PlazoVenta | null>(null)
  const [errorPaso1, setErrorPaso1] = useState<string | null>(null)
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

  const elegirBarrio = useCallback((b: BarrioTasacion) => {
    setBarrio(b)
    setErrorPaso1(null)
  }, [])

  const continuar = () => {
    if (!barrio) {
      setErrorPaso1('Elegí el barrio para seguir.')
      return
    }
    if (!plazo) {
      setErrorPaso1('Contanos cuándo pensás vender.')
      return
    }
    setErrorPaso1(null)
    setPaso(3)
    trackFbCustomEvent('TasacionContacto', { barrio: barrio.nombre, tipo, plazo })
    trackEvent('tasacion_contacto', { barrio: barrio.nombre, tipo, plazo })
  }

  const enviarPedido = async () => {
    if (!barrio || !plazo || enviandoRef.current) return
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
            m2Cubiertos: null,
            m2Lote: null,
            rangoVisto: null,
            nivel: 4,
            n: 0,
            lat: null,
            lng: null,
            plazo,
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
      trackFbEvent('Lead', { content_name: 'Tasación', barrio: barrio.nombre, plazo })
      trackEvent('tasacion_pedido', { barrio: barrio.nombre, tipo, plazo })
      setEnviando(false)
      setPaso('listo')
    } catch {
      setErrorEnvio('Parece que no hay conexión. Revisá internet y probá de nuevo; tus datos quedan cargados.')
      setEnviando(false)
    } finally {
      enviandoRef.current = false
    }
  }

  const plazoTxt = PLAZOS_VENTA.find((p) => p.v === plazo)?.label
  const resumen = barrio
    ? `${TEXTO_TIPO[tipo].singular[0].toUpperCase() + TEXTO_TIPO[tipo].singular.slice(1)} en ${barrio.nombre}${plazoTxt ? ` · ${plazoTxt.toLowerCase()}` : ''}`
    : ''

  return (
    <div className="min-h-screen bg-white">
      <div className={`mx-auto max-w-[520px] px-5 pt-3 ${paso === 'listo' ? 'pb-16' : 'pb-[150px]'}`}>
        {paso === 1 && (
          <PasoVender
            barrios={barrios}
            tipo={tipo}
            barrio={barrio}
            plazo={plazo}
            onTipo={(t) => {
              setTipo(t)
              setErrorPaso1(null)
            }}
            onBarrio={elegirBarrio}
            onPlazo={(p) => {
              setPlazo(p)
              setErrorPaso1(null)
            }}
            onContinuar={continuar}
            error={errorPaso1}
            tituloRef={tituloRef}
          />
        )}
        {paso === 3 && (
          <Paso3Pedido
            resumen={resumen}
            textoVolver="Cambiar datos"
            nombre={nombre}
            whatsapp={whatsapp}
            onNombre={setNombre}
            onWhatsapp={setWhatsapp}
            onEnviar={enviarPedido}
            enviando={enviando}
            error={errorEnvio}
            onVolver={() => setPaso(1)}
            tituloRef={tituloRef}
          />
        )}
        {paso === 'listo' && <PantallaListo nombre={nombre} resumen={resumen} tituloRef={tituloRef} />}
      </div>
    </div>
  )
}
