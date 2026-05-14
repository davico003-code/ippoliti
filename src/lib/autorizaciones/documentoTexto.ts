// Fuente única de los textos legales de la autorización de venta.
//
// Importado por:
//   - AutorizacionPublicaClient (vista web del cliente, live preview)
//   - AutorizacionPDF (commit 3, render del PDF)
//   - panel agente (template de WhatsApp + detalle slug)
//
// Convención: las cláusulas y el preámbulo se devuelven como secuencias de
// chunks { kind: 'text' | 'data', text } para que la vista web pueda renderizar
// los datos (kind='data') con peso 500 color #1A1A1A sin background, y el cuerpo
// (kind='text') con peso 300 color #2A2A28. El PDF colapsa chunks a string
// aplicando el mismo contraste de peso.

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

/** Convierte chunks a string plano para el PDF y para fallback de tests. */
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
  return `Rosario, ${fmt.format(date)}`
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

function formatARS(n: number): string {
  return n.toLocaleString('es-AR', { maximumFractionDigits: 0 })
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
  label: string                  // "1 · INMUEBLE"
  chunks: Chunk[]
}

export function getClausulas(auth: Autorizacion): ClausulaDef[] {
  const hasServicios = SERVICIOS_ORDER.some(s => auth.servicios[s.key])
  const hasExpensas = auth.tiene_expensas && !!auth.expensas_monto_ars && auth.expensas_monto_ars > 0
  const isExclusiva = auth.tipo === 'exclusiva'

  const numeros = getNumeracion({ hasServicios, hasExpensas, isExclusiva })
  const out: ClausulaDef[] = []

  // 1 — INMUEBLE
  {
    const enForma = isExclusiva ? 'en forma EXCLUSIVA ' : ''
    const tipoLabel = PROPIEDAD_LABEL[auth.tipo_propiedad]
    out.push({
      label: `${numeros.inmueble} · INMUEBLE`,
      chunks: [
        t('El Autorizante autoriza '),
        ...(enForma ? [d(enForma)] : []),
        t('al Autorizado a ofrecer en venta el inmueble de su propiedad sito en '),
        d(auth.direccion),
        t(', identificado como '),
        d(tipoLabel),
        t('. Los datos descriptivos y técnicos del inmueble (medidas, superficie, partida inmobiliaria y demás detalles) se completarán por instrumento o anexo posterior.'),
      ],
    })
  }

  // 2 — SERVICIOS (condicional)
  if (hasServicios) {
    out.push({
      label: `${numeros.servicios} · SERVICIOS`,
      chunks: [
        t('El inmueble cuenta con los siguientes servicios disponibles: '),
        d(formatListaServicios(auth.servicios)),
        t('.'),
      ],
    })
  }

  // 3 — EXPENSAS (condicional)
  if (hasExpensas) {
    out.push({
      label: `${numeros.expensas} · EXPENSAS`,
      chunks: [
        t('La propiedad genera expensas mensuales estimadas en $ '),
        d(formatARS(auth.expensas_monto_ars!)),
        t(' (pesos argentinos), a cargo del titular hasta el momento de la posesión por parte del comprador.'),
      ],
    })
  }

  // 4 — PLAZO
  {
    const plazo = String(auth.plazo_dias)
    if (auth.renovacion_automatica) {
      out.push({
        label: `${numeros.plazo} · PLAZO`,
        chunks: [
          t('La presente autorización tendrá una vigencia de '),
          d(`${plazo} días`),
          t(' corridos a partir de la fecha de la firma, renovable en forma automática por igual período, salvo revocación expresa notificada por escrito por cualquiera de las partes.'),
        ],
      })
    } else {
      out.push({
        label: `${numeros.plazo} · PLAZO`,
        chunks: [
          t('La presente autorización tendrá una vigencia de '),
          d(`${plazo} días`),
          t(' corridos a partir de la fecha de la firma, sin renovación automática. Cualquier prórroga deberá ser ratificada expresamente por ambas partes.'),
        ],
      })
    }
  }

  // 5 — PRECIO (3 variantes)
  {
    const venta = auth.precio_venta_usd
    const pub = auth.precio_publicacion_usd
    if (venta && venta > 0 && pub && pub > 0) {
      out.push({
        label: `${numeros.precio} · PRECIO`,
        chunks: [
          t('El precio de venta del inmueble se fija en USD '),
          d(formatUSD(venta)),
          t(' (dólares estadounidenses billete) en efectivo. Se autoriza al Autorizado a publicar el inmueble por la suma de USD '),
          d(formatUSD(pub)),
          t('.'),
        ],
      })
    } else if (venta && venta > 0) {
      out.push({
        label: `${numeros.precio} · PRECIO`,
        chunks: [
          t('El precio de venta del inmueble se fija en USD '),
          d(formatUSD(venta)),
          t(' (dólares estadounidenses billete) en efectivo. Se autoriza al Autorizado a publicar el inmueble por la misma suma.'),
        ],
      })
    } else {
      out.push({
        label: `${numeros.precio} · PRECIO`,
        chunks: [
          t('El precio de venta del inmueble se acordará entre las partes por instrumento o comunicación posterior, formando parte integrante de la presente autorización.'),
        ],
      })
    }
  }

  // 6 — EXCLUSIVIDAD (condicional)
  if (isExclusiva) {
    out.push({
      label: `${numeros.exclusividad} · EXCLUSIVIDAD`,
      chunks: [
        t('El Autorizante declara que no tiene encomendada la venta del inmueble objeto de la presente autorización con ninguna otra inmobiliaria, y se compromete a no encomendarla a terceros mientras esta autorización se encuentre vigente.'),
      ],
    })
  }

  // 7 — VISITAS Y CARTEL
  out.push({
    label: `${numeros.visitas} · VISITAS Y CARTEL`,
    chunks: [
      t('El Autorizante permitirá la visita de los posibles compradores presentados por el Autorizado, en horarios coordinados previamente, y autoriza la colocación del cartel de venta en el inmueble.'),
    ],
  })

  // 8 — RESERVAS
  out.push({
    label: `${numeros.reservas} · RESERVAS`,
    chunks: [
      t('El Autorizado queda facultado para tomar reservas ad referéndum del Autorizante por un monto equivalente al 10% del valor de la oferta recibida. Dichas reservas serán comunicadas al Autorizante dentro de las 48 horas hábiles de recibidas, a los fines de su ratificación o rechazo.'),
    ],
  })

  // 9 — HONORARIOS
  out.push({
    label: `${numeros.honorarios} · HONORARIOS`,
    chunks: [
      t('Los honorarios de SI INMOBILIARIA SRL por su intervención serán del 3% (tres por ciento) más IVA, calculados sobre el precio efectivo de venta del inmueble. Dichos honorarios serán abonados por el Autorizante en oportunidad de la firma del boleto de compraventa o instrumento equivalente.'),
    ],
  })

  // 10 — CONTINUIDAD
  out.push({
    label: `${numeros.continuidad} · CONTINUIDAD`,
    chunks: [
      t('El Autorizante abonará al Autorizado los honorarios íntegros pactados en la cláusula anterior si, aún caducada la presente autorización, la venta se concretara como consecuencia directa o indirecta de las gestiones de SI INMOBILIARIA SRL, es decir, a alguno de los clientes a quienes se les hubiera ofrecido o presentado el inmueble durante la vigencia de esta autorización.'),
    ],
  })

  // 11 — TÍTULOS
  out.push({
    label: `${numeros.titulos} · TÍTULOS`,
    chunks: [
      t('El Autorizante declara bajo juramento que los títulos de propiedad del inmueble son perfectos, que el bien no se encuentra afectado por embargos, hipotecas, prendas ni gravamen alguno, que no es objeto de litigio judicial y que los titulares no se encuentran inhibidos para disponer del mismo. Se compromete a aportar al Autorizado, dentro de los 5 días de requerido, copias del título de propiedad, planos aprobados e impuestos al día.'),
    ],
  })

  return out
}

// ── Numeración dinámica ─────────────────────────────────────────────────────

export function getNumeracion(opts: {
  hasServicios: boolean
  hasExpensas: boolean
  isExclusiva: boolean
}): Record<string, number> {
  let n = 1
  const map: Record<string, number> = {}
  map.inmueble = n++
  if (opts.hasServicios) map.servicios = n++
  if (opts.hasExpensas) map.expensas = n++
  map.plazo = n++
  map.precio = n++
  if (opts.isExclusiva) map.exclusividad = n++
  map.visitas = n++
  map.reservas = n++
  map.honorarios = n++
  map.continuidad = n++
  map.titulos = n++
  return map
}

// ── Cierre ──────────────────────────────────────────────────────────────────

export const CIERRE_CONSENTIMIENTO =
  'En conformidad con lo expuesto, El Autorizante presta consentimiento al contenido del presente acuerdo de comercialización mediante firma electrónica, conforme la Ley Nacional N.º 25.506.'

export function formatCierreFirma(date: Date): string {
  return `Firmado digitalmente en la ciudad de Rosario, el ${formatFechaFirma(date)}.`
}
