import { SignJWT, importPKCS8 } from 'jose'

// Cliente mínimo de la API de Google Search Console usando la cuenta de
// servicio seo-monitor@si-seo-monitor.iam.gserviceaccount.com (proyecto GCP
// si-seo-monitor). La credencial vive en GSC_SERVICE_ACCOUNT_JSON (Vercel) y
// la cuenta tiene que estar agregada como usuario de la propiedad
// https://siinmobiliaria.com/ en Search Console (propietario para poder
// reenviar el sitemap; con "completo" solo funcionan las lecturas).

export const GSC_SITE = 'https://siinmobiliaria.com/'
const SCOPE = 'https://www.googleapis.com/auth/webmasters'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'

interface ServiceAccountKey {
  client_email: string
  private_key: string
}

let _token: { value: string; expiresAt: number } | null = null

// El env puede llegar con los \n del private_key convertidos en saltos de
// línea REALES dentro del string (según cómo se cargó la variable), y eso
// rompe JSON.parse ("bad control character"). Si el parse directo falla, se
// re-escapan los saltos de línea que caen dentro de comillas y se reintenta.
function parseServiceAccountJson(raw: string): ServiceAccountKey {
  try {
    return JSON.parse(raw) as ServiceAccountKey
  } catch {
    let inString = false
    let out = ''
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i]
      if (c === '"' && raw[i - 1] !== '\\') inString = !inString
      if (c === '\n' && inString) {
        out += '\\n'
        continue
      }
      out += c
    }
    return JSON.parse(out) as ServiceAccountKey
  }
}

function getKey(): ServiceAccountKey {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GSC_SERVICE_ACCOUNT_JSON no está configurada')
  const parsed = parseServiceAccountJson(raw)
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('GSC_SERVICE_ACCOUNT_JSON incompleta (faltan client_email/private_key)')
  }
  return parsed
}

// Access token OAuth2 vía JWT firmado (flujo estándar de cuentas de servicio).
// Se cachea en memoria hasta 5 min antes de vencer.
export async function getGscToken(): Promise<string> {
  if (_token && Date.now() < _token.expiresAt - 300_000) return _token.value

  const key = getKey()
  const privateKey = await importPKCS8(key.private_key, 'RS256')
  const now = Math.floor(Date.now() / 1000)
  const assertion = await new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(key.client_email)
    .setAudience(TOKEN_URL)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey)

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  if (!res.ok) {
    throw new Error(`Token de GSC falló: ${res.status} ${await res.text()}`)
  }
  const data = (await res.json()) as { access_token: string; expires_in: number }
  _token = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
  return data.access_token
}

async function gscFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = await getGscToken()
  return fetch(url, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
}

export interface SitemapStatus {
  lastDownloaded: string | null
  isPending: boolean
  errors: number
  warnings: number
}

// Estado del sitemap según Google (cuándo lo leyó por última vez).
export async function getSitemapStatus(): Promise<SitemapStatus> {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/sitemaps/${encodeURIComponent(`${GSC_SITE}sitemap.xml`)}`
  const res = await gscFetch(url)
  if (!res.ok) throw new Error(`sitemaps.get falló: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as {
    lastDownloaded?: string
    isPending?: boolean
    errors?: string
    warnings?: string
  }
  return {
    lastDownloaded: data.lastDownloaded ?? null,
    isPending: Boolean(data.isPending),
    errors: Number(data.errors ?? 0),
    warnings: Number(data.warnings ?? 0),
  }
}

// Reenvía el sitemap (equivale al botón ENVIAR de la UI). Necesita que la
// cuenta de servicio sea PROPIETARIA de la propiedad; con menos permiso
// Google devuelve 403 y el caller decide avisar en vez de reintentar.
export async function submitSitemap(): Promise<void> {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/sitemaps/${encodeURIComponent(`${GSC_SITE}sitemap.xml`)}`
  const res = await gscFetch(url, { method: 'PUT' })
  if (!res.ok) throw new Error(`sitemaps.submit falló: ${res.status} ${await res.text()}`)
}

// Cantidad de páginas distintas con al menos una impresión en Google en los
// últimos `days` días. Es el proxy más confiable de "cuántas páginas nos está
// mostrando Google" disponible por API (el reporte de cobertura de la UI no
// se expone).
export async function getPaginasConImpresiones(days = 7): Promise<number> {
  const end = new Date()
  const start = new Date(end.getTime() - days * 86_400_000)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`
  const res = await gscFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startDate: fmt(start),
      endDate: fmt(end),
      dimensions: ['page'],
      rowLimit: 25000,
    }),
  })
  if (!res.ok) throw new Error(`searchAnalytics.query falló: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { rows?: unknown[] }
  return data.rows?.length ?? 0
}

export interface InspeccionUrl {
  url: string
  verdict: string
  coverageState: string
}

// Inspección puntual de una URL (mismo dato que "Inspección de URLs" en la UI).
export async function inspectUrl(inspectionUrl: string): Promise<InspeccionUrl> {
  const res = await gscFetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inspectionUrl, siteUrl: GSC_SITE }),
  })
  if (!res.ok) throw new Error(`urlInspection falló para ${inspectionUrl}: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as {
    inspectionResult?: {
      indexStatusResult?: { verdict?: string; coverageState?: string }
    }
  }
  const idx = data.inspectionResult?.indexStatusResult
  return {
    url: inspectionUrl,
    verdict: idx?.verdict ?? 'UNKNOWN',
    coverageState: idx?.coverageState ?? 'desconocido',
  }
}
