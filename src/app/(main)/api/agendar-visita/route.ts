// POST /api/agendar-visita — endpoint público para crear lead de visita desde
// la ficha de propiedad. Persiste en Redis (visita:{id} con TTL 180d) y
// notifica al admin por WhatsApp (best-effort, no bloquea la respuesta).
//
// NO requiere team-code (es público — disparado por el cliente final desde
// el VisitWidget en la ficha de propiedad).

import { NextResponse, type NextRequest } from 'next/server'
import { enviarWhatsAppAdmin } from '@/agents/blog/lib/whatsapp'
import { crearVisita, type VisitaSource, type VisitaTipo } from '@/lib/visitas'
import { enviarLeadAHilo } from '@/lib/hilo-leads'
import { attributionDeUrl } from '@/lib/pauta-visita'
import { rateLimit } from '@/lib/feedback'
import { metaDeLaConsulta } from '@/lib/meta-capi'
import { celularArValido, normalizarCelularAr } from '@/lib/tasacion/formato'

export const dynamic = 'force-dynamic'

const TIPOS: VisitaTipo[] = ['venta', 'alquiler', 'temporario']
const SOURCES: VisitaSource[] = ['mobile-sticky', 'desktop-sidebar', 'emprendimiento', 'otro']

// El link de la propiedad va tal cual al WhatsApp del admin: solo se acepta si
// es nuestro. Cualquier otro dominio se descarta (un "Nueva consulta" desde el
// número oficial de alertas con un link ajeno es phishing perfecto). No se
// rearma como /propiedades/{id}: las visitas de un emprendimiento traen la URL
// de su landing.
const HOSTS_PROPIOS = new Set(['siinmobiliaria.com', 'www.siinmobiliaria.com', 'verficha.casa'])

// El VisitWidget ofrece los próximos 7 días hábiles (como mucho ~11 corridos).
// Margen para relojes corridos y la diferencia de huso del servidor.
const DIAS_ATRAS = 1
const DIAS_ADELANTE = 21

function getClientIp(req: Request): string | undefined {
  const xff = req.headers.get('x-forwarded-for') || ''
  const first = xff.split(',')[0]?.trim()
  if (first) return first
  return req.headers.get('x-real-ip') || undefined
}

/** Texto de una línea, sin saltos ni caracteres de control, con tope de largo. */
function linea(v: unknown, max: number): string {
  return typeof v === 'string'
    ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
    : ''
}

function urlPropia(v: unknown): string | undefined {
  if (typeof v !== 'string' || !v) return undefined
  try {
    const u = new URL(v.slice(0, 500))
    if ((u.protocol === 'https:' || u.protocol === 'http:') && HOSTS_PROPIOS.has(u.hostname)) return u.toString()
  } catch {
    /* no es una URL */
  }
  return undefined
}

/** 'YYYY-MM-DD' real y dentro de la ventana que ofrece el widget (hora de Argentina). */
function fechaValida(f: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(f)
  if (!m) return false
  const pedida = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const d = new Date(pedida)
  if (d.getUTCMonth() !== Number(m[2]) - 1 || d.getUTCDate() !== Number(m[3])) return false
  const hoyAr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
  const [y, mo, da] = hoyAr.split('-').map(Number)
  const dias = Math.round((pedida - Date.UTC(y, mo - 1, da)) / 86_400_000)
  return dias >= -DIAS_ATRAS && dias <= DIAS_ADELANTE
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Honeypot (mismo campo que el pedido de tasación): un humano nunca ve ni
  // completa `website`. Si viene con algo, respondemos ok y no registramos nada:
  // ni visita, ni lead en Hilo (que se lo mandaría a Meta), ni WhatsApp pago al admin.
  if (linea(body.website, 200)) return NextResponse.json({ ok: true })

  // Rate-limit anti-flood por IP (fail-open). Este endpoint además dispara un
  // WhatsApp al admin por request, así que es clave evitar abuso.
  const rlIp = getClientIp(request) || 'unknown'
  if (!(await rateLimit(rlIp, 'visita', 6, 60))) {
    return NextResponse.json({ error: 'Demasiados envíos seguidos. Esperá un momento y reintentá.' }, { status: 429 })
  }

  // Todo con tope y en una línea: estos textos terminan en el WhatsApp del admin.
  const nombre = linea(body.nombre, 80)
  const telefonoCrudo = linea(body.telefono, 40)
  const email = linea(body.email, 200)
  const fecha_preferida = linea(body.fecha_preferida, 10)
  const horario = linea(body.horario, 12)
  const propiedad_id = Number(body.propiedad_id)
  const propiedad_titulo = linea(body.propiedad_titulo, 200) || 'Propiedad sin título'
  const propiedad_url = urlPropia(body.propiedad_url)

  // La página con los utm del anuncio (urlConUtmDePauta): Hilo ata la visita al
  // anuncio de Meta que la trajo (David, 20-oct-2026: trazabilidad de la consulta).
  // Va solo a Hilo, nunca al WhatsApp del admin.
  const pageUrl = typeof body.pageUrl === 'string' ? body.pageUrl.slice(0, 500) : ''

  const tipoRaw = typeof body.tipo === 'string' ? body.tipo : 'venta'
  const tipo: VisitaTipo = (TIPOS as readonly string[]).includes(tipoRaw)
    ? (tipoRaw as VisitaTipo)
    : 'venta'

  const sourceRaw = typeof body.source === 'string' ? body.source : 'otro'
  const source: VisitaSource = (SOURCES as readonly string[]).includes(sourceRaw)
    ? (sourceRaw as VisitaSource)
    : 'otro'

  // El teléfono es opcional: el VisitWidget abre WhatsApp con el agente y no
  // lo pide. Exigirlo rebotaba con 400 TODAS las visitas desde el 04-jul.
  // propiedad_id: Number(null) da 0 y pasaba el viejo Number.isFinite.
  if (!nombre || !fecha_preferida || !horario || !Number.isInteger(propiedad_id) || propiedad_id <= 0) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }
  // Mismo formato que manda el VisitWidget ("2026-10-27" y "10:30 hs"): una
  // fecha imposible ("mañana a la noche") no se puede agendar en Hilo.
  if (!fechaValida(fecha_preferida) || !/^\d{1,2}:\d{2}( ?hs)?$/.test(horario)) {
    return NextResponse.json({ error: 'Elegí un día y un horario de la lista.' }, { status: 400 })
  }

  // Celular normalizado como el pedido de tasación (+549 + 10 dígitos). Si no
  // es un celular argentino válido NO se rechaza (WhatsApp ya se abrió y perder
  // la visita es peor): va crudo, solo dígitos y +.
  const cel = normalizarCelularAr(telefonoCrudo)
  const telefono = celularArValido(cel) ? `+549${cel}` : telefonoCrudo.replace(/[^\d+]/g, '').slice(0, 20)

  const ip = getClientIp(request)
  const user_agent = request.headers.get('user-agent') || undefined

  // Redis es el respaldo, no la puerta: si Upstash se cae, la visita igual
  // tiene que llegar a Hilo (el destino principal). Antes un corte de Redis
  // devolvía 500 acá y tiraba también el lead de Hilo.
  let visitaId: string | null = null
  try {
    const visita = await crearVisita({
      propiedad_id,
      propiedad_titulo,
      propiedad_url,
      nombre,
      telefono,
      email: email || undefined,
      fecha_preferida,
      horario,
      tipo,
      source,
      ip,
      user_agent,
    })
    visitaId = visita.id
  } catch (e) {
    console.error('[agendar-visita] Error persistiendo en Redis:', e)
  }

  // Empujar al inbox de Hilo: lead caliente con propiedad + fecha.
  // tokkoPropertyId → Hilo resuelve la ficha y lo asigna al captador.
  // meta: identidad de Meta de la consulta (como /api/leads) → Hilo manda el
  // Lead por CAPI, deduplicado con el píxel si el widget manda `metaEventId`.
  const hilo = await enviarLeadAHilo({
    name: nombre,
    phone: telefono || null,
    email: email || null,
    origen: `visita-${source}`,
    tokkoPropertyId: propiedad_id,
    message: `Agendó visita a "${propiedad_titulo}" para ${fecha_preferida} ${horario}.${
      propiedad_url ? ` ${propiedad_url}` : ''
    }`,
    sourceUrl: pageUrl || propiedad_url || null,
    attribution: attributionDeUrl(pageUrl),
    meta: metaDeLaConsulta(request, body, pageUrl || null),
  })

  if (!visitaId && !hilo.ok) {
    console.error('[agendar-visita] VISITA PERDIDA: falló Redis y Hilo', { propiedad_id, source })
    return NextResponse.json(
      { error: 'No pudimos registrar tu pedido de visita. Reintentá en unos segundos o escribinos por WhatsApp.' },
      { status: 502 },
    )
  }

  // Notificar al admin por WhatsApp (best-effort, no bloquea respuesta)
  const mensaje = [
    `🔔 *Nueva consulta de ${tipo}*`,
    '',
    `👤 ${nombre}`,
    telefono ? `📱 ${telefono}` : '📱 sin teléfono (siguió por WhatsApp)',
    email ? `📧 ${email}` : null,
    '',
    `🏠 ${propiedad_titulo}`,
    propiedad_url ? `🔗 ${propiedad_url}` : null,
    `ID propiedad: ${propiedad_id}`,
    '',
    `📅 ${fecha_preferida} · ${horario}`,
    '',
    // Sin id de Redis (Upstash caído) igual se avisa: el lead está en Hilo.
    visitaId ? `Lead ID: ${visitaId}` : 'Lead en Hilo (sin respaldo en Redis)',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    await enviarWhatsAppAdmin(mensaje)
  } catch (err) {
    console.error('[agendar-visita] Error enviando WhatsApp admin:', err)
    // No rompemos la respuesta al cliente por un fallo de notificación
  }

  // metaEventId: el id con el que Hilo mandó el Lead por CAPI; el widget dispara
  // el píxel con ese (si Hilo ya tenía la consulta, es el primero).
  return NextResponse.json({
    ok: true,
    id: visitaId,
    ...(hilo.metaEventId ? { metaEventId: hilo.metaEventId } : {}),
  })
}
