/**
 * Pega directo a la API de Tokko (sin pasar por Next data cache) y reporta
 * propiedades vinculadas a "Fisherton". Pensado para distinguir si el sitio
 * ve data vieja por cache (problema Next) o si Tokko no las está devolviendo
 * (problema CRM).
 *
 * Hallazgo previo: el filtro `operation_types=[N]` parece NO aplicarse en
 * la API pública con esa sintaxis — la respuesta trae todo. Por eso este
 * script no se confía del filtro y ramifica la búsqueda.
 */
import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(process.cwd(), '.env.local') })

const KEY = process.env.TOKKO_API_KEY || process.env.NEXT_PUBLIC_TOKKO_API_KEY
if (!KEY) {
  console.error('Falta TOKKO_API_KEY o NEXT_PUBLIC_TOKKO_API_KEY en .env.local')
  process.exit(1)
}

const BASE = 'https://www.tokkobroker.com/api/v1'

type Op = { operation_type: string; prices: { currency: string; price: number }[] }
type Loc = { name?: string; full_location?: string; short_location?: string } | null
type Prop = {
  id: number
  publication_title: string
  address: string
  fake_address: string
  real_address: string
  status: number
  deleted_at: string | null
  geo_lat: string | null
  geo_long: string | null
  is_starred_on_web: boolean
  web_price: boolean
  type: { name: string } | null
  location: Loc
  operations: Op[]
}

type ListResp = {
  meta: { total_count: number; limit: number; offset: number }
  objects: Prop[]
}

function matchesFisherton(p: Prop): boolean {
  const haystacks = [
    p.address,
    p.fake_address,
    p.real_address,
    p.publication_title,
    p.location?.name,
    p.location?.full_location,
    p.location?.short_location,
  ]
  return haystacks.some(
    (h) => typeof h === 'string' && h.toLowerCase().includes('fisherton'),
  )
}

async function fetchAll(extra: Record<string, string> = {}): Promise<Prop[]> {
  const fetchPage = async (offset: number): Promise<ListResp> => {
    const url = new URL(`${BASE}/property/`)
    url.searchParams.set('key', KEY!)
    url.searchParams.set('format', 'json')
    url.searchParams.set('lang', 'es')
    url.searchParams.set('limit', '100')
    url.searchParams.set('offset', String(offset))
    for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v)
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) throw new Error(`Tokko ${res.status} ${res.statusText} for ${url}`)
    return res.json()
  }
  const first = await fetchPage(0)
  const all = [...first.objects]
  for (let off = 100; off < first.meta.total_count; off += 100) {
    const page = await fetchPage(off)
    all.push(...page.objects)
  }
  return all
}

function fmtPrice(p: Prop): string {
  const op = p.operations[0]
  if (!op || !op.prices?.length) return 'N/A'
  return `${op.prices[0].currency} ${op.prices[0].price.toLocaleString('es-AR')}`
}

function fmtRow(p: Prop) {
  console.log(`  • [${p.id}] ${p.publication_title}`)
  console.log(`    type: ${p.type?.name ?? '?'}  status: ${p.status}  deleted_at: ${p.deleted_at ?? '-'}`)
  console.log(`    op: ${p.operations[0]?.operation_type ?? '?'}  price: ${fmtPrice(p)}`)
  console.log(`    address: ${p.address}`)
  console.log(`    location.name: ${p.location?.name ?? '-'}`)
  console.log(`    short_location: ${p.location?.short_location ?? '-'}`)
  console.log(`    geo_lat: ${p.geo_lat ?? '∅'}   geo_long: ${p.geo_long ?? '∅'}`)
  console.log(`    starred: ${p.is_starred_on_web}  web_price: ${p.web_price}`)
  console.log()
}

async function main() {
  console.log('═══ Diagnóstico Fisherton (Tokko) ═══\n')

  // 1) Sin filtros: lo que realmente expone el CRM hoy
  console.log('▸ Fetching SIN filtros (key + format + lang)...')
  const all = await fetchAll()
  console.log(`  Total devuelto por Tokko: ${all.length}`)

  // Distribución por operation_type
  const byOp: Record<string, number> = {}
  for (const p of all) {
    const t = p.operations[0]?.operation_type ?? '∅'
    byOp[t] = (byOp[t] ?? 0) + 1
  }
  console.log(`  Distribución operation_type:`, byOp)

  // Distribución por status
  const byStatus: Record<string, number> = {}
  for (const p of all) {
    const k = String(p.status)
    byStatus[k] = (byStatus[k] ?? 0) + 1
  }
  console.log(`  Distribución status:`, byStatus, '\n')

  // 2) Fisherton (cualquier op)
  const fisherton = all.filter(matchesFisherton)
  const fishertonRent = fisherton.filter((p) => p.operations[0]?.operation_type === 'Rent')
  const fishertonSale = fisherton.filter((p) => p.operations[0]?.operation_type === 'Sale')
  console.log(`▸ Fisherton totales en respuesta sin filtros: ${fisherton.length}`)
  console.log(`  → Rent: ${fishertonRent.length}`)
  console.log(`  → Sale: ${fishertonSale.length}\n`)

  if (fishertonRent.length > 0) {
    console.log('  → Detalle Fisherton/Rent:')
    fishertonRent.forEach(fmtRow)
  } else {
    console.log('  ⚠ No hay propiedades de alquiler en Fisherton en la respuesta de Tokko.\n')
  }

  // 3) Fuerza con search_address (búsqueda por dirección server-side de Tokko)
  console.log('▸ Fetching con search_address=fisherton...')
  const sa = await fetchAll({ search_address: 'fisherton' })
  console.log(`  Resultados: ${sa.length}`)
  const saRent = sa.filter((p) => p.operations[0]?.operation_type === 'Rent')
  console.log(`  De los cuales Rent: ${saRent.length}`)
  if (saRent.length > 0) {
    console.log('  → Detalle search_address Rent:')
    saRent.forEach(fmtRow)
  }

  // 4) Por las dudas: ¿la API expone propiedades de alquiler en otra zona?
  const allRent = all.filter((p) => p.operations[0]?.operation_type === 'Rent')
  console.log(`\n▸ Total Rent en TODO el CRM (cualquier zona): ${allRent.length}`)
  if (allRent.length === 0) {
    console.log('  ⚠ Tokko no está devolviendo NINGUNA propiedad en alquiler.')
    console.log('     Probablemente las 2 nuevas tienen status≠2 o falta algún campo')
    console.log('     (precio, web_price, fotos) que las haga públicas en la API.\n')
  } else {
    // Imprime las primeras 5 Rent para confirmar que se devuelven con normalidad
    console.log('  Sample Rent (primeras 5):')
    allRent.slice(0, 5).forEach((p) =>
      console.log(`    - [${p.id}] status=${p.status} ${p.location?.name ?? '?'} :: ${p.address}`),
    )
  }

  // 5) Sample de status≠2 por si las nuevas están en otro estado
  const noPublic = all.filter((p) => p.status !== 2)
  if (noPublic.length > 0) {
    console.log(`\n▸ ${noPublic.length} propiedades con status ≠ 2 en la respuesta:`)
    noPublic.slice(0, 5).forEach((p) =>
      console.log(`    - [${p.id}] status=${p.status} :: ${p.publication_title}`),
    )
  }
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
