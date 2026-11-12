// Imagen para compartir la ficha (og:image, y twitter:image la hereda):
// 1200 × 630 con la portada a sangre y abajo una franja blanca con el precio
// grande, "Casa en venta · Cotos de la Alameda, Roldán" y el logo chico. Es lo
// que se ve en WhatsApp, Facebook o iMessage cuando alguien manda el link.
//
// Antes el og:image era la foto cruda (/fotos/…): cualquier proporción (había
// verticales y 4:3), sin medidas declaradas y de 300 KB a 6 MB. WhatsApp suele
// dejar sin miniatura a las pesadas y Facebook, sin og:image:width/height, no
// la dibuja en el primer compartido. Esta sale siempre 1200 × 630, en JPEG de
// ~100-200 KB, y Next declara las medidas solo (size + contentType).
//
// Cómo se arma: sharp baja la portada y la recorta (cover); satori
// (ImageResponse) dibuja SOLO la franja, sobre fondo transparente; sharp la
// pega encima y codifica en JPEG. Así la foto se comprime una sola vez
// (ImageResponse solo devuelve PNG, y una foto de 1200 × 630 en PNG pesa 1-2 MB).
//
// Nunca revienta por la foto: si no responde, sale la versión verde (#1A5C38)
// con el precio y la zona; si no cargan las fuentes, satori usa la suya.
// "Sin precio" / oportunidad: no se muestra el monto (mostrarPrecio).
//
// OJO caché: la imagen se regenera con la propiedad (mismos tags que la ficha
// vía getPropertyById, más revalidate de 1 h). WhatsApp y Facebook guardan su
// propia copia por URL, así que un precio que baja puede tardar en verse en
// una tarjeta que ya se había mostrado.

import type { ReactElement } from 'react'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import {
  getIdFromSlug,
  getMainPhoto,
  getOperationType,
  getPropertyById,
  mostrarPrecio,
  propertyTypeLabelById,
  sanitizeProperty,
  type TokkoProperty,
} from '@/lib/tokko'
import { formatUbicacion } from '@/lib/ubicacion'
import { esFotoR2, fotoFija } from '@/lib/fotos-fijas'
import { cargarFuentesParaSatori, type SatoriFont } from '@/agents/placas/lib/fonts'
import { LogoSI } from '@/agents/placas/bloques/logo-si'

export const runtime = 'nodejs'
// Igual que la ficha: se arma con el primer pedido y queda en caché 1 h.
export const revalidate = 3600
export const alt = 'Foto de la propiedad con su precio y su zona — SI INMOBILIARIA'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/jpeg'

// Sin esto la ruta de la imagen (segmento dinámico) se arma en CADA pedido:
// con la lista vacía queda como la ficha, a pedido y cacheada.
export async function generateStaticParams() {
  return []
}

const W = size.width
const H = size.height
const FRANJA = 168
const VERDE = '#1A5C38'
const TINTA = '#111111'
const TINTA_SUAVE = '#3A3A3C'
const RALEWAY = 'Raleway'
const POPPINS = 'Poppins'

// Lo que se dibuja. `monto` null = la propiedad no publica precio.
interface Datos {
  monto: string | null
  periodo: string | null
  tipoOperacion: string
  zona: string
}

/** "ARS 850.000 /mes" → ["ARS 850.000", "/mes"]; el período va más chico. */
function partirPrecio(precio: string | null): [string | null, string | null] {
  if (!precio) return [null, null]
  const i = precio.indexOf(' /')
  return i > 0 ? [precio.slice(0, i), precio.slice(i + 1).trim()] : [precio, null]
}

/** Corta en la última palabra entera que entra, con "…" (satori no tiene ellipsis fiable). */
function recortar(texto: string, max: number): string {
  if (texto.length <= max) return texto
  const corte = texto.slice(0, max - 1)
  const espacio = corte.lastIndexOf(' ')
  return `${(espacio > max * 0.6 ? corte.slice(0, espacio) : corte).replace(/[\s,.;:·–—-]+$/, '')}…`
}

function datosDe(property: TokkoProperty): Datos {
  const [monto, periodo] = partirPrecio(mostrarPrecio(property))
  const tipo = propertyTypeLabelById(property.type?.id)
  const op = getOperationType(property).toLowerCase()
  return {
    monto,
    periodo,
    tipoOperacion: `${tipo === 'Otros' ? 'Propiedad' : tipo}${op ? ` en ${op}` : ''}`,
    zona: formatUbicacion(property),
  }
}

// ─── Fuentes ──────────────────────────────────────────────────────────────
// Las mismas TTF de las placas (lib/fonts: satori no lee woff2 ni fuentes
// variables), pero solo los pesos que usa esta imagen. Con tope de 5 s: si
// Google Fonts no contesta, se dibuja con la letra de satori antes que nada.
const PESOS_OG = new Set([
  'Raleway:600', 'Raleway:700', 'Raleway:800',
  'Poppins:700', 'Poppins:800',
  'Audiowide:400', 'Montserrat:600', 'Montserrat:700',
])

async function fuentesOg(): Promise<SatoriFont[] | undefined> {
  let tope: ReturnType<typeof setTimeout> | undefined
  try {
    const todas = await Promise.race([
      cargarFuentesParaSatori(),
      new Promise<never>((_, rechazar) => {
        tope = setTimeout(() => rechazar(new Error('fuentes: tiempo agotado')), 5000)
      }),
    ])
    const elegidas = todas.filter((f) => f.style === 'normal' && PESOS_OG.has(`${f.name}:${f.weight}`))
    return elegidas.length ? elegidas : undefined
  } catch (e) {
    console.error('[og-ficha] fuentes:', e instanceof Error ? e.message : e)
    return undefined
  } finally {
    clearTimeout(tope)
  }
}

// ─── Foto ─────────────────────────────────────────────────────────────────
// Primero la copia de R2 (ya achicada a 1920, sale gratis y rápido); después
// la URL fija del dominio de producción (/fotos/…, CDN de 30 días); por último
// la firmada que trae el feed.
function fuentesDeLaPortada(property: TokkoProperty): string[] {
  const principal = getMainPhoto(property)
  if (!principal) return []
  const foto = property.photos?.find((f) => f.image === principal)
  const r2 = foto && esFotoR2(foto.r2) ? foto.r2 : null
  const fija = fotoFija(property, principal, true)
  return Array.from(new Set([r2, fija, principal].filter((u): u is string => !!u)))
}

async function bajarFoto(url: string): Promise<Buffer | null> {
  try {
    // revalidate y no `no-store`: un fetch sin caché vuelve dinámica la ruta
    // entera y la imagen se rearmaría en cada pedido de WhatsApp.
    const res = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) })
    const tipo = res.headers.get('content-type') ?? ''
    if (!res.ok || !tipo.startsWith('image/')) return null
    // Una cruda de drone (hasta 17 MB) no vale la espera: pasa a la siguiente.
    if (Number(res.headers.get('content-length')) > 12_000_000) {
      await res.body?.cancel().catch(() => {})
      return null
    }
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

/** La portada recortada a 1200 × 630 (sin codificar todavía), o null si ninguna fuente respondió. */
async function portadaRecortada(property: TokkoProperty): Promise<sharp.Sharp | null> {
  for (const url of fuentesDeLaPortada(property)) {
    const buf = await bajarFoto(url)
    if (!buf) continue
    try {
      // Leer la cabecera acá: un archivo que no es imagen pasa a la próxima
      // fuente en vez de caer recién al final en la versión verde.
      await sharp(buf).metadata()
      return sharp(buf)
        .rotate()
        .resize(W, H, { fit: 'cover', position: 'centre' })
        .flatten({ background: VERDE })
    } catch (e) {
      console.error('[og-ficha] foto ilegible:', url, e instanceof Error ? e.message : e)
    }
  }
  return null
}

// ─── Dibujo ───────────────────────────────────────────────────────────────

/** Precio grande (Poppins, es número) con el período más chico al lado. */
function Precio({ monto, periodo, tam, color }: { monto: string; periodo: string | null; tam: number; color: string }) {
  return (
    // flex-end + padding abajo que sube el período a la línea del número:
    // satori no alinea bien por `baseline` y quedaba caído por debajo.
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: Math.round(tam * 0.16) }}>
      <span style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: tam, letterSpacing: '-0.01em', color, lineHeight: 1 }}>
        {monto}
      </span>
      {periodo && (
        <span
          style={{
            fontFamily: RALEWAY,
            fontWeight: 700,
            fontSize: Math.round(tam * 0.42),
            color,
            opacity: 0.75,
            lineHeight: 1,
            paddingBottom: Math.round(tam * 0.32),
          }}
        >
          {periodo}
        </span>
      )}
    </div>
  )
}

/** La franja de abajo sobre fondo transparente (la foto la pone sharp). */
function Franja({ d }: { d: Datos }) {
  // Con precio: el monto manda y abajo "Casa en venta · zona". Sin precio:
  // "Casa en venta" pasa a ser lo grande y la zona queda abajo.
  // ~50 caracteres de Raleway 30 entran en el ancho que deja el logo.
  const segunda = d.monto ? recortar(`${d.tipoOperacion} · ${d.zona}`.replace(/ · $/, ''), 50) : recortar(d.zona, 50)
  return (
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div
        style={{
          height: FRANJA,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 32,
          padding: '0 56px',
          background: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          {d.monto ? (
            <Precio monto={d.monto} periodo={d.periodo} tam={64} color={TINTA} />
          ) : (
            <span style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 54, color: TINTA, lineHeight: 1 }}>
              {recortar(d.tipoOperacion, 30)}
            </span>
          )}
          {segunda && (
            <span style={{ fontFamily: RALEWAY, fontWeight: 600, fontSize: 30, color: TINTA_SUAVE, lineHeight: 1.1 }}>
              {segunda}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexShrink: 0 }}>
          <LogoSI scale={0.6} />
        </div>
      </div>
    </div>
  )
}

/** Sin foto: fondo verde de marca, el precio grande en blanco y la zona. */
function SinFoto({ d }: { d: Datos | null }) {
  return (
    <div
      style={{
        width: W,
        height: H,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        background: VERDE,
        color: '#ffffff',
      }}
    >
      <LogoSI scale={0.8} onDark />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {d?.monto ? (
          <Precio monto={d.monto} periodo={d.periodo} tam={104} color="#ffffff" />
        ) : (
          <span style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 76, lineHeight: 1.05 }}>
            {d ? recortar(d.tipoOperacion, 26) : 'Propiedades en Funes, Roldán y Rosario'}
          </span>
        )}
        {d && (
          <span style={{ fontFamily: RALEWAY, fontWeight: 600, fontSize: 38, opacity: 0.88, lineHeight: 1.15 }}>
            {recortar(d.monto ? `${d.tipoOperacion} · ${d.zona}`.replace(/ · $/, '') : d.zona, 44)}
          </span>
        )}
      </div>
    </div>
  )
}

async function png(el: ReactElement, fonts: SatoriFont[] | undefined): Promise<Buffer> {
  const res = new ImageResponse(el, { width: W, height: H, ...(fonts ? { fonts } : {}) })
  return Buffer.from(await res.arrayBuffer())
}

function jpeg(buf: Buffer): Response {
  return new Response(new Uint8Array(buf), { headers: { 'Content-Type': contentType } })
}

async function verdeSolo(d: Datos | null, fonts: SatoriFont[] | undefined): Promise<Response> {
  return jpeg(await sharp(await png(<SinFoto d={d} />, fonts)).jpeg({ quality: 82, mozjpeg: true }).toBuffer())
}

export default async function Image({ params }: { params: { slug: string } }): Promise<Response> {
  const id = getIdFromSlug(params.slug)
  const fontsPromesa = fuentesOg()

  let property: TokkoProperty | null = null
  if (!isNaN(id)) {
    try {
      property = sanitizeProperty(await getPropertyById(id))
    } catch (e) {
      // Dada de baja / inexistente: la imagen genérica de la marca. Un error
      // pasajero de Hilo sí se propaga: la ruta da 500 sin guardarse y, si ya
      // había una versión en caché, se sigue sirviendo esa.
      if (!(e instanceof Error && e.message.includes('not found'))) throw e
    }
  }
  if (!property) return verdeSolo(null, await fontsPromesa)

  const d = datosDe(property)
  const [foto, fonts] = await Promise.all([portadaRecortada(property), fontsPromesa])
  if (!foto) return verdeSolo(d, fonts)

  try {
    const franja = await png(<Franja d={d} />, fonts)
    const salida = await foto
      .composite([{ input: franja, top: 0, left: 0 }])
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer()
    return jpeg(salida)
  } catch (e) {
    console.error('[og-ficha] armado:', e instanceof Error ? e.message : e)
    return verdeSolo(d, fonts)
  }
}
