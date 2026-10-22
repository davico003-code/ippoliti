'use client'

// Shared desktop body: all content sections in identical order for
// the modal (PropertyPanel) and the full page (/propiedades/[slug]).
// Mobile is NOT rendered here — each parent keeps its own mobile layout.
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Bed, Bath, Maximize, Home, Car, MessageCircle, Navigation, Umbrella, Ruler, CalendarDays, Sparkles, Compass, Layers, DoorOpen } from 'lucide-react'
import {
  type TokkoProperty,
  formatPrice,
  mostrarPrecio,
  esTemporario,
  preciosPorOperacion,
  esOportunidadConsultanos,
  buildPriceConsultWhatsappUrl,
  getProducerCallHref,
  generatePropertySlug,
  getRoofedArea,
  getTotalSurface,
  getLotSurface,
  isMonoambiente,
  getDescription,
  getBlueprintPhotos,
  agruparTags,
  translateCondition,
  translateOrientation,
  translateDisposition,
  operacionPrincipal,
  tituloVisible,
  getProducerName,
} from '@/lib/tokko'
import { condicionesTemporario, tieneCondiciones, comodidadesTemporario } from '@/lib/temporarios'
import ContactoSecundario from './ContactoSecundario'
import WhatsappConDatos from './WhatsappConDatos'
import TemporarioCondiciones, { TemporarioPrecios } from './TemporarioCondiciones'
import DisponibilidadTemporada from '../temporarios/DisponibilidadTemporada'
import { usePropiedadConFoco } from '@/lib/usePropiedadConFoco'
import { formatUbicacion } from '@/lib/ubicacion'
import { trackEvent } from '@/lib/analytics'
import PropertyDescription from '../PropertyDescription'
import SectionBoundary from './SectionBoundary'
import { ESTILO_TITULO_SECCION, TITULO_SECCION } from './titulo-seccion'
import BarrioPanel from './BarrioPanel'
import type { Barrio } from '@/lib/barrios'
import PropertyVideo from './PropertyVideo'
import { videoOficinaSolo, videosPropios } from '@/lib/video-oficina'
import { getAgenteRol } from '@/lib/agente-titulo'
import AgenteAvatar from './AgenteAvatar'
import CostosIngresoMini from '../propiedades/CostosIngresoMini'
import NearbyPropertiesMapClient from './NearbyPropertiesMapClient'
import FeedbackDetalle from '../feedback/FeedbackDetalle'
import AvisameSiBaja from './AvisameSiBaja'
import ListaCercanos, { hayCercanos } from '../ListaCercanos'
import type { LugarFicha } from '@/lib/cercanos'
import TiemposViaje from './TiemposViaje'
import type { TiemposViaje as Tiempos } from '@/lib/tiempos-viaje'

// Skeletons mientras se carga el chunk JS — evitan que la sección quede en
// blanco hasta que llega el bundle de Leaflet (mapa) o la galería de planos.
// Altura aproximada al componente real para no saltar el layout.
const MapSkeleton = () => (
  <div className="w-full h-[320px] rounded-xl bg-gray-100 animate-pulse" aria-hidden />
)
const BlueprintSkeleton = () => (
  <div className="w-full h-[280px] rounded-xl bg-gray-100 animate-pulse" aria-hidden />
)
const NearbyPlacesSkeleton = () => (
  <div className="w-full h-[180px] rounded-xl bg-gray-100 animate-pulse" aria-hidden />
)

const PropertyMap = dynamic(() => import('../PropertyMap'), { ssr: false, loading: MapSkeleton })
const BlueprintGallery = dynamic(() => import('../BlueprintGallery'), { ssr: false, loading: BlueprintSkeleton })
const NearbyPlaces = dynamic(() => import('../NearbyPlaces'), { ssr: false, loading: NearbyPlacesSkeleton })

const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"
const CARD = 'bg-white rounded-2xl p-6 shadow-sm border border-gray-100'

function montoOperacion(op: ReturnType<typeof operacionPrincipal>): string | null {
  const p = op?.prices?.[0]
  return p && p.price > 0 ? `${p.currency} ${p.price.toLocaleString('es-AR')}` : null
}

// Tarjeta de dato (21-oct-2026): el número nunca se parte en dos renglones
// ("214,1" / "m²" en el celu) — la unidad va más chica al lado — y el nombre
// a 13 px en gris oscuro (a 11 px en gris claro no se leía).
// Los datos que eran de "Detalles" (22-oct-2026) también van en tarjeta: "5 años"
// lleva la unidad chica como "m²", y una palabra ("Este", "Contrafrente") va más
// chica y puede cortarse para no salirse de la tarjeta en el celu.
function SpecCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  const conUnidad = typeof value === 'string' ? value.match(/^([\d.,]+) (m²|años?)$/) : null
  const palabra = typeof value === 'string' && !conUnidad && !/^\d/.test(value)
  return (
    <div className="flex flex-col items-center text-center gap-1 py-3 px-1.5 bg-[#f9fafb] rounded-xl">
      <div style={{ color: 'var(--theme-accent, #1A5C38)' }}>{icon}</div>
      <span
        className={palabra ? 'max-w-full [overflow-wrap:anywhere] [hyphens:auto]' : 'whitespace-nowrap'}
        style={{ fontFamily: P, fontWeight: 800, fontSize: palabra ? 15 : 18, lineHeight: palabra ? '27px' : undefined, fontVariantNumeric: 'tabular-nums', color: 'var(--foreground)' }}
        lang={palabra ? 'es' : undefined}
      >
        {conUnidad ? <>{conUnidad[1]}<span style={{ fontSize: 13, fontWeight: 700 }}> {conUnidad[2]}</span></> : value}
      </span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--tinta-soft)' }}>{label}</span>
    </div>
  )
}

function TituloSeccion({ children, mb = 14 }: { children: React.ReactNode; mb?: number }) {
  return <h2 className={TITULO_SECCION} style={{ ...ESTILO_TITULO_SECCION, marginBottom: mb }}>{children}</h2>
}

export default function PropertyDetailBody({
  property: propertyOriginal,
  // Compat: PropertyPanel todavía pasa allProperties. Lo aceptamos pero
  // no lo usamos — el mapa de "otras propiedades cercanas" ahora vive
  // en NearbyPropertiesMapClient que fetchea su propia data del endpoint.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  allProperties: _allProperties = [],
  whatsappUrl,
  showMobileContact = false,
  cercanos = null,
  tiempos = null,
  despuesDeDatos = null,
}: {
  property: TokkoProperty
  allProperties?: TokkoProperty[]
  whatsappUrl: string
  /** Lugares cercanos ya guardados (los lee la ficha en el servidor): van en el
   *  HTML. Sin ellos, NearbyPlaces los pide en el navegador. */
  cercanos?: Record<string, LugarFicha[]> | null
  /** "¿Cuánto tardás desde acá?" ya guardado (igual que `cercanos`). Sin él,
   *  TiemposViaje lo pide en el navegador. */
  tiempos?: Tiempos | null
  /** If true, render a mobile-only contact card after the title (used inside the modal). */
  showMobileContact?: boolean
  /** Va justo después de las tarjetas de datos (la ficha del celu pone ahí el audio). */
  despuesDeDatos?: React.ReactNode
}) {
  // Mixta vista desde una búsqueda de alquiler (?operacion=alquiler): el
  // alquiler pasa al frente → precio principal + costos de ingreso + planilla.
  const property = usePropiedadConFoco(propertyOriginal)

  // Derived
  const price = formatPrice(property)
  // null = "Sin Precio" en Tokko → en vez del monto va un botón que pide el
  // precio por WhatsApp (mismo número/armador que "Consultar por WhatsApp").
  const tienePrecio = mostrarPrecio(property) !== null
  const esOportunidad = esOportunidadConsultanos(property.id)
  const consultarPrecioUrl = tienePrecio
    ? null
    : buildPriceConsultWhatsappUrl(property, generatePropertySlug(property))
  // Venta Y alquiler a la vez: se muestran los dos valores, cada uno con su cartel.
  const precios = preciosPorOperacion(property)
  const dobleOperacion = precios.length > 1
  const avisarSiBaja =
    tienePrecio &&
    !esTemporario(property) &&
    (property.operations ?? []).some((o) => o.operation_type === 'Sale' && (o.prices ?? []).some((x) => x.currency === 'USD' && x.price > 0))
  const roofedArea = getRoofedArea(property)
  const area = getTotalSurface(property)
  const lotSurface = getLotSurface(property)
  const descripcionCompleta = getDescription(property)
  // Temporario: los renglones "Quincena: / Mes: / Depósito: …" de la
  // descripción salen como precios y condiciones; el resto queda de descripción.
  // Venta + temporario (David, 26-sep): el temporario puede no ser la
  // operación principal; sus condiciones y quincenas se muestran igual.
  const opTemporaria = (property.operations ?? []).find((o) => o.operation_type === 'Temporary rent') ?? null
  const condTemp = opTemporaria
    ? condicionesTemporario(descripcionCompleta, opTemporaria.temporada, tienePrecio ? montoOperacion(opTemporaria) : null)
    : null
  const description = condTemp ? condTemp.descripcion : descripcionCompleta
  const blueprints = getBlueprintPhotos(property)
  const recorridos = videosPropios(property.videos)
  const videoOficina = videoOficinaSolo(property.videos)
  const address = property.fake_address || property.address
  const tituloContacto = tituloVisible(property) || address
  // Va pegada a la dirección: sin repetir el barrio o la ciudad que ya diga.
  const location = formatUbicacion(property, property.real_address || address)

  // Barrio privado (si aplica). Se carga por dynamic import para no meter el
  // dataset grande de barrios.ts en el First Load JS de la ficha.
  const [barrio, setBarrio] = useState<Barrio | null>(null)
  useEffect(() => {
    let alive = true
    import('@/lib/barrios')
      .then(m => { if (alive) setBarrio(m.findBarrioForProperty(property)) })
      .catch(() => {})
    return () => { alive = false }
  }, [property])

  // Costos iniciales — solo alquiler permanente (operation_type === 'Rent';
  // 'Sale' y 'Temporary rent' / 'Temporary' quedan fuera).
  const op0 = operacionPrincipal(property)
  const price0 = op0?.prices?.[0]
  const isAlquilerPermanente = op0?.operation_type === 'Rent'
  const alquilerMonto = typeof price0?.price === 'number' ? price0.price : 0
  const monedaContrato = price0?.currency
  const showCostosIngreso =
    isAlquilerPermanente &&
    property.web_price !== false &&  // "Sin Precio": no exponer el monto vía costos
    alquilerMonto > 0 &&
    (monedaContrato === 'ARS' || monedaContrato === 'USD')

  const currentLat = property.geo_lat ? parseFloat(property.geo_lat) : null
  const currentLng = property.geo_long ? parseFloat(property.geo_long) : null
  const hasCoords = currentLat != null && !isNaN(currentLat) && currentLng != null && !isNaN(currentLng)

  // "Cómo llegar": Google Maps en modo direcciones. Con coordenadas el destino
  // es exacto (lat,lng); sin coordenadas cae a la dirección + localidad, que
  // Google resuelve como búsqueda. En mobile abre la app de Maps si está
  // instalada, en desktop la web.
  const direccionCompleta = `${property.real_address || address}${location ? `, ${location}` : ''}`
  const comoLlegarUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${currentLat},${currentLng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${direccionCompleta}, Santa Fe, Argentina`)}`

  // Características (22-oct-2026, David: "unificá con Detalles, se repiten cosas"):
  // UNA sola tarjeta con todo, en este orden: superficies construidas → ambientes
  // → terreno y el resto. "Detalles" ya no existe y "Suites" tampoco: salía del
  // mismo dato que Dormitorios (suite_amount) y parecía que eran 3 suites.
  // La total ya suma la semicubierta (getTotalSurface); si da igual a la cubierta
  // (no hay semicubierta) va una sola tarjeta, "Cubierta", para no repetir el número.
  const semicubierta = parseFloat(property.semiroofed_surface)
  const m2 = (v: number) => `${v.toLocaleString('es-AR')} m²`
  const specs: { icon: React.ReactNode; label: string; value: string | number }[] = []
  if (area != null && area > 0 && area !== roofedArea) specs.push({ icon: <Maximize className="w-5 h-5" />, label: 'Sup. total', value: m2(area) })
  if (roofedArea != null && roofedArea > 0) specs.push({ icon: <Home className="w-5 h-5" />, label: 'Cubierta', value: m2(roofedArea) })
  if (semicubierta > 0) specs.push({ icon: <Umbrella className="w-5 h-5" />, label: 'Semicubierta', value: m2(semicubierta) })
  if (isMonoambiente(property)) specs.push({ icon: <Bed className="w-5 h-5" />, label: 'Ambientes', value: 'Monoambiente' })
  else if (property.suite_amount > 0) specs.push({ icon: <Bed className="w-5 h-5" />, label: 'Dormitorios', value: property.suite_amount })
  if (property.bathroom_amount > 0) specs.push({ icon: <Bath className="w-5 h-5" />, label: property.bathroom_amount === 1 ? 'Baño' : 'Baños', value: property.bathroom_amount })
  if (property.parking_lot_amount > 0) specs.push({ icon: <Car className="w-5 h-5" />, label: property.parking_lot_amount === 1 ? 'Cochera' : 'Cocheras', value: property.parking_lot_amount })
  if (lotSurface != null && lotSurface > 0 && lotSurface !== area) specs.push({ icon: <Ruler className="w-5 h-5" />, label: 'Lote', value: m2(lotSurface) })
  if (property.age != null && property.age >= 0) specs.push({ icon: <CalendarDays className="w-5 h-5" />, label: 'Antigüedad', value: property.age === 0 ? 'A estrenar' : property.age === 1 ? '1 año' : `${property.age} años` })
  const estado = translateCondition(property.property_condition)
  if (estado) specs.push({ icon: <Sparkles className="w-5 h-5" />, label: 'Estado', value: estado })
  const orientacion = translateOrientation(property.orientation)
  if (orientacion) specs.push({ icon: <Compass className="w-5 h-5" />, label: 'Orientación', value: orientacion })
  if (property.floors_amount > 0) specs.push({ icon: <Layers className="w-5 h-5" />, label: property.floors_amount === 1 ? 'Planta' : 'Plantas', value: property.floors_amount })
  const disposicion = translateDisposition(property.disposition)
  if (disposicion) specs.push({ icon: <DoorOpen className="w-5 h-5" />, label: 'Disposición', value: disposicion })

  return (
    <div className="space-y-6">
      {/* OVERVIEW — title + location + price + badges */}
      <section id="overview" className={`${CARD} scroll-mt-40`}>
        {/* 21-oct-2026 (David: "que se entienda todo perfectamente"): el precio es lo
            primero que se busca. En el celu el título va a 24 px para que el precio
            entre en la primera pantalla, y el precio sube a 32/36 px sin el rótulo
            "PRECIO" (el número en USD ya dice qué es). */}
        <h1 className="text-[24px] lg:text-[30px]" style={{ fontFamily: R, fontWeight: 800, color: 'var(--foreground)', lineHeight: 1.18, letterSpacing: '-0.01em', marginBottom: 8 }}>
          {tituloVisible(property) || address}
        </h1>
        {/* Sin chips VENTA / CASA acá: ya están sobre la foto (PropertyGalleryHero,
            con las dos operaciones si es venta + alquiler) y repetidos confundían. */}
        {/* Dirección a 15 px en el gris oscuro de lectura (estaba a 13 en gris claro: costaba leerla). */}
        <div className="flex items-center gap-1.5 mb-4">
          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--theme-accent, #1A5C38)' }} />
          <span style={{ fontFamily: P, fontSize: 15, color: 'var(--tinta-soft)' }}>
            {property.real_address || address}{location ? `, ${location}` : ''}
          </span>
        </div>
        {dobleOperacion ? (
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {precios.map(({ operacion, precio }) => {
              const mes = operacion === 'Alquiler temporario' ? condTemp?.precios.find((x) => x.periodo === 'mes') : undefined
              return (
                <div key={operacion}>
                  <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide block mb-0.5">{operacion}</span>
                  <span className="text-[28px] lg:text-[32px]" style={{ fontFamily: P, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--foreground)', lineHeight: 1 }}>
                    {precio}
                  </span>
                  {mes && (
                    <span className="block mt-1 text-sm font-semibold text-gray-600" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {mes.texto} / mes
                    </span>
                  )}
                </div>
              )
            })}
            {condTemp && (
              <div className="basis-full max-w-md">
                <DisponibilidadTemporada alquiladas={condTemp.alquiladas} tamano="md" />
              </div>
            )}
          </div>
        ) : (
        <div>
          {tienePrecio && condTemp && condTemp.precios.length > 0 ? (
            <div className="space-y-4">
              <TemporarioPrecios precios={condTemp.precios} />
              <div className="max-w-md">
                <DisponibilidadTemporada alquiladas={condTemp.alquiladas} tamano="md" />
              </div>
            </div>
          ) : tienePrecio ? (
            <span className="text-[32px] lg:text-[36px]" style={{ fontFamily: P, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', color: 'var(--foreground)', lineHeight: 1 }}>
              {price}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2.5 flex-wrap">
              {esOportunidad && (
                <span className="font-bold text-[11px] uppercase tracking-wider text-gray-900 rounded-md px-2.5 py-1" style={{ fontFamily: P, background: '#fbce07', color: '#111' }}>
                  Oportunidad
                </span>
              )}
              <WhatsappConDatos
                href={consultarPrecioUrl!}
                propertyId={property.id}
                propertyTitle={tituloContacto}
                className="inline-flex items-center gap-2 bg-[#1A5C38] hover:bg-[#145030] text-white font-bold rounded-xl px-5 py-3 transition-colors"
                style={{ fontFamily: P, fontSize: 17 }}
              >
                <MessageCircle className="w-5 h-5" /> {esOportunidad ? 'Consultanos' : 'Consultar precio'}
              </WhatsappConDatos>
            </span>
          )}
        </div>
        )}
        {/* David 4-oct: "Avisame si baja" — solo venta con precio en dólares a la vista. */}
        {avisarSiBaja && <AvisameSiBaja propertyId={property.id} />}
      </section>

      {/* CONDICIONES — solo alquiler temporario que las tenga cargadas */}
      {condTemp && tieneCondiciones(condTemp) && (
        <TemporarioCondiciones
          condiciones={condTemp}
          comodidades={comodidadesTemporario(condTemp, property.tags ?? [], property.parking_lot_amount || 0)}
        />
      )}

      {/* COSTOS INICIALES — solo alquiler permanente con precio + moneda válidos */}
      {showCostosIngreso && (
        <CostosIngresoMini
          alquiler={alquilerMonto}
          moneda={monedaContrato as 'ARS' | 'USD'}
          tipoPropiedad={property.type?.name ?? ''}
          propertyId={property.id}
        />
      )}

      {/* CARACTERÍSTICAS */}
      {specs.length > 0 && (
        <section id="caracteristicas" className={`${CARD} scroll-mt-40`}>
          <TituloSeccion>Características</TituloSeccion>
          {/* 3 por fila en el celu. En la compu, hasta 7 en una fila; con más, dos filas
              parejas (9 → 5 + 4), nunca una o dos tarjetas solas abajo. */}
          <div
            className="grid grid-cols-3 gap-2.5 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
            style={{ '--cols': specs.length <= 7 ? specs.length : Math.ceil(specs.length / 2) } as React.CSSProperties}
          >
            {specs.map((s, i) => <SpecCard key={i} icon={s.icon} label={s.label} value={s.value} />)}
          </div>
        </section>
      )}

      {/* Celu: el audio y el contacto van DESPUÉS de los datos (21-oct-2026): primero
          se entiende qué es y cuánto sale; WhatsApp igual está siempre en la barra de abajo. */}
      {despuesDeDatos}

      {/* Mobile-only contact (inside modal, since modal is used only on desktop anyway this is defensive) */}
      {showMobileContact && (
        <section className={`md:hidden ${CARD}`}>
          {/* Agente — foto + nombre + badge */}
          {(() => {
            const producer = property.producer
            const name = producer?.name?.trim() || 'SI INMOBILIARIA'
            const rol = getAgenteRol(name)
            const initials =
              name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(s => s[0])
                .join('')
                .toUpperCase() || 'SI'
            return (
              <div className="flex items-center gap-3 mb-4">
                <AgenteAvatar
                  name={name}
                  picture={producer?.picture}
                  initials={initials}
                  bg={'#1A5C38'}
                  fontFamily={"'Raleway', system-ui, sans-serif"}
                />
                <div className="flex-1 min-w-0">
                  <span
                    className="block"
                    style={{ fontFamily: "'Raleway', system-ui, sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--foreground)' }}
                  >
                    {name}
                  </span>
                  <span className="text-xs text-gray-500 block truncate">
                    {rol.titulo}
                    {rol.matricula && <> · Mat. N° <span className="font-numeric">{rol.matricula}</span></>}
                  </span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex-shrink-0"
                  style={{ background: 'var(--theme-tint, #e7f2eb)', color: 'var(--theme-accent, #1A5C38)' }}
                >
                  {rol.badge}
                </span>
              </div>
            )
          })()}

          {/* UN botón principal y una fila secundaria (David 4-oct: "son demasiados botones, confunden"). */}
          <WhatsappConDatos href={whatsappUrl} propertyId={property.id} propertyTitle={tituloContacto} propertyPrice={price}
            className="mb-2 flex w-full items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm"
            style={{ background: '#25d366', color: '#fff' }}>
            <MessageCircle className="w-4 h-4" /> Consultar por WhatsApp
          </WhatsappConDatos>
          <ContactoSecundario
            propertyId={property.id}
            propertyTitle={tituloContacto}
            propertyPrice={price}
            whatsappUrl={whatsappUrl}
            agente={getProducerName(property)}
            callHref={getProducerCallHref(property)}
          />
        </section>
      )}

      {/* VIDEO — arriba de la descripción, solo si la propiedad tiene videos */}
      {recorridos.length > 0 && (
        <SectionBoundary name="video">
          <section id="video" className={`${CARD} scroll-mt-40`}>
            <TituloSeccion>Recorrido en video</TituloSeccion>
            <PropertyVideo videos={recorridos} fallbackPoster={property.photos?.[0]?.image ?? null} />
          </section>
        </SectionBoundary>
      )}

      {/* DESCRIPCIÓN */}
      {description && (
        <SectionBoundary name="descripcion">
          <section id="descripcion" className={`${CARD} scroll-mt-40`}>
            {/* El texto va a 17/19 px (estilo Apple); el título, como el de todas las secciones. */}
            <TituloSeccion>Descripción</TituloSeccion>
            <PropertyDescription text={description} />
          </section>
        </SectionBoundary>
      )}

      {/* SERVICIOS Y AMENITIES — agrupados por categoría (servicios, seguridad,
          amenities, ambientes, confort). Tags sin categoría no se muestran. */}
      {(() => {
        const grupos = agruparTags(property.tags ?? [])
        if (grupos.length === 0) return null
        return (
          <section className={CARD}>
            {grupos.map((g, i) => (
              <div key={g.cat} className={i > 0 ? 'mt-5' : ''}>
                {i === 0 ? (
                  <TituloSeccion mb={12}>{g.label}</TituloSeccion>
                ) : (
                  <h3 style={{ fontFamily: R, fontWeight: 800, fontSize: 17, color: 'var(--foreground)', marginBottom: 10 }}>{g.label}</h3>
                )}
                <div className="flex flex-wrap gap-2">
                  {g.items.map(item => (
                    <span key={item} className="px-4 py-1.5 rounded-full text-sm border border-gray-200" style={{ color: 'var(--tinta-soft)' }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )
      })()}

      {/* PLANOS */}
      {blueprints.length > 0 && (
        <SectionBoundary name="planos">
          <section id="planos" className={`${CARD} scroll-mt-40`}>
            <TituloSeccion>Planos</TituloSeccion>
            <BlueprintGallery blueprints={blueprints} />
          </section>
        </SectionBoundary>
      )}

      {/* BARRIO PRIVADO — solo si la propiedad está en un barrio cerrado conocido */}
      {barrio && (
        <SectionBoundary name="barrio">
          <BarrioPanel barrio={barrio} />
        </SectionBoundary>
      )}

      {/* UBICACIÓN */}
      <SectionBoundary name="ubicacion">
        <section id="ubicacion" className={`${CARD} scroll-mt-40`}>
          <TituloSeccion>Ubicación</TituloSeccion>
          {/* Sin aspect-ratio forzado: el mapa mide 280/380px fijos y el 4:3
              dejaba ~200px en blanco debajo en desktop. */}
          <div className="rounded-[14px] overflow-hidden mb-3">
            <PropertyMap
              lat={currentLat}
              lng={currentLng}
              address={property.real_address || address}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--theme-accent, #1A5C38)' }} />
              <span style={{ fontFamily: P, fontSize: 15, color: 'var(--tinta-soft)' }}>
                {direccionCompleta}
              </span>
            </div>
            <a
              href={comoLlegarUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('como_llegar_click', { property_id: property.id, has_coords: hasCoords })}
              className="inline-flex items-center gap-2 bg-[#1A5C38] hover:bg-[#145030] text-white font-bold rounded-xl px-4 py-2.5 text-sm transition-colors"
              style={{ fontFamily: R }}
              aria-label="Cómo llegar (abre Google Maps)"
            >
              <Navigation className="w-4 h-4" />
              Cómo llegar
            </a>
          </div>
        </section>
      </SectionBoundary>

      {/* ¿CUÁNTO TARDÁS DESDE ACÁ? — minutos en hora pico a los lugares de
          todos los días (no aparece si la propiedad está fuera de zona). */}
      {hasCoords && (
        <SectionBoundary name="tiempos">
          <TiemposViaje propertyId={property.id} tiempos={tiempos} className={`${CARD} scroll-mt-40`} />
        </SectionBoundary>
      )}

      {/* LUGARES CERCANOS */}
      {hasCoords && (
        <SectionBoundary name="lugares-cercanos">
          <section className={CARD}>
            <TituloSeccion mb={4}>Lugares cercanos</TituloSeccion>
            <p className="font-poppins text-gray-500 text-[13px] mb-4">Escuelas, hospitales, comercios y espacios verdes en la zona</p>
            {hayCercanos(cercanos) ? <ListaCercanos lugares={cercanos!} /> : <NearbyPlaces lat={currentLat!} lng={currentLng!} />}
          </section>
        </SectionBoundary>
      )}

      {/* OTRAS PROPIEDADES EN LA ZONA — mapa con pines verdes.
          El wrapper client fetchea /api/propiedades/nearby (cacheado en
          CDN 15 min) y maneja loading/error/success internamente. */}
      {hasCoords && (
        <SectionBoundary name="nearby-properties-map">
          <NearbyPropertiesMapClient
            lat={currentLat!}
            lng={currentLng!}
            excludeId={property.id}
          />
        </SectionBoundary>
      )}

      {/* VIDEO DE LA OFICINA — el que Hilo pone por defecto cuando la propiedad no
          tiene recorrido propio: al final y con su nombre (ver lib/video-oficina). */}
      {videoOficina.length > 0 && (
        <SectionBoundary name="video-oficina">
          <section className={CARD}>
            <TituloSeccion>Conocé nuestra oficina</TituloSeccion>
            <PropertyVideo videos={videoOficina} fallbackPoster={null} />
          </section>
        </SectionBoundary>
      )}

      {/* FEEDBACK ANÓNIMO — caritas + valuación + "avisame si baja".
          Aditivo y detrás de NEXT_PUBLIC_FEEDBACK_ENABLED (se auto-oculta si
          el flag está off). publishedPrice=0 cuando no hay precio visible
          (oculta el slider, deja caritas + alerta). */}
      <FeedbackDetalle
        key={property.id}
        propertyId={property.id}
        publishedPrice={
          property.web_price !== false && typeof price0?.price === 'number' && price0.price > 0
            ? price0.price
            : 0
        }
        currency={price0?.currency ?? 'USD'}
      />

      {/* "Otras opciones para vos" ya no va acá — el parent lo renderiza full-width
          via <PropertyDetailSimilars /> debajo del grid de 2 columnas. */}
    </div>
  )
}
