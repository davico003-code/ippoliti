// Diagnóstico del pipeline de blog (radar + writer + WhatsApp).
// Ejecutar: npx tsx scripts/diagnostico-blog.ts
//
// NO modifica datos. Solo lee Redis, Blob, y reporta presencia de env vars.

import 'dotenv/config';
import { Redis } from '@upstash/redis';
import { list } from '@vercel/blob';

const ENV_FILE = '.env.local';
// dotenv carga .env por default; cargar también .env.local explícitamente
import { config as loadEnv } from 'dotenv';
loadEnv({ path: ENV_FILE });

const KEYS = {
  temasSemana: 'blog:temas_semana',
  temasAprobados: 'blog:temas_aprobados',
  temasUsados: 'blog:temas_usados',
  ultimosCTAs: 'blog:ultimos_ctas',
  contadorRevisadas: 'blog:contador_revisadas',
  publicadaPattern: 'blog:publicada:*',
};

const REQUIRED_ENV = [
  'CRON_SECRET',
  'ANTHROPIC_API_KEY',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'BLOB_READ_WRITE_TOKEN',
  'UNSPLASH_ACCESS_KEY',
  'REVALIDATE_SECRET',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'ADMIN_WHATSAPP_NUMBER',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function header(t: string): void {
  console.log(`\n${'═'.repeat(70)}\n  ${t}\n${'═'.repeat(70)}`);
}

function fmtTtl(ttl: number): string {
  if (ttl < 0) return 'sin expiración';
  if (ttl === -2) return 'NO EXISTE';
  const h = Math.floor(ttl / 3600);
  const m = Math.floor((ttl % 3600) / 60);
  return `${h}h ${m}m (${ttl}s)`;
}

function getRedis(): Redis {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error('Faltan KV_REST_API_URL o KV_REST_API_TOKEN en .env.local');
  }
  return new Redis({ url, token });
}

function safeParse<T>(raw: unknown): T | string | null {
  if (raw == null) return null;
  if (typeof raw !== 'string') return raw as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw;
  }
}

// ─── 1. Env vars ────────────────────────────────────────────────────────────

function checkEnvVars(): void {
  header('1. VARIABLES DE ENTORNO (.env.local)');
  const ausentes: string[] = [];
  for (const name of REQUIRED_ENV) {
    const present = !!process.env[name] && process.env[name]!.length > 0;
    console.log(`  ${present ? '✓ PRESENTE' : '✗ AUSENTE '}  ${name}`);
    if (!present) ausentes.push(name);
  }
  if (ausentes.length > 0) {
    console.log(`\n  ⚠️  Faltantes: ${ausentes.join(', ')}`);
  }
}

// ─── 2. Redis ───────────────────────────────────────────────────────────────

async function checkRedis(): Promise<void> {
  header('2. REDIS (Upstash)');
  const redis = getRedis();

  // temas_semana
  console.log('\n● blog:temas_semana');
  const tsRaw = await redis.get(KEYS.temasSemana);
  const tsTtl = await redis.ttl(KEYS.temasSemana);
  console.log(`  TTL: ${fmtTtl(tsTtl)}`);
  if (tsRaw == null) {
    console.log('  Valor: NO EXISTE');
  } else {
    const parsed = safeParse<unknown[]>(tsRaw);
    if (Array.isArray(parsed)) {
      console.log(`  Valor: array de ${parsed.length} propuestas`);
      parsed.forEach((p, i) => {
        const t = (p as { titulo?: string }).titulo ?? '(sin titulo)';
        console.log(`    ${i + 1}. ${t}`);
      });
    } else {
      console.log(`  Valor (raw): ${String(tsRaw).slice(0, 200)}`);
    }
  }

  // temas_aprobados
  console.log('\n● blog:temas_aprobados');
  const taRaw = await redis.get(KEYS.temasAprobados);
  const taTtl = await redis.ttl(KEYS.temasAprobados);
  console.log(`  TTL: ${fmtTtl(taTtl)}`);
  if (taRaw == null) {
    console.log('  Valor: NO EXISTE  ← significa que no hubo respuesta del admin esta semana');
  } else {
    const parsed = safeParse<unknown[]>(taRaw);
    if (Array.isArray(parsed)) {
      console.log(`  Valor: array de ${parsed.length} aprobados`);
      parsed.forEach((p, i) => {
        const t = (p as { titulo?: string }).titulo ?? '(sin titulo)';
        console.log(`    ${i + 1}. ${t}`);
      });
    } else {
      console.log(`  Valor (raw): ${String(taRaw).slice(0, 200)}`);
    }
  }

  // temas_usados
  console.log('\n● blog:temas_usados');
  const tuRaw = await redis.get(KEYS.temasUsados);
  if (tuRaw == null) {
    console.log('  Valor: NO EXISTE');
  } else {
    const parsed = safeParse<unknown[]>(tuRaw);
    if (Array.isArray(parsed)) {
      console.log(`  Valor: ${parsed.length} temas acumulados`);
      const last = parsed.slice(-5);
      console.log(`  Últimos 5: ${last.map(x => `"${String(x).slice(0, 60)}"`).join(', ')}`);
    } else {
      console.log(`  Valor (raw): ${String(tuRaw).slice(0, 200)}`);
    }
  }

  // ultimos_ctas
  console.log('\n● blog:ultimos_ctas');
  const ctasRaw = await redis.get(KEYS.ultimosCTAs);
  if (ctasRaw == null) {
    console.log('  Valor: NO EXISTE');
  } else {
    const parsed = safeParse<unknown[]>(ctasRaw);
    console.log(`  Valor: ${JSON.stringify(parsed)}`);
  }

  // contador_revisadas
  console.log('\n● blog:contador_revisadas');
  const cRaw = await redis.get(KEYS.contadorRevisadas);
  console.log(`  Valor: ${cRaw == null ? 'NO EXISTE' : String(cRaw)}`);

  // blog:publicada:*
  console.log('\n● blog:publicada:* (notas indexadas en Redis)');
  let cursor: string | number = 0;
  const slugs: string[] = [];
  let safety = 50;
  do {
    const res = (await redis.scan(cursor, {
      match: KEYS.publicadaPattern,
      count: 100,
    })) as [string | number, string[]];
    cursor = res[0];
    slugs.push(...res[1]);
    if (--safety <= 0) break;
  } while (String(cursor) !== '0');

  console.log(`  Total: ${slugs.length} keys`);
  // Heurística: extraer fecha del slug si tiene formato YYYY-MM-DD
  const conFecha = slugs
    .map(k => {
      const slug = k.replace(/^blog:publicada:/, '');
      const m = slug.match(/(\d{4}-\d{2}-\d{2})/);
      return { key: k, slug, fecha: m?.[1] ?? null };
    })
    .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));
  console.log('  Últimos 10 (orden alfabético desc):');
  conFecha.slice(0, 10).forEach(x => {
    console.log(`    ${x.fecha ?? '?'.padEnd(10)}  ${x.slug}`);
  });
}

// ─── 3. Blob storage ────────────────────────────────────────────────────────

async function checkBlob(): Promise<void> {
  // El prefix real en publicador.ts es "blog-posts/" (no "blob-posts/").
  // El blog usa un store dedicado (BLOG_READ_WRITE_TOKEN); las placas
  // siguen en el store viejo (BLOB_READ_WRITE_TOKEN).
  header('3. BLOB STORAGE');

  const blogToken = process.env.BLOG_READ_WRITE_TOKEN;
  if (!blogToken) {
    console.log('  ✗ BLOG_READ_WRITE_TOKEN ausente — no puedo listar el store del blog.');
    return;
  }

  for (const prefix of ['blog-posts/', 'blob-posts/']) {
    console.log(`\n● prefix="${prefix}" (store blog)`);
    try {
      const res = await list({ prefix, limit: 50, token: blogToken });
      const blobs = [...res.blobs].sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      );
      console.log(`  Total: ${blobs.length}`);
      blobs.slice(0, 5).forEach(b => {
        console.log(`    ${b.uploadedAt}  ${b.pathname}  (${b.size} bytes)`);
      });
      if (blobs.length === 0) {
        console.log('  (vacío)');
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`\nDiagnóstico de pipeline blog — ${new Date().toISOString()}`);

  checkEnvVars();

  try {
    await checkRedis();
  } catch (e) {
    console.log(`\n  ✗ Redis: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    await checkBlob();
  } catch (e) {
    console.log(`\n  ✗ Blob: ${e instanceof Error ? e.message : String(e)}`);
  }

  console.log('\n');
}

main().catch(e => {
  console.error('Error fatal:', e);
  process.exit(1);
});
