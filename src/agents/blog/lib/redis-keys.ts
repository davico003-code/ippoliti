export const BLOG_REDIS_KEYS = {
  temasSemana: 'blog:temas_semana',
  temasUsados: 'blog:temas_usados',
  pendienteAprobacion: (id: string) => `blog:pendiente:${id}`,
  notaPublicada: (slug: string) => `blog:publicada:${slug}`,
  contadorNotasRevisadas: 'blog:contador_revisadas',
  ultimosCTAs: 'blog:ultimos_ctas',
} as const;

export const TTL = {
  temasSemana: 60 * 60 * 24 * 14,
  pendienteAprobacion: 60 * 60 * 48,
  notaPublicada: 0,
} as const;
