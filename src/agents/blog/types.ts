import type { Titular } from './lib/scraper';

export type { Titular };

export type TipoTema =
  | 'coyuntura'
  | 'comparacion'
  | 'guia'
  | 'zoom_barrio'
  | 'tendencia';

export type Urgencia = 'alta' | 'media' | 'baja';

export interface TemaPropuesto {
  titulo: string;
  angulo_local: string;
  keywords_seo: string[];
  fuentes_consultar: string[];
  tipo: TipoTema;
  urgencia: Urgencia;
  score_seo: number;
}

export type CategoriaNota =
  | 'mercado'
  | 'inversion'
  | 'guias'
  | 'barrios'
  | 'coyuntura';

export type CtaId = 'web' | 'instagram' | 'whatsapp';

export interface NotaDraft {
  titulo: string;
  slug: string;
  meta_description: string;
  bajada: string;
  contenido_markdown: string;
  keywords: string[];
  categoria: CategoriaNota;
  imagen_sugerida: string;
  cta_usado: CtaId;
}

export interface NotaPublicada extends NotaDraft {
  fecha_publicacion: string;
  url_completa: string;
}
