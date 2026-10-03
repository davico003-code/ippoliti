// Publica las notas reescritas del blog (reescritura de oct-2026) y redirige
// las que se fusionaron en ellas.
//
//   set -a; source .env.local; set +a
//   SI_TEAM_CODE=... npx tsx scripts/publicar-reescrituras.mts <dir-con-json> [--dry] [--solo slug1,slug2]
//
// Cada JSON trae { slug_final, slugs_fusionados, titulo, bajada,
// meta_description, categoria, contenido_markdown }.
// - Si la nota ya es dinámica (Blob): se edita por /api/admin/notas/editar.
// - Si es estática (código): se publica su Blob conservando la fecha original;
//   la versión del Blob le gana a la del código (lib/blog.ts).
// - Los slugs fusionados quedan con 301 a la nota final (blog:redirects,
//   reversible desde /admin/notas).

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { list, put } from '@vercel/blob'
import { posts as estaticas } from '../src/lib/blog'

const BASE = process.env.BASE_URL || 'https://siinmobiliaria.com'
const CODE = process.env.SI_TEAM_CODE
const TOKEN = process.env.BLOG_READ_WRITE_TOKEN
const dir = process.argv[2]
const dry = process.argv.includes('--dry')
const soloIdx = process.argv.indexOf('--solo')
const solo = soloIdx > -1 ? new Set(process.argv[soloIdx + 1].split(',')) : null

if (!dir || (!dry && (!CODE || !TOKEN))) {
  console.error('Uso: SI_TEAM_CODE=... BLOG_READ_WRITE_TOKEN=... npx tsx scripts/publicar-reescrituras.mts <dir> [--dry]')
  process.exit(1)
}

interface Reescritura {
  slug_final: string
  slugs_fusionados?: string[]
  titulo: string
  bajada: string
  meta_description: string
  categoria: string
  contenido_markdown: string
  keywords?: string[]
}

async function existeBlob(slug: string): Promise<boolean> {
  const path = `blog-posts/${slug}.json`
  const r = await list({ prefix: path, token: TOKEN })
  return r.blobs.some((b) => b.pathname === path)
}

async function api(ruta: string, body: unknown) {
  const res = await fetch(`${BASE}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-team-code': CODE! },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${ruta} → ${res.status} ${JSON.stringify(data)}`)
  return data
}

async function revalidar(slug: string) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) return
  await fetch(`${BASE}/api/revalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
    body: JSON.stringify({ slug }),
  }).catch(() => {})
}

const archivos = readdirSync(dir).filter((f) => f.endsWith('.json'))
for (const f of archivos) {
  const r = JSON.parse(readFileSync(join(dir, f), 'utf8')) as Reescritura
  if (solo && !solo.has(r.slug_final)) continue
  const dinamica = dry ? null : await existeBlob(r.slug_final)
  const estatica = estaticas.find((p) => p.slug === r.slug_final)
  console.log(`\n${r.slug_final} (${dinamica ? 'dinámica' : estatica ? 'estática' : 'NUEVA'}) ← ${(r.slugs_fusionados ?? []).join(', ') || 'sin fusión'}`)
  if (dry) continue

  if (dinamica) {
    await api('/api/admin/notas/editar', {
      slug: r.slug_final,
      titulo: r.titulo,
      bajada: r.bajada,
      meta_description: r.meta_description,
      contenido_markdown: r.contenido_markdown,
    })
  } else {
    const ahora = new Date().toISOString()
    const fecha = estatica ? new Date(`${estatica.date}T11:00:00.000Z`).toISOString() : ahora
    const nota = {
      titulo: r.titulo,
      slug: r.slug_final,
      meta_description: r.meta_description,
      bajada: r.bajada,
      contenido_markdown: r.contenido_markdown,
      keywords: r.keywords ?? [],
      categoria: r.categoria,
      imagen_sugerida: '',
      cta_usado: '',
      fecha_publicacion: fecha,
      fecha_modificacion: ahora,
      url_completa: `${BASE}/blog/${r.slug_final}`,
    }
    await put(`blog-posts/${r.slug_final}.json`, JSON.stringify(nota), {
      access: 'public',
      contentType: 'application/json',
      token: TOKEN,
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    await revalidar(r.slug_final)
  }
  console.log('  ✓ publicada')

  for (const viejo of r.slugs_fusionados ?? []) {
    await api('/api/admin/notas/eliminar', { slug: viejo, destino: `/blog/${r.slug_final}` })
    console.log(`  ✓ ${viejo} → 301`)
  }
}
