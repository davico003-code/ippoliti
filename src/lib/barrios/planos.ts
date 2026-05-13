import fs from 'node:fs'
import path from 'node:path'

// Detecta si existe /public/barrios/{slug}/plano.pdf al momento del build.
// Si está presente, devolvemos la URL pública. Si no, null para que el
// componente muestre fallback "pedir por WhatsApp".
export function getPlanoUrl(slug: string): string | null {
  const filePath = path.join(process.cwd(), 'public', 'barrios', slug, 'plano.pdf')
  try {
    if (fs.existsSync(filePath)) {
      return `/barrios/${slug}/plano.pdf`
    }
  } catch {
    // En entornos sin fs (edge runtime, etc.) devolvemos null silenciosamente.
  }
  return null
}
