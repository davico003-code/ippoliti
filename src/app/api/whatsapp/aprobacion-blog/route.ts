import { Redis } from '@upstash/redis';
import twilio from 'twilio';
import { BLOG_REDIS_KEYS } from '@/agents/blog/lib/redis-keys';
import { enviarWhatsAppAdmin } from '@/agents/blog/lib/whatsapp';
import type { TemaPropuesto } from '@/agents/blog/types';

export const dynamic = 'force-dynamic';

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

/**
 * Parsea respuestas como "1,3", "2 y 5", "1 3", "1, 4", "1-4", "1/4",
 * "elijo 1 y 4", etc. Devuelve array de índices 0-based o null si no es válido.
 */
function parsearSeleccion(texto: string): number[] | null {
  const limpio = texto.toLowerCase().trim();
  // Capturar todos los dígitos
  const nums = limpio.match(/\d+/g);
  if (!nums || nums.length < 1) return null;

  const indices = nums
    .map(n => parseInt(n, 10) - 1)
    .filter(n => n >= 0 && n < 5);

  const unicos = Array.from(new Set(indices));
  return unicos.length > 0 ? unicos.slice(0, 2) : null;
}

function normalizarNumero(n: string): string {
  return n.replace(/^whatsapp:/i, '').replace(/\s/g, '').trim();
}

function buildPublicUrl(req: Request): string {
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('host') ?? new URL(req.url).host;
  const path = new URL(req.url).pathname;
  return `${proto}://${host}${path}`;
}

export async function POST(req: Request) {
  // ── DIAGNOSTIC LOGS ──
  const sig = req.headers.get('x-twilio-signature');
  const ct = req.headers.get('content-type');
  console.log('[aprobacion-blog] X-Twilio-Signature:', sig);
  console.log('[aprobacion-blog] Content-Type:', ct);

  // Twilio Sandbox manda application/x-www-form-urlencoded.
  // Tomamos el body como formData (funciona para form-urlencoded y multipart).
  // Si vino como JSON (test manual), parseamos eso como fallback.
  let from = '';
  let texto = '';
  const formParams: Record<string, string> = {};

  const cloneRaw = req.clone();
  const cloneJson = req.clone();

  try {
    const fd = await req.formData();
    fd.forEach((v, k) => { formParams[k] = String(v); });
    from = String(fd.get('From') ?? '');
    texto = String(fd.get('Body') ?? '');
    console.log('[aprobacion-blog] formData From:', from, '| Body:', texto, '| To:', String(fd.get('To') ?? ''));
  } catch (e) {
    console.log('[aprobacion-blog] formData falló, intentando JSON:', e instanceof Error ? e.message : String(e));
    try {
      const body = (await cloneJson.json()) as { from?: string; text?: string; From?: string; Body?: string };
      from = body.From ?? body.from ?? '';
      texto = body.Body ?? body.text ?? '';
      console.log('[aprobacion-blog] body JSON parseado: from=', from, 'texto=', texto);
    } catch {
      const raw = await cloneRaw.text();
      console.log('[aprobacion-blog] body raw (no parseable):', raw);
    }
  }

  texto = texto.trim();

  // ── Validación de firma Twilio (opcional, no rompe si falla) ──
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (sig && authToken && Object.keys(formParams).length > 0) {
    const url = buildPublicUrl(req);
    const valid = twilio.validateRequest(authToken, sig, url, formParams);
    console.log('[aprobacion-blog] validateRequest url=', url, '| valid=', valid);
    if (!valid) {
      console.warn('[aprobacion-blog] firma inválida pero no rechazamos (sandbox debug)');
    }
  }

  // ── Comparar From normalizado contra ADMIN_WHATSAPP_NUMBER ──
  const adminEnv = process.env.ADMIN_WHATSAPP_NUMBER ?? '+5493413340916';
  const fromNorm = normalizarNumero(from);
  const adminNorm = normalizarNumero(adminEnv);
  const isAdmin = fromNorm === adminNorm;
  console.log('[aprobacion-blog] from=', fromNorm, '| admin=', adminNorm, '| match=', isAdmin);

  if (!texto) {
    console.log('[aprobacion-blog] texto vacío, abortando');
    return new Response('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  if (from && !isAdmin) {
    console.log('[aprobacion-blog] mensaje de número no-admin, ignorando');
    return new Response('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  const redis = getRedis();
  const raw = await redis.get<string>(BLOG_REDIS_KEYS.temasSemana);
  if (!raw) {
    console.log('[aprobacion-blog] no hay propuestas pendientes en Redis');
    await enviarWhatsAppAdmin('No hay propuestas pendientes esta semana. El radar corre los lunes 7am.');
    return new Response('<Response></Response>', { status: 200, headers: { 'Content-Type': 'text/xml' } });
  }

  let propuestas: TemaPropuesto[];
  try {
    propuestas = typeof raw === 'string' ? JSON.parse(raw) : (raw as TemaPropuesto[]);
  } catch {
    return Response.json({ error: 'Invalid proposals data' }, { status: 500 });
  }

  const seleccion = parsearSeleccion(texto);
  console.log('[aprobacion-blog] selección parseada:', seleccion, '(de texto:', texto, ')');
  if (!seleccion) {
    await enviarWhatsAppAdmin(
      'No entendí la selección. Respondé con 2 números del 1 al 5 (ej: "1,3" o "2 y 5").',
    );
    return new Response('<Response></Response>', { status: 200, headers: { 'Content-Type': 'text/xml' } });
  }

  const aprobados = seleccion.map(i => propuestas[i]).filter(Boolean);
  if (aprobados.length === 0) {
    await enviarWhatsAppAdmin('Los números elegidos no corresponden a ninguna propuesta. Intentá de nuevo.');
    return new Response('<Response></Response>', { status: 200, headers: { 'Content-Type': 'text/xml' } });
  }

  // Sin TTL: la key se sobrescribe cada lunes por el siguiente radar.
  // 48h era bug — expiraba antes del writer-viernes (Lun→Vie = 96h).
  await redis.set(BLOG_REDIS_KEYS.temasAprobados, JSON.stringify(aprobados));
  console.log('[aprobacion-blog] guardados en Redis blog:temas_aprobados:', aprobados.map(a => a.titulo));

  // Agregar a temas usados (para dedupe futuro)
  const usadosRaw = await redis.get<string[]>(BLOG_REDIS_KEYS.temasUsados);
  const usados = usadosRaw ?? [];
  usados.push(...aprobados.map(a => a.titulo));
  await redis.set(BLOG_REDIS_KEYS.temasUsados, usados.slice(-30));

  const confirmacion = aprobados
    .map((a, i) => `${i + 1}. ${a.titulo}`)
    .join('\n');

  await enviarWhatsAppAdmin(
    `✅ Listo. Esta semana se publican:\n\n${confirmacion}\n\nMartes y viernes 8am.`,
  );

  return new Response('<Response></Response>', { status: 200, headers: { 'Content-Type': 'text/xml' } });
}
