const API_BASE = 'https://api.unsplash.com';
const TIMEOUT_MS = 10_000;

export interface ImagenUnsplash {
  url: string;
  alt: string;
  photographer: string;
  photographer_url: string;
  download_location: string;
}

interface UnsplashPhoto {
  alt_description?: string | null;
  description?: string | null;
  urls: { regular: string; small?: string };
  user: { name: string; links: { html: string } };
  links: { download_location: string };
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
}

async function fetchConTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function elegirSufijo(keywords: string[]): string {
  const joined = keywords.join(' ').toLowerCase();
  if (/barrio|funes|roldán|roldan|rosario|country|loteo/.test(joined)) return 'neighborhood';
  if (/casa|hogar|familia|vivienda|departamento/.test(joined)) return 'home';
  return 'house';
}

export async function buscarImagenUnsplash(
  keywords: string[],
): Promise<ImagenUnsplash | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn('[unsplash] UNSPLASH_ACCESS_KEY no configurada, devolviendo null');
    return null;
  }

  const top = keywords.slice(0, 3).join(' ');
  const sufijo = elegirSufijo(keywords);
  const query = `${top} ${sufijo}`.trim();

  const url = new URL(`${API_BASE}/search/photos`);
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('per_page', '5');

  try {
    const res = await fetchConTimeout(url.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });

    if (!res.ok) {
      console.warn(`[unsplash] búsqueda falló: HTTP ${res.status} para query="${query}"`);
      return null;
    }

    const data = (await res.json()) as UnsplashSearchResponse;
    if (!data.results || data.results.length === 0) {
      console.warn(`[unsplash] sin resultados para query="${query}"`);
      return null;
    }

    const photo = data.results[0];
    return {
      url: photo.urls.regular,
      alt: photo.alt_description ?? photo.description ?? query,
      photographer: photo.user.name,
      photographer_url: photo.user.links.html,
      download_location: photo.links.download_location,
    };
  } catch (err) {
    console.warn(`[unsplash] error en búsqueda: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

export async function registrarDescargaUnsplash(downloadLocation: string): Promise<void> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return;

  try {
    await fetchConTimeout(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });
  } catch (err) {
    console.warn(`[unsplash] error registrando descarga: ${err instanceof Error ? err.message : String(err)}`);
  }
}
