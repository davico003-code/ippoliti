// Carga masiva de notas de la biblioteca SI (20 briefs en src/data/notas-biblioteca.ts).
//
//   Dry-run (no escribe nada, no llama a la API):
//     npx tsx scripts/carga-masiva-notas.ts
//   Ejecución real:
//     npx tsx scripts/carga-masiva-notas.ts --publicar
//   Limitar a un grupo:
//     npx tsx scripts/carga-masiva-notas.ts --publicar --solo-grupo=A
//
// Requiere .env.production:
//   vercel env pull .env.production --environment=production
//
// Reutiliza las mismas piezas del cron writer: llamarClaude (generación),
// buildSystemPrompt (voz editorial + formato JSON), publicarNota (Blob+Redis+
// revalidate), getAllExistingSlugs (dedup) y la rotación blog:ultimos_ctas.
// La imagen se aplica con el mismo override que usa /admin/notas
// (hash Redis blog:image_override), para que el hash por slug no la pise.

import { config as loadEnv } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

loadEnv({ path: '.env.production' });

// ─── Flags ───────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const PUBLICAR = argv.includes('--publicar');
const soloGrupoArg = argv.find(a => a.startsWith('--solo-grupo='));
const SOLO_GRUPO = soloGrupoArg ? soloGrupoArg.split('=')[1].toUpperCase() : null;

if (SOLO_GRUPO && !['A', 'B', 'C'].includes(SOLO_GRUPO)) {
  console.error(`--solo-grupo inválido: "${SOLO_GRUPO}" (debe ser A, B o C)`);
  process.exit(1);
}

// ─── Env (validar con ||, nunca ??: cazar strings vacíos) ────────────────────

function envFaltantes(keys: string[]): string[] {
  return keys.filter(k => !(process.env[k] || '').trim());
}

const ENV_BASE = ['KV_REST_API_URL', 'KV_REST_API_TOKEN', 'BLOG_READ_WRITE_TOKEN'];
const ENV_REAL = ['ANTHROPIC_API_KEY'];

// ─── Tipos y constantes ──────────────────────────────────────────────────────

type Estado = 'OK' | 'OK (dry)' | 'YA EXISTE' | 'COLISIÓN' | 'ERROR';

interface Fila {
  slug: string;
  titulo: string;
  categoria: string;
  imagen: string;
  fecha: string;
  estado: Estado;
  detalle?: string;
}

type CtaBaseId = 'web' | 'instagram' | 'whatsapp';

interface NotaGenerada {
  titulo: string;
  slug: string;
  meta_description: string;
  bajada: string;
  contenido_markdown: string;
  keywords: string[];
  categoria: string;
  imagen_sugerida: string;
  cta_usado: string;
}

// Variantes de CTA por tipo sugerido. El pool del cron tiene un solo texto por
// id (web/instagram/whatsapp); los briefs piden 4 tipos con variación entre
// notas, así que acá hay 2 variantes por tipo usando ÚNICAMENTE los links que
// el writer ya usa (siinmobiliaria.com, @inmobiliaria.si, WhatsApp +54 341
// 210-1694). En blog:ultimos_ctas se registra el id base para no romper la
// rotación del cron.
const CTA_VARIANTES: Record<string, { base: CtaBaseId; textos: string[] }> = {
  instagram: {
    base: 'instagram',
    textos: [
      'Para análisis regulares del mercado inmobiliario en el oeste del Gran Rosario, seguinos en Instagram @inmobiliaria.si.',
      'Si querés más ideas, datos y novedades del mercado de Funes y Roldán, seguinos en Instagram @inmobiliaria.si.',
    ],
  },
  vender: {
    base: 'web',
    textos: [
      '¿Pensás vender? En SI Inmobiliaria tasamos tu propiedad con criterio y datos reales de la zona: entrá a siinmobiliaria.com y consultanos.',
      'Si estás evaluando vender tu casa, pedí una tasación profesional en siinmobiliaria.com: conocemos el valor real de cada barrio de Funes y Roldán.',
    ],
  },
  comprar: {
    base: 'web',
    textos: [
      'Si estás buscando casa o lote en Funes y Roldán, entrá a siinmobiliaria.com y mirá las propiedades disponibles.',
      'En siinmobiliaria.com tenés todas nuestras propiedades y lotes en Funes y Roldán para empezar la búsqueda.',
    ],
  },
  contacto: {
    base: 'whatsapp',
    textos: [
      'En SI Inmobiliaria trabajamos todos los días con personas evaluando cómo invertir mejor su capital. Consultanos por WhatsApp al +54 341 210-1694 o visitá siinmobiliaria.com.',
      '¿Dudas sobre tu caso puntual? Escribinos por WhatsApp al +54 341 210-1694 y lo vemos juntos, sin compromiso.',
    ],
  },
};

// Cifras siempre permitidas además de las de cada brief: matrícula, fundación,
// año en curso y el teléfono de los CTAs.
const CIFRAS_WHITELIST = ['0621', '1983', '2026', '54', '341', '210', '1694'];

const PAUSA_ENTRE_LLAMADAS_MS = 5000;
const HTML_PELIGROSO = /<\s*(script|iframe|object|embed|form|input)\b/i;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function stripJsonFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

function contarPalabras(markdown: string): number {
  const limpio = markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/>\s*/gm, '')
    .replace(/[-*]\s+/gm, '')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .trim();
  return limpio.split(/\s+/).filter(w => w.length > 0).length;
}

function digitRuns(texto: string): string[] {
  return texto.match(/\d+/g) ?? [];
}

function normalizarEspacios(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

// ─── Manifest de imágenes ────────────────────────────────────────────────────

interface ImagenManifest {
  ruta: string;
  categoria: string;
  descripcion: string;
  tags: string[];
  uso_especial?: string;
}

function cargarManifest(): ImagenManifest[] {
  const raw = readFileSync(join(process.cwd(), 'public/images/blog/manifest.json'), 'utf-8');
  const data = JSON.parse(raw) as { imagenes: ImagenManifest[] };
  return data.imagenes.filter(i => i.uso_especial !== 'no_portada_blog');
}

// Cadena de fallback por tag: las carpetas construccion/ e inversion/ están
// vacías y la única imagen de generales/ no puede ser portada, así que esas
// notas caen a los pools que sí tienen fotos. Visible en la tabla del dry-run.
const FALLBACK_TAGS: Record<string, string[]> = {
  'funes-y-roldan': ['funes-y-roldan'],
  'mercado-rosario': ['mercado-rosario', 'funes-y-roldan'],
  construccion: ['construccion', 'funes-y-roldan'],
  inversion: ['inversion', 'mercado-rosario', 'funes-y-roldan'],
  generales: ['generales', 'funes-y-roldan'],
};

// Asigna imagen a cada nota en orden de cronograma: la menos usada del pool
// efectivo, evitando repetir la foto de la nota inmediatamente anterior.
function asignarImagenes(
  notas: { slug: string; tagImagen: string; fechaOrden: string }[],
  manifest: ImagenManifest[],
): Map<string, { ruta: string; fallback: boolean }> {
  const usos = new Map<string, number>(manifest.map(i => [i.ruta, 0]));
  const asignacion = new Map<string, { ruta: string; fallback: boolean }>();
  let anterior: string | null = null;

  const ordenadas = [...notas].sort((a, b) => a.fechaOrden.localeCompare(b.fechaOrden));

  for (const nota of ordenadas) {
    const cadena = FALLBACK_TAGS[nota.tagImagen] ?? [nota.tagImagen];
    let pool: ImagenManifest[] = [];
    let fallback = false;
    for (const tag of cadena) {
      pool = manifest.filter(i => i.categoria === tag);
      if (pool.length > 0) {
        fallback = tag !== nota.tagImagen;
        break;
      }
    }
    if (pool.length === 0) {
      pool = manifest; // último recurso: cualquier imagen del manifest
      fallback = true;
    }

    const candidatas = [...pool].sort(
      (a, b) => (usos.get(a.ruta) ?? 0) - (usos.get(b.ruta) ?? 0),
    );
    const elegida =
      candidatas.find(c => c.ruta !== anterior) ?? candidatas[0];

    usos.set(elegida.ruta, (usos.get(elegida.ruta) ?? 0) + 1);
    asignacion.set(nota.slug, { ruta: elegida.ruta, fallback });
    anterior = elegida.ruta;
  }

  return asignacion;
}

// ─── Validación (reglas de la Fase 2 del plan) ───────────────────────────────

function validarNota(
  nota: { contenido_markdown: string; meta_description: string; bajada: string },
  brief: { datos: string[]; titulo: string; estructura: string[]; anguloLocal: string; keyword: string },
  ctaTexto: string,
): string[] {
  const errores: string[] = [];
  const contenido = nota.contenido_markdown || '';

  const palabras = contarPalabras(contenido);
  if (palabras < 700 || palabras > 1300) {
    errores.push(`largo fuera de rango: ${palabras} palabras (esperado 700-1300)`);
  }

  const h2 = (contenido.match(/^## /gm) || []).length;
  if (h2 < 4) {
    errores.push(`estructura insuficiente: ${h2} H2 (mínimo 4)`);
  }

  if (!/funes|roldán|roldan/i.test(contenido)) {
    errores.push('no menciona Funes ni Roldán');
  }

  if (/corredor oeste/i.test(contenido)) {
    errores.push('contiene "corredor oeste" (prohibido: usar "Funes y Roldán")');
  }

  if (!(nota.meta_description || '').trim()) {
    errores.push('meta_description vacía');
  } else if (nota.meta_description.length > 160) {
    errores.push(`meta_description excede 160 chars (tiene ${nota.meta_description.length})`);
  }

  // Cifras: todo número del texto debe existir en los datos fuente del brief
  // (o en la whitelist fija). Comparación por corridas de dígitos.
  const permitidas = new Set([
    ...digitRuns(
      [
        ...brief.datos,
        brief.titulo,
        ...brief.estructura,
        brief.anguloLocal,
        brief.keyword,
        ctaTexto,
      ].join(' '),
    ),
    ...CIFRAS_WHITELIST,
  ]);
  const sospechosas = Array.from(
    new Set(
      digitRuns([contenido, nota.meta_description, nota.bajada].join(' ')).filter(
        n => !permitidas.has(n),
      ),
    ),
  );
  if (sospechosas.length > 0) {
    errores.push(
      `cifras que no están en los datos fuente: ${sospechosas.join(', ')} — sacalas o reemplazalas por lo cualitativo`,
    );
  }

  if (!normalizarEspacios(contenido).includes(normalizarEspacios(ctaTexto))) {
    errores.push('falta el CTA copiado textual al final (antes de la firma)');
  }

  if (!contenido.slice(-600).toLowerCase().includes('david flores')) {
    errores.push('falta la firma de David Flores al final');
  }

  if (HTML_PELIGROSO.test(contenido)) {
    errores.push('contenido contiene HTML peligroso (script/iframe/etc.)');
  }

  return errores;
}

// ─── Prompt de generación (plantilla del plan) ───────────────────────────────

function buildPromptCarga(
  brief: {
    titulo: string;
    keyword: string;
    estructura: string[];
    datos: string[];
    anguloLocal: string;
  },
  ctaTexto: string,
  feedback?: string,
): string {
  const base = `Sos el redactor del blog de SI Inmobiliaria, inmobiliaria familiar fundada en 1983 en Funes,
zona de Funes y Roldán (Gran Rosario). Escribí una nota original y completa para el blog.

TÍTULO: ${brief.titulo}
KEYWORD PRINCIPAL: ${brief.keyword} (usala natural en el primer párrafo y en al menos un subtítulo)
ESTRUCTURA SUGERIDA (H2):
${brief.estructura.map(h => `- ${h}`).join('\n')}
ÁNGULO LOCAL OBLIGATORIO: ${brief.anguloLocal}

DATOS FUENTE — única fuente permitida de cifras, ejemplos y afirmaciones técnicas:
${brief.datos.map(d => `- ${d}`).join('\n')}

REGLAS:
- 800 a 1200 palabras. Español rioplatense (vos), tono cercano, claro y profesional. Nada de relleno.
- Reescribí todo con palabras propias: contenido 100% original, apto SEO, sin copiar frases de ninguna fuente.
- Usá TODOS los datos fuente que puedas integrar con naturalidad. NO inventes cifras, porcentajes,
  precios ni normativas que no estén en los datos fuente. Si te falta un dato, quedate en lo cualitativo.
- Mínimo 4 subtítulos H2 (##).
- Siempre "Funes y Roldán". NUNCA "corredor oeste". Nada de política, instituciones, marcas comerciales
  ni nombres de personas. No inventes links internos a otras notas.
- Al menos un párrafo aplica el tema a la vida real de la zona (casas con parque, barrios, lotes,
  quinchos, clima local) usando el ángulo local.
- Incluí una meta descripción de máximo 160 caracteres.
- Cerrá con este CTA, copiado TEXTUAL como cierre único, justo antes de la firma: "${ctaTexto}"
- Formato de salida: SOLO el JSON con el shape de NotaDraft definido en el sistema. Sin markdown fences, sin texto adicional.`;

  if (feedback) {
    return `IMPORTANTE: el draft anterior fue rechazado por estos problemas. Corregí ESPECÍFICAMENTE cada uno:
${feedback}

${base}`;
  }
  return base;
}

// ─── Tabla de salida ─────────────────────────────────────────────────────────

function imprimirTabla(filas: Fila[]): void {
  const trunc = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
  const cols = [
    { h: 'slug', w: 52, v: (f: Fila) => f.slug },
    { h: 'título', w: 44, v: (f: Fila) => trunc(f.titulo, 44) },
    { h: 'categoría', w: 14, v: (f: Fila) => f.categoria },
    { h: 'imagen', w: 42, v: (f: Fila) => f.imagen },
    { h: 'fecha publicación', w: 25, v: (f: Fila) => f.fecha },
    { h: 'estado', w: 10, v: (f: Fila) => f.estado },
  ];
  const sep = cols.map(c => '─'.repeat(c.w)).join('─┼─');
  console.log(`\n${cols.map(c => c.h.padEnd(c.w)).join(' │ ')}`);
  console.log(sep);
  for (const f of filas) {
    console.log(cols.map(c => c.v(f).padEnd(c.w)).join(' │ '));
    if (f.detalle) console.log(`    ↳ ${f.detalle}`);
  }

  const totales = new Map<Estado, number>();
  for (const f of filas) totales.set(f.estado, (totales.get(f.estado) ?? 0) + 1);
  console.log(
    `\nTotales: ${filas.length} notas — ${Array.from(totales.entries())
      .map(([e, n]) => `${e}: ${n}`)
      .join(' · ')}`,
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const faltantes = envFaltantes(PUBLICAR ? [...ENV_BASE, ...ENV_REAL] : ENV_BASE);
  if (faltantes.length > 0) {
    console.error(
      `Faltan env vars: ${faltantes.join(', ')}.\n` +
        'Corré: vercel env pull .env.production --environment=production',
    );
    process.exit(1);
  }

  // Imports dinámicos DESPUÉS de cargar el env (src/lib/redis instancia el
  // cliente al importar el módulo).
  const { NOTAS_BIBLIOTECA } = await import('../src/data/notas-biblioteca');
  const { getAllExistingSlugs } = await import('../src/lib/blog-posts-dinamicos');
  const { Redis } = await import('@upstash/redis');
  const { BLOG_REDIS_KEYS } = await import('../src/agents/blog/lib/redis-keys');

  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  const lote = SOLO_GRUPO
    ? NOTAS_BIBLIOTECA.filter(n => n.grupo === SOLO_GRUPO)
    : NOTAS_BIBLIOTECA;

  console.log(
    `Carga masiva — ${PUBLICAR ? 'MODO REAL (--publicar)' : 'DRY-RUN (no escribe nada)'}` +
      `${SOLO_GRUPO ? ` — solo grupo ${SOLO_GRUPO}` : ''} — ${lote.length} notas`,
  );

  // 1. Slugs existentes (dedup) + colisiones internas del lote
  const existentes = await getAllExistingSlugs();
  console.log(`Slugs existentes en el blog: ${existentes.size}`);

  const vistosEnLote = new Set<string>();

  // 2. Asignación de imágenes (determinística, igual en dry-run y real)
  const manifest = cargarManifest();
  const ahoraIso = new Date().toISOString();
  const imagenes = asignarImagenes(
    lote.map(n => ({
      slug: n.slug,
      tagImagen: n.tagImagen,
      fechaOrden: n.fechaPublicacion === 'AHORA' ? ahoraIso : n.fechaPublicacion,
    })),
    manifest,
  );

  // 3. Estado de rotación de CTAs
  const ultimosCTAsRaw = await redis.get<string[]>(BLOG_REDIS_KEYS.ultimosCTAs);
  const ultimosCTAs = ultimosCTAsRaw ?? [];
  const ultimoTextoPorTipo = new Map<string, string>();

  const filas: Fila[] = [];

  for (const brief of lote) {
    const img = imagenes.get(brief.slug)!;
    const imagenLabel = `${img.ruta.split('/').pop()}${img.fallback ? ' (fallback)' : ''}`;
    const fechaLabel =
      brief.fechaPublicacion === 'AHORA' ? `AHORA (${ahoraIso.slice(0, 10)})` : brief.fechaPublicacion;

    const fila: Fila = {
      slug: brief.slug,
      titulo: brief.titulo,
      categoria: brief.categoria,
      imagen: imagenLabel,
      fecha: fechaLabel,
      estado: PUBLICAR ? 'OK' : 'OK (dry)',
    };
    filas.push(fila);

    // Colisión interna del lote
    if (vistosEnLote.has(brief.slug)) {
      fila.estado = 'COLISIÓN';
      fila.detalle = 'slug repetido dentro del lote';
      continue;
    }
    vistosEnLote.add(brief.slug);

    // Dedup contra lo publicado (hace al script re-ejecutable)
    if (existentes.has(brief.slug)) {
      fila.estado = 'YA EXISTE';
      continue;
    }

    // CTA: variante del tipo sugerido que no repita la última usada del tipo
    const variantes = CTA_VARIANTES[brief.ctaSugerido];
    const ultimoTexto = ultimoTextoPorTipo.get(brief.ctaSugerido);
    const ctaTexto =
      variantes.textos.find(t => t !== ultimoTexto) ?? variantes.textos[0];
    ultimoTextoPorTipo.set(brief.ctaSugerido, ctaTexto);

    if (!PUBLICAR) continue; // dry-run: solo simular asignaciones y dedup

    // ── MODO REAL ──
    try {
      const { llamarClaude } = await import('../src/agents/blog/lib/claude-client');
      const { buildSystemPrompt } = await import('../src/agents/blog/writer/prompts');
      const { TEMAS_PROHIBIDOS } = await import('../src/agents/blog/config/taboos');
      const { publicarNota } = await import('../src/agents/blog/writer/publicador');

      // La nota de tokenización está pedida explícitamente por el brief:
      // se excluye el tabú crypto SOLO para ella.
      const esTokenizacion = brief.slug.startsWith('tokenizacion');
      const taboos = esTokenizacion
        ? TEMAS_PROHIBIDOS.filter(t => !/crypto/i.test(t))
        : TEMAS_PROHIBIDOS;
      const systemPrompt = buildSystemPrompt(taboos);

      let nota: NotaGenerada | null = null;
      let errores: string[] = [];

      // 1 intento + 1 reintento con feedback
      for (let intento = 1; intento <= 2 && !nota; intento++) {
        const feedback =
          intento > 1 ? errores.map((e, i) => `${i + 1}. ${e}`).join('\n') : undefined;
        const userPrompt = buildPromptCarga(brief, ctaTexto, feedback);

        console.log(`\n[${brief.slug}] intento ${intento}/2 — generando…`);
        const { texto, inputTokens, outputTokens } = await llamarClaude(
          systemPrompt,
          userPrompt,
          6000,
        );
        console.log(`[${brief.slug}] in=${inputTokens} out=${outputTokens}`);

        let draft: NotaGenerada;
        try {
          draft = JSON.parse(stripJsonFences(texto)) as NotaGenerada;
        } catch (err) {
          errores = [`JSON inválido: ${err instanceof Error ? err.message : String(err)}`];
          console.warn(`[${brief.slug}] intento ${intento}: JSON parse error`);
          await sleep(PAUSA_ENTRE_LLAMADAS_MS);
          continue;
        }

        errores = validarNota(draft!, brief, ctaTexto);
        if (errores.length === 0) {
          nota = draft;
        } else {
          console.warn(`[${brief.slug}] intento ${intento}: RECHAZADO →\n  - ${errores.join('\n  - ')}`);
          await sleep(PAUSA_ENTRE_LLAMADAS_MS);
        }
      }

      if (!nota) {
        fila.estado = 'ERROR';
        fila.detalle = `validación falló 2 veces: ${errores.join(' | ')}`;
        continue;
      }

      // Campos deterministas: el brief manda sobre lo que devuelva el modelo.
      nota.titulo = brief.titulo;
      nota.slug = brief.slug;
      nota.categoria = brief.categoria;
      nota.cta_usado = variantes.base;

      // Override de imagen ANTES de publicar, así el revalidate del publicador
      // ya encuentra la imagen correcta (mismo mecanismo que /admin/notas).
      await redis.hset('blog:image_override', { [brief.slug]: img.ruta });

      const fechaProgramada =
        brief.fechaPublicacion === 'AHORA' ? undefined : brief.fechaPublicacion;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const publicada = await publicarNota(nota as any, fechaProgramada);
      console.log(`[${brief.slug}] publicada → ${publicada.url_completa} (fecha: ${publicada.fecha_publicacion})`);

      // Registrar CTA en la rotación como hace el cron (id base, últimos 4)
      ultimosCTAs.push(variantes.base);
      await redis.set(BLOG_REDIS_KEYS.ultimosCTAs, ultimosCTAs.slice(-4));

      fila.estado = 'OK';
      await sleep(PAUSA_ENTRE_LLAMADAS_MS);
    } catch (err) {
      fila.estado = 'ERROR';
      fila.detalle = err instanceof Error ? err.message : String(err);
      console.error(`[${brief.slug}] ERROR:`, fila.detalle);
    }
  }

  imprimirTabla(filas);

  if (!PUBLICAR) {
    console.log(
      '\nDry-run terminado: no se escribió nada ni se llamó a la API.\n' +
        'Para ejecutar en serio: npx tsx scripts/carga-masiva-notas.ts --publicar',
    );
  } else {
    const conError = filas.filter(f => f.estado === 'ERROR');
    if (conError.length > 0) {
      console.log(
        `\n${conError.length} notas en ERROR. Re-corré el script: el dedup saltea las ya creadas y reintenta solo las faltantes.`,
      );
    }
  }
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
