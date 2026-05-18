// Fuente única de los textos legales del acuerdo de comercialización.
//
// IMPORTANTE: Cualquier modificación a este archivo solo aplica a acuerdos
// futuros y a acuerdos pendientes no firmados. Los acuerdos firmados
// conservan su `documento_snapshot` original por validez legal (Ley 25.506).
// Cada firma electrónica certifica conformidad con un texto específico —
// modificar retroactivamente el texto invalidaría su valor probatorio.
// Por eso, al cambiar el template, también se debe bumpear DOCUMENTO_VERSION
// y verificar que los renderers (PDF, vista admin) prioricen el snapshot.
//
// Importado por:
//   - AutorizacionPublicaClient (vista web del cliente, live preview)
//   - AutorizacionPDF (render del PDF)
//   - Panel agente (template de WhatsApp + detalle slug)
//
// Convención: las cláusulas y el preámbulo se devuelven como secuencias de
// chunks { kind: 'text' | 'data', text } para que la vista web pueda renderizar
// los datos (kind='data') con peso 600 color #1A1A1A sin background, y el cuerpo
// (kind='text') con peso 400 color #1A1A1A. El PDF colapsa chunks aplicando el
// mismo contraste de peso.
//
// Lugar geográfico: Funes (encabezado, cierre, PDF). NO Rosario.

import type { Autorizacion, TipoPropiedad } from './index'

// ── WhatsApp ────────────────────────────────────────────────────────────────

export const WHATSAPP_TEMPLATE = (url: string): string =>
  `Hola! 👋 Te envío el acuerdo de comercialización para que lo puedas revisar y firmar desde tu celular en 1 minuto:\n\n${url}\n\nCualquier consulta estoy a disposición.\n\nDavid Flores\nCorredor Inmobiliario Mat. N.º 0621\nSI INMOBILIARIA`

// ── Labels ──────────────────────────────────────────────────────────────────

export const PROPIEDAD_LABEL: Record<TipoPropiedad, string> = {
  casa: 'casa',
  depto: 'departamento',
  ph: 'PH',
  local: 'local comercial',
  terreno: 'terreno',
  galpon: 'galpón',
  oficina: 'oficina',
  otro: 'inmueble',
}

const SERVICIOS_ORDER: Array<{ key: keyof Autorizacion['servicios']; label: string }> = [
  { key: 'luz', label: 'luz' },
  { key: 'agua', label: 'agua' },
  { key: 'gas', label: 'gas' },
  { key: 'pavimento', label: 'pavimento' },
  { key: 'cloacas', label: 'cloacas' },
]

// ── Chunks ──────────────────────────────────────────────────────────────────

export type Chunk = { kind: 'text' | 'data'; text: string }

function t(text: string): Chunk { return { kind: 'text', text } }
function d(text: string): Chunk { return { kind: 'data', text } }

/** Convierte chunks a string plano para tests / fallback. */
export function chunksToString(chunks: Chunk[]): string {
  return chunks.map(c => c.text).join('')
}

// ── Formatters ──────────────────────────────────────────────────────────────

export function formatFechaEncabezado(date: Date): string {
  const fmt = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
  return `Funes, ${fmt.format(date)}`
}

export function formatFechaFirma(date: Date): string {
  const fecha = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(date)
  const hora = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(date)
  return `${fecha} a las ${hora} hs`
}

function formatListaServicios(servicios: Autorizacion['servicios']): string {
  const activos = SERVICIOS_ORDER.filter(s => servicios[s.key]).map(s => s.label)
  if (activos.length === 0) return ''
  if (activos.length === 1) return activos[0]
  if (activos.length === 2) return `${activos[0]} y ${activos[1]}`
  return `${activos.slice(0, -1).join(', ')} y ${activos[activos.length - 1]}`
}

function formatUSD(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// ── Título dinámico ─────────────────────────────────────────────────────────

export function getTitulo(auth: Pick<Autorizacion, 'tipo'>): string {
  return auth.tipo === 'exclusiva'
    ? 'ACUERDO DE COMERCIALIZACIÓN EXCLUSIVA'
    : 'ACUERDO DE COMERCIALIZACIÓN'
}

// ── Preámbulo (con 4 placeholders dinámicos para live preview) ──────────────

// Token literal para que el cliente pueda splittear y renderizar inputs en vivo.
// El PDF reemplaza con datos del signer (un find+replace simple).
export const PLACEHOLDER_TOKENS = ['{NOMBRE}', '{DNI}', '{DOMICILIO}', '{EMAIL}'] as const

export const PREAMBULO_PLANTILLA =
  'El que suscribe, {NOMBRE}, DNI {DNI}, con domicilio en {DOMICILIO}, correo electrónico {EMAIL}, en adelante "El Autorizante", autoriza a SI INMOBILIARIA SRL, representada por la Sra. Susana Mabel Ippoliti (Corredora Inmobiliaria Matrícula N.º 0559) y el Sr. David Eduardo Flores (Corredor Inmobiliario Matrícula N.º 0621), en adelante "El Autorizado", a comercializar el inmueble bajo las siguientes condiciones:'

/** Para el PDF: reemplaza placeholders con datos del signer. */
export function renderPreambuloPDF(signer: NonNullable<Autorizacion['signer']>): string {
  return PREAMBULO_PLANTILLA
    .replace('{NOMBRE}', signer.nombre)
    .replace('{DNI}', signer.dni)
    .replace('{DOMICILIO}', signer.domicilio)
    .replace('{EMAIL}', signer.email)
}

// ── Cláusulas ───────────────────────────────────────────────────────────────

export interface ClausulaDef {
  key: string                    // 'inmueble' | 'expensas' | 'plazo' | ...
  numero: number                 // 1, 2, 3...
  titulo: string                 // 'Inmueble', 'Plazo', etc. (sin numero ni dos puntos)
  chunks: Chunk[]
}

export function getClausulas(auth: Autorizacion): ClausulaDef[] {
  const isExclusiva = auth.tipo === 'exclusiva'
  const hasServicios = SERVICIOS_ORDER.some(s => auth.servicios[s.key])
  const hipotecada = Boolean(auth.hipotecada)

  const numeros = getNumeracion({ isExclusiva, hipotecada })
  const out: ClausulaDef[] = []

  // 1 — INMUEBLE (con servicios integrados)
  {
    const enForma = isExclusiva ? 'en forma EXCLUSIVA ' : ''
    const tipoLabel = PROPIEDAD_LABEL[auth.tipo_propiedad]
    const chunks: Chunk[] = [
      t('El Autorizante autoriza '),
      ...(enForma ? [d(enForma)] : []),
      t('al Autorizado a ofrecer en venta el inmueble sito en '),
      d(auth.direccion),
      t(', identificado como '),
      d(tipoLabel),
    ]
    if (hasServicios) {
      chunks.push(t(', con los siguientes servicios disponibles: '))
      chunks.push(d(formatListaServicios(auth.servicios)))
    }
    chunks.push(t('.'))
    out.push({ key: 'inmueble', numero: numeros.inmueble, titulo: 'Inmueble', chunks })
  }

  // NOTA v3: la cláusula EXPENSAS fue eliminada del documento legal.
  // Los campos `tiene_expensas` y `expensas_monto_ars` se conservan en el
  // schema/form/Redis como información interna, pero NUNCA se renderizan
  // en el documento que firma el cliente.

  // Plazo (siempre, 2 variantes)
  {
    const plazoStr = `${auth.plazo_dias} días`
    if (auth.renovacion_automatica) {
      out.push({
        key: 'plazo',
        numero: numeros.plazo,
        titulo: 'Plazo',
        chunks: [
          d(plazoStr),
          t(' corridos desde la firma del presente acuerdo, renovables automáticamente por igual período salvo revocación expresa por escrito.'),
        ],
      })
    } else {
      out.push({
        key: 'plazo',
        numero: numeros.plazo,
        titulo: 'Plazo',
        chunks: [
          d(plazoStr),
          t(' corridos desde la firma del presente acuerdo, sin renovación automática. Cualquier prórroga deberá ser ratificada expresamente por ambas partes.'),
        ],
      })
    }
  }

  // Precio (solo publicación, 2 variantes — NUNCA expone precio_venta_usd)
  {
    const pub = auth.precio_publicacion_usd
    if (pub && pub > 0) {
      out.push({
        key: 'precio',
        numero: numeros.precio,
        titulo: 'Precio',
        chunks: [
          t('El precio de publicación del inmueble se fija en USD '),
          d(formatUSD(pub)),
          t(' (dólares estadounidenses billete).'),
        ],
      })
    } else {
      out.push({
        key: 'precio',
        numero: numeros.precio,
        titulo: 'Precio',
        chunks: [
          t('El precio de publicación se acordará entre las partes por instrumento o comunicación posterior, formando parte integrante del presente acuerdo.'),
        ],
      })
    }
  }

  // Difusión (siempre)
  out.push({
    key: 'difusion',
    numero: numeros.difusion,
    titulo: 'Difusión',
    chunks: [
      t('El Autorizante autoriza al Autorizado a publicar y promocionar el inmueble en portales inmobiliarios, redes sociales, medios digitales y cualquier otro canal que considere conveniente.'),
    ],
  })

  // Exclusividad (condicional)
  if (isExclusiva) {
    out.push({
      key: 'exclusividad',
      numero: numeros.exclusividad,
      titulo: 'Exclusividad',
      chunks: [
        t('El Autorizante declara que no tiene encomendada la venta del inmueble a ninguna otra inmobiliaria y se compromete a no encomendarla a terceros mientras el presente acuerdo esté vigente.'),
      ],
    })
  }

  // Honorarios (siempre)
  out.push({
    key: 'honorarios',
    numero: numeros.honorarios,
    titulo: 'Honorarios',
    chunks: [
      t('Los honorarios de SI INMOBILIARIA serán del 3% + IVA sobre el precio efectivo de venta, abonados por el Autorizante al firmar el boleto de compraventa o escritura traslativa de dominio, lo que fuere primero.'),
    ],
  })

  // Títulos (omitida cuando hipotecada=true: la declaración de "títulos
  // perfectos, sin hipotecas" no aplica a una propiedad efectivamente
  // hipotecada; se saca limpio del documento, no se reemplaza por nada).
  if (!hipotecada) {
    out.push({
      key: 'titulos',
      numero: numeros.titulos,
      titulo: 'Títulos',
      chunks: [
        t('El Autorizante declara que los títulos son perfectos, sin embargos, hipotecas, gravámenes, litigios ni inhibiciones, y aportará la documentación al Autorizado dentro de los 5 días.'),
      ],
    })
  }

  return out
}

// ── Numeración dinámica ─────────────────────────────────────────────────────

export function getNumeracion(opts: { isExclusiva: boolean; hipotecada?: boolean }): Record<string, number> {
  let n = 1
  const map: Record<string, number> = {}
  map.inmueble = n++
  map.plazo = n++
  map.precio = n++
  map.difusion = n++
  if (opts.isExclusiva) map.exclusividad = n++
  map.honorarios = n++
  if (!opts.hipotecada) map.titulos = n++
  return map
}

// ── Cierre ──────────────────────────────────────────────────────────────────

export const CIERRE_CONSENTIMIENTO =
  'En conformidad, El Autorizante presta consentimiento al presente acuerdo mediante firma electrónica, conforme la Ley Nacional N.º 25.506.'

/** Para pre-firma (cliente viendo `status === 'pendiente'`): fecha queda
 *  vacía con guiones; reemplaza por valor real en post-firma. */
export const CIERRE_FECHA_PLACEHOLDER = '__________'

/** Para post-firma: "Firmado digitalmente en Funes, el 14 de mayo de 2026 a las 18:42 hs." */
export function formatCierreFirma(date: Date): string {
  return `Firmado digitalmente en Funes, el ${formatFechaFirma(date)}.`
}

// ── Snapshot del documento (versionado retroactivo) ─────────────────────────
//
// Al firmar, guardamos en Redis una foto del documento ya renderizado con
// los datos del firmante interpolados. El PDF futuro se genera desde este
// snapshot, no desde getClausulas() — así si cambiamos la plantilla, los
// acuerdos ya firmados conservan exactamente el texto que el cliente firmó.

/** Bump cuando cambie el TEMPLATE legal (cláusulas, preámbulo, cierre). */
export const DOCUMENTO_VERSION = '2026-05-18-v4-hipoteca-omite-clausula-titulos'

export interface ClausulaSnapshot {
  numero: number
  titulo: string                  // "Inmueble", "Plazo", etc.
  contenido: string               // texto plano (para audit / hashing)
  chunks: Chunk[]                 // para render del PDF con highlight de datos
}

export interface DocumentoSnapshot {
  version: string
  titulo: string
  fecha_encabezado: string        // "Funes, 15 de mayo de 2026"
  preambulo: string               // con datos del signer interpolados (sin tokens)
  clausulas: ClausulaSnapshot[]
  cierre_consentimiento: string
  cierre_firma: string            // "Firmado digitalmente en Funes, el X."
  lugar: 'Funes'
}

/**
 * Genera el snapshot completo del documento con los datos del firmante.
 * Llamado por marcarFirmada al momento de la firma; el resultado se guarda
 * en `auth.documento_snapshot` y el PDF lo consume si está presente.
 */
export function buildDocumentoSnapshot(
  auth: Autorizacion,
  signer: NonNullable<Autorizacion['signer']>,
  signedAt: Date,
): DocumentoSnapshot {
  return {
    version: DOCUMENTO_VERSION,
    titulo: getTitulo(auth),
    fecha_encabezado: formatFechaEncabezado(signedAt),
    preambulo: renderPreambuloPDF(signer),
    clausulas: getClausulas(auth).map(cl => ({
      numero: cl.numero,
      titulo: cl.titulo,
      contenido: chunksToString(cl.chunks),
      chunks: cl.chunks,
    })),
    cierre_consentimiento: CIERRE_CONSENTIMIENTO,
    cierre_firma: formatCierreFirma(signedAt),
    lugar: 'Funes',
  }
}
