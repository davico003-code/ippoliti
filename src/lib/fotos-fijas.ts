/**
 * Fotos de las fichas con URL FIJA (16-oct-2026, revisión SEO/GEO).
 *
 * Hilo entrega cada foto como URL firmada de Supabase (property-media, ?token=…)
 * que rota cada 45 días. Cuando rota, Google Imágenes pierde el historial de la
 * foto y las vistas previas guardadas por WhatsApp/Facebook quedan sin imagen.
 *
 * La web las publica en `https://siinmobiliaria.com/fotos/<id>/<archivo>`: la
 * ruta src/app/fotos/[id]/[archivo] busca la firma vigente en el feed y sirve
 * los bytes (200, no 302: con un redirect a un destino que rota, Google puede
 * quedarse con el destino como URL de la imagen).
 *
 * `archivo` es el nombre del archivo en Storage y NO el orden de la foto: en
 * Hilo un archivo no se pisa nunca (contenido nuevo = archivo nuevo), mientras
 * que el orden y la portada cambian cuando el agente reordena — la misma URL
 * mostraría otra foto.
 *
 * Los planos no pasan por acá: ya vienen con URL fija de Hilo
 * (/api/public/plano/<id>, ver lib/planos.ts).
 */

export const SITIO_FOTOS = 'https://siinmobiliaria.com';

/** Nombres que genera Hilo (sanitizeFilename): minúsculas, números, `._-`. */
export const RE_ARCHIVO_FOTO = /^[\w.-]{1,200}\.(?:jpe?g|png|webp|avif|gif)$/i;

const RE_FIRMADA_PROPERTY_MEDIA = /^\/storage\/v1\/object\/sign\/property-media\/.+/;

type FotoConUrl = { image: string; thumb?: string; original?: string; is_blueprint?: boolean; is_front_cover?: boolean; r2?: string };
type PropiedadConFotos = { id: number; photos?: FotoConUrl[] | null };

/** Nombre del archivo de una URL firmada de property-media; null si es cualquier otra URL. */
export function archivoDeFotoFirmada(url: string | null | undefined): string | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' || !u.hostname.endsWith('.supabase.co')) return null;
  if (!RE_FIRMADA_PROPERTY_MEDIA.test(u.pathname)) return null;
  let archivo: string;
  try {
    archivo = decodeURIComponent(u.pathname.split('/').pop() ?? '');
  } catch {
    return null;
  }
  return RE_ARCHIVO_FOTO.test(archivo) ? archivo : null;
}

/**
 * archivo → URL firmada vigente, de las fotos (no planos) de una propiedad que
 * pueden ir con URL fija. Es la ÚNICA regla: la ficha publica `/fotos/…` solo
 * para lo que está acá y la ruta solo sirve lo que está acá. Si un mismo
 * nombre aparece con dos rutas distintas de Storage, ese nombre queda afuera
 * (la ficha deja la firmada y la ruta da 404) para no servir la foto equivocada.
 */
export function fotosFijasDe(property: PropiedadConFotos): Map<string, string> {
  const fijas = new Map<string, string>();
  const rutaDe = new Map<string, string>();
  const ambiguos = new Set<string>();
  for (const foto of property.photos ?? []) {
    if (foto.is_blueprint) continue;
    const archivo = archivoDeFotoFirmada(foto.image);
    if (!archivo || ambiguos.has(archivo)) continue;
    const ruta = new URL(foto.image).pathname;
    const previa = rutaDe.get(archivo);
    if (previa === undefined) {
      rutaDe.set(archivo, ruta);
      fijas.set(archivo, foto.image);
    } else if (previa !== ruta) {
      ambiguos.add(archivo);
      fijas.delete(archivo);
    }
  }
  return fijas;
}

/** `/fotos/<id>/<archivo>` (o absoluta, para og:image y JSON-LD). */
export function urlFotoFija(id: number, archivo: string, absoluta = false): string {
  const ruta = `/fotos/${id}/${encodeURIComponent(archivo)}`;
  return absoluta ? `${SITIO_FOTOS}${ruta}` : ruta;
}

/** La relativa `/fotos/…` en absoluta (JSON-LD); cualquier otra URL queda igual. */
export function fotoAbsoluta(url: string | null): string | null {
  return url?.startsWith('/fotos/') ? `${SITIO_FOTOS}${url}` : url;
}

/** La URL fija de esa foto si la tiene; si no, la misma URL. */
export function fotoFija(
  property: PropiedadConFotos,
  url: string | null,
  absoluta = false,
  fijas: Map<string, string> = fotosFijasDe(property),
): string | null {
  const archivo = archivoDeFotoFirmada(url);
  return archivo && fijas.has(archivo) ? urlFotoFija(property.id, archivo, absoluta) : url;
}

/**
 * Copia de la propiedad con `image`/`thumb`/`original` de cada foto en su URL
 * fija relativa (para el <img>: next/image la optimiza con una clave que ya no
 * cambia). `original` también: /fotos sirve el mismo archivo y las firmadas
 * eran ~19% del HTML de la ficha (38 KB de 198 KB en 8153191). Solo reescribe
 * las claves que ya vienen: la lista liviana del feed trae únicamente `image`
 * y sumarle thumb/original engordaría el listado.
 *
 * La usan la ficha, todas las listas (hiloGetProperties en lib/tokko.ts) y las
 * APIs por id que son vidriera. NO getPropertyById: la ruta /fotos necesita la
 * firmada, y la ficha neutra (lib/ficha.ts) y hausing.ts la leen tal cual.
 */
export function conFotosFijas<T extends PropiedadConFotos>(property: T): T {
  if (!property.photos?.length) return property;
  const fijas = fotosFijasDe(property);
  const hayR2 = property.photos.some((foto) => !foto.is_blueprint && esFotoR2(foto.r2));
  if (fijas.size === 0 && !hayR2) return property;
  return {
    ...property,
    photos: property.photos.map((foto) => {
      if (foto.is_blueprint) return foto;
      const fija = fotoFija(property, foto.image, false, fijas);
      const cambiaFija = !!fija && fija !== foto.image;
      // Con sus anchos ya achicados en R2 (22-oct-2026), la foto se MUESTRA
      // desde ahí (Imagen.tsx la pide al ancho justo, sin el optimizador de
      // Vercel). `original` queda en la URL fija: es la de los buscadores.
      const ver = esFotoR2(foto.r2) ? foto.r2 : cambiaFija ? fija : null;
      if (!ver) return foto;
      return {
        ...foto,
        image: ver,
        ...('thumb' in foto ? { thumb: ver } : {}),
        ...('original' in foto && cambiaFija ? { original: fija } : {}),
      };
    }),
  };
}

/**
 * La foto principal para los buscadores (JSON-LD), absoluta: la URL fija
 * `/fotos/…` cuando la hay, no la copia de R2 (esa es solo para mostrar).
 */
export function fotoPrincipalParaBuscadores(property: PropiedadConFotos): string | null {
  const fotos = property.photos ?? [];
  const principal = fotos.find((f) => f.is_front_cover && !f.is_blueprint) ?? fotos.find((f) => !f.is_blueprint) ?? fotos[0];
  if (!principal) return null;
  return fotoAbsoluta(esFotoR2(principal.image) ? principal.original ?? principal.image : principal.image);
}

/**
 * Fotos ya achicadas en Cloudflare R2 (22-oct-2026).
 *
 * Hilo achica cada foto UNA vez a 4 anchos fijos y los guarda en R2
 * (cron fotos-web-r2, src/lib/storage/fotos-web-r2-reglas.ts en si-crm). El
 * feed manda en `photos[].r2` la URL del ancho mayor:
 *   https://fotos.verficha.casa/w1/<ruta de la foto>/1920.webp
 * y acá se cambia ese número por el ancho que pide el navegador. Así la foto
 * no pasa por el optimizador de Vercel (cobraba cada transformación: 38.000
 * por día el 21-oct) y R2 no cobra el tráfico.
 */

export const ANCHOS_R2 = [480, 828, 1080, 1920] as const;

const RE_FOTO_R2 = /^https:\/\/fotos\.verficha\.casa\/w1\/.+\/(?:480|828|1080|1920)\.webp$/;
const RE_ANCHO_FINAL = /\/(?:480|828|1080|1920)\.webp$/;

/** true si la URL es una foto con sus anchos en R2. */
export function esFotoR2(url: unknown): url is string {
  return typeof url === 'string' && RE_FOTO_R2.test(url);
}

/** El ancho guardado más chico que cubre el pedido (o el mayor). */
export function anchoR2(pedido: number): number {
  return ANCHOS_R2.find((a) => a >= pedido) ?? ANCHOS_R2[ANCHOS_R2.length - 1];
}

/** Loader de next/image para las fotos de R2: arma la URL del ancho pedido. */
export function loaderFotoR2({ src, width }: { src: string; width: number; quality?: number }): string {
  return src.replace(RE_ANCHO_FINAL, `/${anchoR2(width)}.webp`);
}
