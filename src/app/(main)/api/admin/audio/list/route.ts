// GET /api/admin/audio/list
//
// Lista los audios cacheados en la pipeline TTS actual (v3) para mostrarlos
// en /admin/audio. Auth por header x-team-code contra SI_TEAM_CODE.
//
// Enriquece cada item con título y thumb desde Tokko (cache de 6h vía
// getPropertyById) y, si existe, con createdAt + charsUsed desde la meta
// guardada en Redis.
//
// Limit: 50 items, ordenados por createdAt desc (los items sin meta —audios
// generados antes del Commit 5— quedan al final, ordenados por id desc).
//
// Returns: { ok: true, items: AudioListItem[] }

import { NextResponse } from 'next/server'
import pLimit from 'p-limit'
import {
  listCachedAudioPropertyIds,
  getCachedAudioUrl,
  getCachedAudioMeta,
} from '@/lib/audio'
import { getPropertyById, generatePropertySlug, getMainPhoto } from '@/lib/tokko'
import { assertTeamCode } from '@/lib/team-auth'

const LIMIT = 50
const TOKKO_CONCURRENCY = 6

export interface AudioListItem {
  propertyId: number
  url: string
  slug: string | null
  titulo: string
  thumb: string | null
  createdAt: string | null
  charsUsed: number | null
  textLength: number | null
}

export async function GET(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  try {
    const ids = await listCachedAudioPropertyIds()

    const limit = pLimit(TOKKO_CONCURRENCY)
    const items = await Promise.all(
      ids.map(id => limit(async (): Promise<AudioListItem | null> => {
        const [url, meta] = await Promise.all([
          getCachedAudioUrl(id),
          getCachedAudioMeta(id),
        ])
        if (!url) return null

        let titulo = `Propiedad ${id}`
        let thumb: string | null = null
        let slug: string | null = null
        try {
          const property = await getPropertyById(id)
          titulo =
            property.publication_title ||
            property.fake_address ||
            property.address ||
            titulo
          thumb = getMainPhoto(property)
          slug = generatePropertySlug(property)
        } catch { /* propiedad eliminada o no accesible en Tokko; mantenemos defaults */ }

        return {
          propertyId: id,
          url,
          slug,
          titulo,
          thumb,
          createdAt: meta?.createdAt || null,
          charsUsed: meta?.charsUsed ?? null,
          textLength: meta?.textLength ?? null,
        }
      })),
    )

    const clean = items.filter((x): x is AudioListItem => x !== null)

    // Orden: con createdAt desc primero; sin createdAt al final por id desc.
    clean.sort((a, b) => {
      if (a.createdAt && b.createdAt) return b.createdAt.localeCompare(a.createdAt)
      if (a.createdAt) return -1
      if (b.createdAt) return 1
      return b.propertyId - a.propertyId
    })

    return NextResponse.json({ ok: true, items: clean.slice(0, LIMIT) })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error listando audios'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
