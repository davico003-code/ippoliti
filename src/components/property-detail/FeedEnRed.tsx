'use client'

// "Más casas en <barrio>" debajo de la ficha (David, 3-oct-2026). Va SOLO
// abajo de todo (David, 3-oct noche: "que aparezca si llega hasta el final",
// sin pestaña en la barra ni aviso flotante). Celu: la primera tarjeta del
// mazo con ✕ y ♥; tocarla abre el mazo tipo Tinder (MazoCasas). Compu (David,
// 4-oct, opción A: "una sola tarjeta no atrae"): fila de 4 "En red" como
// "Otras opciones para vos", cada una con su ♥; tocarla abre el mazo en esa.
// Mazo = las nuestras del barrio (sello verde) + las "En red" (otras
// inmobiliarias, dicho abiertamente).

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { type TokkoProperty, operacionPrincipal, translatePropertyType } from '@/lib/tokko'
import {
  type CriteriosBusqueda,
  type FeedEnRed as DatosFeed,
  type ItemFeed,
  type PuntoZona,
  TIPOS_HOGAR,
  enLaZona,
  estiloSinLogo,
  itemDeEnRed,
  pluralTipo,
  textoBusqueda,
  tipoHogarDeTokko,
} from '@/lib/feed-en-red'
import type { ValoresAfinar } from '@/components/mazo/AfinarBusqueda'
import { itemDeNuestra } from '@/lib/mazo-items'
import MazoCasas, { BotonesTinder, Chip, Corazon, CORAZON, SuscripcionMail, Tarjeta, useGuardadas } from '@/components/mazo/MazoCasas'
import { cargarCasasDeBarrios } from '@/lib/mazo-parecidos'

/** Barrio, pin y precio en dólares de una propiedad, para la regla de zona. */
function puntoDe(p: TokkoProperty): PuntoZona {
  const lat = p.geo_lat ? parseFloat(p.geo_lat) : NaN
  const lng = p.geo_long ? parseFloat(p.geo_long) : NaN
  const precio = operacionPrincipal(p)?.prices?.[0]
  return {
    barrio: p.location?.name ?? null,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    precioUsd: precio && precio.currency === 'USD' && precio.price > 0 ? precio.price : null,
  }
}

/** Cuántas nuestras como mucho en el mazo (así también entran las En red). */
const MAX_NUESTRAS = 6

/**
 * Una de la fila de la compu: como las de "Otras opciones para vos" (foto 16:9,
 * precio, datos, dirección) con el chip "En red" y un ♥ en la foto. La tarjeta
 * y el ♥ son botones hermanos (no anidados): la tarjeta abre el mazo en esa.
 */
function TarjetaFila({ item, guardada, onAbrir, onCorazon }: { item: ItemFeed; guardada: boolean; onAbrir: () => void; onCorazon: () => void }) {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 hover:ring-2 hover:ring-[#1A5C38]">
      <button type="button" onClick={onAbrir} className="block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-[#1A5C38]" aria-label={`Ver ${item.datos || 'propiedad'} ${item.precio}`}>
        <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
          {item.fotos[0] && (
            <Image
              src={item.fotos[0]}
              alt={item.titulo}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              style={estiloSinLogo(item.logo)}
            />
          )}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            <Chip nuestra={item.esNuestra} />
            {item.masVista && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-gray-900 shadow-sm">De las más vistas</span>}
          </div>
        </div>
        <div className="p-4">
          <p className="text-gray-900 font-black text-xl font-numeric leading-none mb-2">{item.precio}</p>
          {item.datos && <p className="text-gray-600 text-sm mb-2 font-poppins">{item.datos}</p>}
          {(item.direccion || item.zona) && (
            <div className="flex items-center gap-1.5 text-gray-600 text-xs">
              <MapPin className="w-3 h-3 flex-shrink-0 text-[#1A5C38]" aria-hidden="true" />
              <span className="truncate">{item.direccion || item.zona}</span>
            </div>
          )}
          <p className="mt-1.5 text-[11px] text-gray-400">{item.esNuestra ? 'SI Inmobiliaria' : 'Otra inmobiliaria'}</p>
        </div>
      </button>
      <button
        type="button"
        onClick={onCorazon}
        aria-pressed={guardada}
        aria-label={guardada ? 'Quitar de las que me gustan' : 'Me gusta'}
        className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/95 shadow-sm grid place-items-center transition-transform hover:scale-110 active:scale-90"
        style={{ color: CORAZON }}
      >
        <Corazon lleno={guardada} className="w-6 h-6" />
      </button>
    </div>
  )
}

/** Ciudades para afinar desde la ficha (las mismas de "Conocé tu próximo hogar"). */
const CIUDADES_AFINAR = ['Funes', 'Roldán', 'Rosario']

export default function FeedEnRed({ property, nuestras }: { property: TokkoProperty; nuestras: TokkoProperty[] }) {
  const [datos, setDatos] = useState<DatosFeed | null>(null)
  // Nuestras parecidas para el mazo: se piden más que las 4 de "Otras opciones"
  // y se quedan SOLO las del barrio o la zona (David, 3-oct: "si no, pierde el sentido").
  const [cercanas, setCercanas] = useState<TokkoProperty[] | null>(null)
  /** Desde qué tarjeta se abrió el mazo (null = cerrado). */
  const [abiertoEn, setAbiertoEn] = useState<number | null>(null)
  const guardadasApi = useGuardadas('ficha')
  /**
   * "Afiná tu búsqueda" también acá (David 5-oct, "vamos con eso"): con lo que
   * elija se buscan casas como en "Conocé tu próximo hogar" y el mazo sigue con
   * ellas. Al cerrar vuelve a "Más casas en <barrio>".
   */
  const [afinado, setAfinado] = useState<{ valores: ValoresAfinar; items: ItemFeed[] } | null>(null)
  const [estadoAfinar, setEstadoAfinar] = useState<'listo' | 'buscando' | 'vacio'>('listo')
  const [rondaAfinar, setRondaAfinar] = useState(0)
  /** Cada búsqueda (y cerrar el mazo) sube esto: una respuesta vieja no pisa nada. */
  const pedidoAfinar = useRef(0)
  // La misma ficha se abre ADENTRO de la selección del cliente
  // (/seleccion/ficha/…): ahí no va el mazo ni su "que me escriba un asesor"
  // (entraría como consulta nueva por turno, aunque ese cliente ya tiene asesor).
  const dentroDeSeleccion = usePathname()?.startsWith('/seleccion/') ?? false

  useEffect(() => {
    if (dentroDeSeleccion) return
    let cancelado = false
    fetch(`/api/propiedades/similar?id=${property.id}&limit=24`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { objects?: TokkoProperty[] } | null) => {
        if (!cancelado && d && Array.isArray(d.objects)) setCercanas(d.objects)
      })
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [property.id, dentroDeSeleccion])

  useEffect(() => {
    if (dentroDeSeleccion) return
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
  }, [property.id, dentroDeSeleccion])

  const enRed = useMemo(() => (datos?.tarjetas ?? []).map(itemDeEnRed), [datos])
  const items = useMemo(() => {
    const ref = puntoDe(property)
    const nuestrasZona = (cercanas ?? nuestras)
      .filter((p) => p.id !== property.id && enLaZona(ref, puntoDe(p)))
      .map(itemDeNuestra)
      .filter((i) => i.fotos.length > 0)
      .slice(0, MAX_NUESTRAS)
    return [...nuestrasZona, ...enRed]
  }, [cercanas, nuestras, property, enRed])
  const barrio = datos?.barrio || property.location?.name || null
  // Barrios parecidos (al final del mazo, si dice que sí): mismo tipo y hasta
  // un 25 % más caras que esta, como las En red que ya eligió Hilo.
  const tipoHogar = TIPOS_HOGAR.find((t) => t.tokkoIds.includes(property.type?.id ?? -1))?.id ?? 'house'
  const precioVenta = (property.operations ?? [])
    .find((o) => o.operation_type === 'Sale')
    ?.prices?.find((x) => x.currency === 'USD' && x.price > 0)?.price
  const tope = precioVenta ? Math.round(precioVenta * 1.25) : null
  const plural = pluralTipo(translatePropertyType(property.type?.name))
  const titulo = barrio ? `Más ${plural} en ${barrio}` : `Más ${plural} en la zona`
  // Lo que viaja con el mail si quiere recibir las nuevas: el barrio y el tipo de
  // esta ficha. Sin tope: no lo eligió él (el +25 % es solo para los parecidos).
  const criterios: CriteriosBusqueda = { zona: barrio, tipo: tipoHogarDeTokko(property.type?.id), topeUsd: null, origen: 'ficha' }
  const zonasAfinar = [...(barrio && !CIUDADES_AFINAR.includes(barrio) ? [barrio] : []), ...CIUDADES_AFINAR]
  const aplicarAfinar = async (v: ValoresAfinar) => {
    const pedido = ++pedidoAfinar.current
    setEstadoAfinar('buscando')
    const p = new URLSearchParams({ zona: v.zona, tipo: tipoHogar })
    if (v.tope) p.set('tope', String(v.tope))
    if (v.dorm) p.set('dorm', String(v.dorm))
    if (v.barrio) p.set('barrio', v.barrio)
    try {
      const r = await fetch(`/api/propiedades/hogar?${p.toString()}`)
      const d: { items?: ItemFeed[] } = r.ok ? await r.json() : {}
      const nuevas = Array.isArray(d.items) ? d.items.filter((i) => i.key !== `n:${property.id}`) : []
      // Cerró el mazo (o pidió otra) mientras buscaba: esta respuesta ya no va.
      if (pedido !== pedidoAfinar.current) return
      if (!nuevas.length) return setEstadoAfinar('vacio')
      setAfinado({ valores: v, items: nuevas })
      setEstadoAfinar('listo')
      setRondaAfinar((x) => x + 1)
    } catch {
      if (pedido === pedidoAfinar.current) setEstadoAfinar('vacio')
    }
  }
  // Lo que eligió al afinar: viaja con la consulta (texto para el asesor) y con
  // el mail (Hilo lo escribe en el contacto para los envíos). Sin afinar, la ficha.
  const criteriosAfinados: CriteriosBusqueda | null = afinado
    ? { zona: afinado.valores.zona, tipo: tipoHogar, topeUsd: afinado.valores.tope, dormMin: afinado.valores.dorm, barrio: afinado.valores.barrio, origen: 'ficha' }
    : null

  if (enRed.length === 0 || dentroDeSeleccion) return null
  const { montado, esGuardada, guardar, quitar, guardadas } = guardadasApi
  // Compu: las En red primero (las nuestras ya están arriba, en "Otras opciones").
  const fila = [...items.filter((i) => !i.esNuestra), ...items.filter((i) => i.esNuestra)].slice(0, 4)
  const g = montado ? guardadas.length : 0

  return (
    <>
      <section className="mt-4 bg-white rounded-2xl px-5 md:px-8 pt-6 pb-6 shadow-sm border border-gray-100" aria-labelledby="feed-en-red-titulo">
        <h2 id="feed-en-red-titulo" className="text-2xl font-black text-gray-900 [text-wrap:balance]">
          {titulo}
        </h2>
        <p className="text-sm text-gray-600 mt-1 mb-4 max-w-2xl">
          Algunas las publican otras inmobiliarias. Te las mostramos y te coordinamos la visita nosotros.
        </p>
        {/* Celu: la primera tarjeta del mazo */}
        {items[0] && (
          <div className="max-w-[420px] md:hidden">
            <button
              type="button"
              onClick={() => setAbiertoEn(0)}
              aria-label={`Ver ${titulo.toLowerCase()}`}
              className="relative block w-full h-[470px] text-left rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-[#1A5C38]"
            >
              <Tarjeta item={items[0]} modo="quieta" guardada={montado && esGuardada(items[0].key)} arrastre={null} salida={null} par={0} />
            </button>
            <div className="mt-4">
              <BotonesTinder
                chicos
                onPaso={() => setAbiertoEn(1)}
                onMeGusta={() => {
                  guardar(items[0])
                  setAbiertoEn(1)
                }}
              />
            </div>
            <p className="mt-2.5 text-center text-xs text-gray-500">
              {items.length} para ver · deslizá a la derecha las que te gusten
            </p>
          </div>
        )}

        {/* Compu: fila de 4, como "Otras opciones para vos" */}
        <div className="hidden md:block">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {fila.map((item) => (
              <TarjetaFila
                key={item.key}
                item={item}
                guardada={montado && esGuardada(item.key)}
                onAbrir={() => setAbiertoEn(Math.max(0, items.findIndex((i) => i.key === item.key)))}
                onCorazon={() => (esGuardada(item.key) ? quitar(item.key) : guardar(item))}
              />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {g > 0 ? (
              <button
                type="button"
                onClick={() => setAbiertoEn(items.length)}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl text-white font-bold"
                style={{ background: '#1A5C38' }}
              >
                <Corazon lleno className="w-5 h-5" />
                {g === 1 ? 'Te gustó 1' : `Te gustaron ${g}`} · que me escriba un asesor
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Tocá el <span style={{ color: CORAZON }}>♥</span> en las que te gusten y te las mandamos por WhatsApp.
              </p>
            )}
            {items.length > fila.length && (
              <button type="button" onClick={() => setAbiertoEn(0)} className="text-[15px] font-bold text-[#1A5C38] hover:underline">
                Ver las {items.length} →
              </button>
            )}
          </div>
          {/* David 4-oct: que puedan dejar el mail con la búsqueda ya filtrada (para los envíos). */}
          <div className="mt-4">
            <SuscripcionMail criterios={criterios} compacta origen="ficha" />
          </div>
        </div>
      </section>

      {montado && abiertoEn != null && (
        <MazoCasas
          items={afinado?.items ?? items}
          titulo={titulo}
          barrio={afinado?.valores.zona ?? barrio}
          inicio={abiertoEn}
          guardadasApi={guardadasApi}
          origen="ficha"
          busqueda={criteriosAfinados ? textoBusqueda(criteriosAfinados) : null}
          criterios={criteriosAfinados ?? criterios}
          cargarParecidos={(barrios, yaVistas) => cargarCasasDeBarrios(barrios, tipoHogar, tope, yaVistas)}
          afinar={{
            tipo: tipoHogar,
            valores: afinado?.valores ?? { zona: barrio ?? 'Funes', tope: null, dorm: null, barrio: null },
            zonas: zonasAfinar,
            esCiudad: (z) => CIUDADES_AFINAR.includes(z),
            estado: estadoAfinar,
            ronda: rondaAfinar,
            onAplicar: (v) => void aplicarAfinar(v),
          }}
          onCerrar={() => {
            pedidoAfinar.current++
            setAbiertoEn(null)
            setAfinado(null)
            setEstadoAfinar('listo')
          }}
        />
      )}
    </>
  )
}
