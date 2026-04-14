import type { Titular } from './scraper';
import type { Fuente } from '../config/sources';
import { TEMAS_PROHIBIDOS } from '../config/taboos';

const KEYWORDS_LOCALES = [
  'funes', 'roldán', 'roldan', 'rosario', 'gran rosario',
];

const KEYWORDS_INMOBILIARIAS = [
  'inmobiliario', 'inmobiliaria', 'propiedades', 'propiedad',
  'alquileres', 'alquiler', 'venta', 'metro cuadrado', 'm2', 'm²',
  'construcción', 'construccion', 'hipoteca', 'crédito uva', 'credito uva',
  'barrio cerrado', 'country', 'loteo', 'desarrollo', 'terreno', 'terrenos',
  'departamento', 'casa', 'vivienda',
];

const KEYWORDS_ECONOMICAS = [
  'dólar', 'dolar', 'blanqueo', 'inflación', 'inflacion',
  'bcra', 'tasas', 'cepo', 'devaluación', 'devaluacion',
];

function contieneAlguno(texto: string, keywords: string[]): boolean {
  const lower = texto.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

function chocaConTaboos(texto: string): boolean {
  const lower = texto.toLowerCase();
  for (const taboo of TEMAS_PROHIBIDOS) {
    // Extraer nombres propios y keywords clave del taboo
    const parens = taboo.match(/\(([^)]+)\)/);
    if (parens) {
      const nombres = parens[1].split(',').map(n => n.trim().toLowerCase());
      if (nombres.some(n => n.length > 3 && lower.includes(n))) return true;
    }
    // Check for crypto keywords
    for (const kw of ['crypto', 'blockchain', 'tokenización', 'tokenizacion', 'nft', 'stablecoin']) {
      if (lower.includes(kw)) return true;
    }
  }
  return false;
}

export function puntuarTitular(titular: Titular, fuente: Fuente): number {
  const texto = `${titular.titulo} ${titular.resumen ?? ''}`;

  let score = fuente.weight;

  if (contieneAlguno(texto, KEYWORDS_LOCALES)) score += 0.5;
  if (contieneAlguno(texto, KEYWORDS_INMOBILIARIAS)) score += 0.3;
  if (contieneAlguno(texto, KEYWORDS_ECONOMICAS)) score += 0.2;
  if (chocaConTaboos(texto)) score -= 1.0;

  return score;
}
