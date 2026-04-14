import type { TemaPropuesto } from '../types';

const TIPO_EMOJI: Record<string, string> = {
  coyuntura: '🔥',
  comparacion: '⚖️',
  guia: '📋',
  zoom_barrio: '📍',
  tendencia: '📈',
};

export function formatearPropuestasParaWhatsApp(
  propuestas: TemaPropuesto[],
): string {
  const fecha = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const lineas = propuestas.map((p, i) => {
    const emoji = TIPO_EMOJI[p.tipo] ?? '📝';
    const urgencia = p.urgencia === 'alta' ? ' ⚡' : '';
    return `*${i + 1}.* ${emoji} ${p.titulo}${urgencia}\n   _${p.angulo_local}_\n   SEO: ${p.score_seo}/10 · ${p.tipo}`;
  });

  return [
    `📰 *RADAR BLOG — ${fecha}*`,
    '',
    `Propuestas de la semana:`,
    '',
    ...lineas,
    '',
    `Respondé con los 2 números que querés publicar (ej: "1,3" o "2 y 5").`,
    `Se publican martes y viernes 8am.`,
  ].join('\n');
}
