function imageProxyPath(src: string): string {
  return `/api/image-proxy?url=${encodeURIComponent(src)}`
}

export function shouldProxyExternalImage(src: string): boolean {
  try {
    const url = new URL(src)
    return url.protocol === 'https:' &&
      /(^|\.)argenprop\.com$/i.test(url.hostname) &&
      url.pathname.startsWith('/static-content/')
  } catch {
    return false
  }
}

export function displayImageUrl(src: string): string {
  return shouldProxyExternalImage(src)
    ? imageProxyPath(src)
    : src
}

export function publicImageUrl(src: string | null | undefined, origin: string): string | null {
  if (!src) return null
  if (!shouldProxyExternalImage(src)) return src
  return `${origin.replace(/\/$/, '')}${imageProxyPath(src)}`
}
