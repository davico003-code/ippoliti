// Datos de los kioscos de TV (/tv y /tv-vertical, la misma lista). Trae el stock
// en venta, arma el "mix inteligente" (destacadas + más nuevas + variedad de
// zonas) y devuelve TODAS las que entran (sin tope: David, 22-oct-2026), con un
// emprendimiento "de presentación" cada PROPIEDADES_POR_EMPRENDIMIENTO.

import QRCode from 'qrcode'
import {
  getProperties,
  getMainPhoto,
  getAllPhotos,
  getRoofedArea,
  getLotSurface,
  formatPrice,
  translatePropertyType,
  type TokkoProperty,
} from '@/lib/tokko'
import { formatUbicacion, resolverUbicacion } from '@/lib/ubicacion'
import { fotoJpgDeLaWeb } from '@/lib/fotos-fijas'
import { getTarjetasEmprendimientos } from '@/lib/emprendimientos-tarjetas'

interface SlideBase {
  photo: string          // foto de portada
  photos: string[]       // hasta 4 fotos de la MISMA propiedad/emprendimiento, portada primero
}

export interface SlidePropiedad extends SlideBase {
  kind: 'propiedad'
  precio: string
  tipo: string
  ubicacion: string
  titulo: string
  destacada: boolean
  specs: { v: string; l: string }[]
  // "Bajó de precio" (David, 22-oct-2026): el precio de antes y cuánto bajó.
  rebaja: { anterior: string; diferencia: string } | null
}

// Presentación especial de un emprendimiento (David, 22-oct-2026: "mechar con
// los desarrollos que tenemos, para destacar"). Sale de la misma lista que
// /emprendimientos (lib/emprendimientos-tarjetas.ts).
export interface SlideEmprendimiento extends SlideBase {
  kind: 'emprendimiento'
  nombre: string
  bajada: string | null
  ubicacion: string | null
  descripcion: string | null
  chips: string[]
  marcas: { rol: string; nombre: string; logo: string | null; mostrarNombre: boolean }[]
  // Segundo momento del slide: qué se puede comprar (David: "tendría que mostrar
  // información y unidades de ese emprendimiento"). null si no hay unidades en el feed.
  unidades: {
    titulo: string            // "Lotes disponibles" / "Unidades disponibles"
    desde: string | null      // precio de la más barata ("USD 37.736")
    resumen: string           // "15 lotes · de 300 a 600 m²"
    lista: { foto: string; dato: string; precio: string }[]  // hasta 3
  } | null
}

// Placa "¿Cuánto vale tu casa?" (solo la tele parada, David 22-oct-2026): un QR
// grande a la tasación de la web para el dueño que pasa por la vidriera, sobre
// la foto de una casa del inventario. La tasación la hace un corredor: el texto
// no promete un número automático.
export interface SlideTasar extends SlideBase {
  kind: 'tasar'
  qr: string   // PNG en data URL
  url: string  // lo que se lee abajo del QR
}

export type Slide = SlidePropiedad | SlideEmprendimiento | SlideTasar

const PROPIEDADES_POR_EMPRENDIMIENTO = 6
// La placa de tasar va cada 12 propiedades, corrida 3 para no pegarse a un emprendimiento.
const PROPIEDADES_POR_TASAR = 12
const URL_TASAR = 'https://siinmobiliaria.com/tasar?utm_source=tele&utm_medium=vidriera&utm_campaign=tasar'
// Las unidades de un mismo emprendimiento se ven todas iguales (David,
// 22-oct-2026: "no muestres tantos departamentos de Tierra Nueva"): pasan las 2
// primeras (destacadas y más nuevas) y el emprendimiento tiene su presentación.
const MAX_UNIDADES_POR_EMPRENDIMIENTO = 2

// Qué pasa por la tele (David, 22-oct-2026): casas desde USD 250.000,
// departamentos desde USD 125.000 y lotes desde USD 70.000. Nada más: ni PH,
// ni locales, ni galpones, ni las de precio a consultar. Por id de tipo de
// Tokko (3 casa, 2 departamento, 1 lote): por nombre, "Warehouse" contiene "house".
const PISO_USD: Partial<Record<number, number>> = { 3: 250000, 2: 125000, 1: 70000 }

function usdVenta(p: TokkoProperty): number {
  const venta = p.operations?.find((op) => op.operation_type === 'Sale')
  return venta?.prices?.find((pr) => pr.currency === 'USD')?.price ?? 0
}

const conPrecio = (p: TokkoProperty) => formatPrice(p) !== 'Consultar precio' && usdVenta(p) > 0

// La rebaja que manda Hilo (solo las que bajaron hace poco), con el mismo
// formato que el precio ("USD 455.000"). Sin precio publicado no se muestra.
function rebajaDe(p: TokkoProperty): SlidePropiedad['rebaja'] {
  const r = p.rebaja
  const actual = usdVenta(p)
  if (!r || r.moneda !== 'USD' || !conPrecio(p) || r.anterior <= actual) return null
  const usd = (n: number) => `USD ${Math.round(n).toLocaleString('es-AR')}`
  return { anterior: usd(r.anterior), diferencia: usd(r.anterior - actual) }
}

function entraEnLaTele(p: TokkoProperty): boolean {
  const piso = p.type?.id != null ? PISO_USD[p.type.id] : undefined
  if (!piso || !conPrecio(p)) return false
  return usdVenta(p) >= piso
}

// Traducción de tipología: usa el mapa canónico de tokko.ts (única fuente de
// verdad) para no repetir un mapa parcial. El local previo tenía 'Business'
// (nunca matcheaba: el feed manda 'Bussiness Premises') y le faltaban 'Garage'
// y 'Countryside', que caían crudos en inglés en pantalla.
function tipoEs(p: TokkoProperty): string {
  return translatePropertyType(p.type?.name)
}

function buildSpecs(p: TokkoProperty): { v: string; l: string }[] {
  const specs: { v: string; l: string }[] = []
  const dorm = p.suite_amount || 0
  const amb = p.room_amount || 0
  if (dorm > 0) specs.push({ v: String(dorm), l: dorm === 1 ? 'Dormitorio' : 'Dormitorios' })
  else if (amb > 0) specs.push({ v: String(amb), l: amb === 1 ? 'Ambiente' : 'Ambientes' })
  if (p.bathroom_amount > 0) specs.push({ v: String(p.bathroom_amount), l: p.bathroom_amount === 1 ? 'Baño' : 'Baños' })
  const cub = getRoofedArea(p)
  if (cub) specs.push({ v: cub.toLocaleString('es-AR'), l: 'm² cubiertos' })
  const lote = getLotSurface(p)
  if (lote) specs.push({ v: lote.toLocaleString('es-AR'), l: 'm² de lote' })
  return specs.slice(0, 4)
}

// Reordena para no repetir ciudad en slides consecutivos (variedad de zonas).
// Por ciudad y no por "barrio, ciudad": si no, "Funes" → "Funes Lakes, Funes"
// contaban como zonas distintas y la TV encadenaba Funes tras Funes.
// De qué emprendimiento es una unidad: el del feed, o Tierra Nueva (los Condos
// 22-24 no traen emprendimiento en el feed; los delata el barrio).
const normalizar = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function emprendimientoDe(p: TokkoProperty): string | null {
  if (p.development?.id) return `dev-${p.development.id}`
  return normalizar(p.location?.name ?? '').includes('tierra nueva') ? 'tierra-nueva' : null
}

function sinRepetirEmprendimiento(list: TokkoProperty[]): TokkoProperty[] {
  const vistas = new Map<string, number>()
  return list.filter((p) => {
    const emp = emprendimientoDe(p)
    if (!emp) return true
    const n = vistas.get(emp) ?? 0
    vistas.set(emp, n + 1)
    return n < MAX_UNIDADES_POR_EMPRENDIMIENTO
  })
}

// Texto plano y corto para la tele: la primera oración entera (la descripción
// de las tarjetas puede traer HTML); si es muy larga, cortada en una palabra.
function recortar(texto: string | undefined, max: number): string | null {
  let limpio = (texto ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').replace(/…$/, '').trim()
  // Encabezado tipo "CONDOMINIO | PASEO COMERCIAL | ALDEA – FISHERTON" pegado al
  // texto (Dock Garden): se corta después de la última palabra en mayúsculas.
  const mayusculas = limpio.includes('|') ? Array.from(limpio.slice(0, 160).matchAll(/[A-ZÁÉÍÓÚÑ]{3,}/g)).pop() : undefined
  if (mayusculas?.index !== undefined) limpio = limpio.slice(mayusculas.index + mayusculas[0].length).replace(/^[\s|–-]+/, '')
  if (!limpio) return null
  const oracion = limpio.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? limpio
  if (oracion.length <= max) return oracion
  return `${oracion.slice(0, oracion.lastIndexOf(' ', max)).replace(/[,;:.]$/, '')}…`
}

type Tarjeta = Awaited<ReturnType<typeof getTarjetasEmprendimientos>>[number]

// Unidades de cada emprendimiento en el feed: las de su development en Hilo, o
// por nombre para las landings propias (los Condos de Tierra Nueva no traen
// development). Fincazul y Hausing no tienen unidades cargadas: van sin segundo momento.
const UNIDADES_DE_LANDING: Record<string, (p: TokkoProperty) => boolean> = {
  'tierra-nueva': (p) => emprendimientoDe(p) === 'tierra-nueva',
  aurea: (p) => normalizar(`${p.publication_title ?? ''} ${p.location?.name ?? ''}`).includes('aurea'),
  'fisherton-work': (p) => normalizar(p.publication_title ?? '').includes('fisherton work'),
}

function unidadesDe(t: Tarjeta, objects: TokkoProperty[]): TokkoProperty[] {
  const dev = /^dev-(\d+)$/.exec(t.key)?.[1]
  const es = dev ? (p: TokkoProperty) => p.development?.id === Number(dev) : UNIDADES_DE_LANDING[t.key]
  return es ? objects.filter((p) => es(p) && !!getMainPhoto(p)) : []
}

const m2 = (n: number) => Math.round(n).toLocaleString('es-AR')

// "2 dorm. · 62 m² · cochera", "Lote de 501 m²", "Galpón · 200 m²".
function datoUnidad(p: TokkoProperty): string {
  if (p.type?.id === 1) {
    const lote = getLotSurface(p)
    return lote ? `Lote de ${m2(lote)} m²` : 'Lote'
  }
  const dorm = p.suite_amount || 0
  const cub = getRoofedArea(p)
  return [
    dorm > 0 ? `${dorm} dorm.` : tipoEs(p),
    cub ? `${m2(cub)} m²` : null,
    (p.parking_lot_amount ?? 0) > 0 ? 'cochera' : null,
  ].filter(Boolean).join(' · ')
}

function resumenUnidades(us: TokkoProperty[]): SlideEmprendimiento['unidades'] {
  if (!us.length) return null
  const lotes = us.every((p) => p.type?.id === 1)
  const n = us.length
  // Con un solo aviso no se cuenta: suele ser uno que agrupa varios ("Lotes desde 500 m²").
  const cuenta = n === 1 ? '' : lotes ? `${n} lotes` : `${n} unidades`
  let detalle = ''
  if (lotes) {
    const sup = us.map((p) => getLotSurface(p) ?? 0).filter((x) => x > 0).sort((a, b) => a - b)
    if (sup.length) detalle = sup[0] === sup[sup.length - 1] ? `${m2(sup[0])} m²` : `de ${m2(sup[0])} a ${m2(sup[sup.length - 1])} m²`
  } else {
    const dorms = Array.from(new Set(us.map((p) => p.suite_amount || 0).filter((x) => x > 0))).sort((a, b) => a - b)
    if (dorms.length === 1) detalle = `${dorms[0]} ${dorms[0] === 1 ? 'dormitorio' : 'dormitorios'}`
    else if (dorms.length > 1) detalle = `${dorms.slice(0, -1).join(', ')} y ${dorms[dorms.length - 1]} dormitorios`
  }
  // A la vista: con dormitorios, la más barata de cada tipología (1, 2, 3…);
  // si no, la más barata, una del medio y la más cara (sin repetir).
  const orden = us.filter(conPrecio).sort((a, b) => usdVenta(a) - usdVenta(b))
  const base = orden.length ? orden : us
  const porTipologia = lotes
    ? []
    : Array.from(new Set(base.map((p) => p.suite_amount || 0)))
        .sort((a, b) => a - b)
        .map((d) => base.find((p) => (p.suite_amount || 0) === d) as TokkoProperty)
  const elegidas = (porTipologia.length >= Math.min(3, base.length)
    ? porTipologia
    : Array.from(new Set([0, Math.floor((base.length - 1) / 2), base.length - 1])).map((i) => base[i])
  ).slice(0, 3)
  return {
    titulo: lotes ? 'Lotes disponibles' : 'Unidades disponibles',
    desde: orden.length ? formatPrice(orden[0]) : null,
    resumen: [cuenta, detalle].filter(Boolean).join(' · '),
    lista: elegidas.map((p) => ({ foto: fotoJpgDeLaWeb(p.id, getMainPhoto(p) as string), dato: datoUnidad(p), precio: formatPrice(p) })),
  }
}

function armarEmprendimientos(tarjetas: Tarjeta[], objects: TokkoProperty[]): SlideEmprendimiento[] {
  return tarjetas.flatMap((t): SlideEmprendimiento[] => {
    const photos = (t.fotos?.length ? t.fotos : [t.image]).filter((x): x is string => !!x).slice(0, 4)
    if (!photos.length) return []
    return [{
      kind: 'emprendimiento',
      photo: photos[0],
      photos,
      nombre: t.title,
      bajada: t.eyebrow ?? null,
      ubicacion: t.location ?? null,
      descripcion: recortar(t.description, 170),
      chips: t.chips.slice(0, 3),
      marcas: (t.marcas ?? []).map((m) => ({ rol: m.rol, nombre: m.nombre, logo: m.logo?.src ?? null, mostrarNombre: !!m.mostrarNombre })),
      unidades: resumenUnidades(unidadesDe(t, objects)),
    }]
  })
}

function spreadByZone(list: TokkoProperty[]): TokkoProperty[] {
  const out: TokkoProperty[] = []
  const pool = [...list]
  const ciudad = (p: TokkoProperty) => resolverUbicacion(p).ciudad ?? ''
  let lastZone = ''
  while (pool.length) {
    let pick = pool.findIndex((p) => ciudad(p) !== lastZone)
    if (pick === -1) pick = 0
    const [p] = pool.splice(pick, 1)
    out.push(p)
    lastZone = ciudad(p)
  }
  return out
}

async function placasTasar(propiedades: SlidePropiedad[]): Promise<SlideTasar[]> {
  let qr = ''
  try {
    qr = await QRCode.toDataURL(URL_TASAR, { margin: 1, width: 640, errorCorrectionLevel: 'M', color: { dark: '#0A2418', light: '#FFFFFF' } })
  } catch {
    return []
  }
  // Una casa distinta de fondo en cada pasada.
  const casas = propiedades.filter((p) => p.tipo === 'Casa')
  return (casas.length ? casas : propiedades).map((p) => ({ kind: 'tasar', photo: p.photo, photos: [p.photo], qr, url: 'siinmobiliaria.com/tasar' }))
}

export async function getSlides({ conTasar = false }: { conTasar?: boolean } = {}): Promise<Slide[]> {
  let objects: TokkoProperty[] = []
  const tarjetas = getTarjetasEmprendimientos().catch((): Tarjeta[] => [])
  try {
    const resp = await getProperties({ operation: 'Sale', limit: 500 })
    objects = resp.objects ?? []
  } catch {
    return armarEmprendimientos(await tarjetas, [])
  }

  const seen = new Set<number>()
  const props = objects.filter((p) => {
    if (!getMainPhoto(p)) return false
    if (!p.operations?.length) return false
    if (!entraEnLaTele(p)) return false
    if (p.id && seen.has(p.id)) return false
    if (p.id) seen.add(p.id)
    return true
  })

  const starred = props.filter((p) => p.is_starred_on_web)
  const rest = props.filter((p) => !p.is_starred_on_web).sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
  // Sin tope: pasan todas las que entran (antes eran siempre las mismas 30).
  const propiedades = spreadByZone(sinRepetirEmprendimiento([...starred, ...rest])).map((p): SlidePropiedad => {
    const portada = getMainPhoto(p) as string
    // Hasta 4 fotos de la misma propiedad (portada primero, sin duplicar): la
    // foto grande + la tira de miniaturas. En JPG desde /fotos: el televisor no
    // muestra las de R2 (ver fotoJpgDeLaWeb).
    const photos = [portada, ...getAllPhotos(p).filter((x) => x !== portada)].slice(0, 4).map((x) => fotoJpgDeLaWeb(p.id, x))
    return {
      kind: 'propiedad',
      photo: photos[0],
      photos,
      precio: formatPrice(p),
      tipo: tipoEs(p),
      ubicacion: formatUbicacion(p),
      titulo: p.publication_title ?? '',
      destacada: !!p.is_starred_on_web,
      specs: buildSpecs(p),
      rebaja: rebajaDe(p),
    }
  })

  // Un emprendimiento cada PROPIEDADES_POR_EMPRENDIMIENTO, en el orden comercial
  // de /emprendimientos y dando la vuelta a la lista.
  const emps = armarEmprendimientos(await tarjetas, objects)
  const tasar = conTasar ? await placasTasar(propiedades) : []
  if (!emps.length && !tasar.length) return propiedades
  const slides: Slide[] = []
  propiedades.forEach((p, i) => {
    slides.push(p)
    if (tasar.length && (i + 1) % PROPIEDADES_POR_TASAR === 3) {
      slides.push(tasar[Math.floor(i / PROPIEDADES_POR_TASAR) % tasar.length])
    }
    if (emps.length && (i + 1) % PROPIEDADES_POR_EMPRENDIMIENTO === 0) {
      slides.push(emps[Math.floor(i / PROPIEDADES_POR_EMPRENDIMIENTO) % emps.length])
    }
  })
  return slides
}
