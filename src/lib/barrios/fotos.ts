import fs from 'node:fs'
import path from 'node:path'

// Descubre las fotos WebP procesadas de /public/barrios/{slug}/ al momento
// del build (mismo patrón que getPlanoUrl en ./planos). Devuelve los paths
// públicos ordenados: 01.webp es siempre la portada.
export function getBarrioFotos(slug: string): string[] {
  const dir = path.join(process.cwd(), 'public', 'barrios', slug)
  try {
    return fs
      .readdirSync(dir)
      .filter(f => /^\d{2}\.webp$/.test(f))
      .sort()
      .map(f => `/barrios/${slug}/${f}`)
  } catch {
    return []
  }
}

// Preview del plano (imagen) si fue generado junto al plano.pdf.
export function getPlanoPreviewUrl(slug: string): string | null {
  const filePath = path.join(process.cwd(), 'public', 'barrios', slug, 'plano-preview.webp')
  try {
    if (fs.existsSync(filePath)) return `/barrios/${slug}/plano-preview.webp`
  } catch {
    /* entornos sin fs */
  }
  return null
}
