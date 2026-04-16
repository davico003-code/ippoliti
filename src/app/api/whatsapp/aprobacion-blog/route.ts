import { Redis } from '@upstash/redis';
import twilio from 'twilio';
import { BLOG_REDIS_KEYS, TTL } from '@/agents/blog/lib/redis-keys';
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
  // Twilio Sandbox manda application/x-www-form-urlencoded.
  // Fallback a JSON para test manual con curl.
  let from = '';
  let texto = '';
  const formParams: Record<string, string> = {};

  const cloneJson = req.clone();

  try {
    const fd = await req.formData();
    fd.forEach((v, k) => { formParams[k] = String(v); });
    from = String(fd.get('From') ?? '');
    texto = String(fd.get('Body') ?? '');
  } catch {
    try {
      const body = (await cloneJson.json()) as { from?: string; text?: string; From?: string; Body?: string };
      from = body.From ?? body.from ?? '';
      texto = body.Body ?? body.text ?? '';
    } catch { /* body no parseable */ }
  }

  texto = texto.trim();

  // Validación de firma Twilio (opcional)
  const sig = req.headers.get('x-twilio-signature');
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (sig && authToken && Object.keys(formParams).length > 0) {
    const url = buildPublicUrl(req);
    twilio.validateRequest(authToken, sig, url, formParams);
  }

  // Comparar From contra ADMIN_WHATSAPP_NUMBER
  const adminEnv = process.env.ADMIN_WHATSAPP_NUMBER ?? '+5493413340916';
  const fromNorm = normalizarNumero(from);
  const adminNorm = normalizarNumero(adminEnv);
  const isAdmin = fromNorm === adminNorm;

  if (!texto) {
    return new Response('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  if (from && !isAdmin) {
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

  await redis.set(BLOG_REDIS_KEYS.temasAprobados, JSON.stringify(aprobados), {
    ex: TTL.pendienteAprobacion,
  });
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
