export type FuenteScope = 'local' | 'regional' | 'sector' | 'nacional' | 'datos';

export interface Fuente {
  name: string;
  url: string;
  scope: FuenteScope;
  weight: number;
  selector?: string;
}

export const FUENTES: Fuente[] = [
  { name: 'InfoFunes', url: 'https://infofunes.com.ar', scope: 'local', weight: 1.5 },
  { name: 'El Roldanense', url: 'https://elroldanense.com', scope: 'local', weight: 1.5 },
  { name: 'Ecos 365', url: 'https://ecos365.com.ar', scope: 'regional', weight: 1.3 },
  { name: 'El Ciudadano', url: 'https://www.elciudadanoweb.com', scope: 'regional', weight: 1.2 },
  { name: 'Punto Biz', url: 'https://puntobiz.com.ar', scope: 'regional', weight: 1.2 },
  { name: 'El Occidental', url: 'https://eloccidental.com.ar', scope: 'regional', weight: 1.2 },
  { name: 'La Capital', url: 'https://www.lacapital.com.ar', scope: 'regional', weight: 1.0 },
  { name: 'Rosario3', url: 'https://www.rosario3.com', scope: 'regional', weight: 1.0 },
  { name: 'Reporte Inmobiliario', url: 'https://www.reporteinmobiliario.com', scope: 'sector', weight: 1.4 },
  { name: 'Zonaprop Noticias', url: 'https://www.zonaprop.com.ar/noticias', scope: 'sector', weight: 1.2 },
  { name: 'Argenprop Noticias', url: 'https://www.argenprop.com/noticias', scope: 'sector', weight: 1.0 },
  { name: 'La Nación Propiedades', url: 'https://www.lanacion.com.ar/propiedades', scope: 'nacional', weight: 1.1 },
  { name: 'Clarín Economía', url: 'https://www.clarin.com/economia', scope: 'nacional', weight: 1.0 },
  { name: 'Infobae Economía', url: 'https://www.infobae.com/economia', scope: 'nacional', weight: 1.0 },
  { name: 'BCRA', url: 'https://www.bcra.gob.ar', scope: 'datos', weight: 1.5 },
  { name: 'Cámara Argentina de la Construcción', url: 'https://camarco.org.ar', scope: 'datos', weight: 1.4 },
];
