import type { NotaDraft, CategoriaNota } from '../types';

export interface ValidacionResultado {
  ok: boolean;
  errores: string[];
}

const CATEGORIAS_VALIDAS: CategoriaNota[] = [
  'mercado', 'inversion', 'guias', 'barrios', 'coyuntura',
];

const POLITICOS = [
  'milei', 'kicillof', 'massa', 'macri', 'bullrich', 'villarruel', 'caputo',
];

const CRYPTO = [
  'crypto', 'blockchain', 'tokenización', 'tokenizacion', 'nft', 'stablecoin',
];

const COMPETIDORES = [
  'vanzini', 'crestale', 'squadra', 'squaddra', 'skygarden',
  'altos de funes', 'funes inmobiliaria', 're/max', 'remax', 'eigen',
];

const CLICHES = [
  'en un mundo cambiante',
  'en un mercado cambiante',
  'es importante destacar',
  'cabe mencionar',
  'sin lugar a dudas',
  'oportunidad única',
  'oportunidad unica',
  'imperdible',
  'no te lo pierdas',
];

const HTML_PELIGROSO = /<\s*(script|iframe|object|embed|form|input)\b/i;

function contarPalabras(markdown: string): number {
  // Quitar markdown syntax para contar solo palabras reales
  const limpio = markdown
    .replace(/^#{1,6}\s+/gm, '')   // headers
    .replace(/>\s*/gm, '')          // blockquotes
    .replace(/[-*]\s+/gm, '')       // list items
    .replace(/\*\*|__|\*|_/g, '')   // bold/italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')    // images
    .trim();

  return limpio.split(/\s+/).filter(w => w.length > 0).length;
}

function esKebabCase(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

export function validarNotaDraft(nota: NotaDraft): ValidacionResultado {
  const errores: string[] = [];
  const contenidoLower = nota.contenido_markdown.toLowerCase();

  // ── Campos obligatorios ──
  if (!nota.titulo || nota.titulo.trim().length === 0) {
    errores.push('titulo está vacío');
  } else if (nota.titulo.length > 90) {
    errores.push(`titulo excede 90 chars (tiene ${nota.titulo.length})`);
  }

  if (!nota.slug || nota.slug.trim().length === 0) {
    errores.push('slug está vacío');
  } else if (!esKebabCase(nota.slug)) {
    errores.push(`slug no es kebab-case ASCII: "${nota.slug}"`);
  }

  if (!nota.meta_description || nota.meta_description.trim().length === 0) {
    errores.push('meta_description está vacío');
  } else if (nota.meta_description.length < 120 || nota.meta_description.length > 160) {
    errores.push(`meta_description debe tener 120-160 chars (tiene ${nota.meta_description.length})`);
  }

  if (!nota.bajada || nota.bajada.trim().length === 0) {
    errores.push('bajada está vacía');
  } else if (nota.bajada.length < 80 || nota.bajada.length > 200) {
    errores.push(`bajada debe tener 80-200 chars (tiene ${nota.bajada.length})`);
  }

  if (!nota.contenido_markdown || nota.contenido_markdown.trim().length === 0) {
    errores.push('contenido_markdown está vacío');
  }

  if (!nota.keywords || !Array.isArray(nota.keywords) || nota.keywords.length === 0) {
    errores.push('keywords está vacío o no es un array');
  }

  if (!nota.categoria || !CATEGORIAS_VALIDAS.includes(nota.categoria)) {
    errores.push(`categoria inválida: "${nota.categoria}". Debe ser una de: ${CATEGORIAS_VALIDAS.join(', ')}`);
  }

  if (!nota.imagen_sugerida || nota.imagen_sugerida.trim().length === 0) {
    errores.push('imagen_sugerida está vacía');
  }

  if (!nota.cta_usado) {
    errores.push('cta_usado está vacío');
  }

  // ── Largo ──
  if (nota.contenido_markdown) {
    const palabras = contarPalabras(nota.contenido_markdown);
    if (palabras < 700) {
      errores.push(`contenido muy corto: ${palabras} palabras (mínimo 700)`);
    } else if (palabras > 1400) {
      errores.push(`contenido muy largo: ${palabras} palabras (máximo 1400)`);
    }
  }

  // ── Tabúes ──
  for (const politico of POLITICOS) {
    if (contenidoLower.includes(politico)) {
      errores.push(`mención de político prohibido: "${politico}"`);
    }
  }
  for (const crypto of CRYPTO) {
    if (contenidoLower.includes(crypto)) {
      errores.push(`mención de tema crypto prohibido: "${crypto}"`);
    }
  }
  for (const comp of COMPETIDORES) {
    if (contenidoLower.includes(comp)) {
      errores.push(`mención de competidor prohibido: "${comp}"`);
    }
  }

  // ── Clichés ──
  for (const cliche of CLICHES) {
    if (contenidoLower.includes(cliche)) {
      errores.push(`cliché prohibido encontrado: "${cliche}"`);
    }
  }

  // ── Estructura (mínimo 2 H2) ──
  if (nota.contenido_markdown) {
    const h2Count = (nota.contenido_markdown.match(/^## /gm) || []).length;
    if (h2Count < 2) {
      errores.push(`estructura insuficiente: ${h2Count} subtítulos H2 (mínimo 2)`);
    }
  }

  // ── Firma ──
  if (nota.contenido_markdown) {
    const ultimas200 = nota.contenido_markdown.slice(-600).toLowerCase();
    if (!ultimas200.includes('david flores')) {
      errores.push('falta firma de "David Flores" al final del contenido');
    }
  }

  // ── HTML peligroso ──
  if (HTML_PELIGROSO.test(nota.contenido_markdown)) {
    errores.push('contenido contiene HTML potencialmente peligroso (script, iframe, etc.)');
  }

  return { ok: errores.length === 0, errores };
}

export function generarSlugUnico(
  slugBase: string,
  slugsExistentes: Set<string>,
): string {
  if (!slugsExistentes.has(slugBase)) return slugBase;

  let i = 2;
  while (slugsExistentes.has(`${slugBase}-${i}`)) {
    i++;
  }
  return `${slugBase}-${i}`;
}
