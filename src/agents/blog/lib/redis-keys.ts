export const BLOG_REDIS_KEYS = {
  temasSemana: 'blog:temas_semana',
  temasUsados: 'blog:temas_usados',
  temasAprobados: 'blog:temas_aprobados',
  pendienteAprobacion: (id: string) => `blog:pendiente:${id}`,
  notaPublicada: (slug: string) => `blog:publicada:${slug}`,
  contadorNotasRevisadas: 'blog:contador_revisadas',
  ultimosCTAs: 'blog:ultimos_ctas',
} as const;

export const TTL = {
  temasSemana: 60 * 60 * 24 * 14,       // 14 días
  pendienteAprobacion: 60 * 60 * 48,     // 48 horas
  notaPublicada: 0,                       // sin expiración
  // Una aprobación vive 6 días: cubre el writer de martes y viernes de la
  // misma semana, pero expira antes del próximo radar (lunes) para que una
  // aprobación vieja no se republique si una semana no se aprueban temas.
  temasAprobados: 60 * 60 * 24 * 6,      // 6 días
} as const;
