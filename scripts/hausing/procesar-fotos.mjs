// Fotos de la landing /hausing: procesa TODAS las fotos de las casas de la
// colección → (versión mejorada con Higgsfield si existe) → color de
// arquitectura → WebP → Vercel Blob (store del blog, público). Escribe el
// manifiesto src/lib/hausing-fotos.json {ruta en storage de HILO → URL retocada}.
// NO toca las publicaciones en HILO. Solo procesa lo que falta (idempotente).
//
// Uso:  node scripts/hausing/procesar-fotos.mjs [carpeta-de-trabajo]
// Si hay mejoras de Higgsfield, dejarlas en la carpeta de trabajo con un
// upscaled.json {clave: archivo.png} (clave = ruta en storage, ver `clave`).
// Requiere BLOG_READ_WRITE_TOKEN en .env.local y ImageMagick (magick).
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { put } from '@vercel/blob'

// Mantener en sync con HAUSING_PROPERTY_IDS (src/lib/hausing.ts)
const IDS = [7872050, 7875941, 7868679, 7865564, 7867761, 7879685]
const DIR = path.resolve(process.argv[2] || path.join(os.tmpdir(), 'hausing-fotos'))
fs.mkdirSync(DIR, { recursive: true })
const env = fs.readFileSync('.env.local', 'utf8')
const TOKEN = env.match(/^BLOG_READ_WRITE_TOKEN="?([^"\n]+)"?/m)[1]
const upsFile = path.join(DIR, 'upscaled.json')
const UPS = fs.existsSync(upsFile) ? JSON.parse(fs.readFileSync(upsFile, 'utf8')) : {} // {clave: archivo local}
const OUT = 'src/lib/hausing-fotos.json'
const manifest = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {}

export const clave = u => decodeURIComponent(new URL(u).pathname).replace(/^.*\/object\/(sign|public)\//, '')

function grade(src, dst, maxW) {
  execFileSync('magick', [src, '-colorspace', 'sRGB',
    '-resize', `${maxW}x>`,
    '-modulate', '100,80,100',
    '-channel', 'R', '-evaluate', 'multiply', '1.012', '-channel', 'B', '-evaluate', 'multiply', '0.982', '+channel',
    '-level', '2.5%,99%,0.98',
    '-sigmoidal-contrast', '1.8x42%',
    '-unsharp', '0x0.8+0.45+0.02',
    '-strip', '-quality', '84', dst])
}

let n = 0
for (const id of IDS) {
  const p = await (await fetch(`https://meethilo.com/api/public/propiedades/${id}`)).json()
  const fotos = (p.photos || []).filter(f => !f.is_blueprint).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  for (const [i, f] of fotos.entries()) {
    const k = clave(f.image)
    const up = UPS[k]
    const base = `${id}-${String(i).padStart(2, '0')}`
    if (manifest[k]?.v === 2 && !(up && !manifest[k].hf)) { continue }
    let src = up ? path.join(DIR, up) : path.join(DIR, `${base}.src`)
    if (!up) fs.writeFileSync(src, Buffer.from(await (await fetch(f.image)).arrayBuffer()))
    const dst = path.join(DIR, `${base}.webp`)
    grade(src, dst, up ? 2560 : 2048)
    const blob = await put(`hausing/v2/${id}/${base}${up ? '-hf' : ''}.webp`, fs.readFileSync(dst), {
      access: 'public', token: TOKEN, contentType: 'image/webp', addRandomSuffix: false, allowOverwrite: true,
    })
    manifest[k] = { url: blob.url, v: 2, ...(up ? { hf: true } : {}) }
    n++
    process.stdout.write(`${base}${up ? ' [HF]' : ''} ✓\n`)
  }
}
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 1) + '\n')
console.log(`listo: ${n} procesadas, ${Object.keys(manifest).length} en el manifiesto`)
