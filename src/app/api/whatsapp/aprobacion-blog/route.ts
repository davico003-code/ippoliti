import { Redis } from '@upstash/redis';
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
 * Parsea respuestas como "1,3", "2 y 5", "1 3", "1, 4", etc.
 * Devuelve array de índices 0-based o null si no es válido.
 */
function parsearSeleccion(texto: string): number[] | null {
  const nums = texto.match(/\d+/g);
  if (!nums || nums.length < 1) return null;

  const indices = nums
    .map(n => parseInt(n, 10) - 1) // 1-based → 0-based
    .filter(n => n >= 0 && n < 5);  // válidos dentro de 5 propuestas

  const unicos = Array.from(new Set(indices));
  return unicos.length > 0 ? unicos.slice(0, 2) : null;
}

export async function POST(req: Request) {
  // TODO Fase 2: validar que el request viene del provider WhatsApp real
  // (signature check, token, etc.)

  let body: { from?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const texto = (body.text ?? '').trim();
  if (!texto) {
    return Response.json({ error: 'Empty text' }, { status: 400 });
  }

  const redis = getRedis();

  // Leer propuestas de la semana
  const raw = await redis.get<string>(BLOG_REDIS_KEYS.temasSemana);
  if (!raw) {
    await enviarWhatsAppAdmin('No hay propuestas pendientes esta semana. El radar corre los lunes 7am.');
    return Response.json({ ok: true, action: 'no_proposals' });
  }

  let propuestas: TemaPropuesto[];
  try {
    propuestas = typeof raw === 'string' ? JSON.parse(raw) : raw as TemaPropuesto[];
  } catch {
    return Response.json({ error: 'Invalid proposals data' }, { status: 500 });
  }

  const seleccion = parsearSeleccion(texto);
  if (!seleccion) {
    await enviarWhatsAppAdmin(
      'No entendí la selección. Respondé con 2 números del 1 al 5 (ej: "1,3" o "2 y 5").',
    );
    return Response.json({ ok: true, action: 'invalid_input' });
  }

  // Guardar temas aprobados
  const aprobados = seleccion.map(i => propuestas[i]).filter(Boolean);

  if (aprobados.length === 0) {
    await enviarWhatsAppAdmin('Los números elegidos no corresponden a ninguna propuesta. Intentá de nuevo.');
    return Response.json({ ok: true, action: 'invalid_numbers' });
  }

  // Guardar aprobados en Redis para que el writer los levante
  await redis.set(BLOG_REDIS_KEYS.temasAprobados, JSON.stringify(aprobados), {
    ex: TTL.pendienteAprobacion,
  });

  // Agregar a temas usados (para dedupe futuro)
  const usadosRaw = await redis.get<string[]>(BLOG_REDIS_KEYS.temasUsados);
  const usados = usadosRaw ?? [];
  usados.push(...aprobados.map(a => a.titulo));
  // Mantener últimos 90 días (aprox 26 temas)
  await redis.set(BLOG_REDIS_KEYS.temasUsados, usados.slice(-30));

  // Confirmar por WhatsApp
  const confirmacion = aprobados
    .map((a, i) => `${i + 1}. ${a.titulo}`)
    .join('\n');

  await enviarWhatsAppAdmin(
    `✅ Temas aprobados:\n\n${confirmacion}\n\nSe publican martes y viernes 8am.`,
  );

  return Response.json({
    ok: true,
    action: 'approved',
    temas: aprobados.map(a => a.titulo),
  });
}
