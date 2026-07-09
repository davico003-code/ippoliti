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
    ? `/api/image-proxy?url=${encodeURIComponent(src)}`
    : src
}
