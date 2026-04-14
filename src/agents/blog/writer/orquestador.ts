import { Redis } from '@upstash/redis';
import { BLOG_REDIS_KEYS } from '../lib/redis-keys';
import { seleccionarCTA } from '../config/ctas';
import { obtenerContextoEconomico } from '../lib/datos-economicos';
import { enviarWhatsAppAdmin } from '../lib/whatsapp';
import { generarNotaConRetries } from './generar-nota';
import { publicarNota } from './publicador';
import type { TemaPropuesto } from '../types';

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

function contarPalabras(markdown: string): number {
  return markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/>\s*/gm, '')
    .replace(/[-*]\s+/gm, '')
    .replace(/\*\*|__|\*|_/g, '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0).length;
}

interface WriterResult {
  ok: boolean;
  notaUrl?: string;
  error?: string;
}

export async function ejecutarWriterDia(
  dia: 'martes' | 'viernes',
): Promise<WriterResult> {
  const redis = getRedis();

  // 1. Leer temas aprobados
  const raw = await redis.get<string>(BLOG_REDIS_KEYS.temasAprobados);

  let aprobados: TemaPropuesto[];
  try {
    aprobados = raw
      ? (typeof raw === 'string' ? JSON.parse(raw) : raw) as TemaPropuesto[]
      : [];
  } catch {
    aprobados = [];
  }

  if (aprobados.length < 1 || (dia === 'viernes' && aprobados.length < 2)) {
    await enviarWhatsAppAdmin(
      `⚠️ No hay temas aprobados para ${dia}. Revisá la aprobación del lunes (respondé al radar con 2 números).`,
    );
    return { ok: false, error: 'sin-temas' };
  }

  // 2. Elegir tema según el día
  const tema = dia === 'martes' ? aprobados[0] : aprobados[1];

  // 3. Elegir CTA (rotar)
  const ultimosCTAsRaw = await redis.get<string[]>(BLOG_REDIS_KEYS.ultimosCTAs);
  const ultimosCTAs = ultimosCTAsRaw ?? [];
  const cta = seleccionarCTA(ultimosCTAs);

  // 4. Contexto económico
  await obtenerContextoEconomico(); // para log; el writer lo obtiene internamente también

  // 5. Generar nota con retries
  console.log(`[orquestador] ${dia}: generando nota para "${tema.titulo}" con CTA "${cta.id}"`);
  const resultado = await generarNotaConRetries(tema, cta);

  if (!resultado.ok) {
    const razonesTxt = resultado.razones.map((r, i) => `${i + 1}. ${r}`).join('\n');
    const tituloFallido = resultado.ultimoDraft?.titulo ?? tema.titulo;

    await enviarWhatsAppAdmin(
      `❌ El writer falló para "${tituloFallido}" (${dia}).\n\nRazones:\n${razonesTxt}\n\nEditá manualmente y publicá vos.`,
    );
    return { ok: false, error: 'draft-invalido' };
  }

  // 6. Publicar
  console.log(`[orquestador] Publicando "${resultado.nota.titulo}"`);
  const publicada = await publicarNota(resultado.nota);

  // 7. Actualizar últimos CTAs
  ultimosCTAs.push(resultado.nota.cta_usado);
  await redis.set(BLOG_REDIS_KEYS.ultimosCTAs, ultimosCTAs.slice(-4));

  // 8. Notificar por WhatsApp
  const palabras = contarPalabras(resultado.nota.contenido_markdown);
  await enviarWhatsAppAdmin(
    `✅ Publicada: ${publicada.titulo}\nLink: ${publicada.url_completa}\nCTA: ${publicada.cta_usado}\nPalabras: ${palabras}`,
  );

  return { ok: true, notaUrl: publicada.url_completa };
}
