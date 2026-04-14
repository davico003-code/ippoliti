import type { TemaPropuesto } from '../types';

const STOP_WORDS_ES = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al',
  'en', 'con', 'por', 'para', 'que', 'es', 'se', 'su', 'como', 'más', 'mas',
  'ya', 'o', 'y', 'a', 'e', 'no', 'si', 'lo', 'le', 'les', 'ni', 'muy',
  'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'pero',
  'sin', 'sobre', 'entre', 'hasta', 'desde', 'cada', 'todo', 'toda',
  'hay', 'ser', 'son', 'fue', 'han', 'ha', 'tiene', 'puede',
]);

function normalizar(texto: string): Set<string> {
  const limpio = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^a-z0-9\s]/g, '')     // solo alfanumérico
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS_ES.has(t));

  return new Set(limpio);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let interseccion = 0;
  a.forEach(token => {
    if (b.has(token)) interseccion++;
  });
  const union = a.size + b.size - interseccion;
  return union === 0 ? 0 : interseccion / union;
}

const UMBRAL_SIMILITUD = 0.6;

export function filtrarTemasUsados(
  propuestas: TemaPropuesto[],
  usados: string[],
): TemaPropuesto[] {
  const tokensUsados = usados.map(normalizar);

  return propuestas.filter(p => {
    const tokensPropuesta = normalizar(p.titulo);
    for (const tokensUsado of tokensUsados) {
      if (jaccard(tokensPropuesta, tokensUsado) >= UMBRAL_SIMILITUD) {
        return false;
      }
    }
    return true;
  });
}
