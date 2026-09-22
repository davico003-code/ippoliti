import fs from 'node:fs'
import path from 'node:path'

// Detecta si existe /public/barrios/{slug}/plano.pdf al momento del build.
// Si está presente, devolvemos la URL pública. Si no, null para que el
// componente muestre fallback "pedir por WhatsApp".
export function getPlanoUrl(slug: string): string | null {
  return publicPdf(slug, 'plano.pdf')
}

// Plano técnico de loteo (lotes numerados con medidas), opcional, en
// /public/barrios/{slug}/plano-loteo.pdf. Se ofrece como segunda descarga.
export function getPlanoLoteoUrl(slug: string): string | null {
  return publicPdf(slug, 'plano-loteo.pdf')
}

function publicPdf(slug: string, file: string): string | null {
  const filePath = path.join(process.cwd(), 'public', 'barrios', slug, file)
  try {
    if (fs.existsSync(filePath)) {
      return `/barrios/${slug}/${file}`
    }
  } catch {
    // En entornos sin fs (edge runtime, etc.) devolvemos null silenciosamente.
  }
  return null
}
