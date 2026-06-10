import { NextResponse } from 'next/server'
import { assertTeamCode } from '@/lib/team-auth'
import { posts as estaticos } from '@/lib/blog'
import {
  getPostsDinamicos,
  getBlogRedirects,
  getImageOverrides,
} from '@/lib/blog-posts-dinamicos'
import { normalizar, jaccard } from '@/agents/blog/lib/dedupe'

export const dynamic = 'force-dynamic'

const UMBRAL = 0.6

export interface NotaAdminItem {
  slug: string
  titulo: string
  fecha: string
  categoria: string | null
  image: string
  tipo: 'estatica' | 'dinamica'
  eliminada: boolean
  programada: boolean
  destino: string | null
  dupGroup: number | null
}

export async function GET(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  try {
    const [dinamicos, redirects, overrides] = await Promise.all([
      getPostsDinamicos(),
      getBlogRedirects(),
      getImageOverrides(),
    ])

    const base = [
      ...estaticos.map(p => ({ p, tipo: 'estatica' as const })),
      ...dinamicos.map(p => ({ p, tipo: 'dinamica' as const })),
    ]
    const n = base.length

    // Clustering por similitud de título (union-find, Jaccard >= 0.6).
    const tokens = base.map(b => normalizar(b.p.title))
    const parent = Array.from({ length: n }, (_, i) => i)
    const find = (x: number): number =>
      parent[x] === x ? x : (parent[x] = find(parent[x]))
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (jaccard(tokens[i], tokens[j]) >= UMBRAL) parent[find(i)] = find(j)
      }
    }
    const sizes: Record<number, number> = {}
    for (let i = 0; i < n; i++) {
      const r = find(i)
      sizes[r] = (sizes[r] ?? 0) + 1
    }
    const groupId: Record<number, number> = {}
    let gid = 0
    const dupOf = new Array<number | null>(n).fill(null)
    for (let i = 0; i < n; i++) {
      const r = find(i)
      if (sizes[r] >= 2) {
        if (groupId[r] === undefined) groupId[r] = gid++
        dupOf[i] = groupId[r]
      }
    }

    const items: NotaAdminItem[] = base.map((b, i) => ({
      slug: b.p.slug,
      titulo: b.p.title,
      fecha: b.p.date,
      categoria: b.p.category ?? null,
      image: overrides[b.p.slug] ?? b.p.image,
      tipo: b.tipo,
      eliminada: Boolean(redirects[b.p.slug]),
      programada: Boolean(
        b.p.publishAt && new Date(b.p.publishAt).getTime() > Date.now()
      ),
      destino: redirects[b.p.slug] ?? null,
      dupGroup: dupOf[i],
    }))

    items.sort((a, b) => b.fecha.localeCompare(a.fecha))
    return NextResponse.json({ ok: true, items })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error listando notas'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
